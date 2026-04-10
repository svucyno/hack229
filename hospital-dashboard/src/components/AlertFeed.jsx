import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

const API_BASE_WS = import.meta.env.VITE_WS_BASE || 'ws://localhost:8000';

export default function AlertFeed({ hospitalId, onSelectPatient }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!hospitalId) return;

    const ws = new WebSocket(`${API_BASE_WS}/ws/hospital/${hospitalId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'EMERGENCY_ALERT') {
        const newAlert = {
          id: data.token,
          ...data,
          receivedAt: new Date()
        };
        setAlerts(prev => [newAlert, ...prev]);
        
        // Auto-select if it's the first one
        onSelectPatient(prev => prev ? prev : newAlert);
      }
    };

    return () => ws.close();
  }, [hospitalId, onSelectPatient]);

  return (
    <div className="flex flex-col h-full bg-[#050505] border-r border-[#1A1A1A]">
      <div className="p-5 border-b border-[#111] flex justify-between items-center bg-[#080808]">
        <div>
          <h2 className="font-syne font-black text-xs tracking-[0.2em] text-white/40 uppercase">LIVE EMERGENCY FEED</h2>
          <p className="text-[10px] text-red-500/80 font-mono font-bold animate-pulse mt-0.5">● SECURE GATEWAY ACTIVE</p>
        </div>
        <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.4)]">{alerts.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-20">
            <AlertCircle size={32} className="text-white mb-2" />
            <div className="text-white font-mono text-[10px] tracking-widest uppercase">Waiting for protocol...</div>
          </div>
        ) : (
          alerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const isModerate = alert.severity === 'MODERATE';
            
            return (
              <div 
                key={alert.id}
                onClick={() => onSelectPatient(alert)}
                className={`
                  p-4 rounded-xl cursor-pointer border border-[#1A1A1A] transition-all duration-300 relative overflow-hidden group
                  ${isCritical ? 'bg-red-950/20 border-red-900/50 hover:bg-red-900/30' : 
                    isModerate ? 'bg-orange-950/10 border-orange-900/30 hover:bg-orange-900/20' : 'bg-white/[0.02] hover:bg-white/[0.05]'}
                `}
              >
                {isCritical && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />}
                
                <div className="flex justify-between items-start mb-2">
                  <div className="font-syne font-extrabold text-sm text-white tracking-tight group-hover:text-red-500 transition-colors uppercase">{alert.patient?.name || 'Unknown Protocol'}</div>
                  <div className="flex items-center text-white/30 text-[10px] font-mono font-bold">
                    <Clock size={10} className="mr-1" /> NOW
                  </div>
                </div>
                
                <div className="font-mono text-[11px] text-red-500/90 font-bold mb-3 tracking-tight">{alert.condition}</div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm tracking-widest
                    ${isCritical ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(220,38,38,0.3)]' : 
                      isModerate ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'}`}
                  >
                    {alert.severity}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-white/40 font-bold uppercase">ETA</span>
                    <span className="font-mono text-xs text-white font-black">{Math.floor(alert.eta_seconds / 60)}M</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
