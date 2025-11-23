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
let connection;
let reconnectTimeout;
let isReconnecting = false;

// Connection event handlers
const setupConnectionHandlers = (conn) => {
  conn.on("close", () => {
    console.warn("RabbitMQ connection closed, will reconnect...");
    channel = null;
    connection = null;
    isReconnecting = false;
  });

  conn.on("error", (err) => {
    console.error("RabbitMQ connection error:", err.message);
    channel = null;
    connection = null;
    isReconnecting = false;
  });
};

export async function getChannel() {
  // Check if channel exists and connection is still open
  if (channel && connection) {
    try {
      // Verify channel is still valid by checking connection state
      if (connection.readyState === 'open') {
        return channel;
      } else {
        console.warn("Connection state is not open, resetting...");
        channel = null;
        connection = null;
      }
    } catch (err) {
      console.warn("Channel validation failed, resetting:", err.message);
      channel = null;
      connection = null;
    }
  }

  // Prevent multiple simultaneous reconnection attempts
  if (isReconnecting) {
    console.log("Reconnection already in progress, waiting...");
    // Wait for existing reconnection attempt
    let attempts = 0;
    while (isReconnecting && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      if (channel && connection) return channel;
    }
  }

  isReconnecting = true;

  try {
    console.log(`Connecting to RabbitMQ at ${RABBITMQ_HOST}:${RABBITMQ_PORT}...`);
    connection = await amqp.connect(RABBITMQ_URL, {
      heartbeat: 60,
      connection_timeout: 10000,
    });

    setupConnectionHandlers(connection);

    channel = await connection.createChannel();
    
    // Handle channel errors
    channel.on("error", (err) => {
      console.error("RabbitMQ channel error:", err.message);
      channel = null;
    });

    channel.on("close", () => {
      console.warn("RabbitMQ channel closed");
      channel = null;
    });

    await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });
    console.log("RabbitMQ connected and queue asserted:", RABBITMQ_QUEUE);
    
    isReconnecting = false;
    return channel;
  } catch (err) {
    isReconnecting = false;
    console.error("Failed to connect to RabbitMQ:", err.message);
    console.error("Connection URL:", RABBITMQ_URL.replace(/:[^:@]+@/, ':****@'));
    
    // Schedule retry
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    reconnectTimeout = setTimeout(() => {
      console.log("Retrying RabbitMQ connection...");
      getChannel().catch(() => {}); // Ignore errors, will retry again
    }, 5000);
    
    throw err;
  }
}

// Export function to check connection health
export function isConnected() {
  return channel && connection && connection.readyState === 'open';
}

// Export function to reset connection
export function resetConnection() {
  if (channel) {
    try {
      channel.close().catch(() => {});
    } catch (e) {
      // Ignore
    }
  }
  if (connection) {
    try {
      connection.close().catch(() => {});
    } catch (e) {
      // Ignore
    }
  }
  channel = null;
  connection = null;
  isReconnecting = false;
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
}
