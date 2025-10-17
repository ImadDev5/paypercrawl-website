import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await db.jobPosting.findUnique({ where: { id: params.id } })
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ job })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  category: z.string().min(2).optional(),
  type: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const data = patchSchema.parse(await req.json())
    const job = await db.jobPosting.update({ where: { id: params.id }, data: data as any })
    return NextResponse.json({ job })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Bad request' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const job = await db.jobPosting.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, job })
  } catch (e: any) {
    // Foreign key constraint (e.g., applications linked to this job)
    if (e?.code === 'P2003') {
      return NextResponse.json({ error: 'Cannot delete job with linked applications' }, { status: 409 })
    }
    return NextResponse.json({ error: e?.message || 'Failed to delete job' }, { status: 400 })
  }
}