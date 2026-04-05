import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Navigation2, Share2, FileText, PhoneCall } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function Navigation({ navigate, state }) {
  const [eta, setEta] = useState(state.selectedHospital?.eta_seconds || 600)
  const [wsStatus, setWsStatus] = useState('Notifying...')

  // Simulate Geolocation watchPosition + tracking API POST
  useEffect(() => {
    if (!state.token) return

    const intervalId = setInterval(async () => {
      try {
        await axios.patch(`${API_BASE}/api/tracking/${state.token}`, {
          token: state.token,
          lat: state.patientLat + (Math.random() * 0.0001), // mock movement
          lng: state.patientLng + (Math.random() * 0.0001),
        })
        console.log("Sent mock location update")
        // Decrement ETA slightly
        setEta(prev => Math.max(0, prev - 10))
      } catch (e) {
        console.error("Failed to update tracking")
      }
    }, 10000)

    return () => clearInterval(intervalId)
  }, [state.token, state.patientLat, state.patientLng])

  useEffect(() => {
    if (state.token) {
      setWsStatus('Hospital Notified')
      setTimeout(() => {
        navigate('confirmation')
      }, 5000) // Automate moving to confirmation screen after 5 seconds to simulate user flow
    }
  }, [state.token])

  const handleShare = async () => {
    try {
      await axios.post(`${API_BASE}/api/patient/${state.patient_id || 1}/share_records`)
      alert('Medical records securely shared with hospital.')
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col pt-safe bg-[#0D1B2A]">
      {/* Top 55%: Simulated Google Map */}
      <div className="h-[55%] relative bg-[#0F1724]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at center, #1E293B 2px, transparent 2px)', 
          backgroundSize: '30px 30px', opacity: 0.5 
        }}></div>
        
        {/* Mock Route Line */}
        <div className="absolute top-[30%] left-[20%] w-[50%] h-[40%] border-b-4 border-l-4 border-normal rounded-bl-[100px] blur-[1px]"></div>
        
        {/* Current Location Blob */}
        <div className="absolute bottom-[20%] left-[20%]">
          <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex my-auto animate-pulse"></div>
        </div>
        
        {/* Destination Hospital */}
        <div className="absolute top-[30%] right-[30%] text-emergency">
          <Navigation2 size={32} className="rotate-180" fill="currentColor" />
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-navy-900/90 text-white font-mono text-xs px-4 py-2 border border-navy-700 shadow-xl rounded-full">
          EMERGENCY ROUTE
        </div>
      </div>

      {/* Bottom 45%: Slide-up Card */}
      <div className="h-[45%] bg-[#1A1A1A] rounded-t-3xl p-6 -mt-6 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between">
        
        <div>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold font-sans text-white max-w-[70%] leading-tight">
              {state.selectedHospital?.name || 'Nearest Designated Hospital'}
            </h2>
            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase
              ${wsStatus === 'Hospital Notified' ? 'bg-normal/20 text-normal' : 'bg-moderate/20 text-moderate'}
            `}>
              {wsStatus}
            </div>
          </div>
          
          <div className="font-mono text-3xl font-bold text-gray-200 mt-4 flex items-end tracking-tight">
            <span className="text-normal mr-2">~ {Math.floor(eta / 60)}</span> 
            <span className="text-lg text-gray-500 mb-1">MIN AWAY</span>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="flex-1 bg-emergency/10 border border-emergency text-emergency rounded-xl py-3 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
            <PhoneCall size={20} />
            <span className="text-xs font-bold uppercase font-mono">108 Ambos</span>
          </button>
          
          <button className="flex-1 bg-[#2C2C2C] text-white rounded-xl py-3 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform relative">
            <Share2 size={20} className="text-blue-400" />
            <span className="text-xs font-bold uppercase font-mono">Share GPS</span>
          </button>

          <button onClick={handleShare} className="flex-1 bg-[#2C2C2C] text-white rounded-xl py-3 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
            <FileText size={20} className="text-moderate" />
            <span className="text-xs font-bold uppercase font-mono">Records</span>
          </button>
        </div>
      </div>
    </div>
  )
}
