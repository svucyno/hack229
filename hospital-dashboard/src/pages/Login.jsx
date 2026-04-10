import { useState } from "react"

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000"

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("doctor@apollohospitalstirupati.com")
  const [password, setPassword] = useState("doctor123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) throw new Error("Invalid credentials")
      const data = await res.json()
      onLogin(data)
    } catch {
      // Demo fallback
      onLogin({ token: "demo", name: "Dr. Ramesh Kumar", role: "doctor", hospital_id: "h1", hospital_name: "Apollo Hospitals Tirupati" })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative font-inter">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)' , backgroundSize: '40px 40px' }}></div>

      <div className="w-full max-w-md p-8 relative z-10 animate-slide-up">
        <div className="glass-panel p-10 border border-white/5 rounded-[32px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,49,49,0.4)] mb-6 group-hover:scale-110 transition-transform duration-500">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 2v20M2 12h20"/></svg>
            </div>
            <h1 className="text-3xl font-black font-syne tracking-tighter text-white mb-2 uppercase italic leading-none">MEDIRUSH<span className="text-red-600">OS</span></h1>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">HOSPITAL COMMAND GATEWAY</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-[11px] font-black text-red-500 uppercase tracking-wider">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black font-syne text-white/30 uppercase tracking-[0.2em] ml-1">AUTH TOKEN / EMAIL</label>
              <div className="relative">
                <input 
                  type="email"
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                  className="w-full h-14 px-6 bg-white/[0.03] border border-white/10 rounded-2xl text-white text-sm font-bold placeholder:text-white/10 focus:border-red-500/50 focus:bg-white/[0.05] focus:outline-none transition-all shadow-inner"
                  placeholder="Enter clinical identifier..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black font-syne text-white/30 uppercase tracking-[0.2em] ml-1">SECURITY CLEARANCE CODE</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)}
                  className="w-full h-14 px-6 bg-white/[0.03] border border-white/10 rounded-2xl text-white text-sm font-bold placeholder:text-white/10 focus:border-red-500/50 focus:bg-white/[0.05] focus:outline-none transition-all shadow-inner"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-16 bg-red-600 rounded-2xl text-white font-black font-syne text-sm tracking-[0.2em] shadow-[0_15px_40px_rgba(255,49,49,0.3)] hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 disabled:grayscale uppercase"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>AUTHORIZING...</span>
                </div>
              ) : "INITIATE ACCESS"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-[9px] font-black font-syne text-white/20 uppercase tracking-[0.3em]">RECOVERY PROTOCOLS ACTIVE</p>
            <p className="text-[10px] font-bold text-white/40 italic">
              Credential Reference: <span className="text-red-500 underline decoration-red-500/30 underline-offset-4 cursor-help" title="Demo credentials loaded for development check.">doctor123</span>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-black font-syne text-white/10 uppercase tracking-[0.5em]">MISSION CRITICAL SYSTEM • SECURE GATEWAY 09</p>
      </div>
    </div>
  )
}