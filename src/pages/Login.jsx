
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        form
      )

      localStorage.setItem('token', response.data.token)
localStorage.setItem(
  'user',
  JSON.stringify(response.data.user)
)
if (response.data.user.role === 'admin') {
  window.location.href = '/admin'
} else {
  window.location.href = '/welcome'
}
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Unable to log in. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-brand">SWARNA MAHAL</p>
        <p className="auth-eyebrow">TIMELESS ELEGANCE</p>

        <h1>Welcome Back</h1>
        <p className="auth-description">
          Sign in to continue your jewellery journey.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {message && (
            <p className="auth-message" role="alert">
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          New to Swarna Mahal?{' '}
          <Link to="/signup">Create an account</Link>
        </p>

        <Link className="auth-home" to="/">
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
