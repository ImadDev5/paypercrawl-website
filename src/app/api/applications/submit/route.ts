import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sendCareerApplicationReceipt, sendCareerApplicationInternal } from '@/lib/email'

// Validation schema
const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  position: z.string().min(1, 'Position is required'),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  coverLetter: z.string().optional(),
  jobId: z.string().optional(),
  // resume fields for JSON submission base64
  resume: z
    .object({
      filename: z.string(),
      mimeType: z.literal('application/pdf'),
      size: z.number().max(5 * 1024 * 1024, 'File too large (max 5MB)'),
      base64: z.string(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let body: any
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      body = Object.fromEntries(form.entries())
      // normalize resume file
      const file = form.get('resume') as File | null
      if (file) {
        const arrayBuffer = await file.arrayBuffer()
        body.resume = {
          filename: (file as any).name || 'resume.pdf',
          mimeType: file.type || 'application/pdf',
          size: file.size,
          base64: Buffer.from(arrayBuffer).toString('base64'),
        }
      }
    } else {
      body = await request.json()
    }
    
    // Validate input
    const validatedData = applicationSchema.parse(body)
    
    // Create application
    const resumeBuffer = validatedData.resume
      ? Buffer.from(validatedData.resume.base64, 'base64')
      : undefined

    const application = await db.betaApplication.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        position: validatedData.position,
        jobId: validatedData.jobId || null,
        phone: validatedData.phone || null,
        website: validatedData.website || null,
        coverLetter: validatedData.coverLetter || null,
        resumeData: resumeBuffer,
        resumeFilename: validatedData.resume?.filename,
        resumeMimeType: validatedData.resume?.mimeType,
        resumeSize: validatedData.resume?.size,
      }
    })
    
    // Send confirmation email
    try {
      await Promise.all([
        sendCareerApplicationReceipt({
          to: validatedData.email,
          name: validatedData.name,
          position: validatedData.position,
        }),
        sendCareerApplicationInternal({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || undefined,
          website: validatedData.website || undefined,
          position: validatedData.position,
        }),
      ])
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Continue with success response even if email fails
    }
    
    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: application.id
    })
    
  } catch (error) {
    console.error('Application submission error:', error)
    
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
