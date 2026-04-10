import { useState } from "react"

export default function HomeScreen({ go, language, updateLanguage }) {
  const [showLang, setShowLang] = useState(false)

  const LANGS = [
    { id: "en", name: "ENGLISH", flag: "🇬🇧" },
    { id: "te", name: "తెలుగు", flag: "🇮🇳" },
    { id: "hi", name: "हिन्दी", flag: "🇮🇳" }
  ]

  const TEXT = {
    en: {
      heading: "Emergency Healthcare Protocol",
      subheading: "Mission-Critical Triage • Rapid Intercept",
      btn: "EMERGENCY",
      desc: "ACTIVATE SYSTEM INPUT FOR IMMEDIATE ASSISTANCE"
    },
    te: {
      heading: "అత్యవసర వైద్య ప్రోటోకాల్",
      subheading: "వేగంగా సరైన సహాయం",
      btn: "ప్రారంభించండి",
      desc: "సహాయం కోసం నొక్కండి"
    },
    hi: {
      heading: "आपातकालीन चिकित्सा प्रोटोकॉल",
      subheading: "त्वरित सहायता तंत्र",
      btn: "शुरू करें",
      desc: "मदद के लिए टैप करें"
    }
  }

  const t = TEXT[language] || TEXT.en
  const currentLang = LANGS.find(l => l.id === language) || LANGS[0]

  return (
    <div className="screen" style={{ background: "#FFFFFF", display: "flex", flexDirection: "column", padding: 0 }}>
      {/* SCANLINE OVERLAY - SUBTLE */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-50" style={{ backgroundImage: 'linear-gradient(rgba(239, 68, 68, 0) 50%, rgba(239, 68, 68, 0.05) 50%), linear-gradient(90deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.02), rgba(239, 68, 68, 0.05))', backgroundSize: '100% 2px, 3px 100%' }}></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-14 pb-6 z-10">
        <div className="flex items-center gap-3">
          <div style={{ width: 34, height: 34, background: "var(--red)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 15px rgba(255,49,49,0.3)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
          <span className="font-syne italic" style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.05em", color: "var(--text)" }}>MEDIRUSH<span className="text-red-500">OS</span></span>
        </div>
        
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setShowLang(!showLang)}
            className="font-syne"
            style={{ padding: "8px 16px", borderRadius: 12, background: "#F1F5F9", border: "1px solid #E2E8F0", color: "var(--text)", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", letterSpacing: "0.1em" }}
          >
             <span>{currentLang.name}</span>
             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" style={{ transform: showLang ? "rotate(180deg)" : "none", transition: "0.2s" }}><path d="M6 9l6 6 6-6"/></svg>
          </button>
          
          {showLang && (
            <>
              <div onClick={() => setShowLang(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
              <div style={{ position: "absolute", top: "110%", right: 0, width: 140, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", zIndex: 11, boxShadow: "0 15px 40px rgba(0,0,0,0.1)" }}>
                {LANGS.map(l => (
                  <button 
                    key={l.id}
                    onClick={() => { updateLanguage(l.id); setShowLang(false); }}
                    className="font-syne"
                    style={{ width: "100%", padding: "14px 20px", background: language === l.id ? "#FFF5F5" : "transparent", border: "none", color: language === l.id ? "var(--red2)" : "var(--text)", fontSize: 11, fontWeight: 800, textAlign: "left", cursor: "pointer", letterSpacing: "0.1em" }}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "50%", background: "radial-gradient(circle, rgba(255,49,49,0.05) 0%, transparent 70%)", pointerEvents: "none" }}></div>

        <div style={{ textAlign: "center", marginBottom: 50, zIndex: 1 }}>
          <p className="font-mono" style={{ fontSize: 11, fontWeight: 900, color: "var(--red2)", letterSpacing: "0.4em", marginBottom: 16, textTransform: "uppercase" }}>STATUS: OPERATIONAL</p>
          <h1 className="font-syne italic" style={{ fontSize: 42, fontWeight: 900, color: "var(--text)", lineHeight: 0.95, letterSpacing: "-0.04em", marginBottom: 14 }}>{t.heading}</h1>
          <p className="font-syne" style={{ fontSize: 12, color: "var(--text3)", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>{t.subheading}</p>
        </div>

        {/* SOS Button */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 300, height: 300, zIndex: 1 }}>
          <div className="sos-ring" />
          <div className="sos-ring" style={{ animationDelay: "1s", opacity: 0.3 }} />
          
          <button 
            className="sos-btn" 
            onClick={() => go("input")} 
            style={{ 
              width: 160, height: 160,
              background: "var(--red)", 
              border: "none", 
              borderRadius: "50%",
              boxShadow: "0 15px 50px rgba(255,49,49,0.5), inset 0 0 30px rgba(255,255,255,0.3)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              cursor: "pointer", transition: "0.3s", position: "relative", zIndex: 2
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round">
              <path d="M12 2v20M2 12h20"/>
            </svg>
            <span className="font-syne italic" style={{ fontSize: 18, fontWeight: 900, letterSpacing: "0.05em", color: "#fff" }}>{t.btn}</span>
          </button>
        </div>

        <p className="font-mono" style={{ color: "var(--text3)", fontSize: 11, marginTop: 50, textAlign: "center", maxWidth: 280, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>
          {t.desc}
        </p>
      </div>

      {/* Footer Actions */}
      <footer style={{ padding: "0 32px 52px", display: "flex", flexDirection: "column", gap: 16, zIndex: 10 }}>
        <button 
          className="btn-secondary font-syne" 
          onClick={() => go("records")}
          style={{ height: 72, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, border: "2px solid #F1F5F9", background: "white" }}
        >
          <div style={{ width: 40, height: 40, background: "#F8FAFC", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #E2E8F0" }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.1em" }}>HEALTH RECORDS</span>
        </button>

        <button 
          className="btn-secondary font-syne" 
          onClick={() => go("hospitals")}
          style={{ height: 72, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, border: "2px solid #FFF1F1", background: "#FFF9F9", color: "var(--red2)" }}
        >
          <div style={{ width: 40, height: 40, background: "#FFE4E4", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #FFC1C1" }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.1em" }}>NEARBY FACILITIES</span>
        </button>
      </footer>
    </div>
  )
}