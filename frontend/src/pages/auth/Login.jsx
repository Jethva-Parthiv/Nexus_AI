import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/authApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { EyeIcon, EyeOffIcon, ZapIcon, SparklesIcon, AlertTriangleIcon } from '../../components/Icons.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { setSession, demoLogin } = useAuth()

  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await login(form)
      setSession(data.token, data.username)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDemoAccess() {
    demoLogin()
    navigate('/', { replace: true })
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__brand">
          <div className="sidebar__logo-icon">
            <ZapIcon size={20} />
          </div>
          <span>NexusAI Gateway</span>
        </div>

        <h1 className="auth-card__heading">Welcome back</h1>
        <p className="auth-card__subtext">
          Enterprise multi-LLM router & automated fallback platform.
        </p>

        {error && (
          <div className="auth-card__error">
            <AlertTriangleIcon size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-form__field">
            <span>Username</span>
            <input
              name="username"
              type="text"
              placeholder="e.g. admin or parthiv"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </label>

          <label className="auth-form__field">
            <span>Password</span>
            <div className="input-with-action">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-with-action__btn"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </label>

          <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
            {submitting ? 'Authenticating with auth-service…' : 'Sign in to Console'}
          </button>
        </form>

        <div className="auth-card__demo-divider">
          <span>OR EXPLORE DASHBOARD</span>
        </div>

        <button
          type="button"
          className="btn btn--secondary btn--lg"
          style={{ width: '100%' }}
          onClick={handleDemoAccess}
        >
          <SparklesIcon size={16} color="var(--accent)" />
          <span>Launch Demo Mode (1-Click)</span>
        </button>

        <p className="auth-card__switch">
          New to NexusAI? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
