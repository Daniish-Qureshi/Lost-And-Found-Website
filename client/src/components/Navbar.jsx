import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{ background: isDark ? '#060b14' : '#0a0f1e', fontFamily: 'Syne, sans-serif' }} className="sticky top-0 z-50 px-6 py-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div style={{ background: 'linear-gradient(135deg, #0d9488, #f59e0b)', borderRadius: '10px' }}
            className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
          <span className="text-white text-xl font-bold tracking-tight">
            Lost<span style={{ color: '#0d9488' }}>&</span>Found
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/"
            style={{ color: isActive('/') ? '#0d9488' : '#94a3b8', fontWeight: 500 }}
            className="px-4 py-2 rounded-lg hover:text-white transition-colors text-sm">
            Home
          </Link>

          {/* Theme Toggle */}
          {/* <button onClick={toggleTheme}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '7px 12px', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s' }}
            title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? '☀️' : '🌙'}
          </button> */}

          {/* Notification Bell */}
          {user && <NotificationBell />}

          {user ? (
            <>
              <Link to="/create"
                style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', fontFamily: 'Syne, sans-serif' }}
                className="text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-lg ml-2">
                + Report Item
              </Link>
              <Link to="/chat"
                style={{ color: isActive('/chat') ? '#0d9488' : '#94a3b8' }}
                className="px-4 py-2 rounded-lg hover:text-white transition-colors text-sm ml-1">
                💬 Chat
              </Link>
              <Link to="/profile"
                style={{ color: isActive('/profile') ? '#0d9488' : '#94a3b8' }}
                className="px-4 py-2 rounded-lg hover:text-white transition-colors text-sm">
                Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin"
                  style={{ color: '#f59e0b' }}
                  className="px-4 py-2 rounded-lg hover:opacity-80 transition-colors text-sm font-semibold">
                  ⚡ Admin
                </Link>
              )}
              <div style={{ border: '1px solid #1e293b' }} className="h-6 mx-2" />
              <div className="flex items-center gap-2">
                <div style={{ background: '#1e293b', border: '2px solid #0d9488' }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout}
                  style={{ color: '#64748b' }}
                  className="text-sm hover:text-red-400 transition-colors px-2">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"
                style={{ color: '#94a3b8' }}
                className="px-4 py-2 rounded-lg hover:text-white transition-colors text-sm">
                Login
              </Link>
              <Link to="/register"
                style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
                className="text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-lg">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}