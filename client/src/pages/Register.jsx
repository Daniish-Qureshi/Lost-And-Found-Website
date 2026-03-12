import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('Password kam se kam 6 characters ka hona chahiye')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', form)
      login(res.data, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
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
            Create Account 🚀
          </h1>
          <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
            Community join karo — bilkul free hai!
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
                Full Name
              </label>
              <input type="text" required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Danish Qureshi"
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

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
                placeholder="•••••••• (min 6 chars)"
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {/* Password strength */}
              {form.password.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: form.password.length >= i * 3 ? (form.password.length >= 8 ? '#0d9488' : '#f59e0b') : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                  ))}
                </div>
              )}
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
              {loading ? '⏳ Creating account...' : 'Create Account →'}
            </button>
          </form>

          {/* Features */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[['🔒', 'Secure'], ['⚡', 'Fast'], ['🆓', 'Free']].map(([icon, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{icon}</div>
                <div style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif', fontSize: '11px' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
              Already account hai?{' '}
              <Link to="/login" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
                Login karo →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}