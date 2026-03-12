import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { io } from 'socket.io-client'

let socket

export default function Chat() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeout = useRef(null)

  // Socket setup
  useEffect(() => {
    socket = io('http://localhost:5000')
    socket.emit('user-join', user._id)

    socket.on('online-users', (users) => setOnlineUsers(users))
    socket.on('receive-message', (msg) => {
      setMessages(prev => [...prev, msg])
    })
    socket.on('user-typing', () => setTyping(true))
    socket.on('user-stop-typing', () => setTyping(false))

    return () => socket.disconnect()
  }, [])

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages')
        // Unique users
        const seen = new Set()
        const unique = []
        res.data.forEach(msg => {
          const other = msg.sender._id === user._id ? msg.receiver : msg.sender
          if (!seen.has(other._id)) {
            seen.add(other._id)
            unique.push({ user: other, lastMsg: msg })
          }
        })
        setConversations(unique)

        // If userId in URL, open that chat
        if (userId) {
          const found = unique.find(c => c.user._id === userId)
          if (found) openChat(found.user)
          else {
            // New chat - fetch user info from items
            setActiveUser({ _id: userId, name: 'User' })
            fetchMessages(userId)
          }
        }
      } catch (err) { console.log(err) }
    }
    fetchConversations()
  }, [userId])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async (receiverId) => {
    try {
      const res = await api.get(`/messages/${receiverId}`)
      setMessages(res.data)
    } catch (err) { console.log(err) }
  }

  const openChat = (chatUser) => {
    setActiveUser(chatUser)
    fetchMessages(chatUser._id)
  }

  const handleSend = () => {
    if (!text.trim() || !activeUser) return
    socket.emit('send-message', {
      senderId: user._id,
      receiverId: activeUser._id,
      message: text
    })
    setMessages(prev => [...prev, {
      sender: user._id,
      receiver: activeUser._id,
      message: text,
      createdAt: new Date()
    }])
    setText('')
    socket.emit('stop-typing', { receiverId: activeUser._id })
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    if (!activeUser) return
    socket.emit('typing', { receiverId: activeUser._id, senderId: user._id })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop-typing', { receiverId: activeUser._id })
    }, 1000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isOnline = (uid) => onlineUsers.includes(uid)

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', background: '#f8fafc' }}>

      {/* Sidebar */}
      <div style={{ width: '300px', borderRight: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#0a0f1e', fontSize: '1.2rem', fontWeight: 700 }}>
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
                onClick={() => openChat(conv.user)}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: activeUser?._id === conv.user._id ? '#f0fdfb' : 'white',
                  borderLeft: activeUser?._id === conv.user._id ? '3px solid #0d9488' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d9488, #f59e0b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontFamily: 'Syne, sans-serif'
                  }}>
                    {conv.user.name?.charAt(0).toUpperCase()}
                  </div>
                  {isOnline(conv.user._id) && (
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: '11px', height: '11px', borderRadius: '50%',
                      background: '#22c55e', border: '2px solid white'
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>
                    {conv.user.name}
                  </p>
                  <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.lastMsg.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeUser ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Chat Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d9488, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontFamily: 'Syne, sans-serif'
            }}>
              {activeUser.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontWeight: 700 }}>{activeUser.name}</p>
              <p style={{ fontSize: '12px', color: isOnline(activeUser._id) ? '#22c55e' : '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                {isOnline(activeUser._id) ? '🟢 Online' : '⚫ Offline'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', marginTop: '60px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👋</div>
                <p>Conversation shuru karo!</p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isMine = (msg.sender === user._id || msg.sender?._id === user._id)
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '65%',
                    padding: '10px 14px',
                    borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMine ? 'linear-gradient(135deg, #0d9488, #0f766e)' : 'white',
                    color: isMine ? 'white' : '#1e293b',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '14px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    border: isMine ? 'none' : '1px solid #e2e8f0'
                  }}>
                    {msg.message}
                    <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}

            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '10px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <span style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', gap: '12px' }}>
            <input
              style={{
                flex: 1, border: '2px solid #e2e8f0', borderRadius: '14px',
                padding: '12px 16px', fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px', outline: 'none', color: '#1e293b'
              }}
              onFocus={e => e.target.style.borderColor = '#0d9488'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              placeholder="Message likho... (Enter to send)"
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend}
              style={{
                background: text.trim() ? 'linear-gradient(135deg, #0d9488, #0f766e)' : '#e2e8f0',
                color: text.trim() ? 'white' : '#94a3b8',
                border: 'none', borderRadius: '14px',
                padding: '12px 20px', cursor: 'pointer',
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: '14px', transition: 'all 0.2s'
              }}>
              Send ➤
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '4rem' }}>💬</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#1e293b', fontSize: '1.3rem', fontWeight: 700 }}>
            Select a conversation
          </h3>
          <p style={{ color: '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
            Ya kisi item pe jaao aur "Chat with Owner" click karo
          </p>
        </div>
      )}
    </div>
  )
}