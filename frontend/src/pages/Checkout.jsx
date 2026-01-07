import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Checkout.css'

const Checkout = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [order, setOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [processing, setProcessing] = useState(false)
  const [paymentState, setPaymentState] = useState(null) // 'processing', 'success', 'failed'
  const [paymentData, setPaymentData] = useState(null)
  const [upiForm, setUpiForm] = useState({ vpa: '' })
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    holder_name: ''
  })

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      // Mock order data - in production would call GET /api/v1/orders/{orderId}/public
      setOrder({
        id: orderId,
        amount: 50000,
        currency: 'INR',
        status: 'created'
      })
    } catch (error) {
      console.error('Failed to fetch order:', error)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!orderId) return

    setProcessing(true)
    setPaymentState('processing')

    try {
      const payload = {
        order_id: orderId,
        method: paymentMethod,
        ...(paymentMethod === 'upi' && { vpa: upiForm.vpa }),
        ...(paymentMethod === 'card' && { card: cardForm })
      }

      // Mock payment creation - in production would call POST /api/v1/payments/public
      const paymentId = `pay_${Math.random().toString(16).substr(2, 16)}`
      setPaymentData({
        id: paymentId,
        order_id: orderId,
        amount: order.amount,
        currency: order.currency,
        method: paymentMethod,
        status: 'processing',
        created_at: new Date().toISOString()
      })

      // Simulate processing delay and status change
      setTimeout(() => {
        // Random success (90% for UPI, 95% for card)
        const successRate = paymentMethod === 'upi' ? 0.9 : 0.95
        const isSuccess = Math.random() < successRate

        setPaymentData((prev) => ({
          ...prev,
          status: isSuccess ? 'success' : 'failed',
          updated_at: new Date().toISOString()
        }))
        setPaymentState(isSuccess ? 'success' : 'failed')
        setProcessing(false)
      }, 3000) // 3 second delay for demo
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentState('failed')
      setProcessing(false)
    }
  }

  if (!order) {
    return (
      <div data-test-id="checkout-container" className="checkout-page">
        <div className="loading">Loading order...</div>
      </div>
    )
  }

  return (
    <div data-test-id="checkout-container" className="checkout-page">
      <div data-test-id="order-summary" className="order-summary">
        <h2>Complete Payment</h2>
        <div className="order-details">
          <div className="detail-row">
            <span>Amount:</span>
            <span data-test-id="order-amount">
              ₹{(order.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="detail-row">
            <span>Order ID:</span>
            <span data-test-id="order-id">{order.id}</span>
          </div>
        </div>
      </div>

      {!paymentState && (
        <>
          <div data-test-id="payment-methods" className="payment-methods">
            <button
              data-test-id="method-upi"
              data-method="upi"
              onClick={() => setPaymentMethod('upi')}
              className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
            >
              UPI
            </button>
            <button
              data-test-id="method-card"
              data-method="card"
              onClick={() => setPaymentMethod('card')}
              className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
            >
              Card
            </button>
          </div>

          {paymentMethod === 'upi' && (
            <form data-test-id="upi-form" onSubmit={handlePayment} className="payment-form">
              <input
                data-test-id="vpa-input"
                type="text"
                placeholder="username@bank"
                value={upiForm.vpa}
                onChange={(e) => setUpiForm({ vpa: e.target.value })}
                required
              />
              <button data-test-id="pay-button" type="submit" disabled={processing}>
                Pay ₹{(order.amount / 100).toLocaleString('en-IN')}
              </button>
            </form>
          )}

          {paymentMethod === 'card' && (
            <form data-test-id="card-form" onSubmit={handlePayment} className="payment-form">
              <input
                data-test-id="card-number-input"
                type="text"
                placeholder="Card Number"
                value={cardForm.number}
                onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                required
              />
              <div className="form-row">
                <input
                  data-test-id="expiry-input"
                  type="text"
                  placeholder="MM/YY"
                  value={`${cardForm.expiry_month}/${cardForm.expiry_year}`}
                  onChange={(e) => {
                    const [month, year] = e.target.value.split('/')
                    setCardForm({ ...cardForm, expiry_month: month, expiry_year: year })
                  }}
                  required
                />
                <input
                  data-test-id="cvv-input"
                  type="text"
                  placeholder="CVV"
                  maxLength="3"
                  value={cardForm.cvv}
                  onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                  required
                />
              </div>
              <input
                data-test-id="cardholder-name-input"
                type="text"
                placeholder="Name on Card"
                value={cardForm.holder_name}
                onChange={(e) => setCardForm({ ...cardForm, holder_name: e.target.value })}
                required
              />
              <button data-test-id="pay-button" type="submit" disabled={processing}>
                Pay ₹{(order.amount / 100).toLocaleString('en-IN')}
              </button>
            </form>
          )}
        </>
      )}

      {paymentState === 'processing' && (
        <div data-test-id="processing-state" className="payment-state processing-state">
          <div className="spinner"></div>
          <div data-test-id="processing-message">Processing payment...</div>
        </div>
      )}

      {paymentState === 'success' && paymentData && (
        <div data-test-id="success-state" className="payment-state success-state">
          <h2>✔ Payment Successful!</h2>
          <div className="payment-info">
            <div className="info-row">
              <span>Payment ID:</span>
              <span data-test-id="payment-id">{paymentData.id}</span>
            </div>
            <div data-test-id="success-message" className="success-message">
              Your payment has been processed successfully
            </div>
          </div>
        </div>
      )}

      {paymentState === 'failed' && (
        <div data-test-id="error-state" className="payment-state error-state">
          <h2>✗ Payment Failed</h2>
          <div data-test-id="error-message" className="error-message">
            Payment could not be processed
          </div>
          <button data-test-id="retry-button" onClick={() => setPaymentState(null)}>
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export default Checkout
