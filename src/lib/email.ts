import { Resend } from "resend";
import { db } from "./db";

// Lazily initialize the Resend client to avoid build-time failures
// when RESEND_API_KEY isn't present during static bundling.
let _resend: Resend | null = null;
function getResend(): Resend {
  if (_resend) return _resend;
  const apiKey = process.env.RESEND_API_KEY;
  // Do not construct at import time. Only construct on first use,
  // and fail fast with a clear error message if the key is missing.
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Set it in your .env before sending emails."
    );
  }
  _resend = new Resend(apiKey);
  return _resend;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

async function sendEmail({
  to,
  subject,
  html,
  from = "PayPerCrawl <noreply@paypercrawl.tech>",
}: EmailOptions) {
  try {
    const { data, error } = await getResend().emails.send({
      from,
      to,
      subject,
      html,
    });

    // Log email
    await db.emailLog.create({
      data: {
        to,
        subject,
        body: html,
        status: error ? "failed" : "sent",
        provider: "resend",
      },
    });

    if (error) {
      console.error("Email send error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error(
        `Failed to send email: ${error.message || JSON.stringify(error)}`
      );
    }

    return data;
  } catch (error) {
    console.error("Email service error:", error);

    // Log failed email
    await db.emailLog.create({
      data: {
        to,
        subject,
        body: html,
        status: "failed",
        provider: "resend",
      },
    });

    throw error;
  }
}

export async function sendApplicationConfirmation(email: string, name: string) {
  const subject = "Application Received - PayPerCrawl Beta";
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
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendWaitlistConfirmation(
  email: string,
  name: string,
  position: number
) {
  const subject = "Welcome to PayPerCrawl Waitlist!";
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
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendBetaInvite(
  email: string,
  name: string,
  inviteToken: string
) {
  const subject = "Your PayPerCrawl Beta Access is Ready! 🚀";
  const betaUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?token=${inviteToken}`;

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
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h4 style="margin-top: 0; color: #475569;">Alternative Sign-In Method</h4>
          <p style="margin: 10px 0; color: #64748b; font-size: 14px;">You can also copy this invite link and use it in our Sign In form:</p>
          <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #d1d5db; font-family: monospace; font-size: 13px; color: #374151; word-break: break-all;">
            ${betaUrl}
          </div>
          <p style="margin: 10px 0 0 0; color: #64748b; font-size: 12px;">💡 Tip: Copy this link and paste it into the Sign In form on our website if the button above doesn't work.</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="margin-top: 0; color: #16a34a;">Getting Started</h3>
          <ol>
            <li>Click the button above to access your beta dashboard OR use the Sign In form with the invite link</li>
            <li>Generate your unique API key</li>
            <li>Download and install the PayPerCrawl WordPress plugin</li>
            <li>Configure your plugin with your API key</li>
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
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendContactNotification(
  name: string,
  email: string,
  subject: string,
  message: string
) {
  const emailSubject = `New Contact Form Submission: ${subject}`;
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
            ${message.replace(/\n/g, "<br>")}
          </div>
        </div>
        
        <p>Please respond to this inquiry promptly.</p>
      </div>
    </body>
    </html>
  `;

  // Send to admin email from environment or fallback
  const adminEmail = process.env.ADMIN_EMAIL || "imaduddin.dev@gmail.com";

  return sendEmail({
    to: adminEmail,
    subject: emailSubject,
    html,
  });
}

// Map categories to internal recipient emails
const CATEGORY_EMAIL_MAP: Record<string, string> = {
  general: 'hello@paypercrawl.tech',
  support: 'support@paypercrawl.tech',
  careers: 'careers@paypercrawl.tech',
};

export interface SupportTicketEmail {
  ticketId: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  category: 'general' | 'support' | 'careers';
  createdAt?: string;
}

// Sends a receipt to the user with ticket details and timeline expectations
export async function sendSupportTicketReceipt(
  to: string,
  ticket: SupportTicketEmail
) {
  const subject = `We received your request (Ticket ${ticket.ticketId})`;
  const html = `
  <!doctype html>
  <html>
  <body style="font-family: Inter, Arial; color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 12px;">Thanks, we've received your request</h2>
      <p style="margin:0 0 16px;">Hi ${ticket.name},</p>
      <p style="margin:0 0 16px;">Your ticket has been created and our team will get back to you within 24–48 hours.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p style="margin:0 0 8px;"><strong>Category:</strong> ${ticket.category}</p>
        <p style="margin:0 0 8px;"><strong>Subject:</strong> ${ticket.subject || 'No subject'}</p>
        <div style="margin-top:12px;">
          <p style="margin:0 0 6px;"><strong>Message</strong></p>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">${ticket.message.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
      <p style="margin:16px 0 0;">Thank you.</p>
      <p style="margin:16px 0 0;">— The PayPerCrawl Team</p>
    </div>
  </body>
  </html>`;
  return sendEmail({ to, subject, html });
}

// Sends an internal notification to the appropriate team inbox
export async function sendSupportTicketInternal(ticket: SupportTicketEmail) {
  const to = CATEGORY_EMAIL_MAP[ticket.category] || CATEGORY_EMAIL_MAP.general;
  const subject = `[${ticket.category.toUpperCase()}] New ticket ${ticket.ticketId}: ${ticket.subject || 'No subject'}`;
  const html = `
  <!doctype html>
  <html>
  <body style="font-family: Inter, Arial; color:#0f172a;">
    <div style="max-width:680px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 12px;">New Support Ticket</h2>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;"><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p style="margin:0 0 8px;"><strong>Category:</strong> ${ticket.category}</p>
        <p style="margin:0 0 8px;"><strong>From:</strong> ${ticket.name} &lt;${ticket.email}&gt;</p>
        <p style="margin:0 0 8px;"><strong>Subject:</strong> ${ticket.subject || 'No subject'}</p>
        <div style="margin-top:12px;">
          <p style="margin:0 0 6px;"><strong>Message</strong></p>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">${ticket.message.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
      <p style="margin:16px 0 0;">Please triage and respond within 24–48 hours.</p>
    </div>
  </body>
  </html>`;
  return sendEmail({ to, subject, html });
}

// Sends a resolution message to the user when a ticket is resolved
export async function sendSupportTicketResolution(
  to: string,
  ticketId: string,
  resolutionMessage: string
) {
  const subject = `Your ticket ${ticketId} has been resolved`;
  const html = `
  <!doctype html>
  <html>
  <body style="font-family: Inter, Arial; color:#0f172a;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 12px;">Ticket Resolved</h2>
      <p style="margin:0 0 16px;">We're writing to let you know that your ticket <strong>${ticketId}</strong> has been resolved.</p>
      <div style="background:#ecfeff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 6px;"><strong>Resolution Details</strong></p>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:12px;">${resolutionMessage.replace(/\n/g, '<br>')}</div>
      </div>
      <p style="margin:16px 0 0;">Thank you.</p>
      <p style="margin:16px 0 0;">— The PayPerCrawl Support Team</p>
    </div>
  </body>
  </html>`;
  return sendEmail({ to, subject, html });
}
