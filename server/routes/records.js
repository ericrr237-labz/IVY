import express from 'express';
import RecordModel from '../models/Record.js';

const router = express.Router();

router.post('/', async (req, res) => {
  console.log('[RECORDS ROUTE] Body received:', req.body); // Debug log

  const {
    key,
    value,
    date,
    category = '',
    note = '',
    type,
    marketingSpend,
    newCustomers
  } = req.body;

  try {
    const newRec = new RecordModel({
      key,
      value,
      date: date ? new Date(date) : new Date(),
      category,
      note,
      type,
      marketingSpend,
      newCustomers,
    });

    await newRec.save();
    res.json(newRec);
  } catch (err) {
    console.error('Error saving record:', err);
    res.status(500).json({ error: 'Failed to save record' });
  }
});


export default router;
