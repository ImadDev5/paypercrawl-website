import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET() {
  try {
    const prisma = db as any
    const cats = await prisma.jobCategory.findMany({ orderBy: [{ position: 'asc' }, { name: 'asc' }] })
    return NextResponse.json({ categories: cats })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  icon: z.string().optional(),
  color: z.string().optional(),
  position: z.number().int().optional(),
  active: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const data = createSchema.parse(await req.json())
    const prisma = db as any
    const cat = await prisma.jobCategory.create({ data: data as any })
    return NextResponse.json({ category: cat })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Bad request' }, { status: 400 })
  }
}