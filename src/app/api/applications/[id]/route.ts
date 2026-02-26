import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sendCareerApplicationStatusUpdate } from '@/lib/email'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sb = getSupabaseAdmin()
    const { data: application, error } = await sb
      .from('beta_applications')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()
    
    if (error) throw error
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes, message } = body

    const sb = getSupabaseAdmin()
    const { data: application, error } = await sb
      .from('beta_applications')
      .update({
        ...(status ? { status } : {}),
        ...(notes ? { notes } : {}),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // send email if status provided
    if (status && message) {
      try {
        await sendCareerApplicationStatusUpdate({
          to: application.email,
          name: application.name,
          position: application.position,
          status: status,
          message: message,
        })
      } catch (e) {
        console.error('Failed to send status update email:', e)
      }
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
