import amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const {
  RABBITMQ_USER,
  RABBITMQ_PASS,
  RABBITMQ_HOST,
  RABBITMQ_PORT,
  RABBITMQ_QUEUE,
} = process.env;

const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;

let channel;

export async function getChannel() {
  if (channel) return channel;

  try {
    console.log("Connecting to RabbitMQ at", RABBITMQ_URL);
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });
    console.log("RabbitMQ connected and queue asserted:", RABBITMQ_QUEUE);
    return channel;
  } catch (err) {
    console.error("Failed to connect to RabbitMQ:", err.message);
    throw err;
  }
}
