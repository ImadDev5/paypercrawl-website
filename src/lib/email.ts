import { Resend } from 'resend'
import { db } from './db'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

async function sendEmail({ to, subject, html, from = 'PayPerCrawl <noreply@paypercrawl.tech>' }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    // Log email
    await db.emailLog.create({
      data: {
        to,
        subject,
        body: html,
        status: error ? 'failed' : 'sent',
        provider: 'resend'
      }
    })

    if (error) {
      console.error('Email send error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw new Error(`Failed to send email: ${error.message || JSON.stringify(error)}`)
    }

    return data
  } catch (error) {
    console.error('Email service error:', error)
    
    // Log failed email
    await db.emailLog.create({
      data: {
        to,
        subject,
        body: html,
        status: 'failed',
        provider: 'resend'
      }
    })
    
    throw error
  }
}

export async function sendApplicationConfirmation(email: string, name: string) {
  const subject = 'Application Received - PayPerCrawl Beta'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Application Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Thank you for your application!</h1>
        
        <p>Hi ${name},</p>
        
        <p>We've received your application for the PayPerCrawl beta program. Our team will review your application and get back to you within 2-3 business days.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">What's Next?</h3>
          <ul>
            <li>Our team will review your application</li>
            <li>We'll contact you if we need additional information</li>
            <li>Selected candidates will receive beta access instructions</li>
          </ul>
        </div>
        
        <p>In the meantime, feel free to explore our website and learn more about how PayPerCrawl can help monetize your AI content.</p>
        
        <p>Best regards,<br>The PayPerCrawl Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          PayPerCrawl - AI Content Monetization Platform<br>
          <a href="https://paypercrawl.tech">paypercrawl.tech</a>
        </p>
      </div>
    </body>
    </html>
  `
  
  return sendEmail({ to: email, subject, html })
}

export async function sendWaitlistConfirmation(email: string, name: string, position: number) {
  const subject = 'Welcome to PayPerCrawl Waitlist!'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Waitlist Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">You're on the waitlist! 🎉</h1>
        
        <p>Hi ${name},</p>
        
        <p>Thank you for joining the PayPerCrawl waitlist! You're currently <strong>#${position}</strong> in line.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0; color: #2563eb;">Your Position: #${position}</h3>
          <p style="margin-bottom: 0;">We'll notify you as soon as beta access becomes available!</p>
        </div>
        
        <p>While you wait, here's what you can do:</p>
        <ul>
          <li>Follow us on social media for updates</li>
          <li>Share PayPerCrawl with friends who create AI content</li>
          <li>Read our blog for AI monetization insights</li>
        </ul>
        
        <p>We're working hard to launch the beta and can't wait to help you monetize your AI content!</p>
        
        <p>Best regards,<br>The PayPerCrawl Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          PayPerCrawl - AI Content Monetization Platform<br>
          <a href="https://paypercrawl.tech">paypercrawl.tech</a>
        </p>
      </div>
    </body>
    </html>
  `
  
  return sendEmail({ to: email, subject, html })
}

export async function sendBetaInvite(email: string, name: string, inviteToken: string) {
  const subject = 'Your PayPerCrawl Beta Access is Ready! 🚀'
  const betaUrl = `${process.env.NEXT_PUBLIC_APP_URL}/beta?token=${inviteToken}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Beta Access Ready</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a;">Welcome to PayPerCrawl Beta! 🚀</h1>
        
        <p>Hi ${name},</p>
        
        <p>Congratulations! You've been selected for the PayPerCrawl beta program. You can now start monetizing your AI content!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${betaUrl}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Access Beta Dashboard
          </a>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="margin-top: 0; color: #16a34a;">Getting Started</h3>
          <ol>
            <li>Click the button above to access your beta dashboard</li>
            <li>Install the PayPerCrawl WordPress plugin</li>
            <li>Configure your monetization settings</li>
            <li>Start earning from AI bot traffic!</li>
          </ol>
        </div>
        
        <p>Need help? Our support team is standing by to assist you with setup and configuration.</p>
        
        <p>Welcome aboard!<br>The PayPerCrawl Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          PayPerCrawl - AI Content Monetization Platform<br>
          <a href="https://paypercrawl.tech">paypercrawl.tech</a>
        </p>
      </div>
    </body>
    </html>
  `
  
  return sendEmail({ to: email, subject, html })
}

export async function sendContactNotification(name: string, email: string, subject: string, message: string) {
  const emailSubject = `New Contact Form Submission: ${subject}`
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Contact Form Submission</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">New Contact Form Submission</h1>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <p>Please respond to this inquiry promptly.</p>
      </div>
    </body>
    </html>
  `
  
  // Send to admin email from environment or fallback
  const adminEmail = process.env.ADMIN_EMAIL || 'imaduddin.dev@gmail.com'

  return sendEmail({
    to: adminEmail,
    subject: emailSubject,
    html
  })
}
