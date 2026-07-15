import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Initialize Twilio client if credentials are configured
 */
function getTwilioClient() {
  if (!accountSid || !authToken || !fromPhoneNumber) {
    return null;
  }
  return twilio(accountSid, authToken);
}

/**
 * Check if Twilio is properly configured
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && fromPhoneNumber);
}

/**
 * Send an SMS message via Twilio
 * @param toPhoneNumber - Recipient phone number (E.164 format or auto-formatted)
 * @param message - SMS message body
 * @returns true if sent successfully, false otherwise
 */
export async function sendSMS(toPhoneNumber: string, message: string): Promise<boolean> {
  const client = getTwilioClient();

  if (!client) {
    console.warn("Twilio not configured. Skipping SMS notification.", { toPhoneNumber, message });
    return false;
  }

  try {
    // Normalize phone number: if it doesn't start with +, assume US and prepend +1
    let formattedNumber = toPhoneNumber.trim();
    if (!formattedNumber.startsWith("+")) {
      if (formattedNumber.startsWith("1")) {
        formattedNumber = "+" + formattedNumber;
      } else {
        formattedNumber = "+1" + formattedNumber;
      }
    }

    const result = await client.messages.create({
      body: message,
      from: fromPhoneNumber,
      to: formattedNumber,
    });

    console.log("SMS sent successfully", { messageSid: result.sid, to: formattedNumber });
    return true;
  } catch (error) {
    console.error("Failed to send SMS", { error, toPhoneNumber });
    return false;
  }
}

/**
 * Send booking confirmation SMS to client
 */
export async function sendBookingConfirmationSMS(params: {
  clientPhone: string;
  clientName: string;
  serviceName: string;
  staffName: string;
  startTime: Date;
  cancelToken: string;
}): Promise<boolean> {
  const { clientPhone, clientName, serviceName, staffName, startTime } = params;

  const formattedTime = startTime.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const message = `Hi ${clientName}! Your appointment is confirmed with ${staffName} for ${serviceName} on ${formattedTime}. Reply CANCEL or visit your confirmation email to reschedule. Reply STOP to opt out. 💈`;

  return sendSMS(clientPhone, message);
}

/**
 * Send booking alert SMS to barber/staff
 */
export async function sendBookingAlertSMS(params: {
  staffPhone: string;
  staffName: string;
  clientName: string;
  serviceName: string;
  startTime: Date;
}): Promise<boolean> {
  const { staffPhone, staffName, clientName, serviceName, startTime } = params;

  const formattedTime = startTime.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const message = `New booking alert for ${staffName}: ${clientName} has booked ${serviceName} on ${formattedTime}. 📅`;

  return sendSMS(staffPhone, message);
}

/**
 * Send cancellation SMS to client
 */
export async function sendReminderSMS(params: {
  clientPhone: string;
  clientName: string;
  serviceName: string;
  staffName: string;
  startTime: Date;
}): Promise<boolean> {
  const { clientPhone, clientName, serviceName, staffName, startTime } = params;

  const formattedTime = startTime.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const message = `Hi ${clientName}, just a reminder that you have an appointment tomorrow with ${staffName} for ${serviceName} at ${formattedTime}. 2Gether Hair Studio. Reply STOP to opt out.`;

  return sendSMS(clientPhone, message);
}

export async function sendCancellationSMS(params: {
  clientPhone: string;
  clientName: string;
  serviceName: string;
  startTime: Date;
}): Promise<boolean> {
  const { clientPhone, clientName, serviceName, startTime } = params;

  const formattedTime = startTime.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const message = `Hi ${clientName}, your appointment for ${serviceName} on ${formattedTime} has been cancelled. Please contact us if you have any questions. 2Gether Hair Studio. Reply STOP to opt out.`;

  return sendSMS(clientPhone, message);
}
