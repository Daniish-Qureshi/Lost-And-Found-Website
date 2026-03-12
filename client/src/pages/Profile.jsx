import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../utils/api'

const CATEGORY_ICONS = {
  Electronics: '📱', Documents: '📄', Accessories: '💍',
  Clothing: '👕', Books: '📚', Sports: '⚽', Keys: '🔑', Wallet: '👛', Other: '📦'
}

export default function Profile() {
  const { user, login, token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' })
    const fetchMyItems = async () => {
      try {
        const res = await api.get('/items')
        setItems(res.data.filter(item => item.user?._id === user?._id))
      } catch (err) { console.log(err) }
      setLoading(false)
    }
    fetchMyItems()
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('phone', form.phone)
      if (avatar) formData.append('avatar', avatar)

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      login(res.data, token)
      setSaveSuccess(true)
      setEditMode(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Update nahi hua')
    }
    setSaving(false)
  }

  const lostCount = items.filter(i => i.type === 'lost').length
  const foundCount = items.filter(i => i.type === 'found').length

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a0f1e, #111827)' }} className="px-4 py-12">
        <div className="max-w-4xl mx-auto">

          {saveSuccess && (
            <div style={{ background: 'rgba(13,148,136,0.2)', border: '1px solid #0d9488', color: '#0d9488', borderRadius: '12px', padding: '12px 20px', marginBottom: '20px', fontFamily: 'DM Sans, sans-serif' }}>
              ✅ Profile update ho gaya!
            </div>
          )}

          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #0d9488, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.2rem', fontWeight: 800, color: 'white',
                fontFamily: 'Syne, sans-serif',
                boxShadow: '0 8px 25px rgba(13,148,136,0.4)',
                overflow: 'hidden'
              }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : user?.avatar ? (
                  <img src={`${user.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              {editMode && (
                <label style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: '#0d9488', borderRadius: '50%',
                  width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '2px solid #0a0f1e'
                }}>
                  <span style={{ fontSize: '14px' }}>📷</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 600 }} className="block mb-1 uppercase tracking-wider">Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', width: '100%', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: 600 }} className="block mb-1 uppercase tracking-wider">Phone</label>
                    <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', padding: '10px 14px', fontFamily: 'DM Sans, sans-serif', width: '100%', outline: 'none' }} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveProfile} disabled={saving}
                      style={{ background: 'linear-gradient(135deg,#0d9488,#0f766e)', color: 'white', borderRadius: '10px', padding: '10px 24px', fontFamily: 'Syne, sans-serif', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                      {saving ? '⏳ Saving...' : '💾 Save'}
                    </button>
                    <button onClick={() => { setEditMode(false); setAvatarPreview(null) }}
                      style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '10px', padding: '10px 20px', fontFamily: 'Syne, sans-serif', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '14px' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontSize: '1.8rem', fontWeight: 800 }}>
                    {user?.name}
                  </h1>
                  <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', marginBottom: '4px' }}>{user?.email}</p>
                  {user?.phone && <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', marginBottom: '8px' }}>📞 {user.phone}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span style={{
                      background: user?.role === 'admin' ? 'rgba(245,158,11,0.2)' : 'rgba(13,148,136,0.2)',
                      color: user?.role === 'admin' ? '#f59e0b' : '#0d9488',
                      border: `1px solid ${user?.role === 'admin' ? 'rgba(245,158,11,0.4)' : 'rgba(13,148,136,0.4)'}`,
                      borderRadius: '20px', padding: '2px 12px',
                      fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600
                    }}>
                      {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
                    </span>
                    <button onClick={() => setEditMode(true)}
                      style={{ background: 'rgba(13,148,136,0.15)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '20px', padding: '2px 14px', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                      ✏️ Edit Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Items', value: items.length, color: '#0d9488' },
            { label: 'Lost Reports', value: lostCount, color: '#ef4444' },
            { label: 'Found Reports', value: foundCount, color: '#16a34a' },
          ].map(stat => (
            <div key={stat.label} className="card p-5 text-center">
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* My Items */}
        <div className="flex justify-between items-center mb-5">
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#0a0f1e', fontSize: '1.4rem', fontWeight: 700 }}>
            My Reports
          </h2>
          <Link to="/create"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', fontFamily: 'Syne, sans-serif', borderRadius: '10px' }}
            className="text-white px-5 py-2 text-sm font-bold hover:opacity-90 transition">
            + New Report
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontSize: '1.2rem', fontWeight: 700 }} className="mb-2">No reports yet</h3>
            <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }} className="mb-5">Koi item lost ya found kiya? Report karo!</p>
            <Link to="/create"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', fontFamily: 'Syne, sans-serif', borderRadius: '10px' }}
              className="text-white px-6 py-3 font-bold hover:opacity-90 transition inline-block">
              Report Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(item => (
              <div key={item._id} className="card p-5 flex gap-4 items-start" style={{ position: 'relative' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f0fdfb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', overflow: 'hidden' }}>
                  {item.images?.length > 0 ? (
                    <img src={`${item.images[0]}`} alt="" className="w-full h-full object-cover" />
                  ) : CATEGORY_ICONS[item.category]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex justify-between items-start gap-2">
                    <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 700, fontSize: '15px' }} className="truncate">
                      {item.title}
                    </h3>
                    <span style={{
                      background: item.type === 'lost' ? '#fef2f2' : '#f0fdfb',
                      color: item.type === 'lost' ? '#ef4444' : '#0d9488',
                      borderRadius: '6px', padding: '2px 8px', fontSize: '11px',
                      fontWeight: 600, fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap'
                    }}>
                      {item.type === 'lost' ? '❌ Lost' : '✅ Found'}
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }} className="mt-1">📍 {item.location}</p>
                  <p style={{ color: '#cbd5e1', fontFamily: 'DM Sans, sans-serif', fontSize: '12px' }} className="mt-1">
                    {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Link to={`/item/${item._id}`}
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                      👁️ View
                    </Link>
                    <Link to={`/edit/${item._id}`}
                      style={{ background: '#f0fdfb', border: '1px solid #99f6e4', color: '#0d9488', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                      ✏️ Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}