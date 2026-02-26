import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept both { apiKey } (internal) and { api_key, site_url } (WP plugin)
    const apiKey = body.apiKey || body.api_key;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    const sb = getSupabaseAdmin();

    // Look up the key in the api_keys table
    const { data: keyData, error } = await sb
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .maybeSingle();

    if (error) {
      console.error('Supabase error validating API key:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to validate API key' },
        { status: 500 }
      );
    }

    if (!keyData) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    if (!keyData.active) {
      return NextResponse.json(
        { success: false, error: 'API key is inactive' },
        { status: 403 }
      );
    }

    // Update lastUsedAt timestamp (fire-and-forget)
    sb.from('api_keys')
      .update({ lastUsedAt: new Date().toISOString() })
      .eq('id', keyData.id)
      .then(({ error: updateErr }) => {
        if (updateErr) console.error('Failed to update lastUsedAt:', updateErr);
      });

    return NextResponse.json({
      success: true,
      valid: true,
      userId: keyData.userId,
      message: 'API key is valid'
    });
  } catch (error) {
    console.error('Error validating API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate API key' },
      { status: 500 }
    );
  }
}
