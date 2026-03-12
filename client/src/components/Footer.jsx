import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#0a0f1e', borderTop: '1px solid #1e293b' }} className="mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ background: 'linear-gradient(135deg, #0d9488, #f59e0b)', borderRadius: '10px' }}
                className="w-9 h-9 flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>
                Lost<span style={{ color: '#0d9488' }}>&</span>Found
              </span>
            </div>
            <p style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.7 }}>
              Community ka lost & found platform. Apni cheezein dhundo ya dusron ki madad karo.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>
              Quick Links
            </h4>
            <div className="flex flex-col gap-2">
              {[['/', 'Home'], ['/create', 'Report Item'], ['/chat', 'Messages'], ['/profile', 'Profile']].map(([to, label]) => (
                <Link key={to} to={to}
                  style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', textDecoration: 'none' }}
                  className="hover:text-teal-400 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif', color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>
              Platform Info
            </h4>
            <div className="flex flex-col gap-2">
              {[['24/7', 'Available anytime'], ['Free', 'No charges'], ['Secure', 'Your data is safe'], ['Fast', 'Quick reporting']].map(([val, label]) => (
                <div key={val} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#0d9488', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px' }}>{val}</span>
                  <span style={{ color: '#64748b', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
            © 2026 Lost & Found Portal. All rights reserved.
          </p>
          <p style={{ color: '#475569', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
            Made with ❤️ by <span style={{ color: '#0d9488', fontWeight: 600 }}>Danish Qureshi</span>
          </p>
        </div>
      </div>
    </footer>
  )
}