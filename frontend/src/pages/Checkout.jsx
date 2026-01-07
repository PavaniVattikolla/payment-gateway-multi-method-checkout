import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CreditCard from '../components/checkout/CreditCard'
import Wallet from '../components/checkout/Wallet'
import BankTransfer from '../components/checkout/BankTransfer'

const Checkout = () => {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await axios.post(
        '/api/payments/process',
        {
          amount: parseFloat(amount),
          paymentMethod
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        navigate('/', { state: { message: 'Payment successful' } })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-test-id="checkout-page" className="checkout-container">
      <header>
        <h1>Checkout</h1>
        <button onClick={() => navigate('/')}>Back</button>
      </header>

      <div className="checkout-form">
        <div className="amount-section">
          <label>Amount</label>
          <input
            data-test-id="amount-input"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            step="0.01"
            min="0"
          />
        </div>

        <div className="method-section">
          <h3>Payment Method</h3>
          <div className="method-options">
            <label>
              <input
                type="radio"
                value="credit-card"
                checked={paymentMethod === 'credit-card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Credit Card
            </label>
            <label>
              <input
                type="radio"
                value="digital-wallet"
                checked={paymentMethod === 'digital-wallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Digital Wallet
            </label>
            <label>
              <input
                type="radio"
                value="bank-transfer"
                checked={paymentMethod === 'bank-transfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Bank Transfer
            </label>
          </div>
        </div>

        {paymentMethod === 'credit-card' && <CreditCard />}
        {paymentMethod === 'digital-wallet' && <Wallet />}
        {paymentMethod === 'bank-transfer' && <BankTransfer />}

        {error && <div className="error-message">{error}</div>}

        <button
          data-test-id="pay-button"
          onClick={handlePayment}
          disabled={loading}
          className="pay-button"
        >
          {loading ? 'Processing...' : `Pay $${amount || '0.00'}`}
        </button>
      </div>
    </div>
  )
}

export default Checkout
