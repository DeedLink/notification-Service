import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject) {
    throw new Error("Missing required email fields: to and subject are required");
  }
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials not configured: EMAIL_USER and EMAIL_PASS must be set");
  }

  console.log(`Sending email to: ${to}, subject: ${subject}`);
  
  const result = await transporter.sendMail({
    from: `"DeedLink" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
  
  console.log(`Email sent successfully. MessageId: ${result.messageId}`);
  return result;
};

export default sendEmail;
