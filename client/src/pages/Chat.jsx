import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket

export default function Chat() {
  const { userId, itemId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [activeItemId, setActiveItemId] = useState(itemId || null)
  const [text, setText] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef(null)

  // Socket setup
  useEffect(() => {
    socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socket.emit('join', user._id)

    socket.on('receiveMessage', (msg) => {
      // Conversations update karo
      loadConversations()
      // Agar active chat mein hai to message show karo
      setActiveUser(prev => {
        if (prev && (msg.senderId === prev._id || msg.receiverId === prev._id)) {
          setMessages(old => {
            if (old.find(m => m.id === msg.id || m._id === msg._id)) return old
            return [...old, msg]
          })
        }
        return prev
      })
    })

    return () => socket.disconnect()
  }, [])

  // Load conversations
  const loadConversations = async () => {
    try {
      const res = await api.get('/messages')
      const seen = new Map()
      res.data.forEach(msg => {
        const other = msg.sender?._id === user._id ? msg.receiver : msg.sender
        if (!other) return
        const key = other._id
        if (!seen.has(key)) {
          seen.set(key, { user: other, lastMsg: msg })
        }
      })
      setConversations(Array.from(seen.values()))
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  // If userId in URL, open that chat
  useEffect(() => {
    if (!userId) return
    const openFromUrl = async () => {
      try {
        const userRes = await api.get(`/users/${userId}`)
        setActiveUser(userRes.data)
        setActiveItemId(itemId || null)
        setShowSidebar(false)
        const url = itemId ? `/messages/${userId}?itemId=${itemId}` : `/messages/${userId}`
        const msgRes = await api.get(url)
        setMessages(msgRes.data)
      } catch {
        setActiveUser({ _id: userId, name: 'User' })
        setMessages([])
      }
    }
    openFromUrl()
  }, [userId, itemId])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openChat = async (conv) => {
    setActiveUser(conv.user)
    setActiveItemId(null)
    setShowSidebar(false)
    try {
      const msgRes = await api.get(`/messages/${conv.user._id}`)
      setMessages(msgRes.data)
    } catch {
      setMessages([])
    }
  }

  const handleSend = (e) => {
    if (e) e.preventDefault()
    const targetId = activeUser?._id || userId
    if (!text.trim() || !targetId || !socket) return

    socket.emit('sendMessage', {
      senderId: user._id,
      receiverId: targetId,
      message: text.trim(),
      senderName: user.name,
      itemId: activeItemId || null
    })

    setText('')
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', background: '#f8fafc', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{
        width: '300px', minWidth: '300px',
        borderRight: '1px solid #e2e8f0',
        background: 'white',
        display: window.innerWidth < 768 && !showSidebar ? 'none' : 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#0a0f1e', fontSize: '1.1rem', fontWeight: 700 }}>
            💬 Messages
          </h2>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
              <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
                Koi conversation nahi hai abhi
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div key={conv.user._id}
                onClick={() => openChat(conv)}
                style={{
                  padding: '14px 16px', cursor: 'pointer',
                  background: activeUser?._id === conv.user._id ? '#f0fdfb' : 'white',
                  borderLeft: activeUser?._id === conv.user._id ? '3px solid #0d9488' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0d9488, #f59e0b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontFamily: 'Syne, sans-serif',
                  flexShrink: 0
                }}>
                  {conv.user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>
                    {conv.user.name}
                  </p>
                  <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.lastMsg?.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activeUser ? (
          <>
            {/* Header */}
            <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Mobile back button */}
              <button onClick={() => setShowSidebar(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', display: window.innerWidth < 768 ? 'block' : 'none' }}>
                ←
              </button>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
                {activeUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 700, fontSize: '15px' }}>
                  {activeUser.name}
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                  Lost & Found Chat
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', marginTop: '60px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👋</div>
                  <p>Conversation shuru karo!</p>
                </div>
              )}
              {messages.map((m, i) => {
                const isMine = m.senderId === user._id || m.sender === user._id || m.sender?._id === user._id
                return (
                  <div key={m.id || m._id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%', padding: '10px 14px',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine ? 'linear-gradient(135deg, #0d9488, #0f766e)' : 'white',
                      color: isMine ? 'white' : '#1e293b',
                      fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      border: isMine ? 'none' : '1px solid #e2e8f0',
                      wordBreak: 'break-word'
                    }}>
                      {m.message}
                      <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message likho... (Enter to send)"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '14px', border: '2px solid #e2e8f0', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                onFocus={e => e.target.style.borderColor = '#0d9488'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button type="submit"
                style={{ background: text.trim() ? 'linear-gradient(135deg, #0d9488, #0f766e)' : '#e2e8f0', color: text.trim() ? 'white' : '#94a3b8', border: 'none', borderRadius: '14px', padding: '10px 16px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                Send ➤
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '4rem' }}>💬</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontSize: '1.3rem', fontWeight: 700 }}>
              Conversations
            </h3>
            <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', textAlign: 'center', padding: '0 20px' }}>
              Left side se conversation select karo ya kisi item pe "Chat with Owner" click karo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}