import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const sb = getSupabaseAdmin()

    const { data: posts, count, error } = await sb
      .from('blog_posts')
      .select('id, slug, title, author, publishedAt, tags', { count: 'exact' })
      .order('publishedAt', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    const total = count || 0

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (e) {
    console.error('List blogs error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
