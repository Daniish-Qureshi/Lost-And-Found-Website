import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

const CATEGORY_ICONS = {
  Electronics: '📱', Documents: '📄', Accessories: '💍',
  Clothing: '👕', Books: '📚', Sports: '⚽', Keys: '🔑', Wallet: '👛', Other: '📦'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ items: 0, claims: 0, lost: 0, found: 0 })
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userItems, setUserItems] = useState([])
  const [userModal, setUserModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, claimsRes, usersRes] = await Promise.all([
          api.get('/items'),
          api.get('/claims'),
          api.get('/users'),
        ])
        setItems(itemsRes.data)
        setClaims(claimsRes.data)
        setUsers(usersRes.data)
        setStats({
          items: itemsRes.data.length,
          claims: claimsRes.data.length,
          lost: itemsRes.data.filter(i => i.type === 'lost').length,
          found: itemsRes.data.filter(i => i.type === 'found').length,
        })
      } catch (err) { console.log(err) }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete karna chahte ho?')) return
    try {
      await api.delete(`/items/${id}`)
      setItems(prev => prev.filter(i => i._id !== id))
    } catch { alert('Delete nahi hua') }
  }

  const handleClaimStatus = async (id, status) => {
    try {
      await api.put(`/claims/${id}`, { status })
      setClaims(prev => prev.map(c => c._id === id ? { ...c, status } : c))
    } catch { alert('Update nahi hua') }
  }

  const handleUserRole = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role })
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u))
      if (selectedUser?._id === id) setSelectedUser(prev => ({ ...prev, role }))
    } catch { alert('Role update nahi hua') }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('User delete karna chahte ho?')) return
    try {
      await api.delete(`/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      setUserModal(false)
    } catch { alert('Delete nahi hua') }
  }

  const openUserModal = (user) => {
    setSelectedUser(user)
    const uItems = items.filter(i => i.user?._id === user._id || i.user === user._id)
    setUserItems(uItems)
    setUserModal(true)
  }

  const handleItemUpdate = async (id, data) => {
    try {
      await api.put(`/items/${id}`, data)
      setItems(prev => prev.map(i => i._id === id ? { ...i, ...data } : i))
      setUserItems(prev => prev.map(i => i._id === id ? { ...i, ...data } : i))
    } catch { alert('Update nahi hua') }
  }

  const TABS = ['overview', 'items', 'claims', 'users']

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a0f1e, #111827)' }} className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <span style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
            ⚡ ADMIN
          </span>
          <h1 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif' }}>Manage items, claims aur users</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Items', value: stats.items, icon: '📦', color: '#0d9488' },
            { label: 'Lost Items', value: stats.lost, icon: '❌', color: '#ef4444' },
            { label: 'Found Items', value: stats.found, icon: '✅', color: '#16a34a' },
            { label: 'Total Users', value: users.length, icon: '👥', color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} className="card p-5">
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid #e2e8f0', marginBottom: '24px', display: 'flex', gap: '4px' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px', fontFamily: 'Syne, sans-serif', fontWeight: 600,
                fontSize: '14px', border: 'none', background: 'none', cursor: 'pointer',
                textTransform: 'capitalize',
                color: activeTab === tab ? '#0d9488' : '#64748b',
                borderBottom: activeTab === tab ? '2px solid #0d9488' : '2px solid transparent',
                marginBottom: '-2px', transition: 'all 0.2s'
              }}>
              {tab === 'overview' ? '📊 Overview' : tab === 'items' ? '📦 Items' : tab === 'claims' ? '🙋 Claims' : '👥 Users'}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 700, marginBottom: '16px' }}>📈 Quick Stats</h3>
              {[
                { label: 'Active Items', value: items.filter(i => i.status === 'active').length, color: '#0d9488' },
                { label: 'Claimed Items', value: items.filter(i => i.status === 'claimed').length, color: '#f59e0b' },
                { label: 'Pending Claims', value: claims.filter(c => c.status === 'pending').length, color: '#ef4444' },
                { label: 'Approved Claims', value: claims.filter(c => c.status === 'approved').length, color: '#16a34a' },
                { label: 'Admin Users', value: users.filter(u => u.role === 'admin').length, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#475569', fontSize: '14px' }}>{s.label}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: s.color, fontSize: '18px' }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="card p-6">
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 700, marginBottom: '16px' }}>🕐 Recent Users</h3>
              {users.slice(0, 6).map(u => (
                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '13px', fontFamily: 'Syne, sans-serif' }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#1e293b', fontSize: '14px', fontWeight: 500 }}>{u.name}</span>
                  </div>
                  <span style={{ background: u.role === 'admin' ? 'rgba(245,158,11,0.15)' : '#f0fdfb', color: u.role === 'admin' ? '#f59e0b' : '#0d9488', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                    {u.role === 'admin' ? '⚡ Admin' : '👤 User'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="card overflow-hidden">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Title', 'Type', 'Category', 'Status', 'Posted By', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Syne, sans-serif', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', color: '#1e293b', fontWeight: 500, fontSize: '14px' }}>{item.title}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: item.type === 'lost' ? '#fef2f2' : '#f0fdfb', color: item.type === 'lost' ? '#ef4444' : '#0d9488', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                        {item.type === 'lost' ? '❌ Lost' : '✅ Found'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', color: '#64748b', fontSize: '13px' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={item.status} onChange={e => handleItemUpdate(item._id, { status: e.target.value })}
                        style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', background: 'white', cursor: 'pointer' }}>
                        <option value="active">🟢 Active</option>
                        <option value="claimed">🟡 Claimed</option>
                        <option value="closed">⚫ Closed</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', color: '#64748b', fontSize: '13px' }}>{item.user?.name || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link to={`/edit/${item._id}`}
                          style={{ background: '#f0fdfb', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                          ✏️
                        </Link>
                        <button onClick={() => handleDeleteItem(item._id)}
                          style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>Koi items nahi hain</div>}
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="card overflow-hidden">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Item', 'Claimant', 'Description', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Syne, sans-serif', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claims.map((claim, i) => (
                  <tr key={claim._id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', color: '#1e293b', fontWeight: 500, fontSize: '14px' }}>{claim.item?.title || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', color: '#475569', fontSize: '13px' }}>{claim.claimant?.name || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', color: '#64748b', fontSize: '13px', maxWidth: '200px' }}>{claim.description}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: claim.status === 'approved' ? '#f0fdf4' : claim.status === 'rejected' ? '#fef2f2' : '#fffbeb', color: claim.status === 'approved' ? '#16a34a' : claim.status === 'rejected' ? '#ef4444' : '#ca8a04', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                        {claim.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {claim.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleClaimStatus(claim._id, 'approved')}
                            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                            ✅
                          </button>
                          <button onClick={() => handleClaimStatus(claim._id, 'rejected')}
                            style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                            ❌
                          </button>
                        </div>
                      )}
                      {claim.status !== 'pending' && <span style={{ color: '#94a3b8', fontSize: '13px' }}>Done</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {claims.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>Koi claims nahi hain</div>}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card overflow-hidden">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['User', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'Syne, sans-serif', color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontFamily: 'Syne, sans-serif', fontSize: '14px', overflow: 'hidden', flexShrink: 0 }}>
                          {u.avatar ? <img src={`${u.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', color: '#64748b', fontSize: '13px' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', color: '#64748b', fontSize: '13px' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={u.role} onChange={e => handleUserRole(u._id, e.target.value)}
                        style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', background: 'white', cursor: 'pointer' }}>
                        <option value="user">👤 User</option>
                        <option value="admin">⚡ Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', color: '#94a3b8', fontSize: '12px' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openUserModal(u)}
                          style={{ background: '#f0fdfb', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                          👁️ View
                        </button>
                        <button onClick={() => handleDeleteUser(u._id)}
                          style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>Koi users nahi hain</div>}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {userModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setUserModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#111827)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', overflow: 'hidden' }}>
                  {selectedUser.avatar ? <img src={`${selectedUser.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>{selectedUser.name}</h2>
                  <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setUserModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: '14px' }}>
                ✕ Close
              </button>
            </div>

            <div style={{ overflowY: 'auto', padding: '24px' }}>

              {/* User Details */}
              <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Full Name', value: selectedUser.name },
                  { label: 'Email', value: selectedUser.email },
                  { label: 'Phone', value: selectedUser.phone || '—' },
                  { label: 'Role', value: selectedUser.role === 'admin' ? '⚡ Admin' : '👤 User' },
                  { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Total Items', value: userItems.length },
                ].map(d => (
                  <div key={d.label}>
                    <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{d.label}</p>
                    <p style={{ color: '#1e293b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 500 }}>{d.value}</p>
                  </div>
                ))}
              </div>

              {/* User Items */}
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 700, marginBottom: '12px' }}>
                📦 Posted Items ({userItems.length})
              </h3>
              {userItems.length === 0 ? (
                <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', textAlign: 'center', padding: '20px' }}>Koi items nahi hain</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userItems.map(item => (
                    <div key={item._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0fdfb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', overflow: 'hidden', flexShrink: 0 }}>
                          {item.images?.length > 0 ? <img src={`${item.images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : CATEGORY_ICONS[item.category]}
                        </div>
                        <div>
                          <p style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 700, fontSize: '14px' }}>{item.title}</p>
                          <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '12px' }}>📍 {item.location}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: item.type === 'lost' ? '#fef2f2' : '#f0fdfb', color: item.type === 'lost' ? '#ef4444' : '#0d9488', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                          {item.type === 'lost' ? '❌ Lost' : '✅ Found'}
                        </span>
                        <select value={item.status} onChange={e => handleItemUpdate(item._id, { status: e.target.value })}
                          style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', background: 'white', cursor: 'pointer' }}>
                          <option value="active">🟢 Active</option>
                          <option value="claimed">🟡 Claimed</option>
                          <option value="closed">⚫ Closed</option>
                        </select>
                        <Link to={`/edit/${item._id}`}
                          style={{ background: '#f0fdfb', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                          ✏️
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}