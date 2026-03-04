const nodemailer = require('nodemailer');
import { BrevoClient} from '@getbrevo/brevo';

let transport: any;

// Initialize transport based on environment
if (process.env.NODE_ENV === 'production') {
  // Use Resend for production
  // transport = new Resend(process.env.RESEND_API_KEY);
  //use brevo for prod
  transport = new BrevoClient({
    apiKey: process.env.BREVO_API!
  })
} else {
  // Use Mailtrap for development
  transport = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });
}

const sendPasswordResetMail = async (url: string, email: string, username: string) => {
  const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:'Arial',sans-serif;background-color:#f4f4f4;"><div style="max-width:600px;margin:0 auto;background-color:#ffffff;padding:40px 20px;"><h1 style="margin:0 0 15px 0;padding:0;font-size:24px;">Password Reset Request</h1><p style="margin:0 0 10px 0;padding:0;">Hello <strong>${username}</strong>,</p><p style="margin:0 0 15px 0;padding:0;">We received a request to reset your password. Click the button below to create a new password:</p><table cellpadding="0" cellspacing="0" border="0" style="margin:15px 0;"><tr><td><a href="${url}" style="background-color:#1a1a1a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Reset Password</a></td></tr></table><p style="color:#666;font-size:14px;margin:15px 0 0 0;padding:0;">This link will expire in <strong>1 hour</strong>.</p><hr style="border:none;border-top:1px solid #eee;margin:20px 0;"><p style="color:#999;font-size:13px;margin:0;padding:0;">If you didn't request this password reset, you can safely ignore this email</p></div></body></html>`

  try {
    if (process.env.NODE_ENV === 'production') {
      // Use brevo for production
      const result = await transport.transactionalEmails.sendTransacEmail({
        sender: {name: 'ForzaBuildBase', email: 'rahilganatra@gmail.com'},
        to: [{email}],
        subject: 'Password Reset Link',
        textContent: htmlContent
      });
      return result;
    } else {
      // Use Mailtrap for development
      const info = await transport.sendMail({
        from: 'ForzaBuildBase <rahilganatra@gmail.com>',
        to: email,
        subject: 'Password Reset Link',
        html: htmlContent
      });

      return { success: true, messageId: info.messageId };
    }
  } catch (error) {
    throw error;
  }
};

export { sendPasswordResetMail };