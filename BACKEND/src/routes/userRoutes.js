// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Fetch user data
router.get('/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update user points
router.post('/:telegramId/points', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { telegramId: req.params.telegramId },
      { points: req.body.points },
      { new: true, upsert: true }
    );
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
