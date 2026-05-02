import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'

const client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(to: string, body: string, mediaUrl?: string) {
  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: `whatsapp:${to.startsWith("+") ? to : `+91${to}`}`,
      mediaUrl: mediaUrl ? [mediaUrl] : undefined,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error("Twilio WhatsApp Error:", error);
    return { success: false, error: error.message };
  }
}
