import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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
    const skip = (page - 1) * limit

    const where: any = {}
    if (status !== 'all') where.status = status
    if (category !== 'all') where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { ticketId: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, tickets] = await Promise.all([
      db.contactSubmission.count({ where }),
      db.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })
    ])

    return NextResponse.json({
      tickets,
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
