import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isAdminAuthenticated } from '@/lib/admin-auth'

function verifyAdminAuth(request: NextRequest): boolean {
  return isAdminAuthenticated(request)
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const sb = getSupabaseAdmin()

    let query = sb
      .from('contact_submissions')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data: contactSubmissions, count, error } = await query
    if (error) throw error

    const total = count || 0

    return NextResponse.json({
      contactSubmissions: contactSubmissions || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching contact submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { contactId, status } = body

    const sb = getSupabaseAdmin()
    const { data: contact, error } = await sb
      .from('contact_submissions')
      .update({
        ...(status ? { status } : {}),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', contactId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error updating contact submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
