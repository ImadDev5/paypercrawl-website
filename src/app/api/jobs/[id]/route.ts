import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sb = getSupabaseAdmin()
    const { data: job } = await sb
      .from('job_postings')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()
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
    const sb = getSupabaseAdmin()
    const { data: job, error } = await sb
      .from('job_postings')
      .update(data as any)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ job })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Bad request' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const sb = getSupabaseAdmin()
    const { data: job, error } = await sb
      .from('job_postings')
      .delete()
      .eq('id', params.id)
      .select()
      .single()
    if (error) {
      // Foreign key constraint
      if (error.code === '23503') {
        return NextResponse.json({ error: 'Cannot delete job with linked applications' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ success: true, job })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete job' }, { status: 400 })
  }
}