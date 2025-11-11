import dotenv from "dotenv";
import { getChannel } from "../hopping/rabbitmq.js";

dotenv.config();

const { RABBITMQ_QUEUE } = process.env;

export async function startConsumer(onMessage) {
  try {
    const channel = await getChannel();
    console.log(`Listening for messages on queue: "${RABBITMQ_QUEUE}"`);

    channel.consume(
      RABBITMQ_QUEUE,
      async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          console.log("Received message:", content);
          await onMessage(content);

          channel.ack(msg);
        } catch (err) {
          console.error("Error processing message:", err.message);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error starting RabbitMQ consumer:", error.message);
    setTimeout(() => startConsumer(onMessage), 5000);
  }
}
