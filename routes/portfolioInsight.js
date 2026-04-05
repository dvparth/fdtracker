const express = require('express');
const router = express.Router();
const { summarizePortfolio } = require('../services/llmService');

router.post('/', async (req, res) => {
  try {
    const portfolioDetails = req.body;
    const modelOverride = req.query.model; // Allow model override via query parameter

    if (!portfolioDetails || typeof portfolioDetails !== 'object') {
      return res.status(400).json({ error: 'Request body must contain portfolio details JSON.' });
    }

    const insight = await summarizePortfolio(portfolioDetails, modelOverride);
    return res.json({ insight, model: modelOverride || process.env.HUGGINGFACE_MODEL || 'default' });
  } catch (error) {
    console.error('[portfolioInsight] error', error?.message || error);
    return res.status(500).json({ error: error?.message || 'Unable to generate portfolio insight.' });
  }
});

module.exports = router;
