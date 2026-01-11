export function generateVerificationOtpEmailTemplate(otpCode){

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
  </div>`
}