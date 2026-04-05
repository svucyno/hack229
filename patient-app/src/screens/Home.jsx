import { useState, useEffect } from 'react'

// ── ECG Waveform SVG ────────────────────────────────────────────
function ECGLine() {
  return (
    <div className="w-full overflow-hidden" style={{ height: 60 }}>
      <svg viewBox="0 0 400 60" className="w-full ecg-svg" preserveAspectRatio="none">
        <path
          className="ecg-path"
          d="M0,30 L60,30 L70,30 L80,10 L90,50 L100,5 L110,55 L120,30 L140,30
             L160,30 L170,30 L180,10 L190,50 L200,5 L210,55 L220,30 L240,30
             L260,30 L270,30 L280,10 L290,50 L300,5 L310,55 L320,30 L360,30 L400,30"
        />
      </svg>
    </div>
  )
}

// ── SOS Pulse Rings ─────────────────────────────────────────────
function SOSButton({ onClick, animate }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Rings */}
      <div
        className="absolute rounded-full border-2"
        style={{
          borderColor: 'rgba(229,57,53,0.5)',
          width: 170, height: 170,
          animation: 'pulseRing 2s cubic-bezier(0.455,0.03,0.515,0.955) infinite',
        }}
      />
      <div
        className="absolute rounded-full border-2"
        style={{
          borderColor: 'rgba(229,57,53,0.3)',
          width: 190, height: 190,
          animation: 'pulseRing 2s cubic-bezier(0.455,0.03,0.515,0.955) 0.7s infinite',
        }}
      />

      {/* Main button */}
      <button
        id="sos-button"
        onClick={onClick}
        className="btn-sos z-10 flex flex-col items-center justify-center gap-1"
        aria-label="Emergency SOS"
        style={{
          width: 130, height: 130,
          transition: animate ? 'all 0.4s ease' : undefined,
          boxShadow: animate ? '0 0 80px rgba(229,57,53,1)' : '0 0 40px rgba(229,57,53,0.5)',
        }}
      >
        {/* Cross icon */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
          <rect x="13" y="4" width="6" height="24" rx="3"/>
          <rect x="4" y="13" width="24" height="6" rx="3"/>
        </svg>
        <span className="font-syne font-bold text-white tracking-widest text-xs">EMERGENCY</span>
      </button>
    </div>
  )
}

// ── Main Screen ─────────────────────────────────────────────────
export default function Home({ navigate }) {
  const [pressed, setPressed] = useState(false)
  const [location, setLocation] = useState('Tirupati, Andhra Pradesh')

  useEffect(() => {
    // Try to get real location name
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Use coordinates as fallback display
          const { latitude, longitude } = pos.coords
          setLocation(`${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`)
        },
        () => {} // silently fall back
      )
    }
  }, [])

  const handleSOS = () => {
    setPressed(true)
    setTimeout(() => {
      navigate('input')
    }, 600)
  }

  return (
    <div
      className="screen pt-safe"
      style={{
        backgroundColor: pressed ? '#E53935' : '#0D0D0D',
        transition: 'background-color 0.5s ease',
        minHeight: '100vh',
      }}
    >
      {/* ── Top Bar ─────────────────── */}
      <div className="flex items-center justify-between pt-6 pb-2">
        <div className="flex items-center gap-2">
          {/* Red cross logo */}
          <div className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="10" y="2" width="8" height="24" rx="4" fill="#E53935"/>
              <rect x="2" y="10" width="24" height="8" rx="4" fill="#E53935"/>
            </svg>
          </div>
          <span className="font-syne font-bold text-white text-xl tracking-tight">MediRush</span>
        </div>
        {/* Avatar */}
        <button
          id="profile-avatar"
          onClick={() => navigate('records')}
          className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
          style={{ width: 40, height: 40, background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          aria-label="Profile"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#888">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </button>
      </div>

      {/* ── ECG Line ─────────────────── */}
      <div className="mt-4 mb-2 opacity-60">
        <ECGLine />
      </div>

      {/* ── SOS Button ────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
        <SOSButton onClick={handleSOS} animate={pressed} />

        <p className="font-dm text-sm" style={{ color: '#888' }}>
          Tap once. Help is on the way.
        </p>

        {/* ── Action Buttons ──────────── */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            id="my-health-records-btn"
            className="btn-outline"
            onClick={() => navigate('records')}
          >
            <span className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#888">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
              </svg>
              My Health Records
            </span>
          </button>
          <button
            id="find-hospital-btn"
            className="btn-outline"
            onClick={() => navigate('input')}
          >
            <span className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#888">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Find Nearest Hospital
            </span>
          </button>
        </div>
      </div>

      {/* ── Location Strip ──────────── */}
      <div
        className="flex items-center gap-2 py-4 mb-2"
        style={{ borderTop: '1px solid #1A1A1A' }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: '#00C853', boxShadow: '0 0 6px #00C853' }} />
        <span className="font-dm text-xs" style={{ color: '#888' }}>
          Location: {location}
        </span>
      </div>
    </div>
  )
}
