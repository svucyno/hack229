import { useState } from "react"

export default function FeedbackScreen({ go }) {
  const [rating, setRating] = useState(0)

  return (
    <div className="screen" style={{ background: "#FFFFFF", alignItems: "center", justifyContent: "center", padding: "40px" }}>
      <div style={{ textAlign: "center", width: "100%", maxWidth: 360 }}>
        <p className="font-mono" style={{ fontSize: 12, fontWeight: 900, color: "var(--red2)", letterSpacing: "0.4em", marginBottom: 16 }}>SYSTEM EVALUATION</p>
        <h1 className="font-syne italic" style={{ fontSize: 42, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.04em", marginBottom: 24 }}>PROTOCOL COMPLETE</h1>
        <p className="font-syne" style={{ fontSize: 13, color: "var(--text3)", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 50, lineHeight: 1.6 }}>EVALUATE THE EMERGENCY INTERCEPT SYSTEM</p>

        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 50 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button 
              key={s}
              onClick={() => setRating(s)}
              style={{ 
                width: 56, height: 56, borderRadius: 16, 
                background: rating >= s ? "var(--red)" : "#F1F5F9", 
                border: rating >= s ? "none" : "1.5px solid #E2E8F0", 
                color: rating >= s ? "#fff" : "var(--text3)", 
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" 
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={rating >= s ? "#fff" : "none"} stroke="currentColor" strokeWidth="3"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </button>
          ))}
        </div>

        <textarea 
          placeholder="Enter clinical or operational feedback..."
          className="font-dm"
          style={{ width: "100%", height: 140, background: "#F8FAFC", border: "2.5px solid #F1F5F9", borderRadius: 28, padding: "24px", color: "var(--text)", fontSize: 16, fontWeight: 700, resize: "none", outline: "none", marginBottom: 40 }}
        />

        <button 
          onClick={() => go("home")}
          className="btn-primary"
          style={{ height: 76, borderRadius: 28 }}
        >
          <span className="font-syne italic">CLOSE CASE LOG</span>
        </button>
      </div>
    </div>
  )
}
