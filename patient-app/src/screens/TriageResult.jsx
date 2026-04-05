import { useEffect, useRef, useState } from 'react'

const SEVERITY_CONFIG = {
  CRITICAL: {
    bg:         '#B71C1C',
    bgGradient: 'linear-gradient(160deg, #7f0000 0%, #B71C1C 100%)',
    color:      '#FF5252',
    label:      'CRITICAL',
    pulse:      true,
  },
  MODERATE: {
    bg:         '#E65100',
    bgGradient: 'linear-gradient(160deg, #bf360c 0%, #E65100 100%)',
    color:      '#FFD740',
    label:      'MODERATE',
    pulse:      false,
  },
  NORMAL: {
    bg:         '#1B5E20',
    bgGradient: 'linear-gradient(160deg, #004d40 0%, #1B5E20 100%)',
    color:      '#69F0AE',
    label:      'NORMAL',
    pulse:      false,
  },
}

// ── Circular arc gauge ───────────────────────────────────────────
function PriorityGauge({ score, severity }) {
  const cfg    = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.MODERATE
  const [displayed, setDisplayed] = useState(0)
  const animRef = useRef(null)

  useEffect(() => {
    const target   = score || 0
    const duration = 800
    const start    = performance.now()

    const animate = (now) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      const ease     = 1 - Math.pow(1 - progress, 3)
      setDisplayed(parseFloat((target * ease).toFixed(1)))
      if (progress < 1) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [score])

  // SVG arc math
  const size   = 180
  const cx     = size / 2
  const cy     = size / 2
  const r      = 72
  const stroke = 10
  const startA = -220    // degrees
  const totalA = 260     // degrees sweep
  const pct    = displayed / 10

  const toRad = (deg) => (deg * Math.PI) / 180
  const arcX  = (ang) => cx + r * Math.cos(toRad(ang))
  const arcY  = (ang) => cy + r * Math.sin(toRad(ang))

  const endDeg   = startA + totalA * pct
  const largeArc = totalA * pct > 180 ? 1 : 0

  const describeArc = (start, end) => {
    const s = { x: arcX(start), y: arcY(start) }
    const e = { x: arcX(end),   y: arcY(end) }
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${e.x} ${e.y}`
  }

  return (
    <div className="flex items-center justify-center" style={{ position: 'relative' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <path
          d={describeArc(startA, startA + totalA)}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        {displayed > 0 && (
          <path
            d={describeArc(startA, endDeg)}
            fill="none"
            stroke={cfg.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${cfg.color})` }}
          />
        )}
        {/* Score text */}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="700"
          fontSize="32"
          fill="#fff"
        >
          {displayed.toFixed(1)}
        </text>
        <text
          x={cx} y={cy + 18}
          textAnchor="middle"
          fontFamily="DM Sans, sans-serif"
          fontSize="11"
          fill="rgba(255,255,255,0.5)"
        >
          / 10
        </text>
      </svg>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
export default function TriageResult({ navigate, state }) {
  const result   = state.triageResult
  const severity = result?.severity || 'MODERATE'
  const cfg      = SEVERITY_CONFIG[severity]

  useEffect(() => {
    const timer = setTimeout(() => navigate('hospital'), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!result) {
    return (
      <div className="screen items-center justify-center">
        <p className="font-dm text-white">No triage result found.</p>
        <button className="btn-primary mt-4" onClick={() => navigate('home')}>Go Back</button>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: cfg.bgGradient,
        animation: cfg.pulse ? 'borderPulse 1.5s ease-in-out infinite' : 'none',
        boxShadow: cfg.pulse ? '0 0 0 4px rgba(229,57,53,0.5) inset' : 'none',
      }}
    >
      {/* ── Header ─────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-3">
        <span className="font-syne font-bold text-white text-base">MediRush</span>
        <span
          className="text-xs font-dm px-3 py-1 rounded-full font-semibold"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
        >
          Step 2 of 3
        </span>
      </div>

      {/* ── White Card ─────────────────── */}
      <div className="flex-1 flex flex-col px-5 pb-8">
        <div
          className="flex-1 rounded-3xl p-6 flex flex-col items-center gap-5"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {/* Severity label */}
          <div className="text-center mt-2">
            <p className="font-dm text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              EMERGENCY LEVEL
            </p>
            <h1
              className="font-syne font-bold tracking-tight"
              style={{ fontSize: 42, color: cfg.color, lineHeight: 1.1 }}
            >
              {cfg.label}
            </h1>
          </div>

          {/* Gauge */}
          <PriorityGauge score={result.priority_score} severity={severity} />

          {/* Confidence badge */}
          <div
            className="px-3 py-1.5 rounded-full text-xs font-dm font-semibold"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}
          >
            AI Confidence: {result.confidence}%
          </div>

          {/* Condition */}
          <div className="w-full rounded-2xl p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <p className="font-dm text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Suspected Condition</p>
            <p className="font-syne font-bold text-white text-lg">{result.condition}</p>
          </div>

          {/* Detected symptoms */}
          {result.symptoms_detected?.length > 0 && (
            <div className="w-full">
              <p className="font-dm text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Detected Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {result.symptoms_detected.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs font-dm px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended action */}
          <div
            className="w-full rounded-2xl p-4"
            style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="font-dm text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Recommended Action</p>
            <p className="font-dm text-sm text-white leading-relaxed">{result.action}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5">
          <button
            id="find-hospital-cta-btn"
            className="w-full tap-target rounded-xl font-syne font-bold text-base"
            style={{
              background: '#fff',
              color: cfg.bg,
              border: 'none',
              minHeight: 56,
            }}
            onClick={() => navigate('hospital')}
          >
            Find Best Hospital →
          </button>
          <p className="text-center font-dm text-xs mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Auto-advancing in 4 seconds...
          </p>
        </div>
      </div>
    </div>
  )
}
