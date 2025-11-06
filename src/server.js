import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import notificationRoutes from "./routes/notificationRoutes.js";
import verificationRoutes from "./routes/verification.js";
import deedNotificationRoutes from "./routes/deedNotification.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://notification-service-beta-opal.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use("/api/notifications", notificationRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/deed-notification", deedNotificationRoutes); // Use a distinct path

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`✅ Notification service running on port ${PORT}`));
