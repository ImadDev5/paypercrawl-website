import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'
import { sendSupportTicketResolution } from '@/lib/email'
import { isAdminAuthenticated } from '@/lib/admin-auth'

const resolveSchema = z.object({
  id: z.string().min(1),
  resolutionMessage: z.string().min(5, 'Resolution must be at least 5 characters'),
})

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, resolutionMessage } = resolveSchema.parse(body)

    const sb = getSupabaseAdmin()
    const { data: existing } = await sb
      .from('contact_submissions')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const { data: updated, error } = await sb
      .from('contact_submissions')
      .update({
        status: 'resolved',
        resolutionMessage,
        resolvedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    try {
      await sendSupportTicketResolution(existing.email, existing.ticketId, resolutionMessage)
    } catch (emailError) {
      console.error('Failed to send resolution email:', emailError)
    }

    return NextResponse.json({ message: 'Ticket resolved', ticket: updated })
  } catch (error) {
    console.error('Resolve ticket error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
