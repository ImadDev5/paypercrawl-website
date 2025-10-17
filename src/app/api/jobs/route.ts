import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const onlyActive = searchParams.get('active') === 'true'
    let jobs = await db.jobPosting.findMany({ orderBy: { createdAt: 'desc' } as any })
    // If schema has 'active' use it; otherwise, pass all
    if (onlyActive) {
      jobs = jobs.filter((j: any) => j.active !== false)
    }
    return NextResponse.json({ jobs })
  } catch (e) {
    console.error('List jobs error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const jobSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  type: z.string().min(2),
  location: z.string().min(2),
  description: z.string().min(10),
  active: z.boolean().optional(),
  categoryId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const input = jobSchema.parse(await req.json())
    const slug = input.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80)
    const data: any = {
      title: input.title,
      slug,
      category: input.category,
      categoryId: input.categoryId || null,
      type: input.type,
      location: input.location,
      description: input.description,
      status: 'published',
      active: input.active ?? true,
    }
    const job = await (db as any).jobPosting.create({ data })
    return NextResponse.json({ job })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Bad request' }, { status: 400 })
  }
}