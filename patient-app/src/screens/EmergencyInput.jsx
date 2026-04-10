import { useState, useEffect, useRef } from "react"

export default function EmergencyInputScreen({ go, setTriageData, language, showToast }) {
  const [mode, setMode] = useState("voice")
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast("System Error: Speech Recognition Unavailable")
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-US"

    rec.onstart = () => setIsListening(true)
    rec.onend = () => setIsListening(false)
    rec.onresult = (event) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) setTranscript(prev => prev + event.results[i][0].transcript + " ")
        else interim += event.results[i][0].transcript
      }
      setInterimTranscript(interim)
    }
    recognitionRef.current = rec
    return () => rec.abort()
  }, [language, showToast])

  const toggleVoice = () => {
    if (isListening) recognitionRef.current?.stop()
    else {
      setTranscript("")
      setInterimTranscript("")
      recognitionRef.current?.start()
    }
  }

  const handleAnalyze = async () => {
    const finalInput = mode === "voice" ? (transcript + interimTranscript).trim() : transcript.trim()
    if (!finalInput) return showToast("PROTOCOL ERROR: Describe Emergency")
    
    setIsProcessing(true)
    setTimeout(() => {
      setTriageData({
        severity: "CRITICAL", score: 9.4, confidence: 96,
        condition: "Acute Coronary Syndrome",
        action: "Directing intercept to Cardiac Specialist. Minimize movement.",
        symptoms: ["Severe chest pain", "Radiating to left arm", "Diaphoresis"]
      })
      go("triage")
    }, 2500)
  }

  return (
    <div className="screen" style={{ background: "#FFFFFF", display: "flex", flexDirection: "column", padding: 0 }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-14 pb-4 border-b border-[#F1F5F9] z-10">
        <button onClick={() => go("home")} style={{ background: "none", border: "none", padding: 8, cursor: "pointer", color: "var(--text)" }}>
           <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="text-center">
          <p className="font-syne" style={{ fontSize: 14, fontWeight: 900, color: "var(--text)", letterSpacing: "0.1em" }}>INPUT PROTOCOL</p>
          <div style={{ width: 40, height: 3, background: "var(--red)", margin: "4px auto 0", borderRadius: 2 }}></div>
        </div>
        <div style={{ width: 40 }}></div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "32px 24px", display: "flex", flexDirection: "column" }}>
        
        {/* Toggle Mode */}
        <div style={{ display: "flex", background: "#F8FAFC", borderRadius: 24, padding: 6, marginBottom: 32, border: "1.5px solid #F1F5F9" }}>
          <button 
            onClick={() => setMode("voice")}
            className="font-syne"
            style={{ flex: 1, height: 56, borderRadius: 20, border: "none", background: mode === "voice" ? "#fff" : "transparent", color: mode === "voice" ? "var(--red2)" : "var(--text3)", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", boxShadow: mode === "voice" ? "0 4px 15px rgba(0,0,0,0.05)" : "none", transition: "0.3s" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            VOICE UPLINK
          </button>
          <button 
            onClick={() => setMode("typing")}
            className="font-syne"
            style={{ flex: 1, height: 56, borderRadius: 20, border: "none", background: mode === "typing" ? "#fff" : "transparent", color: mode === "typing" ? "var(--red2)" : "var(--text3)", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", boxShadow: mode === "typing" ? "0 4px 15px rgba(0,0,0,0.05)" : "none", transition: "0.3s" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 16h10M5 8h14M5 12h14"/></svg>
            DATA ENTRY
          </button>
        </div>

        {/* Input Area */}
        <div className="card flex-1" style={{ display: "flex", flexDirection: "column", padding: "32px", position: "relative", border: "2px solid #F1F5F9", background: mode === "voice" && isListening ? "#FFF5F5" : "#FFF", transition: "0.3s" }}>
          {mode === "voice" ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
               {isListening ? (
                 <div style={{ marginBottom: 40 }}>
                    <div className="waveform">
                       {[...Array(6)].map((_, i) => <div key={i} className="wave-bar" style={{ width: 8, margin: "0 3px", background: "var(--red)" }} />)}
                    </div>
                    <p className="font-mono" style={{ color: "var(--red2)", fontWeight: 900, fontSize: 13, marginTop: 24, letterSpacing: "0.3em", textTransform: "uppercase" }}>UPLINK ACTIVE</p>
                 </div>
               ) : (
                 <button 
                  onClick={toggleVoice} 
                  style={{ width: 120, height: 120, borderRadius: "50%", background: "#F8FAFC", border: "2px solid #F1F5F9", color: "var(--red2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, cursor: "pointer", transition: "0.3s" }}
                 >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                 </button>
               )}
               
               <p className="font-dm italic" style={{ fontSize: transcript || interimTranscript ? 22 : 16, color: transcript || interimTranscript ? "var(--text)" : "var(--text3)", fontWeight: 800, lineHeight: 1.5, letterSpacing: "-0.01em" }}>
                 {transcript || interimTranscript || "Describe condition: age, primary systems, and time since onset."}
                 {interimTranscript && <span style={{ opacity: 0.4 }}>{interimTranscript}</span>}
               </p>
            </div>
          ) : (
            <textarea 
              className="font-dm"
              placeholder="Enter comprehensive emergency intel..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", fontSize: 18, fontWeight: 800, color: "var(--text)", resize: "none", background: "transparent", lineHeight: 1.6 }}
            />
          )}

          {isListening && (
            <button 
              onClick={toggleVoice}
              style={{ position: "absolute", bottom: 20, right: 20, width: 56, height: 56, borderRadius: "50%", background: "var(--red2)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px var(--red-glow)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            </button>
          )}
        </div>

        {/* Neural Analysis Status */}
        <div style={{ marginTop: 32, display: "flex", gap: 16, alignItems: "center", background: "#FFF5F5", padding: "20px 24px", borderRadius: 24, border: "2px solid #FFE4E4" }}>
          <div style={{ width: 12, height: 12, background: "var(--red)", borderRadius: "50%", animation: "glowPulse 1.5s infinite" }}></div>
          <p className="font-syne" style={{ fontSize: 12, fontWeight: 900, color: "var(--red2)", textTransform: "uppercase", letterSpacing: "0.2em" }}>NEURAL ANALYSIS ENGINE READY</p>
        </div>

      </div>

      {/* Execute Button */}
      <footer style={{ padding: "0 24px 52px" }}>
        <button 
          onClick={handleAnalyze}
          disabled={isProcessing}
          className="btn-primary"
          style={{ height: 72, borderRadius: 28, background: isProcessing ? "#E2E8F0" : "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}
        >
          {isProcessing ? (
            <div className="spinner" style={{ borderTopColor: "var(--red)" }}></div>
          ) : (
             <span className="font-syne" style={{ italic: "true" }}>EXECUTE TRIAGE PROTOCOL</span>
          )}
        </button>
      </footer>
    </div>
  )
}