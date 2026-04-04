import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

// ── Transport ─────────────────────────────────────────────────────────────────
// Supports any SMTP provider (Gmail, Outlook, SendGrid, Mailgun, Mailtrap, etc.)
// Set EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS in your .env.
// For Gmail you'll need an App Password (not your account password) if you have
// 2FA enabled.  For Mailtrap (recommended for dev) just paste the SMTP creds.
const createTransporter = () => {
    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT ?? 587);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!host || !user || !pass) {
        throw new Error(
            "[Email] Missing EMAIL_HOST, EMAIL_USER, or EMAIL_PASS environment variables"
        );
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for 587/2587
        auth: { user, pass },
    });
};

// ── Types ────────────────────────────────────────────────────────────────────
export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    text?: string; // plain-text fallback
}

// ── Send ─────────────────────────────────────────────────────────────────────
export const sendEmail = async (payload: EmailPayload): Promise<void> => {
    const transporter = createTransporter();

    const from = `"${process.env.EMAIL_FROM_NAME ?? "DACS Health"}" <${process.env.EMAIL_FROM_ADDRESS ?? process.env.EMAIL_USER}>`;

    await transporter.sendMail({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text ?? payload.html.replace(/<[^>]+>/g, ""), // strip tags for plain-text
    });

    console.log(`[Email] ✓ Sent "${payload.subject}" → ${payload.to}`);
};

// ── HTML Templates ────────────────────────────────────────────────────────────
const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>DACS Notification</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #1a6fcc; padding: 24px 32px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; }
    .body { padding: 32px; color: #333; line-height: 1.6; }
    .body h2 { margin-top: 0; color: #1a6fcc; font-size: 18px; }
    .info-box { background: #f0f7ff; border-left: 4px solid #1a6fcc; border-radius: 4px; padding: 16px 20px; margin: 20px 0; }
    .info-box p { margin: 6px 0; font-size: 14px; }
    .info-box strong { color: #1a4a8a; }
    .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #1a6fcc; color: #fff !important; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 14px; }
    .footer { background: #f4f6f9; padding: 16px 32px; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🏥 DACS Health Portal</h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      This is an automated message from DACS Health. Please do not reply to this email.<br/>
      &copy; ${new Date().getFullYear()} DACS Health System
    </div>
  </div>
</body>
</html>
`;

// Appointment confirmation
export const appointmentConfirmedHtml = (data: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    type: string;
    appointmentId: string;
}) => baseLayout(`
  <h2>Appointment Confirmed ✅</h2>
  <p>Hi <strong>${data.patientName}</strong>,</p>
  <p>Your appointment has been successfully booked. Here are the details:</p>
  <div class="info-box">
    <p><strong>Doctor:</strong> ${data.doctorName}</p>
    <p><strong>Date:</strong> ${data.date}</p>
    <p><strong>Time:</strong> ${data.time}</p>
    <p><strong>Type:</strong> ${data.type}</p>
    <p><strong>Reference:</strong> ${data.appointmentId}</p>
  </div>
  <p>Please arrive 10 minutes before your scheduled time. If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
`);

// Appointment reminder
export const appointmentReminderHtml = (data: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    appointmentId: string;
}) => baseLayout(`
  <h2>Appointment Reminder ⏰</h2>
  <p>Hi <strong>${data.patientName}</strong>,</p>
  <p>This is a friendly reminder about your upcoming appointment:</p>
  <div class="info-box">
    <p><strong>Doctor:</strong> ${data.doctorName}</p>
    <p><strong>Date:</strong> ${data.date}</p>
    <p><strong>Time:</strong> ${data.time}</p>
    <p><strong>Reference:</strong> ${data.appointmentId}</p>
  </div>
  <p>Please remember to bring any relevant medical documents or test results.</p>
`);

// Appointment cancellation
export const appointmentCancelledHtml = (data: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    reason?: string;
    appointmentId: string;
}) => baseLayout(`
  <h2>Appointment Cancelled ❌</h2>
  <p>Hi <strong>${data.patientName}</strong>,</p>
  <p>Your appointment has been cancelled. Details below:</p>
  <div class="info-box">
    <p><strong>Doctor:</strong> ${data.doctorName}</p>
    <p><strong>Date:</strong> ${data.date}</p>
    <p><strong>Time:</strong> ${data.time}</p>
    ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
    <p><strong>Reference:</strong> ${data.appointmentId}</p>
  </div>
  <p>If you'd like to reschedule, please log in to the DACS portal or contact your healthcare provider.</p>
`);

// Bill / payment notification
export const billCreatedHtml = (data: {
    patientName: string;
    amount: string;
    billId: string;
    appointmentId: string;
}) => baseLayout(`
  <h2>New Bill Generated 💳</h2>
  <p>Hi <strong>${data.patientName}</strong>,</p>
  <p>A new bill has been generated for your recent appointment:</p>
  <div class="info-box">
    <p><strong>Bill ID:</strong> ${data.billId}</p>
    <p><strong>Appointment:</strong> ${data.appointmentId}</p>
    <p><strong>Amount Due:</strong> KES ${data.amount}</p>
    <p><strong>Status:</strong> Pending</p>
  </div>
  <p>Please log in to the DACS portal to view the full breakdown and complete payment.</p>
`);

// Welcome / registration email
export const welcomeHtml = (data: { name: string; role: string }) => baseLayout(`
  <h2>Welcome to DACS Health! 🎉</h2>
  <p>Hi <strong>${data.name}</strong>,</p>
  <p>Your <strong>${data.role}</strong> account has been created successfully. You can now log in to the DACS Health Portal to:</p>
  <ul>
    <li>Book and manage appointments</li>
    <li>View your medical records</li>
    <li>Track billing and payments</li>
    <li>Receive real-time notifications</li>
  </ul>
  <p>If you have any questions, please contact our support team.</p>
`);

// Password reset email
export const passwordResetHtml = (data: { name: string; resetLink: string }) => baseLayout(`
  <h2>Password Reset Request 🔐</h2>
  <p>Hi <strong>${data.name}</strong>,</p>
  <p>We received a request to reset your DACS Health account password.</p>
  <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
  <a href="${data.resetLink}" class="btn">Reset My Password</a>
  <p style="margin-top:24px; font-size:13px; color:#888;">If you didn't request a password reset, you can safely ignore this email.</p>
`);