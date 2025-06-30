const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerUser, loginUser } = require('../controllers/authController');
const jwt = require('jsonwebtoken');

// Test route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Chrona API' });
});

router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    
    // Set cookie and redirect to frontend
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

module.exports = router; 