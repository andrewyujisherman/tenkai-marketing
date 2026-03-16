import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Tenkai Marketing <onboarding@resend.dev>'
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@alegius.com'

export async function sendWelcomeEmail(to: string, name: string, tempPassword?: string) {
  const resend = getResend()
  if (!resend) { console.warn('[Email] RESEND_API_KEY not set — skipping welcome email'); return { success: false, error: 'No API key' } }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Tenkai Marketing',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Welcome to Tenkai, ${name || 'there'}!</h1>
          <p style="color: #555; line-height: 1.6;">Your AI marketing team is ready to get to work.</p>
          ${tempPassword ? `
            <div style="background: #f5f0e8; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="color: #333; margin: 0 0 8px 0; font-weight: bold;">Your temporary password:</p>
              <code style="font-size: 16px; color: #c0392b;">${tempPassword}</code>
              <p style="color: #777; font-size: 13px; margin: 8px 0 0 0;">Please change this after your first login.</p>
            </div>
          ` : ''}
          <a href="https://tenkai-marketing.vercel.app/auth/login" style="display: inline-block; background: #c0392b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Sign In to Your Dashboard</a>
          <p style="color: #999; font-size: 13px; margin-top: 30px;">Questions? Reply to this email or reach us at ${SUPPORT_EMAIL}</p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error)
    return { success: false, error }
  }
}

export async function sendContentReadyEmail(to: string, name: string, contentTitle: string) {
  const resend = getResend()
  if (!resend) { console.warn('[Email] RESEND_API_KEY not set — skipping content-ready email'); return { success: false, error: 'No API key' } }
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New content ready for review: ${contentTitle}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Content Ready for Review</h1>
          <p style="color: #555; line-height: 1.6;">Hi ${name || 'there'}, your Tenkai team has prepared new content:</p>
          <div style="background: #f5f0e8; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="color: #333; font-weight: bold; margin: 0;">${contentTitle}</p>
          </div>
          <a href="https://tenkai-marketing.vercel.app/content" style="display: inline-block; background: #c0392b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Review Content</a>
          <p style="color: #999; font-size: 13px; margin-top: 30px;">You're receiving this because content notifications are enabled in your settings.</p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('[Email] Failed to send content-ready email:', error)
    return { success: false, error }
  }
}
