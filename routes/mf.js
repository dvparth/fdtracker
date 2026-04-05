const express = require('express');
const { fetchSchemeDataUsingAdapter } = require('../adapters/mfAdapter');

const router = express.Router();

/**
 * GET /api/mf/:schemeCode
 * Fetch scheme data using mfapi adapter
 */
router.get('/:schemeCode', async (req, res) => {
    try {
        const { schemeCode } = req.params;
        
        if (!schemeCode || isNaN(schemeCode)) {
            return res.status(400).json({ error: 'Invalid scheme code' });
        }

        const scheme = { scheme_code: schemeCode };
        const data = await fetchSchemeDataUsingAdapter('mfapi', scheme);
        
        return res.json(data);
    } catch (err) {
        console.error('Error fetching scheme data:', err.message);
        return res.status(500).json({ 
            error: err.message || 'Failed to fetch scheme data',
            code: err.response?.status || 500
        });
    }
});

/**
 * GET /api/mf/hybrid/:schemeCode
 * Fetch scheme data using hybrid adapter (mfapi + RapidAPI)
 */
router.get('/hybrid/:schemeCode', async (req, res) => {
    try {
        const { schemeCode } = req.params;
        
        if (!schemeCode || isNaN(schemeCode)) {
            return res.status(400).json({ error: 'Invalid scheme code' });
        }

        // Get RapidAPI credentials from environment
        const rapidKey = process.env.RAPIDAPI_KEY || '';
        const rapidHost = process.env.RAPIDAPI_HOST || 'latest-mutual-fund-nav.p.rapidapi.com';
        
        if (!rapidKey) {
            console.warn('RapidAPI key not configured; falling back to mfapi only');
            // Fall back to mfapi if key is not available
            const scheme = { scheme_code: schemeCode };
            const data = await fetchSchemeDataUsingAdapter('mfapi', scheme);
            return res.json(data);
        }

        const scheme = { scheme_code: schemeCode };
        const data = await fetchSchemeDataUsingAdapter('hybrid', scheme, rapidKey, rapidHost);
        
        return res.json(data);
    } catch (err) {
        console.error('Error fetching hybrid scheme data:', err.message);
        return res.status(500).json({ 
            error: err.message || 'Failed to fetch scheme data',
            code: err.response?.status || 500
        });
    }
});

module.exports = router;
