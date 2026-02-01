import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from './routes/authRoutes.js';
import studentAuthRoutes from './routes/studentAuthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import postRoutes from './routes/postRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import pool from './config/database.js';

import { patchEventsTable } from "./config/patchEventsTable.js";
import { initPostsDatabase } from './config/initPostsDatabase.js';
import { initStudentsDatabase } from './config/initStudentsDatabase.js';
import { initConnectionsDatabase } from './config/initConnectionsDatabase.js';
import { initDonationsDatabase } from './config/initDonationsDatabase.js';
import { initLocationsDatabase } from './config/initLocationsDatabase.js';
import { initMessagingDatabase } from './config/initMessagingDatabase.js';

// Load env
dotenv.config();

// App
const app = express();
const PORT = process.env.PORT || 5001;

// ✅ CORS FIX (IMPORTANT FOR VERCEL)
app.use(
  cors({
    origin: true, // allow all origins (safe for now)
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  })
);

// ✅ Webhook must come before json()
app.use('/api/donations/webhook', express.raw({ type: 'application/json' }));

// ✅ LIMIT BODY SIZE (CRITICAL FOR OCR)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// ✅ DB test
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SETU API Server is running',
  });
});

// Health
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server healthy',
    time: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/student', studentAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', aiRoutes); // OCR routes
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/messages', messageRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

// ✅ START SERVER AFTER DB INIT
const startServer = async () => {
  try {
    await patchEventsTable();
    await initPostsDatabase();
    await initStudentsDatabase();
    await initDonationsDatabase();
    await initConnectionsDatabase();
    await initLocationsDatabase();
    await initMessagingDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 SETU Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
};

startServer();

// Safety
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

export default app;
