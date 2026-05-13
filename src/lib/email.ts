import { SendMailClient } from 'zeptomail';

const client = new SendMailClient({
  url: 'https://api.zeptomail.eu/v1.1/email',
  token: process.env.ZEPTOMAIL_TOKEN!,
});

const FROM = {
  address: process.env.ZEPTOMAIL_FROM_ADDRESS ?? 'noreply@babalola.dev',
  name: process.env.ZEPTOMAIL_FROM_NAME ?? 'Babalola Brainiac',
};

export async function sendLearnerCredentials(
  toEmail: string,
  toName: string,
  password: string,
): Promise<void> {
  await client.sendMail({
    from: FROM,
    to: [{ email_address: { address: toEmail, name: toName } }],
    subject: 'Your Brainiac Learning Platform Access',
    htmlbody: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="margin:0 0 8px;color:#1e1b4b;">Brainiac Learning Platform</h2>
        <p style="color:#64748b;margin:0 0 24px;">Your account is ready. Use the credentials below to sign in.</p>
        <div style="background:#f1f5f9;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;letter-spacing:.05em;text-transform:uppercase;">Email</p>
          <p style="margin:0 0 16px;font-size:15px;color:#0f172a;font-family:monospace;">${toEmail}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;letter-spacing:.05em;text-transform:uppercase;">Password</p>
          <p style="margin:0;font-size:20px;color:#0f172a;font-family:monospace;letter-spacing:.12em;">${password}</p>
        </div>
        <a href="https://babalola.dev/auth/signin?callbackUrl=%2Flearning"
           style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
          Sign in to learning platform
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
          This is your permanent password — save it. To reset it, use the Get Access form again with the same email.
        </p>
      </div>
    `,
  });
}
