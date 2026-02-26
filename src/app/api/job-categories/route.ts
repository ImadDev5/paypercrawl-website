import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data: cats, error } = await sb
      .from('job_categories')
      .select('*')
      .order('position', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return NextResponse.json({ categories: cats || [] })
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
    const sb = getSupabaseAdmin()
    const { data: cat, error } = await sb
      .from('job_categories')
      .insert(data as any)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ category: cat })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Bad request' }, { status: 400 })
  }
}