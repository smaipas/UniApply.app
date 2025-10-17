interface EmailTemplateData {
  title: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
  additionalInfo?: string;
  footerMessage?: string;
}

function createBaseEmailTemplate(data: EmailTemplateData): string {
  const {
    title,
    message,
    buttonText,
    buttonUrl,
    additionalInfo,
    footerMessage = "This email was sent from UniApply. If you have any questions, please contact support.",
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - UniApply</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3d6294 0%, #568ac8 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">UniApply</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 16px;">University Application Management System</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #3d6294; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">${title}</h2>
          
          <div style="margin-bottom: 30px;">
            ${message}
          </div>
          
          ${
            buttonText && buttonUrl
              ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${buttonUrl}" 
                 style="background: linear-gradient(135deg, #3d6294 0%, #568ac8 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        display: inline-block; 
                        font-weight: 600; 
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(61, 98, 148, 0.3);
                        transition: all 0.3s ease;">
                ${buttonText}
              </a>
            </div>
          `
              : ""
          }
          
          ${
            additionalInfo
              ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3d6294; margin: 20px 0;">
              ${additionalInfo}
            </div>
          `
              : ""
          }
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
          <p style="font-size: 14px; color: #6c757d; margin: 0; text-align: center;">
            ${footerMessage}
          </p>
          <p style="font-size: 12px; color: #adb5bd; margin: 10px 0 0 0; text-align: center;">
            © ${new Date().getFullYear()} UniApply. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function createPasswordResetEmail(
  email: string,
  code: string,
  frontendUrl: string
): { subject: string; html: string } {
  const resetUrl = `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&code=${code}`;

  return {
    subject: "Reset your password - UniApply",
    html: createBaseEmailTemplate({
      title: "Reset your password",
      message: `
        <p>You requested to reset your password for your UniApply account.</p>
        <p>Click the button below to reset your password:</p>
      `,
      buttonText: "Reset Password",
      buttonUrl: resetUrl,
      additionalInfo: `
        <p><strong>Alternative:</strong> Copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #dee2e6; font-family: monospace; font-size: 12px;">
          ${resetUrl}
        </p>
        <p><strong>⚠️ Important:</strong> This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
      `,
    }),
  };
}

export function createRegistrationConfirmationEmail(
  email: string,
  code: string,
  frontendUrl: string
): { subject: string; html: string } {
  const confirmUrl = `${frontendUrl}/confirm-registration?email=${encodeURIComponent(email)}&code=${code}`;

  return {
    subject: "Confirm your email address - UniApply",
    html: createBaseEmailTemplate({
      title: "Welcome to UniApply!",
      message: `
        <p>Thank you for registering with UniApply! We're excited to have you join our university application management system.</p>
        <p>To complete your registration and activate your account, please confirm your email address by clicking the button below:</p>
      `,
      buttonText: "Confirm Email Address",
      buttonUrl: confirmUrl,
      additionalInfo: `
        <p><strong>Alternative:</strong> Copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px; border: 1px solid #dee2e6; font-family: monospace; font-size: 12px;">
          ${confirmUrl}
        </p>
        <p><strong>⚠️ Important:</strong> This confirmation link will expire in 24 hours.</p>
        <p>If you didn't create an account with UniApply, please ignore this email.</p>
      `,
    }),
  };
}

export function createWelcomeEmail(
  email: string,
  firstName?: string
): { subject: string; html: string } {
  const greeting = firstName ? `Hello ${firstName}` : "Hello";

  return {
    subject: "Welcome to UniApply!",
    html: createBaseEmailTemplate({
      title: "Welcome to UniApply!",
      message: `
        <p>${greeting},</p>
        <p>Your email address has been successfully confirmed and your UniApply account is now active!</p>
        <p>You can now:</p>
        <ul style="margin: 20px 0; padding-left: 20px;">
          <li>Complete your profile information</li>
          <li>Browse available application forms</li>
          <li>Submit university applications</li>
          <li>Track your application status</li>
        </ul>
        <p>We're here to help make your university application process as smooth as possible.</p>
      `,
      buttonText: "Get Started",
      buttonUrl: process.env.FRONTEND_URL || "https://dev.uniapply.app",
      additionalInfo: `
        <p><strong>Need help?</strong> If you have any questions or need assistance, don't hesitate to contact our support team.</p>
      `,
    }),
  };
}

export function createPasswordChangeConfirmationEmail(): {
  subject: string;
  html: string;
} {
  return {
    subject: "Password changed successfully - UniApply",
    html: createBaseEmailTemplate({
      title: "Password changed successfully",
      message: `
        <p>Your password has been successfully changed for your UniApply account.</p>
        <p>If you made this change, no further action is required.</p>
      `,
      additionalInfo: `
        <p><strong>Security Notice:</strong> If you didn't make this change, please contact our support team immediately and consider changing your password again.</p>
        <p>For your security, we recommend using a strong, unique password that you don't use for other accounts.</p>
      `,
    }),
  };
}
