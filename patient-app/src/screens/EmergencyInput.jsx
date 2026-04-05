import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// ── Symptom cards data ───────────────────────────────────────────
const SYMPTOM_CARDS = [
  { id: 'chest pain',       label: 'Chest Pain',      icon: '❤️' },
  { id: 'breathlessness',   label: 'Breathlessness',  icon: '🫁' },
  { id: 'severe headache',  label: 'Severe Headache', icon: '🧠' },
  { id: 'bleeding',         label: 'Bleeding',        icon: '🩸' },
  { id: 'unconscious',      label: 'Unconscious',     icon: '😶' },
  { id: 'stroke signs',     label: 'Stroke Signs',    icon: '⚡' },
  { id: 'burns',            label: 'Burns',           icon: '🔥' },
  { id: 'fracture',         label: 'Fracture',        icon: '🦴' },
  { id: 'severe allergy',   label: 'Severe Allergy',  icon: '💉' },
  { id: 'high fever',       label: 'High Fever',      icon: '🌡️' },
  { id: 'abdominal pain',   label: 'Abdominal Pain',  icon: '🤕' },
  { id: '__other__',        label: 'Other',           icon: '➕' },
]

// ── Waveform bars (animated, mock) ──────────────────────────────
function Waveform({ active }) {
  const delays = [0, 0.1, 0.2, 0.15, 0.05, 0.25, 0.1, 0.2]
  const heights = [20, 40, 60, 30, 50, 70, 35, 45]

  return (
    <div className="flex items-end justify-center gap-1" style={{ height: 72 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 6,
            height: active ? h : 8,
            background: active ? '#E53935' : '#333',
            transition: 'height 0.15s ease',
            animation: active ? `waveBounce ${0.6 + delays[i]}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${delays[i]}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── WPM calculator ───────────────────────────────────────────────
function calcWPM(transcript, durationSeconds) {
  if (!transcript || durationSeconds < 1) return null
  const words = transcript.trim().split(/\s+/).filter(Boolean).length
  return Math.round((words / durationSeconds) * 60)
}

// ── Vitals color ─────────────────────────────────────────────────
function vitalsColor(type, value) {
  if (type === 'hr') {
    if (value < 40 || value > 130) return '#E53935'
    if (value < 55 || value > 110) return '#FFB300'
    return '#00C853'
  }
  if (type === 'spo2') {
    if (value < 90) return '#E53935'
    if (value < 94) return '#FFB300'
    return '#00C853'
  }
  return '#888'
}

// ────────────────────────────────────────────────────────────────
export default function EmergencyInput({ navigate, state, setState }) {
  const [tab, setTab] = useState('symptoms')   // 'voice' | 'symptoms' | 'vitals'
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState(state.transcript || '')
  const [wpm, setWpm] = useState(state.wpm || null)
  const [selectedSymptoms, setSelectedSymptoms] = useState(state.symptoms || [])
  const [otherText, setOtherText] = useState('')
  const [hr, setHr] = useState(state.vitals?.hr || 75)
  const [spo2, setSpo2] = useState(state.vitals?.spo2 || 98)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const recognitionRef = useRef(null)
  const recordStartRef = useRef(null)

  // ── Voice / Speech API ──────────────────────────────────────
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Please use Chrome.')
      return
    }
    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-IN'

    rec.onresult = (e) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t + ' '
        else interim += t
      }
      setTranscript(prev => prev + final || interim)
    }
    rec.onerror = () => setRecording(false)
    rec.onend   = () => setRecording(false)

    recordStartRef.current = Date.now()
    rec.start()
    recognitionRef.current = rec
    setRecording(true)
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    const elapsed = (Date.now() - (recordStartRef.current || Date.now())) / 1000
    setWpm(calcWPM(transcript, elapsed))
    setRecording(false)
  }

  const toggleRecording = () => recording ? stopRecording() : startRecording()

  // ── Symptom Toggle ──────────────────────────────────────────
  const toggleSymptom = (id) => {
    if (id === '__other__') return  // handled separately via text input
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  // ── Submission ──────────────────────────────────────────────
  const allSymptoms = [
    ...selectedSymptoms,
    ...(otherText.trim() ? [otherText.trim().toLowerCase()] : []),
  ]

  const canSubmit = allSymptoms.length > 0 || transcript.trim().length > 10

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    try {
      // Get patient geo if not already
      let lat = state.patientLat
      let lng = state.patientLng
      if (navigator.geolocation) {
        await new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(
            pos => { lat = pos.coords.latitude; lng = pos.coords.longitude; resolve() },
            () => resolve(),
            { timeout: 3000 }
          )
        })
      }

      const body = {
        symptoms:   allSymptoms,
        vitals:     { hr, spo2 },
        transcript: transcript || '',
        wpm:        wpm || null,
      }
      const { data } = await axios.post(`${API}/api/analyze_symptoms`, body)

      navigate('triage', {
        symptoms:     allSymptoms,
        vitals:       { hr, spo2 },
        transcript,
        wpm,
        triageResult: data,
        patientLat:   lat,
        patientLng:   lng,
      })
    } catch (err) {
      setError('Could not connect to server. Check if backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // ── Tab Button ──────────────────────────────────────────────
  const TabBtn = ({ id, label }) => (
    <button
      id={`tab-${id}`}
      onClick={() => setTab(id)}
      className="flex-1 py-2 text-sm font-dm font-medium rounded-xl transition-all"
      style={{
        background:   tab === id ? '#E53935' : 'transparent',
        color:        tab === id ? '#fff' : '#888',
        border:       tab === id ? 'none' : '1px solid #2A2A2A',
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="screen" style={{ minHeight: '100vh' }}>
      {/* ── Header ─────────────────────── */}
      <div className="flex items-center justify-between pt-6 pb-3">
        <button
          id="back-to-home"
          onClick={() => navigate('home')}
          className="flex items-center gap-1 text-sm"
          style={{ color: '#888' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#888"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="font-syne font-bold text-white text-base">MediRush</span>
          <span
            className="text-xs font-dm px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(229,57,53,0.15)', color: '#E53935', border: '1px solid rgba(229,57,53,0.3)' }}
          >
            Step 1 of 3
          </span>
        </div>
      </div>

      <h1 className="font-syne font-bold text-white text-2xl mt-1 mb-4">
        What's the emergency?
      </h1>

      {/* ── Tabs ───────────────────────── */}
      <div className="flex gap-2 mb-5">
        <TabBtn id="voice"    label="🎙 Voice" />
        <TabBtn id="symptoms" label="⚡ Symptoms" />
        <TabBtn id="vitals"   label="💓 Vitals" />
      </div>

      {/* ── Tab: Voice ─────────────────── */}
      {tab === 'voice' && (
        <div className="flex flex-col items-center gap-5 animate-fade-up">
          <Waveform active={recording} />

          {/* Mic button */}
          <button
            id="mic-button"
            onClick={toggleRecording}
            className="flex flex-col items-center justify-center rounded-full gap-1 font-dm font-semibold"
            style={{
              width: 80, height: 80,
              background: recording ? '#B71C1C' : '#E53935',
              boxShadow:  recording ? '0 0 30px rgba(229,57,53,0.8)' : '0 0 20px rgba(229,57,53,0.4)',
              transition: 'all 0.2s',
              border: 'none',
              color: '#fff',
              fontSize: 11,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
            {recording ? 'Stop' : 'Speak'}
          </button>

          {recording && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red animate-pulse" />
              <span className="font-mono text-xs" style={{ color: '#E53935' }}>Recording...</span>
            </div>
          )}

          {/* Transcript */}
          {transcript ? (
            <div className="card w-full mt-2">
              <p className="text-xs font-dm mb-1" style={{ color: '#888' }}>Transcript</p>
              <p className="font-dm text-sm text-white leading-relaxed">{transcript}</p>
              {wpm && (
                <p className="font-mono text-xs mt-2" style={{ color: '#FFB300' }}>
                  WPM: {wpm} {wpm > 160 ? '⚡ High stress detected' : ''}
                </p>
              )}
            </div>
          ) : (
            <p className="text-center font-dm text-sm" style={{ color: '#555' }}>
              Describe your emergency clearly — location, what happened, symptoms
            </p>
          )}
        </div>
      )}

      {/* ── Tab: Symptoms ──────────────── */}
      {tab === 'symptoms' && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {SYMPTOM_CARDS.map(card => (
              card.id === '__other__' ? (
                <div
                  key="other"
                  className={`symptom-card ${otherText ? 'selected' : ''}`}
                >
                  <span className="text-2xl">{card.icon}</span>
                  <input
                    id="other-symptom-input"
                    value={otherText}
                    onChange={e => setOtherText(e.target.value)}
                    placeholder="Describe..."
                    className="w-full text-center text-xs font-dm bg-transparent border-none outline-none"
                    style={{ color: '#fff', '::placeholder': { color: '#555' } }}
                  />
                </div>
              ) : (
                <button
                  key={card.id}
                  id={`symptom-${card.id.replace(/\s/g, '-')}`}
                  className={`symptom-card ${selectedSymptoms.includes(card.id) ? 'selected' : ''}`}
                  onClick={() => toggleSymptom(card.id)}
                >
                  <span className="text-2xl">{card.icon}</span>
                  <span className="font-dm text-xs text-white font-medium">{card.label}</span>
                  {selectedSymptoms.includes(card.id) && (
                    <span className="text-xs" style={{ color: '#E53935' }}>✓</span>
                  )}
                </button>
              )
            ))}
          </div>
          {selectedSymptoms.length > 0 && (
            <p className="text-xs font-dm mb-2" style={{ color: '#00C853' }}>
              ✓ {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      )}

      {/* ── Tab: Vitals ────────────────── */}
      {tab === 'vitals' && (
        <div className="flex flex-col gap-6 animate-fade-up">
          {/* Heart Rate */}
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <span className="font-dm text-sm" style={{ color: '#888' }}>Heart Rate</span>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono font-bold text-xl"
                  style={{ color: vitalsColor('hr', hr) }}
                >
                  {hr}
                </span>
                <span className="font-dm text-xs" style={{ color: '#555' }}>BPM</span>
                <div
                  className="w-2 h-2 rounded-full ml-1"
                  style={{ background: vitalsColor('hr', hr), boxShadow: `0 0 6px ${vitalsColor('hr', hr)}` }}
                />
              </div>
            </div>
            <input
              id="hr-slider"
              type="range"
              min={40} max={200} step={1}
              value={hr}
              onChange={e => setHr(Number(e.target.value))}
              className="slider-red w-full"
              style={{
                background: `linear-gradient(to right, ${vitalsColor('hr', hr)} 0%, ${vitalsColor('hr', hr)} ${((hr-40)/160)*100}%, #2A2A2A ${((hr-40)/160)*100}%, #2A2A2A 100%)`
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="font-dm text-xs" style={{ color: '#555' }}>40</span>
              <span className="font-dm text-xs" style={{ color: '#555' }}>Normal: 60–100</span>
              <span className="font-dm text-xs" style={{ color: '#555' }}>200</span>
            </div>
          </div>

          {/* SpO2 */}
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <span className="font-dm text-sm" style={{ color: '#888' }}>Blood Oxygen (SpO₂)</span>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono font-bold text-xl"
                  style={{ color: vitalsColor('spo2', spo2) }}
                >
                  {spo2}
                </span>
                <span className="font-dm text-xs" style={{ color: '#555' }}>%</span>
                <div
                  className="w-2 h-2 rounded-full ml-1"
                  style={{ background: vitalsColor('spo2', spo2), boxShadow: `0 0 6px ${vitalsColor('spo2', spo2)}` }}
                />
              </div>
            </div>
            <input
              id="spo2-slider"
              type="range"
              min={70} max={100} step={1}
              value={spo2}
              onChange={e => setSpo2(Number(e.target.value))}
              className="slider-red w-full"
              style={{
                background: `linear-gradient(to right, ${vitalsColor('spo2', spo2)} 0%, ${vitalsColor('spo2', spo2)} ${((spo2-70)/30)*100}%, #2A2A2A ${((spo2-70)/30)*100}%, #2A2A2A 100%)`
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="font-dm text-xs" style={{ color: '#555' }}>70%</span>
              <span className="font-dm text-xs" style={{ color: '#555' }}>Normal: ≥95%</span>
              <span className="font-dm text-xs" style={{ color: '#555' }}>100%</span>
            </div>
          </div>

          <p className="font-dm text-xs text-center" style={{ color: '#555' }}>
            Estimated values are fine if you don't have a device
          </p>
        </div>
      )}

      {/* ── Error ──────────────────────── */}
      {error && (
        <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)' }}>
          <p className="font-dm text-sm" style={{ color: '#E53935' }}>{error}</p>
        </div>
      )}

      {/* ── Footer CTA ─────────────────── */}
      <div className="mt-auto pt-6 pb-8">
        <button
          id="analyze-emergency-btn"
          className="btn-primary"
          disabled={!canSubmit || loading}
          onClick={handleAnalyze}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0110 10"/>
              </svg>
              Analyzing...
            </span>
          ) : 'Analyze Emergency →'}
        </button>
      </div>
    </div>
  )
}
