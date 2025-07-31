import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schema
const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  position: z.string().min(1, 'Position is required'),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  coverLetter: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = applicationSchema.parse(body)
    
    // Check if application already exists
    const existingApplication = await db.betaApplication.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      )
    }
    
    // Create application
    const application = await db.betaApplication.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        position: validatedData.position,
        phone: validatedData.phone || null,
        website: validatedData.website || null,
        coverLetter: validatedData.coverLetter || null,
      }
    })
    
    // TODO: Send confirmation email
    // await sendConfirmationEmail(validatedData.email, validatedData.name)
    
    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: application.id
    })
    
  } catch (error) {
    console.error('Application submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const applications = await db.betaApplication.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
