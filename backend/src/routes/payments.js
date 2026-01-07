const express = require('express');
const crypto = require('crypto');
const { query } = require('../db');
const router = express.Router();

function generatePaymentId() {
  return 'pay_' + crypto.randomBytes(8).toString('hex').substring(0, 16);
}

function validateVPA(vpa) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(vpa);
}

function validateCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  let sum = 0, isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function detectCardNetwork(cardNumber) {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  const firstTwo = cleaned.substring(0, 2), firstDigit = cleaned[0];
  if (firstDigit === '4') return 'visa';
  if (['51','52','53','54','55'].includes(firstTwo)) return 'mastercard';
  if (['34','37'].includes(firstTwo)) return 'amex';
  if (['60','65'].includes(firstTwo) || (parseInt(firstTwo) >= 81 && parseInt(firstTwo) <= 89)) return 'rupay';
  return 'unknown';
}

function validateExpiry(month, year) {
  const monthNum = parseInt(month, 10), yearNum = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
  if (monthNum < 1 || monthNum > 12) return false;
  const now = new Date(), currentMonth = now.getMonth() + 1, currentYear = now.getFullYear();
  if (yearNum < currentYear) return false;
  if (yearNum === currentYear && monthNum < currentMonth) return false;
  return true;
}

router.post('/', async (req, res) => {
  const { order_id, method, vpa, card } = req.body;
  
  try {
    const orderResult = await query('SELECT * FROM orders WHERE id = $1 AND merchant_id = $2', [order_id, req.merchant.id]);
    if (orderResult.rows.length === 0) return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });
    
    const order = orderResult.rows[0];
    const paymentId = generatePaymentId();
    let paymentData = {
      id: paymentId,
      order_id: order.id,
      merchant_id: req.merchant.id,
      amount: order.amount,
      currency: order.currency,
      method: method,
      status: 'processing'
    };
    
    if (method === 'upi') {
      if (!vpa || !validateVPA(vpa)) {
        return res.status(400).json({ error: { code: 'INVALID_VPA', description: 'Invalid VPA format' } });
      }
      paymentData.vpa = vpa;
    } else if (method === 'card') {
      if (!card || !card.number || !validateCardNumber(card.number)) {
        return res.status(400).json({ error: { code: 'INVALID_CARD', description: 'Invalid card number' } });
      }
      if (!validateExpiry(card.expiry_month, card.expiry_year)) {
        return res.status(400).json({ error: { code: 'EXPIRED_CARD', description: 'Card expiry date invalid' } });
      }
      paymentData.card_network = detectCardNetwork(card.number);
      paymentData.card_last4 = card.number.slice(-4);
    }
    
    const insertResult = await query(
      'INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [paymentData.id, paymentData.order_id, paymentData.merchant_id, paymentData.amount, paymentData.currency, paymentData.method, paymentData.status, paymentData.vpa || null, paymentData.card_network || null, paymentData.card_last4 || null]
    );
    
    res.status(201).json({
      id: insertResult.rows[0].id,
      order_id: insertResult.rows[0].order_id,
      amount: insertResult.rows[0].amount,
      currency: insertResult.rows[0].currency,
      method: insertResult.rows[0].method,
      status: insertResult.rows[0].status,
      vpa: insertResult.rows[0].vpa,
      card_network: insertResult.rows[0].card_network,
      card_last4: insertResult.rows[0].card_last4,
      created_at: insertResult.rows[0].created_at
    });
    
    setTimeout(async () => {
      const delay = process.env.TEST_PROCESSING_DELAY ? parseInt(process.env.TEST_PROCESSING_DELAY) : Math.random() * 5000 + 5000;
      setTimeout(async () => {
        const testMode = process.env.TEST_MODE === 'true';
        const successRate = method === 'upi' ? 0.9 : 0.95;
        const isSuccess = testMode ? (process.env.TEST_PAYMENT_SUCCESS !== 'false') : Math.random() < successRate;
        
        let updateQuery, updateParams;
        if (isSuccess) {
          updateQuery = 'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
          updateParams = ['success', paymentId];
        } else {
          updateQuery = 'UPDATE payments SET status = $1, error_code = $2, error_description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4';
          updateParams = ['failed', 'PAYMENT_DECLINED', 'Payment declined by processor', paymentId];
        }
        
        await query(updateQuery, updateParams);
      }, delay);
    }, 0);
    
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Payment processing failed' } });
  }
});

router.get('/:paymentId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM payments WHERE id = $1 AND merchant_id = $2', [req.params.paymentId, req.merchant.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Payment not found' } });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Failed to fetch payment' } });
  }
});

// Public endpoints for checkout page (no auth required)
router.post('/public', async (req, res) => {
  const { order_id, method, vpa, card } = req.body;
  
  try {
    // Fetch order without auth check
    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });
    }
    
    const order = orderResult.rows[0];
    const paymentId = generatePaymentId();
    let paymentData = {
      id: paymentId,
      order_id: order.id,
      merchant_id: order.merchant_id,
      amount: order.amount,
      currency: order.currency,
      method: method,
      status: 'processing'
    };
    
    if (method === 'upi') {
      if (!vpa || !validateVPA(vpa)) {
        return res.status(400).json({ error: { code: 'INVALID_VPA', description: 'Invalid VPA format' } });
      }
      paymentData.vpa = vpa;
    } else if (method === 'card') {
      if (!card || !card.number || !validateCardNumber(card.number)) {
        return res.status(400).json({ error: { code: 'INVALID_CARD', description: 'Invalid card number' } });
      }
      if (!validateExpiry(card.expiry_month, card.expiry_year)) {
        return res.status(400).json({ error: { code: 'EXPIRED_CARD', description: 'Card expiry date invalid' } });
      }
      paymentData.card_network = detectCardNetwork(card.number);
      paymentData.card_last4 = card.number.slice(-4);
    }
    
    const insertResult = await query(
      'INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [paymentData.id, paymentData.order_id, paymentData.merchant_id, paymentData.amount, paymentData.currency, paymentData.method, paymentData.status, paymentData.vpa || null, paymentData.card_network || null, paymentData.card_last4 || null]
    );
    
    res.status(201).json({
      id: insertResult.rows[0].id,
      order_id: insertResult.rows[0].order_id,
      amount: insertResult.rows[0].amount,
      currency: insertResult.rows[0].currency,
      method: insertResult.rows[0].method,
      status: insertResult.rows[0].status,
      vpa: insertResult.rows[0].vpa,
      card_network: insertResult.rows[0].card_network,
      card_last4: insertResult.rows[0].card_last4,
      created_at: insertResult.rows[0].created_at
    });
    
    // Async payment processing
    setTimeout(async () => {
      const delay = process.env.TEST_PROCESSING_DELAY ? parseInt(process.env.TEST_PROCESSING_DELAY) : Math.random() * 5000 + 5000;
      setTimeout(async () => {
        const testMode = process.env.TEST_MODE === 'true';
        const successRate = method === 'upi' ? 0.9 : 0.95;
        const isSuccess = testMode ? (process.env.TEST_PAYMENT_SUCCESS !== 'false') : Math.random() < successRate;
        
        let updateQuery, updateParams;
        if (isSuccess) {
          updateQuery = 'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
          updateParams = ['success', paymentId];
        } else {
          updateQuery = 'UPDATE payments SET status = $1, error_code = $2, error_description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4';
          updateParams = ['failed', 'PAYMENT_DECLINED', 'Payment declined by processor', paymentId];
        }
        await query(updateQuery, updateParams);
      }, delay);
    }, 0);
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Payment processing failed' } });
  }
});

router.get('/public/:paymentId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM payments WHERE id = $1', [req.params.paymentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Payment not found' } });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', description: 'Failed to fetch payment' } });
  }
});

module.exports = router;
