import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  position: z.number().int().optional(),
  active: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const data = patchSchema.parse(await req.json())
    const prisma = db as any
    const cat = await prisma.jobCategory.update({ where: { id: params.id }, data: data as any })
    return NextResponse.json({ category: cat })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Bad request' }, { status: 400 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const prisma = db as any
    const cat = await prisma.jobCategory.findUnique({ where: { id: params.id } })
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ category: cat })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}