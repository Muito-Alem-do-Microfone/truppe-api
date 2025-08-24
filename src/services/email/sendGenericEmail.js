import "dotenv/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

export const sendGenericEmail = async ({ to, subject, html, name = "" }) => {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API,
  });

  const sentFrom = new Sender(
    "contato@muitoalemdomicrofone.com.br",
    "Muito Além do Microfone"
  );

  const recipients = [new Recipient(to, name)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(subject)
    .setHtml(html);

  try {
    await mailerSend.email.send(emailParams);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};
