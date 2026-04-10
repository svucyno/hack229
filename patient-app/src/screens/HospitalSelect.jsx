import { useState, useEffect } from "react"

const DEMO = [
  { id: "h1", name: "Apollo Hospitals", distance: "2.4 km", time: "12 min", wait: "5 min", beds: 12, icu: 3, rating: 4.8, specialization: "CARDIAC SPECIALTY", match: 98 },
  { id: "h2", name: "SVIMS University", distance: "1.8 km", time: "15 min", wait: "18 min", beds: 45, icu: 12, rating: 4.5, specialization: "MULTI-TRAUMA", match: 85 },
  { id: "h3", name: "Ruia Govt Hospital", distance: "3.1 km", time: "22 min", wait: "45 min", beds: 8, icu: 0, rating: 3.9, specialization: "GENERAL SURGERY", match: 62 },
]

export default function HospitalSelectScreen({ go, setSelectedHospital, setToken, triageData }) {
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState([])
  const [active, setActive] = useState(null)

  useEffect(() => {
    setTimeout(() => {
      setList(DEMO)
      setLoading(false)
      setActive(DEMO[0])
    }, 1500)
  }, [])

  const handleSelect = (h) => {
    setSelectedHospital(h)
    setToken(`MED-${Math.random().toString(36).substr(2, 6).toUpperCase()}`)
    go("navigation")
  }

  if (loading) {
    return (
      <div className="screen flex items-center justify-center bg-[#FFFFFF]">
        <div style={{ textAlign: "center" }}>
          <div className="spinner mb-8" style={{ width: 60, height: 60, borderWidth: 4 }}></div>
          <p className="font-syne italic" style={{ color: "var(--red2)", fontSize: 13, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase" }}>Intercepting Facility Uplinks</p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ background: "#FFFFFF", display: "flex", flexDirection: "column", padding: 0 }}>
      {/* Header */}
      <header style={{ padding: "58px 24px 24px", borderBottom: "1.5px solid #F1F5F9", background: "#FFFFFF", position: "relative", zIndex: 10 }}>
        <p className="font-mono" style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.3em", color: "var(--red2)", marginBottom: 12, textTransform: "uppercase" }}>OPERATIONAL RESOURCE ALLOCATION</p>
        <h1 className="font-syne italic" style={{ fontSize: 32, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.04em" }}>SELECT <span style={{ color: "var(--red)" }}>INTERCEPT</span></h1>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px", display: "grid", gap: 18 }}>
        {list.map((h) => (
          <div 
            key={h.id}
            onClick={() => setActive(h)}
            style={{ 
              background: active?.id === h.id ? "#FFF5F5" : "#FFFFFF",
              border: active?.id === h.id ? "3px solid var(--red)" : "1.5px solid #F1F5F9",
              borderRadius: 32, padding: "28px", transition: "0.3s cubic-bezier(0.16, 1, 0.3, 1)", cursor: "pointer", position: "relative",
              boxShadow: active?.id === h.id ? "0 15px 40px rgba(255, 49, 49, 0.12)" : "none"
            }}
          >
            {active?.id === h.id && (
              <div style={{ position: "absolute", top: -12, right: 28, background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 900, padding: "5px 18px", borderRadius: 20, letterSpacing: "0.1em" }}>
                 OPTIMAL MATCH {h.match}%
              </div>
            )}
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <p className="font-syne" style={{ fontSize: 21, fontWeight: 900, color: "var(--text)", marginBottom: 6 }}>{h.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                   <div style={{ width: 10, height: 10, background: h.match > 90 ? "var(--green)" : "var(--amber)", borderRadius: "50%", boxShadow: h.match > 90 ? "0 0 10px var(--green-glow)" : "none" }}></div>
                   <p className="font-mono" style={{ fontSize: 12, color: "var(--text2)", fontWeight: 800 }}>{h.specialization}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="font-mono" style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", leading: 1 }}>{h.time}</p>
                <p style={{ fontSize: 10, color: "var(--red2)", fontWeight: 900, letterSpacing: "0.1em" }}>EST. ETA</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
               <div style={{ background: "#fff", padding: "14px", borderRadius: 20, border: "1.5px solid #F1F5F9" }}>
                  <p style={{ fontSize: 9, color: "var(--text3)", fontWeight: 900, marginBottom: 4, letterSpacing: "0.05em" }}>WAIT</p>
                  <p className="font-mono" style={{ fontSize: 14, color: "var(--text)", fontWeight: 800 }}>{h.wait}</p>
               </div>
               <div style={{ background: "#fff", padding: "14px", borderRadius: 20, border: "1.5px solid #F1F5F9" }}>
                  <p style={{ fontSize: 9, color: "var(--text3)", fontWeight: 900, marginBottom: 4, letterSpacing: "0.05em" }}>DIST</p>
                  <p className="font-mono" style={{ fontSize: 14, color: "var(--text)", fontWeight: 800 }}>{h.distance}</p>
               </div>
               <div style={{ background: "#fff", padding: "14px", borderRadius: 20, border: "1.5px solid #F1F5F9" }}>
                  <p style={{ fontSize: 9, color: "var(--text3)", fontWeight: 900, marginBottom: 4, letterSpacing: "0.05em" }}>ICU</p>
                  <p className="font-mono" style={{ fontSize: 14, color: "var(--red2)", fontWeight: 900 }}>{h.icu} AVAIL</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      <footer style={{ padding: "32px 32px 58px", background: "#FFFFFF", borderTop: "1.5px solid #F1F5F9", zIndex: 10 }}>
         <button 
           onClick={() => active && handleSelect(active)}
           disabled={!active}
           className="btn-primary"
           style={{ 
             height: 76, borderRadius: 28, background: active ? "var(--red)" : "#F1F5F9",
             color: active ? "#FFF" : "#94A3B8",
             boxShadow: active ? "0 20px 50px rgba(255, 49, 49, 0.4)" : "none",
             transition: "0.3s"
           }}
         >
           <span className="font-syne italic">ESTABLISH CARE CHANNEL</span>
         </button>
      </footer>
    </div>
  )
}