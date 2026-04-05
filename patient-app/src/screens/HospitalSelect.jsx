import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const BADGE_STYLE = {
  'Best Match': { bg: 'rgba(255,183,0,0.15)', color: '#FFB300', border: '1px solid rgba(255,183,0,0.3)' },
  'Fastest':    { bg: 'rgba(21,101,192,0.15)', color: '#1E88E5', border: '1px solid rgba(21,101,192,0.3)' },
}

function formatETA(seconds) {
  if (!seconds) return '—'
  const mins = Math.round(seconds / 60)
  if (mins < 1) return '< 1 min'
  return `${mins} min${mins > 1 ? 's' : ''}`
}

// ── Availability bar ─────────────────────────────────────────────
function AvailabilityBar({ available, total }) {
  const pct = total ? Math.round((available / total) * 100) : 0
  const color = pct > 40 ? '#00C853' : pct > 15 ? '#FFB300' : '#E53935'
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-dm text-xs" style={{ color: '#888' }}>Bed Availability</span>
        <span className="font-mono text-xs" style={{ color }}>{available}/{total} free ({pct}%)</span>
      </div>
      <div className="availability-bar">
        <div
          className="availability-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ── Hospital Card ────────────────────────────────────────────────
function HospitalCard({ hospital, index, onSelect, loading }) {
  const [expanded, setExpanded] = useState(false)
  const badge = hospital.badge

  return (
    <div
      className="hospital-card animate-fade-up"
      style={{
        animationDelay: `${index * 150}ms`,
        border: expanded ? '1px solid rgba(229,57,53,0.4)' : '1px solid #2A2A2A',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* ── Card Header ───────────────── */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {badge && (
            <span
              className="text-xs font-dm font-semibold px-2 py-0.5 rounded-full mb-1 inline-block"
              style={BADGE_STYLE[badge] || {}}
            >
              {badge}
            </span>
          )}
          <h3 className="font-syne font-bold text-white text-base leading-tight">
            {hospital.name}
          </h3>
          <p className="font-dm text-xs mt-0.5" style={{ color: '#888' }}>
            {hospital.type} · {hospital.city}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 ml-3">
          <span className="text-xs" style={{ color: '#FFB300' }}>★</span>
          <span className="font-mono text-sm font-bold" style={{ color: '#FFB300' }}>
            {hospital.rating?.toFixed(1)}
          </span>
        </div>
      </div>

      {/* ── Key metrics row ───────────── */}
      <div className="flex gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#888">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span className="font-mono text-xs" style={{ color: '#fff' }}>
            {hospital.distance_km} km
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#888">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L11 13V7h1.5v5.25l4.28 2.85-.54.9z"/>
          </svg>
          <span className="font-mono text-xs" style={{ color: badge === 'Fastest' ? '#1E88E5' : '#fff' }}>
            {formatETA(hospital.eta_seconds)} ETA
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#888">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
          </svg>
          <span className="font-mono text-xs" style={{ color: '#fff' }}>
            {hospital.beds_available} beds
          </span>
        </div>
      </div>

      {/* ── Specialities ──────────────── */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {hospital.specializations?.slice(0, 3).map((s, i) => (
          <span
            key={i}
            className="text-xs font-dm px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(21,101,192,0.15)', color: '#1E88E5', border: '1px solid rgba(21,101,192,0.2)' }}
          >
            {s}
          </span>
        ))}
        {hospital.specializations?.length > 3 && (
          <span className="text-xs font-dm" style={{ color: '#555' }}>
            +{hospital.specializations.length - 3} more
          </span>
        )}
      </div>

      {/* ── Availability bar ──────────── */}
      <AvailabilityBar available={hospital.beds_available} total={hospital.beds_total} />

      {/* ── Composite score mini bar ──── */}
      <div className="mt-3">
        <div className="flex justify-between mb-1">
          <span className="font-dm text-xs" style={{ color: '#555' }}>Match Score</span>
          <span className="font-mono text-xs" style={{ color: '#00C853' }}>
            {Math.round(hospital.composite_score * 100)}%
          </span>
        </div>
        <div className="availability-bar">
          <div
            className="availability-fill"
            style={{ width: `${Math.round(hospital.composite_score * 100)}%`, background: '#00C853' }}
          />
        </div>
      </div>

      {/* ── Expanded panel ────────────── */}
      {expanded && (
        <div
          className="mt-4 pt-4 border-t animate-fade-up"
          style={{ borderColor: '#2A2A2A' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="font-dm text-xs mb-0.5" style={{ color: '#555' }}>Emergency Bay</p>
              <p className="font-dm text-sm font-semibold" style={{ color: hospital.emergency_bay ? '#00C853' : '#E53935' }}>
                {hospital.emergency_bay ? '✓ Available' : '✗ Unavailable'}
              </p>
            </div>
            <div>
              <p className="font-dm text-xs mb-0.5" style={{ color: '#555' }}>ICU Beds</p>
              <p className="font-mono text-sm font-bold text-white">{hospital.icu_beds}</p>
            </div>
            <div>
              <p className="font-dm text-xs mb-0.5" style={{ color: '#555' }}>Contact</p>
              <a
                href={`tel:${hospital.phone}`}
                className="font-mono text-sm"
                style={{ color: '#1E88E5' }}
                onClick={e => e.stopPropagation()}
              >
                {hospital.phone}
              </a>
            </div>
            <div>
              <p className="font-dm text-xs mb-0.5" style={{ color: '#555' }}>Last Update</p>
              <p className="font-dm text-sm text-white">Just now</p>
            </div>
          </div>

          <button
            id={`select-hospital-${hospital.id}`}
            className="btn-primary"
            onClick={(e) => { e.stopPropagation(); onSelect(hospital) }}
            disabled={loading}
          >
            {loading ? 'Notifying...' : 'Select This Hospital →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Filter chip ──────────────────────────────────────────────────
const FILTERS = ['All', 'Nearest', 'Best Match', 'Beds Available']

// ────────────────────────────────────────────────────────────────
export default function HospitalSelect({ navigate, state, setState }) {
  const [hospitals, setHospitals]   = useState(state.hospitals || [])
  const [filter, setFilter]         = useState('All')
  const [loading, setLoading]       = useState(false)
  const [notifying, setNotifying]   = useState(false)
  const [toast, setToast]           = useState('')
  const [fetchError, setFetchError] = useState('')

  const result = state.triageResult

  useEffect(() => {
    if (hospitals.length === 0) fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    setLoading(true)
    setFetchError('')
    try {
      const body = {
        lat:                state.patientLat,
        lng:                state.patientLng,
        condition:          result?.condition || 'General Emergency',
        severity:           result?.severity  || 'MODERATE',
        required_specialty: result?.specialty || 'General Medicine',
      }
      const { data } = await axios.post(`${API}/api/recommend`, body)
      setHospitals(data.hospitals || [])
      setState(prev => ({ ...prev, hospitals: data.hospitals || [] }))
    } catch (err) {
      setFetchError('Could not load hospitals. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const filteredHospitals = () => {
    const h = [...hospitals]
    if (filter === 'Nearest')       return [...h].sort((a, b) => a.distance_km - b.distance_km)
    if (filter === 'Best Match')    return [...h].sort((a, b) => b.composite_score - a.composite_score)
    if (filter === 'Beds Available') return [...h].sort((a, b) => b.beds_available - a.beds_available)
    return h
  }

  const handleSelect = async (hospital) => {
    setNotifying(true)
    try {
      const tokenRes = await axios.post(`${API}/api/generate_token`, {
        patient_name:   'Patient',
        severity:       result?.severity || 'MODERATE',
        symptoms:       state.symptoms || [],
        condition:      result?.condition || 'Emergency',
        priority_score: result?.priority_score || 5,
        hospital_id:    hospital.id,
      })
      const { token, emergency_id } = tokenRes.data

      await axios.post(`${API}/api/notify_hospital`, {
        emergency_id,
        hospital_id:  hospital.id,
        token,
        severity:     result?.severity,
        condition:    result?.condition || 'Emergency',
      })

      setState(prev => ({ ...prev, selectedHospital: hospital, token, emergencyId: emergency_id }))
      setToast(`Hospital Notified! Token: ${token}`)
      setTimeout(() => {
        navigate('navigation', { selectedHospital: hospital, token, emergencyId: emergency_id })
      }, 2000)
    } catch (err) {
      setToast('Could not notify. Please try again.')
    } finally {
      setNotifying(false)
    }
  }

  return (
    <div className="screen" style={{ minHeight: '100vh' }}>
      {/* ── Header ─────────────────────── */}
      <div className="flex items-center justify-between pt-6 pb-2">
        <button
          id="back-to-triage"
          onClick={() => navigate('triage')}
          className="flex items-center gap-1 text-sm"
          style={{ color: '#888' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#888"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back
        </button>
        <span
          className="text-xs font-dm px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(229,57,53,0.15)', color: '#E53935', border: '1px solid rgba(229,57,53,0.3)' }}
        >
          Step 3 of 3
        </span>
      </div>

      <h1 className="font-syne font-bold text-white text-2xl mt-2">
        Best Hospitals For You
      </h1>
      <p className="font-dm text-sm mt-1 mb-4" style={{ color: '#888' }}>
        Ranked by specialty match, availability & distance
      </p>

      {/* ── Condition pill ─────────────── */}
      {result?.condition && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
          style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#E53935', boxShadow: '0 0 4px #E53935' }} />
          <span className="font-dm text-xs" style={{ color: '#E53935' }}>{result.condition}</span>
        </div>
      )}

      {/* ── Filter chips ───────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            id={`filter-${f.replace(/\s/g, '-').toLowerCase()}`}
            onClick={() => setFilter(f)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-dm font-medium transition-all"
            style={{
              background:  filter === f ? '#E53935' : '#1A1A1A',
              color:       filter === f ? '#fff' : '#888',
              border:      filter === f ? 'none' : '1px solid #2A2A2A',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <svg className="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
            <path d="M12 2a10 10 0 0110 10"/>
          </svg>
          <p className="font-dm text-sm" style={{ color: '#888' }}>Finding best hospitals...</p>
        </div>
      )}

      {fetchError && (
        <div className="card p-4 mb-4 text-center">
          <p className="font-dm text-sm mb-3" style={{ color: '#E53935' }}>{fetchError}</p>
          <button className="btn-primary" onClick={fetchHospitals} style={{ borderRadius: 8 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !fetchError && (
        <div className="flex flex-col gap-4 pb-8">
          {filteredHospitals().map((h, i) => (
            <HospitalCard
              key={h.id}
              hospital={h}
              index={i}
              onSelect={handleSelect}
              loading={notifying}
            />
          ))}
        </div>
      )}

      {/* ── Toast ──────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-8 left-5 right-5 p-4 rounded-2xl flex items-center gap-3 animate-fade-up z-50"
          style={{
            background:    toast.includes('Could not') ? '#B71C1C' : '#1A3A1A',
            border:        toast.includes('Could not') ? '1px solid #E53935' : '1px solid #00C853',
            boxShadow:     '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: toast.includes('Could not') ? '#E53935' : '#00C853' }}
          >
            {toast.includes('Could not') ? '!' : '✓'}
          </div>
          <p className="font-dm text-sm text-white font-medium">{toast}</p>
        </div>
      )}
    </div>
  )
}
