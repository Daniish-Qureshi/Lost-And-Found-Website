import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0d2f2b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #0d9488, #f59e0b)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif', margin: '0 auto 16px', boxShadow: '0 8px 25px rgba(13,148,136,0.4)' }}>
            L
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
            Welcome Back 👋
          </h1>
          <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
            Apne account mein login karo
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(10px)' }}>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                Email Address
              </label>
              <input type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="danish@gmail.com"
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                Password
              </label>
              <input type="password" required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button type="submit" disabled={loading}
              style={{
                background: loading ? '#475569' : 'linear-gradient(135deg, #0d9488, #0f766e)',
                color: 'white', border: 'none', borderRadius: '12px',
                padding: '14px', fontFamily: 'Syne, sans-serif',
                fontWeight: 700, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(13,148,136,0.4)',
                transition: 'all 0.2s', marginTop: '4px'
              }}>
              {loading ? '⏳ Logging in...' : 'Login →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
            <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
              Account nahi hai?{' '}
              <Link to="/register" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
                Register karo →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}