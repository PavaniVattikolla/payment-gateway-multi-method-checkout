const express = require('express');
const router = express.Router();

router.get('/merchant', (req, res) => {
  res.status(200).json({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    api_key: 'key_test_abc123',
    seeded: true
  });
});

module.exports = router;
