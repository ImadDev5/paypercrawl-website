import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const sb = getSupabaseAdmin()
    const { data: post } = await sb
      .from('blog_posts')
      .select('*')
      .eq('slug', params.slug)
      .maybeSingle()
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post })
  } catch (e) {
    console.error('Get blog error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
