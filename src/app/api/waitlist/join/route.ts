import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'
import { generateInviteToken } from '@/lib/utils'
import { sendWaitlistConfirmation } from '@/lib/email'

const waitlistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  website: z.string().url().optional().or(z.literal('')),
  companySize: z.enum(['small', 'medium', 'large']).optional(),
  useCase: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = waitlistSchema.parse(body)
    
    const sb = getSupabaseAdmin()

    // Check if already on waitlist
    const { data: existingEntry } = await sb
      .from('waitlist_entries')
      .select('id')
      .eq('email', validatedData.email)
      .maybeSingle()
    
    if (existingEntry) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 400 }
      )
    }
    
    // Create waitlist entry
    const { data: waitlistEntry, error: insertErr } = await sb
      .from('waitlist_entries')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        website: validatedData.website || null,
        companySize: validatedData.companySize || null,
        useCase: validatedData.useCase || null,
        inviteToken: generateInviteToken(),
      })
      .select()
      .single()

    if (insertErr) throw insertErr
    
    // Get waitlist position
    const position = await getWaitlistPosition(validatedData.email)

    // Send confirmation email
    try {
      await sendWaitlistConfirmation(validatedData.email, validatedData.name, position)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }
    
    return NextResponse.json({
      message: 'Successfully joined waitlist',
      position: position
    })
    
  } catch (error) {
    console.error('Waitlist join error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getWaitlistPosition(email: string): Promise<number> {
  const sb = getSupabaseAdmin()
  const { data: entry } = await sb
    .from('waitlist_entries')
    .select('createdAt')
    .eq('email', email)
    .maybeSingle()
  
  if (!entry) return 0
  
  const { count } = await sb
    .from('waitlist_entries')
    .select('*', { count: 'exact', head: true })
    .lte('createdAt', entry.createdAt)

  return count || 0
}

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data: waitlist, error } = await sb
      .from('waitlist_entries')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    return NextResponse.json(waitlist)
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
