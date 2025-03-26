import "dotenv/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { getConfirmationEmailHtml } from "./templates/announcementConfirmation.js";

export const sendEmail = async ({
  recipientEmail,
  recipientName,
  confirmationCode,
}) => {
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
    .setHtml(getConfirmationEmailHtml(confirmationCode));

  try {
    await mailerSend.email.send(emailParams);
    return true;
  } catch (error) {
    console.error(error);
    return error;
  }
};
