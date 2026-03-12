import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
  if (!user) return
  fetchNotifications()
  const interval = setInterval(fetchNotifications, 15000)
  return () => clearInterval(interval)
}, [user])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch (err) { console.log(err) }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) { console.log(err) }
  }

  const getIcon = (type) => {
    const icons = { claim: '🙋', claim_approved: '✅', claim_rejected: '❌', item_match: '🔍', message: '💬' }
    return icons[type] || '🔔'
  }

  const getTime = (date) => {
    const diff = Date.now() - new Date(date)
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead() }}
        style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '7px 12px', cursor: 'pointer',
          fontSize: '16px', position: 'relative', transition: 'all 0.2s'
        }}>
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-6px', right: '-6px',
            background: '#ef4444', color: 'white',
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '10px', fontFamily: 'Syne, sans-serif', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #0a0f1e'
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '110%', right: 0,
            background: 'white', borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            width: '320px', zIndex: 50,
            animation: 'fadeIn 0.15s ease', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
                🔔 Notifications
              </h3>
              {unread > 0 && (
                <button onClick={markAllRead}
                  style={{ background: 'none', border: 'none', color: '#0d9488', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔔</div>
                  <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
                    Koi notifications nahi hain
                  </p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n._id}
                    style={{
                      padding: '14px 20px',
                      background: n.read ? 'white' : '#f0fdfb',
                      borderBottom: '1px solid #f8fafc',
                      borderLeft: n.read ? '3px solid transparent' : '3px solid #0d9488',
                      transition: 'all 0.2s'
                    }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{getIcon(n.type)}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#1e293b', fontSize: '13px', lineHeight: 1.5, marginBottom: '4px' }}>
                          {n.message}
                        </p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#94a3b8', fontSize: '11px' }}>
                          {getTime(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d9488', flexShrink: 0, marginTop: '4px' }} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}