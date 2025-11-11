import transporter from "../config/emailConfig.js";

async function sendEmail(to, subject, message, html) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
}

export default sendEmail;
