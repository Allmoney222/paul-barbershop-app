import { Resend } from "resend";
import { formatDateLong, formatPrice, formatTime12h } from "@/lib/format";
import { SHOP_TIMEZONE } from "@/lib/constants";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export interface BookingEmailDetails {
  to: string;
  clientName: string;
  shopName: string;
  staffName: string;
  serviceName: string;
  priceCents: number;
  startTime: Date;
  endTime: Date;
  cancelToken: string;
  depositPaid: boolean;
}

export async function sendBookingConfirmationEmail(details: BookingEmailDetails) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping confirmation email");
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cancelUrl = `${appUrl}/book/confirmation/${details.cancelToken}`;
  const dateStr = formatDateLong(details.startTime, SHOP_TIMEZONE);
  const timeStr = `${formatTime12h(details.startTime, SHOP_TIMEZONE)} - ${formatTime12h(details.endTime, SHOP_TIMEZONE)}`;

  const from = process.env.RESEND_FROM_EMAIL ?? "2Gether Hair Studio <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to: details.to,
    subject: `You're booked at ${details.shopName} — ${dateStr}`,
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; background:#0D0D0D; color:#F5F5F5; padding:32px;">
        <h1 style="font-size:24px; margin-bottom:4px;">
          <span style="color:#C9A96E; font-style:italic;">2Gether</span> Hair Studio
        </h1>
        <p style="color:#888888; margin-top:0;">Where beauty, style, and community come together.</p>
        <hr style="border:none; border-top:1px solid #C9A96E; opacity:0.5; margin:24px 0;" />
        <p>Hi ${escapeHtml(details.clientName)},</p>
        <p>Your appointment is confirmed! Here are the details:</p>
        <table style="width:100%; margin:16px 0; border-collapse:collapse;">
          <tr><td style="padding:4px 0; color:#888888;">Service</td><td style="padding:4px 0; text-align:right;">${escapeHtml(details.serviceName)}</td></tr>
          <tr><td style="padding:4px 0; color:#888888;">With</td><td style="padding:4px 0; text-align:right;">${escapeHtml(details.staffName)}</td></tr>
          <tr><td style="padding:4px 0; color:#888888;">Date</td><td style="padding:4px 0; text-align:right;">${dateStr}</td></tr>
          <tr><td style="padding:4px 0; color:#888888;">Time</td><td style="padding:4px 0; text-align:right;">${timeStr}</td></tr>
          <tr><td style="padding:4px 0; color:#888888;">Price</td><td style="padding:4px 0; text-align:right;">${formatPrice(details.priceCents)}</td></tr>
          ${details.depositPaid ? `<tr><td style="padding:4px 0; color:#888888;">Deposit</td><td style="padding:4px 0; text-align:right;">Paid</td></tr>` : ""}
        </table>
        <hr style="border:none; border-top:1px solid #333; margin:24px 0;" />
        <p style="color:#888888; font-size:14px;">
          Need to cancel? You can cancel up to 24 hours before your appointment:
        </p>
        <p>
          <a href="${cancelUrl}" style="color:#C9A96E;">${cancelUrl}</a>
        </p>
        <p style="color:#888888; font-size:12px; margin-top:32px;">
          2Gether Hair Studio · Buffalo, NY
        </p>
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
