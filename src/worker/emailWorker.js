import dotenv from "dotenv";
import axios from "axios";
import { startConsumer } from "../utils/consumer.js";
import sendEmail from "../utils/sendEmail.js";

dotenv.config();

const { USER_SERVICE_URL, INTERNAL_ACCESS_KEY } = process.env;

async function getEmailFromWallet(walletAddress) {
  try {
    const response = await axios.get(
      `${USER_SERVICE_URL}/email/${walletAddress}`,
      {
        headers: {
          "x-internal-key": INTERNAL_ACCESS_KEY,
        },
      }
    );

    return response.data.email;
  } catch (error) {
    console.error(
      `Failed to fetch email for wallet ${walletAddress}:`,
      error.message
    );
    return null;
  }
}

async function handleEmailNotification(data) {
  try {
    const { ownerWalletAddress, deed, time } = data;

    const recipientEmail = await getEmailFromWallet(ownerWalletAddress);
    if (!recipientEmail) {
      console.warn(`No email found for wallet ${ownerWalletAddress}`);
      return;
    }

    const subject = "New Deed Sent for Registration";
    const message = `A new deed has been created for wallet: ${ownerWalletAddress} at ${time}`;
    const html = `
      <h2>New Deed Registered!</h2>
      <p><strong>Wallet:</strong> ${ownerWalletAddress}</p>
      <p><strong>Survey Plan:</strong> ${deed.surveyPlanNumber || "N/A"}</p>
      <p><strong>Created At:</strong> ${new Date(time).toLocaleString()}</p>
    `;

    await sendEmail(recipientEmail, subject, message, html);
    console.log(`Email sent successfully to ${recipientEmail}`);
  } catch (error) {
    console.error("Failed to process email notification:", error.message);
  }
}

startConsumer(handleEmailNotification);
