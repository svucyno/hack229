import { useEffect, useState, useRef } from "react"

export default function NavigationScreen({ go, selectedHospital, token, showToast }) {
  const mapRef = useRef(null)
  const [eta, setEta] = useState(720) 
  const [arrived, setArrived] = useState(false)
  
  useEffect(() => {
    if (!window.google) return
    const h = selectedHospital || { name: "Apollo Hospitals", lat: 13.628, lng: 79.419 }
    
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 13.628, lng: 79.419 },
      zoom: 15,
      disableDefaultUI: true,
      styles: [
        { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
        { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "lightness": 16 }] },
        { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#fefefe" }, { "lightness": 20 }] },
        { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] },
        { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] },
        { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] },
        { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] },
        { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] },
        { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] },
        { "featureType": "transit", "elementType": "geometry.fill", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] },
        { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }
      ]
    })

    new window.google.maps.Marker({
      position: { lat: 13.628, lng: 79.419 },
      map,
      title: h.name,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: "#EF4444",
        fillOpacity: 1,
        strokeWeight: 5,
        strokeColor: "#FFFFFF",
      }
    })

    const timer = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000)
    return () => clearInterval(timer)
  }, [selectedHospital])

  const handleArrival = () => {
    setArrived(true)
    setTimeout(() => go("confirmation"), 1500)
  }

  const m = Math.floor(eta / 60), s = eta % 60

  return (
    <div className="screen" style={{ background: "#FFFFFF", display: "flex", flexDirection: "column", padding: 0 }}>
      {/* SCANLINE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.01] z-50" style={{ backgroundImage: 'linear-gradient(rgba(239, 68, 68, 0) 50%, rgba(239, 68, 68, 0.05) 50%), linear-gradient(90deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.02), rgba(239, 68, 68, 0.05))', backgroundSize: '100% 2px, 3px 100%' }}></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-14 pb-4 bg-white/95 backdrop-blur-xl border-b border-[#F1F5F9] z-10">
        <div className="flex items-center gap-4">
          <div style={{ width: 12, height: 12, background: "var(--red)", borderRadius: "50%", animation: "glowPulse 1.5s infinite" }}></div>
          <p className="font-syne italic" style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", letterSpacing: "0.05em" }}>LIVE INTERCEPT</p>
        </div>
        <div className="text-right">
           <p className="font-mono" style={{ fontSize: 10, color: "var(--red2)", fontWeight: 900, letterSpacing: "0.1em" }}>CASE UPLINK</p>
           <p className="font-mono" style={{ fontSize: 14, fontWeight: 900, color: "var(--text)" }}>{token || "MED-6V29"}</p>
        </div>
      </header>

      {/* Map Content */}
      <div style={{ flex: 1, position: "relative" }}>
         <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
         
         {/* Live Overlay Panels */}
         <div style={{ position: "absolute", bottom: 28, left: 16, right: 16, zIndex: 10 }}>
            <div className="card" style={{ padding: "32px", background: "#FFFFFF", borderRadius: "34px", boxShadow: "0 25px 60px rgba(0,0,0,0.12)", border: "2px solid #F1F5F9", position: "relative", overflow: "hidden" }}>
               <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "linear-gradient(90deg, var(--red), var(--red2))" }}></div>
               
               <div className="flex justify-between items-center mb-8">
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, color: "var(--red2)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 6 }}>DESTINATION FACILITY</p>
                    <p className="font-syne" style={{ fontSize: 24, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.01em" }}>{selectedHospital?.name || "Apollo Hospitals"}</p>
                  </div>
                  <div style={{ textAlign: "right", paddingLeft: 20 }}>
                    <p className="font-mono" style={{ fontSize: 36, fontWeight: 900, color: "var(--text)", leading: 1, letterSpacing: "-0.05em" }}>{m}:{String(s).padStart(2,'0')}</p>
                    <p className="font-mono" style={{ fontSize: 11, color: "var(--red2)", fontWeight: 900, letterSpacing: "0.1em" }}>ETA</p>
                  </div>
               </div>

               <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
                  <button 
                  onClick={handleArrival}
                  className="btn-primary" 
                  style={{ height: 76, borderRadius: 24, background: arrived ? "var(--green)" : "var(--red)", boxShadow: arrived ? "0 20px 50px rgba(16, 185, 129, 0.4)" : "0 20px 50px rgba(255, 49, 49, 0.4)", transition: "0.4s" }}
                  >
                  <span className="font-syne italic" style={{ fontSize: 16, fontWeight: 900 }}>{arrived ? "HANDOVER SUCCESSFUL" : "SIGNAL ARRIVAL"}</span>
                  </button>
                  <button style={{ width: 76, height: 76, borderRadius: 24, border: "2.5px solid #F1F5F9", background: "#FFFFFF", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }}>
                     <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  </button>
               </div>
            </div>
         </div>

         {/* Medical Telemetry Panel - Floating */}
         <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", border: "1.5px solid #F1F5F9", padding: "12px 18px", borderRadius: 20, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
               <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 9, color: "var(--text3)", fontWeight: 900, marginBottom: 2 }}>BPM</p>
                  <p className="font-mono" style={{ fontSize: 16, fontWeight: 900, color: "var(--red2)" }}>114</p>
               </div>
               <div style={{ width: 1, height: 24, background: "#E2E8F0" }}></div>
               <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 9, color: "var(--text3)", fontWeight: 900, marginBottom: 2 }}>O2</p>
                  <p className="font-mono" style={{ fontSize: 16, fontWeight: 900, color: "var(--text)" }}>92%</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}