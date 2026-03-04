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

const sendVerificationMail = async (otp: string, username: string, email: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
          <div style="text-align: center; padding-bottom: 15px;">
            <h1 style="color: #333333; font-size: 24px; margin: 0; padding: 0;">Email Verification</h1>
          </div>
          <div style="text-align: center; color: #666666;">
            <p style="font-size: 18px; color: #333333; margin: 0 0 10px 0; padding: 0;">Hello <strong>${username}</strong>,</p>
            <p style="font-size: 16px; margin: 0 0 15px 0; padding: 0; line-height: 1.4;">
              Thank you for signing up! Please use the verification code below to complete your registration.
            </p>
            <div style="background: #1a1a1a; border-radius: 8px; padding: 15px; margin: 15px 0; border: 2px solid #e0e0e0;">
              <div style="font-size: 28px; font-weight: bold; letter-spacing: 8px; padding-left: 12px; color: #ffffff; user-select: all; -webkit-user-select: all; cursor: text; font-family: 'Courier New', monospace; margin: 0;">${otp}</div>
              <p style="color: #cccccc; font-size: 13px; margin: 8px 0 0 0; padding: 0; opacity: 0.9;">Click to select and copy</p>
            </div>
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; text-align: left; color: #856404; font-size: 14px;">
              <strong>Important:</strong> This code will expire in <strong>10 minutes</strong>
            </div>
            <p style="font-size: 14px; color: #666666; margin: 12px 0; padding: 0; line-height: 1.4;">
              Enter this code on the verification page to activate your account.
            </p>
            <p style="color: #dc3545; font-size: 14px; margin: 12px 0 0 0; padding: 0;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eeeeee; text-align: center; color: #999999; font-size: 12px;">
            <p style="margin: 0; padding: 0;">This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    if (process.env.NODE_ENV === 'production') {
      // Use brevo for production
      const result = await transport.transactionalEmails.sendTransacEmail({
        sender: {name: 'ForzaBuildBase', email: 'rahilganatra@gmail.com'},
        to: [{email}],
        subject: 'Verify Your Email Address',
        textContent: htmlContent
      });
      return result;
    } else {
      // Use Mailtrap for development
      const info = await transport.sendMail({
        from: 'ForzaBuildBase <rahilganatra@gmail.com>',
        to: email,
        subject: 'Verify Your Email Address',
        html: htmlContent
      });

      return { success: true, messageId: info.messageId };
    }
  } catch (err) {
      throw err;
  }
};

export { sendVerificationMail };