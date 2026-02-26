import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// Use puppeteer for JavaScript-rendered SPAs like Vite/React blogs

function verifyAdminAuth(request: NextRequest): boolean {
  return isAdminAuthenticated(request)
}

function isAllowedSource(urlStr: string): boolean {
  try {
    const u = new URL(urlStr)
    return u.hostname === 'blogging-website-s.netlify.app'
  } catch {
    return false
  }
}

// JSON-LD utilities
type AnyObj = Record<string, any>
function collectObjects(input: any, acc: AnyObj[] = []): AnyObj[] {
  if (!input) return acc
  if (Array.isArray(input)) {
    for (const it of input) collectObjects(it, acc)
    return acc
  }
  if (typeof input === 'object') {
    acc.push(input as AnyObj)
    if (input['@graph']) collectObjects(input['@graph'], acc)
    for (const k of Object.keys(input)) {
      const v = (input as AnyObj)[k]
      if (v && typeof v === 'object') collectObjects(v, acc)
    }
  }
  return acc
}

function extractJsonLd(html: string): AnyObj[] {
  const results: AnyObj[] = []
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const raw = m[1]
    try {
      const parsed = JSON.parse(raw.trim())
      results.push(...collectObjects(parsed))
    } catch {
      // ignore bad JSON
    }
  }
  return results
}

function sanitizeText(s: string | null | undefined): string | undefined {
  if (!s) return undefined
  return s.replace(/\s+/g, ' ').trim()
}

function extractMeta(html: string, name: string): string | undefined {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
  const m = html.match(re)
  return m?.[1]
}

function extractOg(html: string, property: string): string | undefined {
  const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
  const m = html.match(re)
  return m?.[1]
}

function extractTitle(html: string): string | undefined {
  const m = html.match(/<title>([^<]+)<\/title>/i)
  return m?.[1]?.trim()
}

function extractArticle(html: string): string | undefined {
  // Try common article wrappers
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i)
  if (articleMatch) return articleMatch[0]
  // Fallback to main content
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i)
  if (mainMatch) return mainMatch[0]
  // Fallback to body
  const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i)
  return bodyMatch?.[0]
}

function stripScriptsStyles(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
}

function extractAuthor(html: string): string | undefined {
  // Try meta author
  const metaAuthor = extractMeta(html, 'author') || extractOg(html, 'article:author')
  if (metaAuthor) return metaAuthor
  // Try common patterns
  const byline = html.match(/By\s*<[^>]*>([^<]+)<\/[^>]*>/i) || html.match(/<span[^>]*class=["'][^"']*(author|byline)[^"']*["'][^>]*>([^<]+)<\/span>/i)
  return (byline?.[1] || byline?.[2])?.trim()
}

function extractDate(html: string): string | undefined {
  const metaDate = extractMeta(html, 'date') || extractOg(html, 'article:published_time')
  if (metaDate) return metaDate
  const timeTag = html.match(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/i)
  return timeTag?.[1]
}

function extractTags(html: string): string[] {
  const tags: string[] = []
  const metaKeywords = extractMeta(html, 'keywords')
  if (metaKeywords) {
    tags.push(
      ...metaKeywords
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    )
  }
  // Try simple anchors with rel=tag
  const tagRegex = /<a[^>]*rel=["']tag["'][^>]*>([^<]+)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = tagRegex.exec(html))) {
    const t = m[1]?.trim()
    if (t) tags.push(t)
  }
  // Deduplicate
  return Array.from(new Set(tags)).slice(0, 10)
}

function slugFromSourceUrl(urlStr: string): string {
  const u = new URL(urlStr)
  const parts = u.pathname.split('/').filter(Boolean)
  return parts[parts.length - 1] || u.hostname.replace(/\./g, '-')
}

function humanizeFromSlug(slug: string): string {
  const cleaned = slug
    .replace(/[_]+/g, '-')
    // drop obvious hash-like segments (letters+digits length>=6) at the end
    .replace(/(-[A-Za-z0-9]{6,})+$/, '')
  const words = cleaned
    .split(/[-]+/)
    .map((w) => w.trim())
    .filter(Boolean)
  const titled = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  return titled || slug.replace(/[-_]+/g, ' ')
}

function tidyTitle(t: string | undefined): string | undefined {
  if (!t) return t
  const text = t.trim()
  const splitters = [':', ' - ', ' – ', ' — ']
  for (const s of splitters) {
    const idx = text.indexOf(s)
    if (idx > 0) {
      const left = text.slice(0, idx).trim()
      const words = left.split(/\s+/).filter(Boolean)
      if (words.length >= 2 && words.length <= 8) return left
    }
  }
  return text
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyAdminAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    if (!isAllowedSource(url)) {
      return NextResponse.json({ error: 'Source not allowed' }, { status: 400 })
    }

    console.log('[FETCH] URL:', url)
    
    // Launch headless browser for SPA content
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })
    
  let htmlRaw = ''
  let h1FromRuntime: string | undefined
  let h2FromRuntime: string | undefined
    try {
      const page = await browser.newPage()
      await page.setUserAgent('Mozilla/5.0 (compatible; PayPerCrawlBot/1.0)')
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      
      // Wait for React hydration and key selectors
      await new Promise(r => setTimeout(r, 1500))
      await page.waitForSelector('h1, main h1, article h1', { timeout: 5000 }).catch(()=>{})
      
      // Extract the most prominent H1/H2 directly from runtime DOM
      const runtime = await page.evaluate(() => {
        const pick = (sel: string) => {
          const n = document.querySelector(sel)
          return n ? (n.textContent || '').trim() : ''
        }
        return {
          h1: pick('article h1') || pick('main h1') || pick('h1') || '',
          h2: pick('article h2') || pick('main h2') || pick('h2') || ''
        }
      })
      h1FromRuntime = runtime?.h1 || undefined
      h2FromRuntime = runtime?.h2 || undefined
      
  htmlRaw = await page.content()
  console.log('[FETCH] HTML length:', htmlRaw.length, 'Runtime H1:', h1FromRuntime, 'Runtime H2:', h2FromRuntime)
    } finally {
      await browser.close()
    }
    
    // Attempt to parse JSON-LD before stripping scripts
    const ldObjs = extractJsonLd(htmlRaw)
    console.log('[FETCH] JSON-LD objects found:', ldObjs.length)
    const ldArticle = ldObjs.find((o) => {
      const t = o['@type']
      if (!t) return false
      if (typeof t === 'string') return /Article|BlogPosting/i.test(t)
      if (Array.isArray(t)) return t.some((it: any) => /Article|BlogPosting/i.test(String(it)))
      return false
    }) as AnyObj | undefined
    console.log('[FETCH] JSON-LD Article found:', !!ldArticle)

  const html = stripScriptsStyles(htmlRaw)
  const $ = cheerio.load(html)

    // Extract via JSON-LD first
    const ldTitle = sanitizeText((ldArticle?.headline as string) || (ldArticle?.name as string))
    const ldAuthor = sanitizeText((ldArticle?.author?.name as string) || (ldArticle?.creator?.name as string))
    const ldPublished = (ldArticle?.datePublished as string) || (ldArticle?.dateCreated as string)
    const ldKeywords = ldArticle?.keywords
    const ldTags = Array.isArray(ldKeywords)
      ? ldKeywords.map((x: any) => String(x)).filter(Boolean)
      : typeof ldKeywords === 'string'
      ? ldKeywords.split(',').map((x) => x.trim()).filter(Boolean)
      : []
    const ldBody = (ldArticle?.articleBody as string) || (ldArticle?.description as string)
    console.log('[FETCH] LD Title:', ldTitle, 'LD Author:', ldAuthor, 'LD Body length:', ldBody?.length || 0)

    // Fallbacks via HTML extraction
    const baseTitle = sanitizeText(ldTitle || extractOg(html, 'og:title') || extractTitle(html))
    const baseAuthor = sanitizeText(ldAuthor || extractAuthor(html))
    const publishedRaw = ldPublished || extractDate(html)
    const tagsSet = new Set<string>([...ldTags, ...extractTags(html)])
    let tags = Array.from(tagsSet)

    // Prefer body from JSON-LD if present (plain text). If so, convert to simple HTML paragraphs.
    let articleHtml = ldBody
      ? `<div class="imported-article">${ldBody
          .split(/\n\n+/)
          .map((p) => `<p>${p.replace(/\n/g, ' ').trim()}</p>`) 
          .join('')}</div>`
      : (function(){
          // Try multiple content selectors for this specific blog platform
          // Check for content wrappers common in React/Vite blogs
          let content = $('.blog-content, .post-content, .article-content, [class*="content"]').first().html()
          if (content) {
            console.log('[FETCH] Found content via class selector')
            return content
          }
          
          // Try <article>
          const art = $('article').first()
          if (art.length) {
            console.log('[FETCH] Found content via <article>')
            return art.html() || undefined
          }
          
          // Try main content
          const main = $('main').first()
          if (main.length) {
            console.log('[FETCH] Found content via <main>')
            return main.html() || undefined
          }
          
          // Try any div with substantial text content (fallback)
          const divs = $('div').filter((_, el) => {
            const text = $(el).text().trim()
            return text.length > 200 && !$(el).find('nav, header, footer').length
          })
          if (divs.length) {
            console.log('[FETCH] Found content via substantial div (fallback)')
            return $(divs[0]).html() || undefined
          }
          
          console.log('[FETCH] Falling back to <body>')
          return $('body').html() || undefined
        })()

    console.log('[FETCH] Article HTML length:', articleHtml?.length || 0)

    // Improve title/author/date with DOM hints if still missing
  // Try to find in-page headings which usually hold the real article title
  const h1InArticle = $('article h1').first().text().trim()
  const h1InMain = $('main h1').first().text().trim()
  const h1Any = $('h1').first().text().trim()
  const h2InArticle = $('article h2').first().text().trim()
  const h2InMain = $('main h2').first().text().trim()
  const h2Any = $('h2').first().text().trim()
  const domH1Title = sanitizeText(h1InArticle || h1InMain || h1Any)
  const domH2Title = sanitizeText(h2InArticle || h2InMain || h2Any)

  const domTitle = $('meta[property="og:title"]').attr('content') || $('title').text()
  const domTwitterTitle = $('meta[name="twitter:title"]').attr('content')
    const domAuthor = $('meta[name="author"]').attr('content') || $('[rel="author"], .author, .byline').first().text()
    const domDate = $('time[datetime]').attr('datetime') || $('meta[property="article:published_time"]').attr('content')
    const domKeywords = $('meta[name="keywords"]').attr('content')
    
    // Build candidate titles and choose the best non-generic one
    const looksGeneric = (t?: string) => {
      if (!t) return true
      const lower = t.toLowerCase().trim()
      const words = lower.split(/\s+/).filter(Boolean)
      const tooShort = lower.length < 6 || words.length === 1 // treat very short/one-word titles as generic
      return (
        tooShort ||
        lower === 'vite + react' ||
        lower === 'react app' ||
        lower === 'home' ||
        lower === 'blog' ||
        lower === 'comments' ||
        /vite\s*\+\s*react/.test(lower)
      )
    }

    const candidates = [
      sanitizeText(ldTitle || undefined),
      sanitizeText(domTitle || undefined),
      sanitizeText(domTwitterTitle || undefined),
      sanitizeText(h1InArticle || undefined),
      sanitizeText(h1InMain || undefined),
      sanitizeText(h1Any || undefined),
      sanitizeText(h1FromRuntime || undefined),
      sanitizeText(domH2Title || undefined),
      sanitizeText(h2FromRuntime || undefined),
    ].filter(Boolean) as string[]

    // Score candidates by length and word count; penalize generics
    const scoreTitle = (t: string): number => {
      const len = t.length
      const words = t.trim().split(/\s+/).length
      let score = len + words * 5
      if (looksGeneric(t)) score -= 50
      // prefer titles with colon/dash (often full headlines)
      if (/[\:\-–—]/.test(t)) score += 10
      return score
    }
    const wordCount = (t?: string) => (t ? t.trim().split(/\s+/).filter(Boolean).length : 0)
    // Prefer concise runtime H1 (hero-style) when it's not generic
    let chosenTitle = undefined as string | undefined
    if (h1FromRuntime && !looksGeneric(h1FromRuntime)) {
      const wc = wordCount(h1FromRuntime)
      if (wc >= 2 && wc <= 8) {
        chosenTitle = sanitizeText(h1FromRuntime)
      }
    }
    if (!chosenTitle) {
      const sorted = [...candidates].sort((a, b) => scoreTitle(b) - scoreTitle(a))
      chosenTitle = sorted[0]
    }

  let finalTitle = tidyTitle(chosenTitle || baseTitle || undefined)
    let finalAuthor = baseAuthor || undefined
    if (!finalTitle && domTitle) finalTitle = sanitizeText(domTitle)
    // If still generic, humanize from slug
    if (looksGeneric(finalTitle)) {
      finalTitle = humanizeFromSlug(slugFromSourceUrl(url))
    }
    if (!finalAuthor && domAuthor) finalAuthor = sanitizeText(domAuthor)
    
    console.log('[FETCH] Final Title:', finalTitle, 'Final Author:', finalAuthor)
    
    const moreTags = domKeywords ? domKeywords.split(',').map((x)=>x.trim()).filter(Boolean) : []
    if (moreTags.length) {
      tags = Array.from(new Set<string>([...tags, ...moreTags]))
    }
    const slug = slugFromSourceUrl(url)

    if (!articleHtml || !finalTitle) {
      return NextResponse.json({ error: 'Could not extract article content or title' }, { status: 422 })
    }

    // If we took title from an H1, remove the first H1 from the article HTML to avoid duplicate headings
    if (articleHtml && finalTitle) {
      try {
        const $content = cheerio.load(articleHtml)
        const firstH1 = $content('h1').first()
        if (firstH1.length) {
          // Only remove if it matches or looks like our selected title
          const h1Txt = sanitizeText(firstH1.text())
          if (h1Txt === finalTitle || (h1Txt && finalTitle && h1Txt.startsWith(finalTitle))) {
            firstH1.remove()
            articleHtml = $content.root().html() || articleHtml
          }
        }
      } catch {
        // ignore stripping errors
      }
    }

    // Store the raw HTML content for rendering; optionally could sanitize further server-side when rendering
    const publishedAt = publishedRaw ? new Date(publishedRaw) : null

    const sb = getSupabaseAdmin()

    // Check if blog post exists by sourceUrl
    const { data: existing } = await sb
      .from('blog_posts')
      .select('id')
      .eq('sourceUrl', url)
      .maybeSingle()

    let upserted
    if (existing) {
      const { data: updated } = await sb
        .from('blog_posts')
        .update({
          slug,
          title: finalTitle,
          content: articleHtml,
          author: finalAuthor,
          publishedAt: publishedAt?.toISOString() ?? undefined,
          tags,
        })
        .eq('id', existing.id)
        .select()
        .single()
      upserted = updated
    } else {
      const { data: created } = await sb
        .from('blog_posts')
        .insert({
          slug,
          sourceUrl: url,
          title: finalTitle,
          content: articleHtml,
          author: finalAuthor,
          publishedAt: publishedAt?.toISOString() ?? undefined,
          tags,
        })
        .select()
        .single()
      upserted = created
    }

    return NextResponse.json({ post: upserted })
  } catch (e) {
    console.error('Fetch blog error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
