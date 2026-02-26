import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { api_key, site_url, content } = body;

    if (!api_key || !content || !Array.isArray(content)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();

    // Validate API Key
    const { data: apiKeyRecord, error: keyError } = await sb
      .from('api_keys')
      .select('*')
      .eq('key', api_key)
      .maybeSingle();

    if (keyError) {
      console.error('API key lookup error:', keyError);
      return NextResponse.json(
        { success: false, error: 'Failed to validate API key' },
        { status: 500 }
      );
    }

    if (!apiKeyRecord || !apiKeyRecord.active) {
       return NextResponse.json(
        { success: false, error: 'Invalid or inactive API key' },
        { status: 401 }
      );
    }

    const userId = apiKeyRecord.userId;
    // Normalize URL: strip trailing slash to prevent mismatch with stored records
    const validSiteUrl = site_url ? site_url.replace(/\/+$/, '') : 'unknown-url';

    // Find or Create Site
    const { data: existingSite } = await sb
      .from('sites')
      .select('*')
      .eq('userId', userId)
      .eq('url', validSiteUrl)
      .maybeSingle();

    let site;
    if (existingSite) {
      const { data: updated, error: updateErr } = await sb
        .from('sites')
        .update({ apiKey: api_key, updatedAt: new Date().toISOString() })
        .eq('id', existingSite.id)
        .select()
        .single();
      if (updateErr) {
        console.error('Site update error:', updateErr);
        return NextResponse.json(
          { success: false, error: 'Failed to update site: ' + updateErr.message },
          { status: 500 }
        );
      }
      site = updated;
    } else {
      const { data: created, error: createErr } = await sb
        .from('sites')
        .insert({
          userId: userId,
          url: validSiteUrl,
          apiKey: api_key,
          name: validSiteUrl !== 'unknown-url' ? new URL(validSiteUrl).hostname : 'Unknown Site'
        })
        .select()
        .single();
      if (createErr) {
        console.error('Site create error:', createErr);
        return NextResponse.json(
          { success: false, error: 'Failed to create site: ' + createErr.message },
          { status: 500 }
        );
      }
      site = created;
    }

    if (!site) {
      return NextResponse.json(
        { success: false, error: 'Failed to resolve site record' },
        { status: 500 }
      );
    }

    // Process Content (Upsert ScrapedPages)
    const results: string[] = [];
    const errors: { url: string; error: string }[] = [];

    for (const item of content) {
      const { url, title, content_toon, original_json } = item;
      
      if (!url) continue;

      // Check existing
      const { data: existing } = await sb
        .from('scraped_pages')
        .select('id')
        .eq('siteId', site.id)
        .eq('url', url)
        .maybeSingle();

      if (existing) {
        const { error: updateErr } = await sb
          .from('scraped_pages')
          .update({
            title: title,
            contentToon: content_toon,
            originalJson: original_json,
            status: 'scraped',
            lastScraped: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (updateErr) {
          console.error('ScrapedPage update error:', updateErr, 'url:', url);
          errors.push({ url, error: updateErr.message });
        } else {
          results.push(existing.id);
        }
      } else {
        const { data: created, error: insertErr } = await sb
          .from('scraped_pages')
          .insert({
            siteId: site.id,
            url: url,
            title: title,
            contentToon: content_toon,
            originalJson: original_json,
            status: 'scraped',
            lastScraped: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (insertErr) {
          console.error('ScrapedPage insert error:', insertErr, 'url:', url);
          errors.push({ url, error: insertErr.message });
        } else if (created) {
          results.push(created.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
