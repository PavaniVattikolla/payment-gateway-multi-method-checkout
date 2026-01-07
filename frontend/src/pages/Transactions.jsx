import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Transactions.css'

const Transactions = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!user.api_key) {
      navigate('/login')
    } else {
      fetchTransactions()
    }
  }, [navigate, user.api_key])

  const fetchTransactions = async () => {
    try {
      // Mock transactions data for now
      // In production, would fetch from: GET /api/v1/payments
      // With headers: X-Api-Key and X-Api-Secret
      const mockTransactions = [
        {
          id: 'pay_H8sK3jD9s2L1pQr',
          order_id: 'order_NXhj67fGH2jk9mPq',
          amount: 50000,
          method: 'upi',
          status: 'success',
          created_at: new Date().toISOString()
        },
        {
          id: 'pay_K2mL9jR5t8N3pQx',
          order_id: 'order_PqR2sTuVwXyZ1aBc',
          amount: 75000,
          method: 'card',
          status: 'success',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'pay_B1cD4eF7gH0jKlM',
          order_id: 'order_DeF3gHiJkLmNoPq',
          amount: 25000,
          method: 'upi',
          status: 'failed',
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ]
      setTransactions(mockTransactions)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading transactions...</div>

  return (
    <div className="transactions-container">
      <h1>Transactions</h1>
      <table data-test-id="transactions-table" className="transactions-table">
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Order ID</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              data-test-id="transaction-row"
              data-payment-id={transaction.id}
              className="transaction-row"
            >
              <td data-test-id="payment-id" className="cell-payment-id">
                {transaction.id}
              </td>
              <td data-test-id="order-id" className="cell-order-id">
                {transaction.order_id}
              </td>
              <td data-test-id="amount" className="cell-amount">
                ₹{(transaction.amount / 100).toLocaleString('en-IN', {
                  minimumFractionDigits: 2
                })}
              </td>
              <td data-test-id="method" className="cell-method">
                {transaction.method.toUpperCase()}
              </td>
              <td
                data-test-id="status"
                className={`cell-status status-${transaction.status}`}
              >
                {transaction.status.charAt(0).toUpperCase() +
                  transaction.status.slice(1)}
              </td>
              <td data-test-id="created-at" className="cell-created-at">
                {new Date(transaction.created_at).toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Transactions
