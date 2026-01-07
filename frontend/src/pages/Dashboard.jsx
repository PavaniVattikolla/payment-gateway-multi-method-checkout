import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    successRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/login')
    } else {
      setUser(JSON.parse(userData))
      // Mock stats - in production would fetch from API
      setStats({
        totalTransactions: 42,
        totalAmount: 250000,
        successRate: 96
      })
      setLoading(false)
    }
  }, [navigate])

  if (loading || !user) return <div className="loading">Loading...</div>

  return (
    <div data-test-id="dashboard" className="dashboard-container">
      <div className="dashboard-header">
        <h1>Merchant Dashboard</h1>
        <button onClick={() => {
          localStorage.removeItem('user')
          navigate('/login')
        }}>
          Logout
        </button>
      </div>

      <div data-test-id="api-credentials" className="credentials-section">
        <h2>API Credentials</h2>
        <div className="credential-group">
          <div className="credential-item">
            <label>API Key</label>
            <code data-test-id="api-key">{user.api_key}</code>
            <button onClick={() => navigator.clipboard.writeText(user.api_key)}>Copy</button>
          </div>
          <div className="credential-item">
            <label>API Secret</label>
            <code data-test-id="api-secret">{user.api_secret}</code>
            <button onClick={() => navigator.clipboard.writeText(user.api_secret)}>Copy</button>
          </div>
        </div>
      </div>

      <div data-test-id="stats-container" className="stats-section">
        <h2>Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Transactions</div>
            <div data-test-id="total-transactions" className="stat-value">
              {stats.totalTransactions}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Amount</div>
            <div data-test-id="total-amount" className="stat-value">
              ₹{(stats.totalAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Success Rate</div>
            <div data-test-id="success-rate" className="stat-value">
              {stats.successRate}%
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-links">
        <Link to="/dashboard/transactions">
          <button>View Transactions</button>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
