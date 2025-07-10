const express = require('express');
const router = express.Router();
const generateAiResponse = require('../generateAiResponse');

router.post('/analyse', async (req, res) => {
  try {
    const { code } = req.body;
    const analysis = await generateAiResponse(code);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 