import twilio from "twilio";
import { env } from "../config/env.js";

const client = twilio(env.twilio.accountSid, env.twilio.authToken);

export async function sendSmsOTP(to: string, code: string) {
	if (!env.twilio.messagingServiceSid)
		throw new Error("Twilio messaging service SID missing");
	await client.messages.create({
		to,
		messagingServiceSid: env.twilio.messagingServiceSid,
		body: `Your OTP code is ${code}. It expires in ${env.otp.expMinutes} minutes.`,
	});
}

export async function sendWhatsAppOTP(to: string, code: string) {
	if (!env.twilio.whatsappFrom)
		throw new Error("Twilio WhatsApp from number missing");
	await client.messages.create({
		from: env.twilio.whatsappFrom,
		to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
		body: `Your OTP code is ${code}. It expires in ${env.otp.expMinutes} minutes.`,
	});
}
