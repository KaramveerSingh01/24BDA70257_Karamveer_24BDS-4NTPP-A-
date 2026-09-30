require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const studyPlanRoutes = require('./routes/studyPlans');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20kb' }));
app.use(session({
  name: 'skillpath.sid',
  secret: process.env.SESSION_SECRET || 'local-college-demo-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: 'Please log in to continue.' });
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'The database is unavailable. Start MongoDB and try again.' });
  next();
}

function requirePageLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login.html');
  next();
}

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
for (const page of ['dashboard.html', 'study-plan.html', 'profile.html']) {
  app.get(`/${page}`, requirePageLogin, (_req, res) => res.sendFile(path.join(__dirname, 'public', page)));
}
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', (req, res, next) => {
  if (['/register', '/login', '/me', '/logout'].includes(req.path) && mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'The database is unavailable. Start MongoDB and try again.' });
  }
  next();
}, authRoutes);
app.use('/api/study-plans', requireLogin, studyPlanRoutes);

app.use((error, _req, res, _next) => {
  console.error('Request failed:', error.message);
  if (res.headersSent) return;
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillpath-ai')
  .then(() => console.log('Connected to MongoDB.'))
  .catch((error) => console.error(`MongoDB unavailable: ${error.message}. Pages are still available.`));

app.listen(port, () => console.log(`SkillPath AI is running at http://localhost:${port}`));