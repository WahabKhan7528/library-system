export function generateVerificationOtpEmailTemplate(otpCode) {
  return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #4CAF50;">Bookworm Library - Email Verification</h2>
    <p>Dear User,</p>
    <p>Thank you for registering with Bookworm Library! To complete your registration, please use the following verification code:</p>
    <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block; margin: 20px 0;">
      <strong style="font-size: 24px; letter-spacing: 2px;">${otpCode}</strong>
    </div>
    <p>This code is valid for the next 15 minutes. Please do not share this code with anyone.</p>
    <p>If you did not initiate this request, please ignore this email.</p>
    <p>Happy Reading!</p>
    <p>Best Regards,<br/>The Bookworm Library Team</p>
  </div>`;
}

export function generateForgetPasswordEmailTemplate(resetPasswordUrl) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #4CAF50;">Bookworm Library - Password Reset</h2>
    <p>Dear User,</p>
    <p>We received a request to reset your password for your Bookworm Library account. To proceed with resetting your password, please click on the link below:</p>
    <div style="margin: 20px 0;">
      <a href="${resetPasswordUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    </div>
    <p>This link will expire in 15 minutes. If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
    <p>If the button above does not work, please copy and paste the following URL into your web browser:</p>
    <p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a></p>
    <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
    <p>Happy Reading!</p>
    <p>Best Regards,<br/>The Bookworm Library Team</p>
  </div>

  `;
}
