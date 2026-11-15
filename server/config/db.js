/**
 * MongoDB Atlas Connection Configuration via Mongoose
 * Gracefully handles connection states, retries, and offline fallbacks.
 */
let mongoose;
try {
  mongoose = require('mongoose');
} catch (e) {
  mongoose = null;
}

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[MongoDB] Notice: MONGODB_URI is not set in environment.');
    console.log('[MongoDB] Running in resilient in-memory mode with full seed data.');
    return false;
  }

  if (!mongoose) {
    console.log('[MongoDB] Notice: mongoose package not installed in current environment.');
    console.log('[MongoDB] Using in-memory store. Run npm install to connect to MongoDB Atlas.');
    return false;
  }

  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Successfully connected to MongoDB Atlas: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error(`[MongoDB] Atlas Connection Error: ${err.message}`);
    console.log('[MongoDB] Falling back to in-memory store so the portfolio remains online.');
    return false;
  }
};

const getDbStatus = () => {
  if (mongoose && mongoose.connection.readyState === 1) {
    return {
      connected: true,
      provider: 'MongoDB Atlas',
      readyState: 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }
  return {
    connected: false,
    provider: 'In-Memory Resilient Store (Seeded)',
    readyState: 0,
    note: 'Set MONGODB_URI in .env to connect to live MongoDB Atlas'
  };
};

module.exports = { connectDB, getDbStatus, mongoose };
