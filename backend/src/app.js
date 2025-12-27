require('dotenv').config();
require('./cron/notification.cron');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// ----------------------------------------------------
// CORS
// ----------------------------------------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ----------------------------------------------------
// BODY PARSER
// ----------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------
// STATIC FILE
// ----------------------------------------------------
app.use('/uploads', express.static('uploads'));

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------
app.use('/auth', require('./routes/auth.route'));
app.use('/help', require('./routes/help.route'));
app.use('/profile', require('./routes/profile.route'));
app.use('/missions', require('./routes/missions.route'));
app.use('/leaderboard', require('./routes/leaderboard.route'));
app.use('/admin', require('./routes/admin.route'));
app.use('/notifications', require('./routes/notification.route'));
app.use('/badges', require('./routes/badge.route'));

// ----------------------------------------------------
// GLOBAL ERROR HANDLER
// ----------------------------------------------------
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'Ukuran file terlalu besar. Maksimal 5MB' 
      });
    }
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// ----------------------------------------------------
// DATABASE CHECK
// ----------------------------------------------------
async function checkDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
}

// ----------------------------------------------------
// EXPORT APP
// ----------------------------------------------------
module.exports = {
  app,
  prisma,
  checkDB,
};
