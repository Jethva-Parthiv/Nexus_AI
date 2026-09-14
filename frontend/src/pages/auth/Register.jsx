import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/authApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { EyeIcon, EyeOffIcon, ZapIcon, SparklesIcon, AlertTriangleIcon } from '../../components/Icons.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(form) {
  const errors = {}
  if (form.username.length < 3 || form.username.length > 50) {
    errors.username = 'Username must be 3–50 characters.'
  }
  if (!EMAIL_RE.test(form.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (form.password.length < 6 || form.password.length > 100) {
    errors.password = 'Password must be 6–100 characters.'
  }
  return errors
}

export default function Register() {
  const navigate = useNavigate()
  const { setSession, demoLogin } = useAuth()

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const clientErrors = validate(form)
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }

    setSubmitting(true)
    try {
      const data = await register(form)
      setSession(data.token, data.username)
      navigate('/', { replace: true })
    } catch (err) {
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors)
      } else {
        setFormError(err.message)
      }
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

        <h1 className="auth-card__heading">Create an account</h1>
        <p className="auth-card__subtext">
          Zero downtime AI proxy with intra-provider and cross-provider fallback.
        </p>

        {formError && (
          <div className="auth-card__error">
            <AlertTriangleIcon size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label className="auth-form__field">
            <span>Username</span>
            <input
              name="username"
              type="text"
              placeholder="Pick a username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
            />
            {fieldErrors.username && (
              <span style={{ color: 'var(--error-text)', fontSize: '12px' }}>
                {fieldErrors.username}
              </span>
            )}
          </label>

          <label className="auth-form__field">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <span style={{ color: 'var(--error-text)', fontSize: '12px' }}>
                {fieldErrors.email}
              </span>
            )}
          </label>

          <label className="auth-form__field">
            <span>Password</span>
            <div className="input-with-action">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Choose a secure password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            {fieldErrors.password && (
              <span style={{ color: 'var(--error-text)', fontSize: '12px' }}>
                {fieldErrors.password}
              </span>
            )}
          </label>

          <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
            {submitting ? 'Registering with auth-service…' : 'Create Organization Account'}
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
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
