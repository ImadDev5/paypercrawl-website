import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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

    const existing = await db.contactSubmission.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const updated = await db.contactSubmission.update({
      where: { id },
      data: {
        // @ts-ignore Prisma types update after `prisma generate`
        status: 'resolved',
        // @ts-ignore Prisma types update after `prisma generate`
        resolutionMessage,
        // @ts-ignore Prisma types update after `prisma generate`
        resolvedAt: new Date(),
      },
    })

    try {
  // @ts-ignore Prisma types update after `prisma generate`
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
