import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
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
    const sb = getSupabaseAdmin()
    const { data: cat, error } = await sb
      .from('job_categories')
      .update(data as any)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ category: cat })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Bad request' }, { status: 400 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sb = getSupabaseAdmin()
    const { data: cat } = await sb
      .from('job_categories')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ category: cat })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}