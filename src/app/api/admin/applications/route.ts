import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthenticated } from '@/lib/admin-auth'

function verifyAdminAuth(request: NextRequest): boolean {
  return isAdminAuthenticated(request)
}

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    const sb = getSupabaseAdmin()

    let query = sb
      .from('beta_applications')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[ADMIN APPS] Supabase error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      applications: data ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        pages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (err) {
    console.error('Error fetching applications:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { applicationId, status, notes } = body
    const sb = getSupabaseAdmin()

    const updateData: any = { updatedAt: new Date().toISOString() }
    if (status) updateData.status = status
    if (notes) updateData.notes = notes

    const { data, error } = await sb
      .from('beta_applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      console.error('[ADMIN APPS] Update error:', error.message)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error updating application:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
