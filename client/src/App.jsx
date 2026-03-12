import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ItemDetail from './pages/ItemDetail'
import CreateItem from './pages/CreateItem'
import EditItem from './pages/EditItem'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import AdminDashboard from './pages/AdminDashboard'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748b' }}>Loading...</p>
      </div>
    </div>
  )

  return user ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  return user?.role === 'admin' ? children : <Navigate to="/" />
}

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/create" element={<PrivateRoute><CreateItem /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><EditItem /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/chat/:userId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App