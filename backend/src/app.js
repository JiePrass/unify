require('dotenv').config();
require('./cron/notification.cron');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// ----------------------------------------------------
// 2️⃣ CORS
// ----------------------------------------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ----------------------------------------------------
// 3️⃣ BODY PARSER
// ----------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------
// 4️⃣ STATIC FILE
// ----------------------------------------------------
app.use('/uploads', express.static('uploads'));

// ----------------------------------------------------
// 5️⃣ OTHER ROUTES
// ----------------------------------------------------
app.use('/auth', require('./routes/auth.route'));
app.use('/help', require('./routes/help.route'));
app.use('/profile', require('./routes/profile.route'));
app.use('/missions', require('./routes/missions.route'));
app.use('/leaderboard', require('./routes/leaderboard.route'));
app.use('/admin', require('./routes/admin.route'));
app.use('/notifications', require('./routes/notification.route'));

// ----------------------------------------------------
// 6️⃣ ERROR HANDLER
// ----------------------------------------------------
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err);

  if (err instanceof multer.MulterError)
    return res.status(400).json({ error: err.message });

  return res.status(500).json({
    error: err.message || "Internal Server Error",
    details: err,
  });
});

// ----------------------------------------------------
// 7️⃣ START SERVER
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

const PORT = process.env.PORT || 3000;
checkDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
