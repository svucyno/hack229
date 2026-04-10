import { useEffect, useState } from "react"

export default function TriageResultScreen({ go, triageData, setHospitals }) {
  const [animated, setAnimated] = useState(false)
  const [meterScale, setMeterScale] = useState(0)
  const [showComparison, setShowComparison] = useState(false)
  const d = triageData || { severity: "CRITICAL", score: 9.2, confidence: 91, condition: "Possible Myocardial Infarction", action: "Emergency intercept required. Stay on the line." }

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100)
    setTimeout(() => setMeterScale(d.score), 200)
    
    let t;
    if (!showComparison) {
      t = setTimeout(() => go("hospitals"), 12000) 
    }
    return () => clearTimeout(t)
  }, [showComparison, d.score, go])

  const getPainMeta = (s) => {
    if (s <= 3) return { label: "MILD DISCOMFORT", color: "#64748b" }
    if (s <= 6) return { label: "MODERATE STRESS", color: "#f59e0b" }
    if (s <= 8) return { label: "SEVERE TRAUMA", color: "#ef4444" }
    return { label: "CRITICAL FAILURE", color: "#b91c1c" }
  }
  const pm = getPainMeta(d.score)

  const COMPARISON = [
    { name: "Apollo Hospitals", wait: "12 min", dist: "2.4 km", trauma: "Yes ✓", icu: "22", match: "High", score: 9.2, best: true, reason: "Specialized Cardiac Wing" },
    { name: "SVIMS University", wait: "28 min", dist: "1.8 km", trauma: "Yes ✓", icu: "45", match: "Medium", score: 8.5, best: false, reason: "General Trauma Center" },
    { name: "Ruia Govt Hospital", wait: "45 min", dist: "3.1 km", trauma: "No ✗", icu: "30", match: "Low", score: 7.2, best: false, reason: "Standard ER" },
  ]

  return (
    <div className="screen" style={{ background: "#FFFFFF", paddingTop: 40, alignItems: "center", justifyContent: "center", gap: 16 }}>
      {d.severity === "CRITICAL" && (
        <div style={{ position: "absolute", inset: 0, border: "4px solid var(--red)", pointerEvents: "none", animation: "glowPulse 2s infinite", zIndex: 5 }} />
      )}

      {/* Result Card */}
      <div className="card" style={{ width: "92%", maxWidth: 400, padding: 32, position: "relative", zIndex: 10, background: "#fff", borderColor: "#F1F5F9", boxShadow: "0 20px 50px rgba(0,0,0,0.05)" }}>
        <p className="font-syne" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: "var(--red2)", textAlign: "center", marginBottom: 12, textTransform: "uppercase" }}>NEURAL TRIAGE SCAN COMPLETE</p>

        <h1 className="font-syne" style={{ fontSize: 52, fontWeight: 900, textAlign: "center", color: "var(--text)", lineHeight: 1, letterSpacing: "-0.04em", italic: "true" }}>
          {d.severity}
        </h1>

        {/* Gauge */}
        <div style={{ display: "flex", justifyContent: "center", margin: "28px 0" }}>
          <div style={{ position:"relative", width:170, height:170 }}>
            <svg width="170" height="170" viewBox="0 0 170 170">
              <circle cx="85" cy="85" r="75" fill="none" stroke="#F1F5F9" strokeWidth="12"/>
              <circle cx="85" cy="85" r="75" fill="none"
                stroke="var(--red)" strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="471"
                strokeDashoffset={animated ? 471 - (d.score / 10) * 471 : 471}
                style={{ transformOrigin:"center", transform:"rotate(-90deg)", transition:"stroke-dashoffset 1.8s cubic-bezier(0.19, 1, 0.22, 1)", filter: "drop-shadow(0 0 12px rgba(255,49,49,0.3))" }}
              />
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span className="font-mono" style={{ fontSize: 48, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.05em" }}>{d.score}</span>
              <span className="font-syne" style={{ fontSize: 10, color: "var(--text3)", fontWeight: 800, letterSpacing: "0.2em" }}>INDEX</span>
            </div>
          </div>
        </div>

        <div style={{ background: "#FFF5F5", borderRadius: 24, padding: 24, marginBottom: 24, border: "1px solid #FFE4E4" }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: "var(--red2)", fontWeight: 900, marginBottom: 6, letterSpacing: "0.1em" }}>SUSPECTED PATHOLOGY</p>
            <p className="font-syne" style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>{d.condition}</p>
          </div>
          <div style={{ height: 1, background: "#FFE4E4", marginBottom: 16 }}></div>
          <div>
            <p style={{ fontSize: 10, color: "var(--red2)", fontWeight: 900, marginBottom: 6, letterSpacing: "0.1em" }}>DISPATCH PROTOCOL</p>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5, fontWeight: 600 }}>{d.action}</p>
          </div>
        </div>

        <button 
          onClick={() => setShowComparison(true)}
          className="font-syne"
          style={{ width: "100%", background: "#FFFFFF", border: "2px solid #F1F5F9", padding: "16px", borderRadius: 20, color: "var(--text2)", fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "0.2s" }}
        >
          SELECT BEST HOSPITAL →
        </button>
      </div>

      <button onClick={() => go("hospitals")} className="btn-primary" style={{ width: "92%", maxWidth: 400, height: 72, borderRadius: 24 }}>
        INTERCEPT BEST CARE CHANNEL
      </button>

      {!showComparison && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.5 }}>
           <div className="spinner" style={{ width: 14, height: 14 }}></div>
           <p className="font-mono" style={{ fontSize: 12, color: "var(--text2)", fontWeight: 800 }}>MAPPING OPTIMAL FACILITIES (12S)</p>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17, 24, 39, 0.8)", zIndex: 100, display: "flex", alignItems: "flex-end", animation: "fadeIn 0.3s ease", backdropFilter: "blur(8px)" }}>
          <div onClick={() => setShowComparison(false)} style={{ position: "absolute", inset: 0 }} />
          <div style={{ background: "#FFFFFF", width: "100%", height: "92%", borderRadius: "32px 32px 0 0", borderTop: "5px solid var(--red)", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div style={{ padding: "32px 32px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 className="font-syne" style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.01em" }}>Facility Decision Matrix</h2>
                <p style={{ fontSize: 12, color: "var(--red2)", fontWeight: 800, marginTop: 4, letterSpacing: "0.1em" }}>REAL-TIME EMERGENCY INTELLIGENCE</p>
              </div>
              <button onClick={() => setShowComparison(false)} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
              <div style={{ display: "grid", gap: 16 }}>
                {COMPARISON.map((h) => (
                  <div key={h.name} style={{ background: h.best ? "#FFF5F5" : "#FFFFFF", border: h.best ? "2px solid var(--red)" : "1.5px solid #F1F5F9", borderRadius: 28, padding: 24, position: "relative" }}>
                    {h.best && <div style={{ position: "absolute", top: -12, right: 24, background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 900, padding: "5px 16px", borderRadius: 20, letterSpacing: "0.05em" }}>OPTIMAL INTERCEPT</div>}
                    <div style={{ display: "flex", justifyContent: "space-between", mb: 16 }}>
                       <div>
                         <p className="font-syne" style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>{h.name}</p>
                         <p className="font-mono" style={{ fontSize: 12, color: "var(--red2)", fontWeight: 700 }}>{h.dist} • {h.wait} WAIT</p>
                       </div>
                       <div style={{ textAlign: "right" }}>
                         <p className="font-mono" style={{ fontSize: 24, fontWeight: 900, color: "var(--text)" }}>{h.score}</p>
                         <p style={{ fontSize: 10, color: "var(--text3)", fontWeight: 800 }}>RANK</p>
                       </div>
                    </div>
                    <div style={{ marginTop: 16, background: "#fff", padding: 16, borderRadius: 20, border: "1.5px solid #F1F5F9" }}>
                       <p style={{ fontSize: 10, color: "var(--text3)", fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>Clinical Recommendation</p>
                       <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 600, lineHeight: 1.5 }}>{h.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer style={{ padding: "32px", background: "#F8FAFC", borderTop: "1px solid #F1F5F9" }}>
              <button 
                onClick={() => go("hospitals")}
                className="btn-primary"
                style={{ height: 72, borderRadius: 24 }}
              >
                PROCEED TO BEST FACILITY
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}