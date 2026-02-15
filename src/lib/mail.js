import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'noreply@example.com';

export async function sendResetEmail(to, resetLink) {
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: 'CTMS - Reset your password',
    html: `
      <p>You requested a password reset for your CTMS account.</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
  if (error) throw new Error(error.message);
  return data;
}

/** Send OTP email for User (verification or password reset) via Resend */
export async function sendOtpEmail(to, otp, purpose = 'verification') {
  const subject =
    purpose === 'reset'
      ? 'CTMS - Your password reset OTP'
      : 'CTMS - Verify your email';
  const message =
    purpose === 'reset'
      ? `Use this OTP to reset your password: <strong>${otp}</strong>. It expires in 10 minutes.`
      : `Your email verification OTP is: <strong>${otp}</strong>. It expires in 10 minutes.`;
  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject,
    html: `
      <p>${message}</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
  if (error) throw new Error(error.message);
  return data;
}
