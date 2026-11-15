/**
 * Vercel Serverless Function Entry Point
 * Exports the Express / Node app instance to handle serverless requests under /api/*
 */
const path = require('path');

// Ensure environment variables are loaded
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '../.env') });
} catch (e) {
  // Production Vercel automatically populates process.env from Dashboard
}

const { connectDB } = require('../server/config/db');
const app = require('../server/app');

// Ensure MongoDB connection is initialized in serverless environment
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless] DB connection note:', err.message);
    }
  }

  // Handle the request with Express / app instance
  return app(req, res);
};
