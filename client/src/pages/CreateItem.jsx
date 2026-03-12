import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const CATEGORIES = ['Electronics', 'Documents', 'Accessories', 'Clothing', 'Books', 'Sports', 'Keys', 'Wallet', 'Other']

const CATEGORY_ICONS = {
  Electronics: '📱', Documents: '📄', Accessories: '💍',
  Clothing: '👕', Books: '📚', Sports: '⚽', Keys: '🔑', Wallet: '👛', Other: '📦'
}

export default function CreateItem() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', type: 'lost',
    category: 'Electronics', location: '', date: ''
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      Object.keys(form).forEach(key => formData.append(key, form[key]))
      images.forEach(img => formData.append('images', img))
      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      navigate(`/item/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Error aaya, dobara try karo')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Syne, sans-serif', color: '#0a0f1e' }}
            className="text-4xl font-bold mb-2">Report an Item</h1>
          <p style={{ color: '#64748b' }}>Fill in the details below to report a lost or found item</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
            className="p-4 rounded-xl mb-6 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="card p-8">

          {/* Lost / Found Toggle */}
          <div className="mb-6">
            <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '14px', fontWeight: 600 }}
              className="block mb-3 uppercase tracking-wider">Item Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm({ ...form, type: 'lost' })}
                style={{
                  background: form.type === 'lost' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#f8fafc',
                  border: form.type === 'lost' ? 'none' : '2px solid #e2e8f0',
                  color: form.type === 'lost' ? 'white' : '#64748b',
                  fontFamily: 'Syne, sans-serif',
                  boxShadow: form.type === 'lost' ? '0 4px 20px rgba(239,68,68,0.3)' : 'none'
                }}
                className="py-4 rounded-xl font-semibold text-sm transition-all duration-200">
                ❌ Lost Item
              </button>
              <button type="button" onClick={() => setForm({ ...form, type: 'found' })}
                style={{
                  background: form.type === 'found' ? 'linear-gradient(135deg, #0d9488, #0f766e)' : '#f8fafc',
                  border: form.type === 'found' ? 'none' : '2px solid #e2e8f0',
                  color: form.type === 'found' ? 'white' : '#64748b',
                  fontFamily: 'Syne, sans-serif',
                  boxShadow: form.type === 'found' ? '0 4px 20px rgba(13,148,136,0.3)' : 'none'
                }}
                className="py-4 rounded-xl font-semibold text-sm transition-all duration-200">
                ✅ Found Item
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '14px', fontWeight: 600 }}
                className="block mb-2 uppercase tracking-wider">Title *</label>
              <input type="text"
                style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' }}
                className="w-full px-4 py-3 focus:outline-none text-gray-800 bg-white"
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                placeholder="e.g. Black iPhone 13 with cracked screen"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '14px', fontWeight: 600 }}
                className="block mb-2 uppercase tracking-wider">Description *</label>
              <textarea
                style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' }}
                className="w-full px-4 py-3 focus:outline-none text-gray-800 bg-white resize-none"
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                placeholder="Describe the item in detail — color, brand, any marks..."
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required />
            </div>

            {/* Category */}
            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '14px', fontWeight: 600 }}
                className="block mb-3 uppercase tracking-wider">Category *</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    style={{
                      border: form.category === cat ? '2px solid #0d9488' : '2px solid #e2e8f0',
                      background: form.category === cat ? '#f0fdfb' : '#f8fafc',
                      color: form.category === cat ? '#0d9488' : '#64748b',
                      borderRadius: '10px',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '13px',
                      fontWeight: form.category === cat ? 600 : 400,
                    }}
                    className="py-2 px-3 transition-all">
                    {CATEGORY_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Location + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '14px', fontWeight: 600 }}
                  className="block mb-2 uppercase tracking-wider">Location *</label>
                <input type="text"
                  style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' }}
                  className="w-full px-4 py-3 focus:outline-none text-gray-800 bg-white"
                  onFocus={e => e.target.style.borderColor = '#0d9488'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  placeholder="e.g. Library, Block A"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required />
              </div>
              <div>
                <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '14px', fontWeight: 600 }}
                  className="block mb-2 uppercase tracking-wider">Date *</label>
                <input type="date"
                  style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif' }}
                  className="w-full px-4 py-3 focus:outline-none text-gray-800 bg-white"
                  onFocus={e => e.target.style.borderColor = '#0d9488'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required />
              </div>
            </div>

            {/* Images */}
            <div>
              <label style={{ fontFamily: 'Syne, sans-serif', color: '#374151', fontSize: '14px', fontWeight: 600 }}
                className="block mb-2 uppercase tracking-wider">Images (max 5)</label>
              <label style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer' }}
                className="flex flex-col items-center justify-center py-8 hover:border-teal-500 transition-colors bg-gray-50">
                <span className="text-3xl mb-2">📷</span>
                <span style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif' }} className="text-sm">
                  Click to upload images
                </span>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {previews.length > 0 && (
                <div className="flex gap-3 mt-3 flex-wrap">
                  {previews.map((p, i) => (
                    <img key={i} src={p} alt=""
                      className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white" />
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0d9488, #0f766e)',
                fontFamily: 'Syne, sans-serif',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(13,148,136,0.35)'
              }}
              className="w-full text-white py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90 disabled:cursor-not-allowed mt-2">
              {loading ? '⏳ Submitting...' : '🚀 Report Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}