import "dotenv/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

export const sendEmail = async ({ recipientEmail, recipientName }) => {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API,
  });

  const sentFrom = new Sender(
    "contato@muitoalemdomicrofone.com.br",
    "Muito Além do Microfone"
  );

  const recipients = [new Recipient(recipientEmail, recipientName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject("Confirmação de anúncio")
    .setHtml("<strong>This is the HTML content</strong>")
    .setText("This is the text content");

  try {
    await mailerSend.email.send(emailParams);
    return true;
  } catch (error) {
    console.error(error);
    return error;
  }
};
