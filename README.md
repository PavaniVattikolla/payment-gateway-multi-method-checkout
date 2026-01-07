# Payment Gateway with Multi-Method Processing and Hosted Checkout

A full-stack payment gateway application similar to Razorpay/Stripe with multi-method payment processing (UPI & Cards), hosted checkout page, and comprehensive merchant dashboard.

## Features

- **Dockerized Deployment**: All services (API, Database, Frontend, Checkout) running via `docker-compose up -d`
- **RESTful API**: Fixed endpoints for order and payment management
- **Merchant Authentication**: API key and secret-based authentication
- **Multi-Method Payment Processing**:
  - UPI with VPA validation
  - Card payments with Luhn algorithm validation and network detection (Visa, Mastercard, Amex, RuPay)
- **Hosted Checkout Page**: Professional UI for customer payments
- **Database Persistence**: PostgreSQL with proper schema and relationships
- **Merchant Dashboard**: View API credentials and transaction statistics
- **Payment Simulation**: Random success/failure with configurable rates

## Tech Stack

- **Backend**: Node.js with Express.js
- **Frontend**: React.js with Vite
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **Payment Methods**: UPI and Card validation

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PavaniVattikolla/payment-gateway-multi-method-checkout.git
cd payment-gateway-multi-method-checkout
```

2. Start all services:
```bash
docker-compose up -d
```

3. The application will be available at:
- **API**: http://localhost:8000
- **Dashboard**: http://localhost:3000
- **Checkout Page**: http://localhost:3001

## API Endpoints

### Health Check
```
GET /health
```

### Orders
```
POST /api/v1/orders
GET /api/v1/orders/{order_id}
```

### Payments
```
POST /api/v1/payments
GET /api/v1/payments/{payment_id}
```

### Test Endpoint
```
GET /api/v1/test/merchant
```

## Authentication

Use test credentials:
- **API Key**: key_test_abc123
- **API Secret**: secret_test_xyz789
- **Email**: test@example.com

## Testing

### Create an Order
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "currency": "INR"}'
```

### Process a Payment
```bash
curl -X POST http://localhost:8000/api/v1/payments \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order_XXX", "method": "upi", "vpa": "user@paytm"}'
```

## Project Structure

```
payment-gateway-multi-method-checkout/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── db.js
│   │   ├── middleware.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   └── db/
│       └── schema.sql
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       └── components/
└── checkout-page/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.jsx
        └── pages/
```

## Environment Variables

See `.env.example` for all available configuration options.

## Database Schema

The application automatically creates three main tables:
- **merchants**: Merchant account information and API keys
- **orders**: Payment orders created by merchants
- **payments**: Individual payment transactions

## Features in Detail

### VPA Validation
Validates UPI Virtual Payment Address format: `username@bank`

### Card Validation
- **Luhn Algorithm**: Validates card number checksum
- **Network Detection**: Identifies Visa, Mastercard, Amex, RuPay
- **Expiry Validation**: Checks card expiration date
- **Security**: Stores only last 4 digits in database

### Payment Processing
- Synchronous processing with 5-10 second delay
- Configurable success rates (UPI: 90%, Card: 95%)
- Test mode for deterministic outcomes

## Deployment

The entire application is containerized and ready for deployment:

```bash
# Build images
docker-compose build

# Run with production settings
docker-compose up -d
```

## Support

For issues or questions, please refer to the Partnr Network documentation or contact the development team.

## License

MIT
