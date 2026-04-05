import React, { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'

const API_BASE_WS = import.meta.env.VITE_WS_BASE || 'ws://localhost:8000'

export default function Confirmation({ navigate, state }) {
  const [stages, setStages] = useState([true, false, false, false]);
  const [doctorMsg, setDoctorMsg] = useState(null)

  useEffect(() => {
    // Stagger checklist
    [1, 2, 3].forEach((index) => {
      setTimeout(() => {
        setStages(prev => {
          let updated = [...prev];
          updated[index] = true;
          return updated;
        })
      }, index * 800)
    });
  }, [])

  useEffect(() => {
    if (!state.token) return;

    const ws = new WebSocket(`${API_BASE_WS}/ws/patient/${state.token}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'DOCTOR_ACCEPTED') {
        setDoctorMsg(data);
      }
    };

    return () => ws.close();
  }, [state.token])

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex flex-col p-6 items-center pt-16 relative">
      <button 
        onClick={() => navigate('navigation')}
        className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 font-mono text-sm"
      >
        <ArrowLeft size={16} /> BACK TO ROUTE
      </button>

      <div className="w-24 h-24 mb-6 relative mt-10">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1A2D42" strokeWidth="8" />
          <circle 
            cx="50" cy="50" r="45" fill="none" stroke="#00C853" strokeWidth="8"
            strokeDasharray="283" strokeDashoffset={doctorMsg ? "0" : "80"} className="transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {doctorMsg ? <CheckCircle2 size={36} className="text-normal" /> : <Loader2 size={36} className="text-blue-400 animate-spin" />}
        </div>
      </div>

      <div className="w-full bg-[#16273B] rounded-2xl p-6 border border-[#213751] shadow-2xl mb-8">
        <h2 className="text-lg font-sans font-bold text-white mb-5 uppercase tracking-wide border-b border-[#213751] pb-3">
          Pre-Arrival Checklist
        </h2>
        
        <ul className="space-y-4 font-mono text-sm">
          <li className="flex items-center gap-3">
            <CheckCircle2 className="text-normal shrink-0" size={18} />
            <span className="text-gray-300">Triage Detected — <span className={state.triageResult?.severity === 'CRITICAL' ? 'text-emergency font-bold' : 'text-moderate font-bold'}>{state.triageResult?.severity}</span></span>
          </li>
          
          <li className={`flex items-start gap-3 transition-opacity duration-500 ${stages[1] ? 'opacity-100' : 'opacity-0'}`}>
            <CheckCircle2 className="text-normal shrink-0" size={18} />
            <span className="text-gray-300">Hospital Selected: <span className="text-white bg-[#0D1B2A] px-2 py-0.5 rounded ml-1">{state.selectedHospital?.name || 'Apollo Hospitals Tirupati'}</span></span>
          </li>

          <li className={`flex items-center gap-3 transition-opacity duration-500 ${stages[2] ? 'opacity-100' : 'opacity-0'}`}>
            <CheckCircle2 className="text-normal shrink-0" size={18} />
            <span className="text-gray-300">Secure Records Transferred</span>
          </li>

          <li className={`flex items-start gap-3 transition-opacity duration-500 ${stages[3] ? 'opacity-100' : 'opacity-0'}`}>
            {doctorMsg ? (
              <CheckCircle2 className="text-normal shrink-0 mt-0.5" size={18} />
            ) : (
              <Loader2 className="text-blue-400 animate-spin shrink-0 mt-0.5" size={18} />
            )}
            
            <div className="flex-1">
              <span className={doctorMsg ? "text-normal font-bold" : "text-blue-400"}>
                {doctorMsg ? "Case Accepted by Hospital" : "Hospital is preparing..."}
              </span>
              {doctorMsg && (
                <div className="mt-2 bg-[#0A1628] rounded p-3 text-xs leading-relaxed border left-border border-normal/30 border-l-normal">
                  <span className="text-gray-400 mb-1 block">Message from {doctorMsg.doctor_name}:</span>
                  <span className="text-white">"{doctorMsg.message}"</span>
                </div>
              )}
            </div>
          </li>
        </ul>
      </div>

      <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center w-full max-w-sm bg-[#050D1A]">
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Unique Case Token</div>
        <div className="text-3xl font-mono font-bold text-white tracking-[0.2em]">{state.token || 'A3F9-72XK'}</div>
        <div className="text-xs text-gray-500 font-sans mt-2">Valid for 18 minutes</div>
      </div>
      
      <p className="text-gray-400 mt-8 mb-4 font-sans text-center text-sm px-6 max-w-xs">
        Stay calm. You are expected. Follow the navigation route.
      </p>
    </div>
  )
}
