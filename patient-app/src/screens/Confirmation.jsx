export default function ConfirmationScreen({ go, selectedHospital, token }) {
  return (
    <div className="screen" style={{ background: "#FFFFFF", alignItems: "center", justifyContent: "center", padding: "40px" }}>
      {/* Background Pulse - Subtle */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
        <div className="sos-ring" style={{ width: 400, height: 400 }}></div>
      </div>

      <div style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
        <div style={{ width: 120, height: 120, background: "var(--red)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 40px", boxShadow: "0 20px 50px rgba(255, 49, 49, 0.3)" }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>

        <p className="font-mono" style={{ fontSize: 12, fontWeight: 900, color: "var(--red2)", letterSpacing: "0.4em", marginBottom: 16 }}>HANDOVER COMPLETE</p>
        <h1 className="font-syne italic" style={{ fontSize: 44, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.04em", marginBottom: 16 }}>MISSION SUCCESS</h1>
        <p className="font-syne" style={{ fontSize: 14, color: "var(--text2)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 48 }}>INTERCEPT PROTOCOL FINALIZED</p>

        <div className="card" style={{ background: "#F8FAFC", border: "2px solid #F1F5F9", borderRadius: 32, padding: "32px", marginBottom: 48 }}>
           <div style={{ marginBottom: 20 }}>
             <p style={{ fontSize: 10, color: "var(--text3)", fontWeight: 900, marginBottom: 4, letterSpacing: "0.1em" }}>ARRIVAL FACILITY</p>
             <p className="font-syne" style={{ fontSize: 20, fontWeight: 900, color: "var(--text)" }}>{selectedHospital?.name || "Apollo Hospitals"}</p>
           </div>
           <div style={{ height: 1.5, background: "#E2E8F0", marginBottom: 20 }}></div>
           <div>
             <p style={{ fontSize: 10, color: "var(--text3)", fontWeight: 900, marginBottom: 4, letterSpacing: "0.1em" }}>CASE UPLINK TOKEN</p>
             <p className="font-mono" style={{ fontSize: 18, fontWeight: 900, color: "var(--red2)" }}>{token || "MED-6V29"}</p>
           </div>
        </div>

        <button 
          onClick={() => go("feedback")}
          className="btn-primary"
          style={{ height: 76, borderRadius: 28 }}
        >
          <span className="font-syne italic">CLOSE PROTOCOL</span>
        </button>
      </div>
    </div>
  )
}