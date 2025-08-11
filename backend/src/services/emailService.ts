import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
	host: env.email.host,
	port: env.email.port,
	secure: false,
	auth: { user: env.email.user, pass: env.email.pass },
});

export async function sendEmailOTP(to: string, code: string) {
	await transporter.sendMail({
		from: env.email.from,
		to,
		subject: "Your QuickCourt OTP Code",
		text: `Your OTP code is ${code}. It expires in ${env.otp.expMinutes} minutes.`,
	});
}
