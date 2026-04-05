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
    
    // Handle HuggingFace 402 (credit depletion) specifically
    if (error?.status === 402 && error?.provider === 'huggingface') {
      return res.status(402).json({
        error: 'AI service credits depleted',
        message: 'Your HuggingFace account has run out of included credits. Please purchase pre-paid credits or subscribe to PRO to continue using portfolio insights.',
        details: error.message,
      });
    }
    
    // Handle other 5xx errors from HuggingFace (service unavailable, rate limits, etc.)
    if (error?.status >= 500 && error?.provider === 'huggingface') {
      return res.status(503).json({
        error: 'AI service temporarily unavailable',
        message: 'The HuggingFace AI service is temporarily unavailable. Please try again in a few moments.',
        details: error.message,
      });
    }
    
    return res.status(500).json({ error: error?.message || 'Unable to generate portfolio insight.' });
  }
});

module.exports = router;
