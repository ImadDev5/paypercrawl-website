import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    const adminKey = authHeader?.replace('Bearer ', '')
    
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sb = getSupabaseAdmin()

    // Get recent email logs
    const { data: emailLogs, error } = await sb
      .from('email_logs')
      .select('id, to, subject, status, provider, createdAt, body')
      .order('createdAt', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({
      logs: emailLogs || [],
      total: (emailLogs || []).length
    })

  } catch (error) {
    console.error('Error fetching email logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email logs' },
      { status: 500 }
    )
  }
}
