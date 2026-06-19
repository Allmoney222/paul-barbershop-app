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

export interface StaffInviteEmailDetails {
  to: string;
  staffName: string;
  shopName: string;
  inviteLink: string;
}

export async function sendStaffInviteEmail(details: StaffInviteEmailDetails) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping invite email");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "2Gether Hair Studio <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to: details.to,
    subject: `You've been invited to join ${escapeHtml(details.shopName)}`,
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; background:#0D0D0D; color:#F5F5F5; padding:32px; max-width:560px; margin:0 auto;">
        <h1 style="font-size:24px; margin-bottom:4px;">
          <span style="color:#C9A96E; font-style:italic;">2Gether</span> Hair Studio
        </h1>
        <p style="color:#888888; margin-top:0; font-size:14px;">Staff Portal Invitation</p>
        <hr style="border:none; border-top:1px solid #C9A96E; opacity:0.5; margin:24px 0;" />

        <p>Hi ${escapeHtml(details.staffName)},</p>
        <p>
          You've been invited to join the ${escapeHtml(details.shopName)} staff portal, where you can
          manage your schedule, availability, services, and client list.
        </p>

        <div style="margin:32px 0; text-align:center;">
          <a
            href="${details.inviteLink}"
            style="display:inline-block; background:#C9A96E; color:#0D0D0D; text-decoration:none;
                   font-weight:600; font-size:15px; padding:14px 32px; border-radius:8px;"
          >
            Accept Invitation &amp; Set Password
          </a>
        </div>

        <p style="color:#888888; font-size:13px;">
          This link will take you to a page where you can create your password. Once set, you can
          sign in any time at <strong style="color:#F5F5F5;">${escapeHtml(process.env.NEXT_PUBLIC_APP_URL ?? "")}/barber/login</strong>.
        </p>
        <p style="color:#888888; font-size:13px;">
          The link expires in 24&nbsp;hours. If it has expired, ask your administrator to send a new one.
        </p>

        <hr style="border:none; border-top:1px solid #333; margin:24px 0;" />
        <p style="color:#888888; font-size:12px; margin:0;">
          ${escapeHtml(details.shopName)} &middot; If you weren&apos;t expecting this email, you can safely ignore it.
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
