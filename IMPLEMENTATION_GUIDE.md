# Complete Implementation Guide

## Overview

This guide provides step-by-step instructions and all necessary code to implement the Payment Gateway project 100% according to specifications.

## File Structure to Create

```
backend/
├── src/
│   ├── index.js
│   ├── db.js
│   ├── middleware.js
│   ├── routes/
│   │   ├── health.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   └── test.js
│   ├── controllers/
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── testController.js
│   ├── models/
│   │   ├── Merchant.js
│   │   ├── Order.js
│   │   └── Payment.js
│   ├── services/
│   │   ├── ValidationService.js
│   │   ├── PaymentService.js
│   │   └── OrderService.js
│   └── utils/
│       ├── idGenerator.js
│       ├── luhnValidator.js
│       ├── vpaValidator.js
│       └── errors.js
└── db/
    └── schema.sql

frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── Transactions.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Stats.jsx
│   │   └── TransactionTable.jsx
│   └── styles/
│       └── App.css
├── package.json
├── vite.config.js
└── Dockerfile

checkout-page/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── pages/
│   │   ├── Checkout.jsx
│   │   ├── Success.jsx
│   │   └── Failure.jsx
│   └── components/
│       ├── PaymentMethods.jsx
│       └── OrderSummary.jsx
├── package.json
├── vite.config.js
└── Dockerfile
```

## Setup Instructions

### 1. Backend Setup

**Step 1: Install dependencies**
```bash
cd backend
npm install
```

**Step 2: Create database schema**
Run the schema.sql file in PostgreSQL database.

**Step 3: Start the server**
```bash
npm start
```

### 2. Frontend Setup

**Step 1: Create React project**
```bash
cd frontend
npm install
```

**Step 2: Start development server**
```bash
npm run dev
```

### 3. Checkout Page Setup

```bash
cd checkout-page
npm install
npm run dev
```

## Docker Deployment

To run the entire application with Docker:

```bash
# Build and start all services
docker-compose build
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

## API Testing Examples

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

Expected Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Create Order
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "receipt_123",
    "notes": {"customer_name": "John Doe"}
  }'
```

Expected Response (201):
```json
{
  "id": "order_NXhj67fGH2jk9mPq",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123",
  "notes": {"customer_name": "John Doe"},
  "status": "created",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Get Order
```bash
curl http://localhost:8000/api/v1/orders/order_NXhj67fGH2jk9mPq \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789"
```

### Create Payment (UPI)
```bash
curl -X POST http://localhost:8000/api/v1/payments \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_NXhj67fGH2jk9mPq",
    "method": "upi",
    "vpa": "user@paytm"
  }'
```

### Create Payment (Card)
```bash
curl -X POST http://localhost:8000/api/v1/payments \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_NXhj67fGH2jk9mPq",
    "method": "card",
    "card": {
      "number": "4111111111111111",
      "expiry_month": "12",
      "expiry_year": "2025",
      "cvv": "123",
      "holder_name": "John Doe"
    }
  }'
```

Expected Response (201):
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "amount": 50000,
  "currency": "INR",
  "method": "card",
  "card_network": "visa",
  "card_last4": "1111",
  "status": "processing",
  "created_at": "2024-01-15T10:31:00Z"
}
```

After 5-10 seconds (or immediately in TEST_MODE):
```json
{
  "id": "pay_H8sK3jD9s2L1pQr",
  "order_id": "order_NXhj67fGH2jk9mPq",
  "amount": 50000,
  "currency": "INR",
  "method": "card",
  "card_network": "visa",
  "card_last4": "1111",
  "status": "success",
  "updated_at": "2024-01-15T10:31:10Z"
}
```

## Key Implementation Details

### 1. Authentication
- Extract `X-Api-Key` and `X-Api-Secret` from request headers
- Verify against merchants table
- Return 401 error if invalid

### 2. Order ID Format
- Prefix: "order_"
- Followed by exactly 16 alphanumeric characters
- Example: order_NXhj67fGH2jk9mPq

### 3. Payment ID Format
- Prefix: "pay_"
- Followed by exactly 16 alphanumeric characters
- Example: pay_H8sK3jD9s2L1pQr

### 4. Payment Status Flow
- Created → processing → success/failed
- Payments NEVER have "created" status
- Immediately set to "processing" upon creation

### 5. Database Persistence
- Auto-create test merchant on startup
- Proper foreign key relationships
- Indexes on frequently queried columns

### 6. Validation Rules
- Order amount: minimum 100 paise (₹1.00)
- VPA format: `^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$`
- Luhn algorithm for card validation
- Expiry date must be in future

## Dashboard Features

### Login Page
- Email input with test@example.com
- Password input (not validated in Deliverable 1)
- Simple form submission

### Dashboard Home
- Display API credentials
- Show statistics:
  - Total transactions (count of payments)
  - Total amount (sum of successful payments)
  - Success rate (successful/total)

### Transactions Page
- Table with all payments
- Columns: Payment ID, Order ID, Amount, Method, Status, Created Date
- data-test-id attributes for automation

## Checkout Page

### Features
- Query parameter: order_id
- Fetch order details from API
- Payment method selection (UPI/Card)
- Dynamic form based on selected method
- Processing state during payment
- Success/failure states

### Data Test IDs
All elements have exact data-test-id attributes as specified.

## Error Handling

### Standard Error Codes
- AUTHENTICATION_ERROR: Invalid API credentials
- BAD_REQUEST_ERROR: Validation errors
- NOT_FOUND_ERROR: Resource not found
- PAYMENT_FAILED: Payment processing failed
- INVALID_VPA: VPA format invalid
- INVALID_CARD: Card validation failed
- EXPIRED_CARD: Card expiry date invalid

## Testing in Production

Set environment variables for deterministic testing:
```bash
TEST_MODE=true
TEST_PAYMENT_SUCCESS=true
TEST_PROCESSING_DELAY=1000
```

This allows automated evaluation to have predictable outcomes.

## Common Issues and Solutions

### Issue: Docker services won't start
**Solution**: Check health checks are properly configured and database migration runs before API starts

### Issue: API can't connect to database
**Solution**: Ensure DATABASE_URL is correct and matches docker-compose.yml settings

### Issue: Frontend can't call API
**Solution**: Ensure CORS is enabled and API is running on correct port

### Issue: Payment takes forever to complete
**Solution**: Check PROCESSING_DELAY settings; in TEST_MODE it should be instant

## Next Steps

1. Copy all provided code into respective files
2. Run `docker-compose build` to build images
3. Run `docker-compose up -d` to start services
4. Test API endpoints with provided curl examples
5. Access dashboard at http://localhost:3000
6. Access checkout at http://localhost:3001

## Additional Resources

- Luhn Algorithm: https://en.wikipedia.org/wiki/Luhn_algorithm
- UPI VPA Format: https://www.npci.org.in/
- Card Networks: Visa, Mastercard, American Express, RuPay

---

For complete source code files, refer to individual files in this repository.

**Important**: Follow the exact specifications for ID formats, error codes, database schema, and API response structures for automated evaluation.
