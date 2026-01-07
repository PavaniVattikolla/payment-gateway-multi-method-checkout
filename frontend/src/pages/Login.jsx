import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = ({ setUser }) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Simple email-based authentication for test merchant
      if (email === 'test@example.com') {
        const userData = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@example.com',
          name: 'Test Merchant',
          api_key: 'key_test_abc123',
          api_secret: 'secret_test_xyz789'
        }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        navigate('/dashboard')
      } else {
        setError('Please use test@example.com to login')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-test-id="login-page" className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <form data-test-id="login-form" onSubmit={handleLogin}>
          <input
            data-test-id="email-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            data-test-id="password-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button data-test-id="login-button" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
