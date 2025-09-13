const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/db');
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');

dbConnect();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

module.exports = app;
