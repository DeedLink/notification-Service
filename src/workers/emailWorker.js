import { startConsumer } from "../utils/consumer.js";
import { handleEmailNotification } from "../utils/emailHandler.js";

console.log("Email worker loaded, starting consumer...");
startConsumer(handleEmailNotification);
