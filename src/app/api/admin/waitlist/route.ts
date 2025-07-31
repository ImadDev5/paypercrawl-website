import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendBetaInvite } from '@/lib/email'

function verifyAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminKey = authHeader?.replace('Bearer ', '')
  return adminKey === process.env.ADMIN_API_KEY
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
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [waitlistEntries, total] = await Promise.all([
      db.waitlistEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.waitlistEntry.count({ where })
    ])

    return NextResponse.json({
      waitlistEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, email, emails } = body

    if (action === 'invite') {
      if (email) {
        // Single invite
        const waitlistEntry = await db.waitlistEntry.findUnique({
          where: { email }
        })

        if (!waitlistEntry) {
          return NextResponse.json(
            { error: 'Email not found on waitlist' },
            { status: 404 }
          )
        }

        if (waitlistEntry.status === 'invited') {
          return NextResponse.json(
            { error: 'User already invited' },
            { status: 400 }
          )
        }

        // Update status
        const updatedEntry = await db.waitlistEntry.update({
          where: { email },
          data: {
            status: 'invited',
            invitedAt: new Date()
          }
        })

        // Send invite email
        try {
          await sendBetaInvite(email, waitlistEntry.name, waitlistEntry.inviteToken!)
        } catch (emailError) {
          console.error('Failed to send beta invite:', emailError)
        }

        return NextResponse.json({
          message: 'Beta invite sent successfully',
          entry: updatedEntry
        })
      } else if (emails && Array.isArray(emails)) {
        // Bulk invite
        const results = []
        
        for (const emailAddr of emails) {
          try {
            const waitlistEntry = await db.waitlistEntry.findUnique({
              where: { email: emailAddr }
            })

            if (!waitlistEntry || waitlistEntry.status === 'invited') {
              continue
            }

            // Update status
            const updatedEntry = await db.waitlistEntry.update({
              where: { email: emailAddr },
              data: {
                status: 'invited',
                invitedAt: new Date()
              }
            })

            // Send invite email
            try {
              await sendBetaInvite(emailAddr, waitlistEntry.name, waitlistEntry.inviteToken!)
              results.push({ email: emailAddr, success: true })
            } catch (emailError) {
              console.error(`Failed to send beta invite to ${emailAddr}:`, emailError)
              results.push({ email: emailAddr, success: false, error: 'Email failed' })
            }
          } catch (error) {
            results.push({ email: emailAddr, success: false, error: 'Database error' })
          }
        }

        return NextResponse.json({
          message: 'Bulk invite completed',
          results
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing waitlist action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
