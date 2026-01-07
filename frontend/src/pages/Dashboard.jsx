import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await axios.get('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBalance(response.data.balance)
      setTransactions(response.data.transactions)
    } catch (err) {
      console.error('Failed to fetch dashboard', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div data-test-id="dashboard-page" className="dashboard-container">
      <header>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <section className="balance-section">
        <h2>Balance: ${balance.toFixed(2)}</h2>
        <button data-test-id="checkout-button" onClick={() => navigate('/checkout')}>
          Make Payment
        </button>
      </section>
      <section className="transactions-section">
        <h2>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>${tx.amount.toFixed(2)}</td>
                <td>{tx.status}</td>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default Dashboard
