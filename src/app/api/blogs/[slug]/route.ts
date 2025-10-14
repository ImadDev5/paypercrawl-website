import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const post = await db.blogPost.findUnique({ where: { slug: params.slug } })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post })
  } catch (e) {
    console.error('Get blog error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
