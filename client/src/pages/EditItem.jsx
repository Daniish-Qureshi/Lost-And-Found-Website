import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'

const CATEGORIES = ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Books', 'Sports', 'Keys', 'Wallet', 'Other']

export default function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', type: 'lost',
    category: 'Electronics', location: '', date: '', status: 'active'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`)
        const item = res.data
        setForm({
          title: item.title,
          description: item.description,
          type: item.type,
          category: item.category,
          location: item.location,
          date: item.date?.split('T')[0],
          status: item.status
        })
      } catch { navigate('/') }
      setLoading(false)
    }
    fetchItem()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put(`/items/${id}`, form)
      navigate(`/item/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Update nahi hua')
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 style={{ fontFamily: 'Syne, sans-serif', color: '#0a0f1e', fontSize: '2rem', fontWeight: 800 }} className="mb-2">
          ✏️ Edit Item
        </h1>
        <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif' }} className="mb-8">
          Item ki details update karo
        </p>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '12px' }} className="p-4 mb-6 text-sm">⚠️ {error}</div>}

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Type Toggle */}
            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '13px', fontWeight: 600 }} className="block mb-3 uppercase tracking-wider">Item Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['lost', 'found'].map(t => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                    style={{
                      background: form.type === t ? (t === 'lost' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#0d9488,#0f766e)') : '#f8fafc',
                      border: form.type === t ? 'none' : '2px solid #e2e8f0',
                      color: form.type === t ? 'white' : '#64748b',
                      fontFamily: 'Syne, sans-serif', borderRadius: '12px', padding: '12px',
                      fontWeight: 600, fontSize: '14px', cursor: 'pointer'
                    }}>
                    {t === 'lost' ? '❌ Lost' : '✅ Found'}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '13px', fontWeight: 600 }} className="block mb-2 uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', width: '100%', padding: '12px 16px' }}
                className="focus:outline-none bg-white text-gray-800">
                <option value="active">🟢 Active</option>
                <option value="claimed">🟡 Claimed</option>
                <option value="closed">⚫ Closed</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '13px', fontWeight: 600 }} className="block mb-2 uppercase tracking-wider">Title *</label>
              <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', width: '100%', padding: '12px 16px' }}
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                className="focus:outline-none text-gray-800 bg-white" />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '13px', fontWeight: 600 }} className="block mb-2 uppercase tracking-wider">Description *</label>
              <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', width: '100%', padding: '12px 16px', resize: 'none' }}
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                className="focus:outline-none text-gray-800 bg-white" />
            </div>

            {/* Category */}
            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '13px', fontWeight: 600 }} className="block mb-3 uppercase tracking-wider">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                    style={{
                      border: form.category === cat ? '2px solid #0d9488' : '2px solid #e2e8f0',
                      background: form.category === cat ? '#f0fdfb' : '#f8fafc',
                      color: form.category === cat ? '#0d9488' : '#64748b',
                      borderRadius: '10px', padding: '8px', fontSize: '13px',
                      fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                      fontWeight: form.category === cat ? 600 : 400
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Location + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '13px', fontWeight: 600 }} className="block mb-2 uppercase tracking-wider">Location *</label>
                <input type="text" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', width: '100%', padding: '12px 16px' }}
                  onFocus={e => e.target.style.borderColor = '#0d9488'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  className="focus:outline-none text-gray-800 bg-white" />
              </div>
              <div>
                <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '13px', fontWeight: 600 }} className="block mb-2 uppercase tracking-wider">Date *</label>
                <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', width: '100%', padding: '12px 16px' }}
                  onFocus={e => e.target.style.borderColor = '#0d9488'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  className="focus:outline-none text-gray-800 bg-white" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(`/item/${id}`)}
                style={{ flex: 1, border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'Syne, sans-serif', color: '#64748b', background: 'white', padding: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                style={{ flex: 2, background: saving ? '#94a3b8' : 'linear-gradient(135deg,#0d9488,#0f766e)', borderRadius: '12px', fontFamily: 'Syne, sans-serif', color: 'white', padding: '14px', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(13,148,136,0.3)' }}>
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}