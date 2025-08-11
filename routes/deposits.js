const express = require('express');
const Deposit = require('../models/Deposit');

const router = express.Router();

// Get all deposits
router.get('/', async (req, res) => {
  try {
    const deposits = await Deposit.find();
    res.json(deposits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a deposit
router.post('/', async (req, res) => {
  try {
    const deposit = new Deposit(req.body);
    await deposit.save();
    res.status(201).json(deposit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit a deposit
router.put('/:id', async (req, res) => {
  try {
    const deposit = await Deposit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
    res.json(deposit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a deposit
router.delete('/:id', async (req, res) => {
  try {
    const deposit = await Deposit.findByIdAndDelete(req.params.id);
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });
    res.json({ message: 'Deposit deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
