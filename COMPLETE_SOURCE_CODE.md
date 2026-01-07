# Complete Payment Gateway Source Code

## DATABASE SCHEMA (backend/db/schema.sql)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    api_secret VARCHAR(64) NOT NULL,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    receipt VARCHAR(255),
    notes JSONB,
    status VARCHAR(20) DEFAULT 'created',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);

CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'processing',
    vpa VARCHAR(255),
    card_network VARCHAR(20),
    card_last4 VARCHAR(4),
    error_code VARCHAR(50),
    error_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Seed test merchant
INSERT INTO merchants (id, name, email, api_key, api_secret, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Test Merchant',
    'test@example.com',
    'key_test_abc123',
    'secret_test_xyz789',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;
```

## BACKEND FILES

### backend/src/index.js

Main application entry point with Express setup.

### backend/src/db.js

Database connection and migration logic.

### backend/src/middleware.js

Authentication and logging middleware.

### backend/src/utils/idGenerator.js

```javascript
const crypto = require('crypto');

function generateId(prefix) {
  const randomPart = crypto.randomBytes(8).toString('hex').substring(0, 16);
  return `${prefix}_${randomPart}`;
}

module.exports = { generateId };
```

### backend/src/utils/vpaValidator.js

```javascript
function validateVPA(vpa) {
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return vpaRegex.test(vpa);
}

module.exports = { validateVPA };
```

### backend/src/utils/luhnValidator.js

```javascript
function validateCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

function detectCardNetwork(cardNumber) {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  const firstTwo = cleaned.substring(0, 2);
  const firstDigit = cleaned[0];
  
  if (firstDigit === '4') return 'visa';
  if (['51', '52', '53', '54', '55'].includes(firstTwo)) return 'mastercard';
  if (['34', '37'].includes(firstTwo)) return 'amex';
  if (['60', '65'].includes(firstTwo) || (parseInt(firstTwo) >= 81 && parseInt(firstTwo) <= 89)) return 'rupay';
  return 'unknown';
}

module.exports = { validateCardNumber, detectCardNetwork };
```

### backend/src/utils/cardExpiryValidator.js

```javascript
function validateExpiry(month, year) {
  const monthNum = parseInt(month, 10);
  let yearNum = parseInt(year, 10);
  
  if (monthNum < 1 || monthNum > 12) return false;
  
  // Convert 2-digit year to 4-digit
  if (year.length === 2) {
    yearNum = 2000 + yearNum;
  }
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  if (yearNum < currentYear) return false;
  if (yearNum === currentYear && monthNum < currentMonth) return false;
  
  return true;
}

module.exports = { validateExpiry };
```

## IMPLEMENTATION SUMMARY

This document provides the database schema and key utility functions. For complete implementation:

1. Create all files listed in IMPLEMENTATION_GUIDE.md
2. Copy the database schema into backend/db/schema.sql
3. Copy utility functions into respective files
4. Implement route handlers, controllers, and models following the specifications
5. Add proper error handling and validation throughout

## Key Points for 100% Accuracy

1. **ID Generation**: Use exactly the format `prefix_` + 16 alphanumeric characters
2. **Payment Status**: Always "processing" on creation, never "created"
3. **Error Codes**: Use exact standard error codes as specified
4. **Validation**: Implement all validation rules (Luhn, VPA, expiry, amount)
5. **Database**: Seed test merchant automatically on startup
6. **Authentication**: Check X-Api-Key and X-Api-Secret headers on all protected endpoints
7. **Response Format**: Match exactly as specified in API documentation
8. **Data Test IDs**: All frontend elements must have exact data-test-id attributes

## Testing Commands

```bash
# Health check
curl http://localhost:8000/health

# Get test merchant
curl http://localhost:8000/api/v1/test/merchant

# Create order
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "currency": "INR"}'

# Create UPI payment
curl -X POST http://localhost:8000/api/v1/payments \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order_XXX", "method": "upi", "vpa": "user@paytm"}'

# Create Card payment
curl -X POST http://localhost:8000/api/v1/payments \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order_XXX", "method": "card", "card": {"number": "4111111111111111", "expiry_month": "12", "expiry_year": "2025", "cvv": "123", "holder_name": "John Doe"}}'
```

## Next Steps

1. Implement all routes and controllers
2. Add database models and queries
3. Implement payment processing logic with delays
4. Add frontend components and pages
5. Create checkout page
6. Test entire flow with docker-compose
7. Verify all data-test-ids are present
8. Ensure exact API response formats

## References

- Original task specifications from Partnr Network
- Luhn algorithm: https://en.wikipedia.org/wiki/Luhn_algorithm
- UPI specification: https://www.npci.org.in/
- Card standards: ISO/IEC 7812
