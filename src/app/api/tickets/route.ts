import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// GET /api/tickets?status=open|resolved|all&category=general|support|careers&search=...&page=1&limit=50
export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'open'
    const category = searchParams.get('category') || 'all'
    const search = searchParams.get('search')?.trim() || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = (page - 1) * limit

    const sb = getSupabaseAdmin()
    let query = sb
      .from('contact_submissions')
      .select('*', { count: 'exact' })

    if (status !== 'all') query = query.eq('status', status)
    if (category !== 'all') query = query.eq('category', category)
    if (search) {
      const term = `%${search}%`
      query = query.or(`name.ilike.${term},email.ilike.${term},subject.ilike.${term},message.ilike.${term},ticketId.ilike.${term}`)
    }

    const { data: tickets, count, error } = await query
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    const total = count || 0

    return NextResponse.json({
      tickets: tickets || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('List tickets error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
