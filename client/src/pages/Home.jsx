import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { useLang } from '../context/LanguageContext'

const CATEGORIES = ['All', 'Electronics', 'Documents', 'Accessories', 'Clothing', 'Books', 'Sports', 'Keys', 'Wallet', 'Other']

const CATEGORY_ICONS = {
  All: '🔍', Electronics: '📱', Documents: '📄', Accessories: '💍',
  Clothing: '👕', Books: '📚', Sports: '⚽', Keys: '🔑', Wallet: '👛', Other: '📦'
}

export default function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('All')
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useLang()

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (type) params.type = type
      if (category && category !== 'All') params.category = category
      const res = await api.get('/items', { params })
      setItems(res.data)
    } catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [type, category])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchItems()
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0d2f2b 100%)' }} className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div style={{ display: 'inline-block', background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '100px', padding: '6px 16px', marginBottom: '20px' }}>
            <span style={{ color: '#0d9488', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 500 }}>
              🌟 Community Lost & Found Platform
            </span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}>
            Lost Something?<br />
            <span style={{ color: '#0d9488' }}>We'll Help You Find It.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '1.1rem', marginBottom: '32px' }}>
            Report lost or found items and connect with your community instantly
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/create"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', fontFamily: 'Syne, sans-serif', boxShadow: '0 8px 25px rgba(239,68,68,0.35)', borderRadius: '12px' }}
              className="text-white px-8 py-4 font-bold text-base hover:opacity-90 transition">
              ❌ Report Lost Item
            </Link>
            <Link to="/create"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', fontFamily: 'Syne, sans-serif', boxShadow: '0 8px 25px rgba(13,148,136,0.35)', borderRadius: '12px' }}
              className="text-white px-8 py-4 font-bold text-base hover:opacity-90 transition">
              ✅ Report Found Item
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-12">
            {[['24/7', 'Available'], ['Free', 'To Use'], ['Secure', 'Platform']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div style={{ fontFamily: 'Syne, sans-serif', color: '#0d9488', fontSize: '1.5rem', fontWeight: 800 }}>{val}</div>
                <div style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input type="text"
            style={{ border: '2px solid #e2e8f0', borderRadius: '14px', fontFamily: 'DM Sans, sans-serif', fontSize: '15px' }}
            className="flex-1 px-5 py-4 focus:outline-none bg-white text-gray-800"
            onFocus={e => e.target.style.borderColor = '#0d9488'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            placeholder="🔍  Search lost or found items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', fontFamily: 'Syne, sans-serif', borderRadius: '14px', boxShadow: '0 4px 15px rgba(13,148,136,0.3)' }}
            className="text-white px-8 py-4 font-bold hover:opacity-90 transition whitespace-nowrap">
            Search
          </button>
        </form>

        {/* Filter Row */}
        <div className="flex gap-3 mb-8 flex-wrap items-center">
          <select
            style={{ border: '2px solid #e2e8f0', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', color: '#374151', background: 'white' }}
            className="px-4 py-3 focus:outline-none text-sm"
            onFocus={e => e.target.style.borderColor = '#0d9488'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="lost">❌ Lost</option>
            <option value="found">✅ Found</option>
          </select>

          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{
                  border: category === cat ? '2px solid #0d9488' : '2px solid #e2e8f0',
                  background: category === cat ? '#0d9488' : 'white',
                  color: category === cat ? 'white' : '#64748b',
                  borderRadius: '10px', fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px', fontWeight: category === cat ? 600 : 400,
                  padding: '8px 14px', transition: 'all 0.2s', cursor: 'pointer'
                }}>
                {CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #0d9488', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📭</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontSize: '1.5rem', fontWeight: 700 }} className="mb-2">
              No items found
            </h3>
            <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }} className="mb-6">
              Be the first to report a lost or found item
            </p>
            <Link to="/create"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', fontFamily: 'Syne, sans-serif', borderRadius: '12px' }}
              className="text-white px-8 py-3 font-bold hover:opacity-90 transition inline-block">
              + Report First Item
            </Link>
          </div>
        ) : (
          <>
            <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }} className="mb-4">
              {items.length} item{items.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <div key={item._id} className="card overflow-hidden group" style={{ display: 'flex', flexDirection: 'column' }}>

                  {/* Clickable Top Part */}
                  <Link to={`/item/${item._id}`} style={{ flex: 1 }}>
                    {item.images?.length > 0 ? (
                      <div className="overflow-hidden" style={{ height: '200px' }}>
                        <img src={`http://localhost:5000/uploads/${item.images[0]}`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div style={{ height: '200px', background: 'linear-gradient(135deg, #f0fdfb, #e6fffa)' }}
                        className="flex items-center justify-center text-6xl">
                        {CATEGORY_ICONS[item.category] || '📦'}
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 700, fontSize: '1rem' }}
                          className="flex-1 mr-2 line-clamp-1">
                          {item.title}
                        </h3>
                        <span style={{
                          background: item.type === 'lost' ? '#fef2f2' : '#f0fdfb',
                          color: item.type === 'lost' ? '#ef4444' : '#0d9488',
                          border: `1px solid ${item.type === 'lost' ? '#fecaca' : '#99f6e4'}`,
                          borderRadius: '8px', padding: '2px 10px', fontSize: '12px',
                          fontWeight: 600, fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap'
                        }}>
                          {item.type === 'lost' ? '❌ Lost' : '✅ Found'}
                        </span>
                      </div>

                      <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}
                        className="mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      <div style={{ borderTop: '1px solid #f1f5f9' }} className="pt-3 flex justify-between items-center">
                        <span style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
                          📍 {item.location}
                        </span>
                        <span style={{ background: '#f0fdfb', color: '#0d9488', borderRadius: '6px', padding: '2px 8px', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>
                          {CATEGORY_ICONS[item.category]} {item.category}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Chat Button — only for other users */}
                  {user && item.user?._id !== user?._id && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <Link to={`/chat/${item.user?._id}`}
                        style={{
                          display: 'block', textAlign: 'center',
                          background: '#0a0f1e', color: 'white',
                          borderRadius: '10px', padding: '10px',
                          fontFamily: 'Syne, sans-serif', fontWeight: 600,
                          fontSize: '13px', textDecoration: 'none'
                        }}
                        className="hover:opacity-80 transition">
                        💬 Chat with Owner
                      </Link>
                    </div>
                  )}

                  {/* Own item badge */}
                  {user && item.user?._id === user?._id && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <div style={{
                        textAlign: 'center', background: '#f0fdfb',
                        border: '1px solid #99f6e4', color: '#0d9488',
                        borderRadius: '10px', padding: '8px',
                        fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 500
                      }}>
                        ✅ Your Item
                      </div>
                    </div>
                  )}

                  {/* Not logged in */}
                  {!user && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <button onClick={() => navigate('/login')}
                        style={{
                          width: '100%', textAlign: 'center',
                          background: '#f8fafc', color: '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px', padding: '8px',
                          fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
                          cursor: 'pointer'
                        }}
                        className="hover:bg-gray-100 transition">
                        🔐 Login to Chat
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      `}</style>
    </div>
  )
}