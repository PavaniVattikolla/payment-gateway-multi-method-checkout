const express = require('express');
const crypto = require('crypto');
const { query } = require('../db');
const router = express.Router();

function generateOrderId() {
  return 'order_' + crypto.randomBytes(8).toString('hex').substring(0, 16);
}

router.post('/', async (req, res) => {
  const { amount, currency = 'INR', receipt, notes } = req.body;
  
  if (!amount || amount < 100) {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST_ERROR', description: 'amount must be at least 100' }
    });
  }
  
  try {
    const orderId = generateOrderId();
    const result = await query(
      'INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [orderId, req.merchant.id, amount, currency, receipt || null, notes ? JSON.stringify(notes) : null, 'created']
    );
    
    res.status(201).json({
      id: result.rows[0].id,
      merchant_id: result.rows[0].merchant_id,
      amount: result.rows[0].amount,
      currency: result.rows[0].currency,
      receipt: result.rows[0].receipt,
      notes: result.rows[0].notes,
      status: result.rows[0].status,
      created_at: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Order creation failed' } });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE id = $1 AND merchant_id = $2',
      [req.params.orderId, req.merchant.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Failed to fetch order' } });
  }
});

module.exports = router;
