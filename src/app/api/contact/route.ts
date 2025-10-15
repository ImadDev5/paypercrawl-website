import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendSupportTicketReceipt, sendSupportTicketInternal } from '@/lib/email'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  category: z.enum(['general','support','careers']).default('general'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = contactSchema.parse(body)
    
    // Generate a human-friendly ticket id: TCK-YYYYMMDD-XXXX
    const date = new Date()
    const ymd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`
    const random = Math.random().toString(36).substring(2,6).toUpperCase()
    const ticketId = `TCK-${ymd}-${random}`

    // Save to database with ticketing fields
    const contactSubmission = await db.contactSubmission.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject || 'General Inquiry',
        message: validatedData.message,
        // @ts-ignore Prisma types update after `prisma generate`
        category: validatedData.category,
        // @ts-ignore Prisma types update after `prisma generate`
        ticketId,
        // @ts-ignore Prisma types update after `prisma generate`
        status: 'open',
      }
    })
    
    // Send emails in parallel: receipt to user and internal to team inbox
    try {
      await Promise.all([
        sendSupportTicketReceipt(validatedData.email, {
          ticketId,
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject || 'General Inquiry',
          message: validatedData.message,
          category: validatedData.category,
          createdAt: contactSubmission.createdAt.toISOString(),
        }),
        sendSupportTicketInternal({
          ticketId,
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject || 'General Inquiry',
          message: validatedData.message,
          category: validatedData.category,
          createdAt: contactSubmission.createdAt.toISOString(),
        })
      ])
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError)
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({
      message: 'Ticket created successfully',
      submissionId: contactSubmission.id,
      ticketId
    })
    
  } catch (error) {
    console.error('Contact form submission error:', error)
    
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
