import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BedDouble, Stethoscope, DoorOpen, Users } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function ResourceBar({ hospitalId }) {
  const [hospital, setHospital] = useState(null);

  const fetchHospital = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/hospitals/${hospitalId}`);
      setHospital(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      fetchHospital();
      // Polling every 10s for bed updates in Phase 2
      const interval = setInterval(fetchHospital, 10000);
      return () => clearInterval(interval);
    }
  }, [hospitalId]);

  if (!hospital) return (
    <footer className="h-16 bg-navy-800 border-t border-navy-700 flex justify-center items-center shrink-0">
      <div className="w-4 h-4 rounded-full border-2 border-gray-500 border-t-white animate-spin"></div>
    </footer>
  );

  const bedOccupancy = hospital.beds_occupied / hospital.beds_total;
  const icuOccupancy = 0.65; // Mock ICU for dashboard
  const isIcuWarning = icuOccupancy > 0.7;

  return (
    <footer className="h-16 bg-[#080808] border-t border-[#111] shrink-0 flex items-center px-8 gap-10 relative z-10">
      
      {/* General Capacity */}
      <div className="flex items-center gap-4 w-1/4">
        <BedDouble className="text-white/30" size={18} />
        <div className="flex-1">
          <div className="flex justify-between text-[9px] font-black font-syne text-white/40 mb-1.5 tracking-widest uppercase">
            <span>GENERAL WARD</span>
            <span className="text-white/60">{hospital.beds_occupied} / {hospital.beds_total}</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700
                ${bedOccupancy > 0.8 ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]' : bedOccupancy > 0.5 ? 'bg-orange-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, bedOccupancy * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ICU Status */}
      <div className="flex items-center gap-4 w-1/4">
        <Stethoscope className="text-white/30" size={18} />
        <div className="flex-1">
          <div className="flex justify-between text-[9px] font-black font-syne text-white/40 mb-1.5 tracking-widest uppercase">
            <span>ICU INTENSITY</span>
            <span className="text-white/60">{Math.floor(hospital.icu_beds * icuOccupancy)} / {hospital.icu_beds}</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${isIcuWarning ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]' : 'bg-orange-500'}`}
              style={{ width: `${icuOccupancy * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Trauma Bay */}
      <div className="flex items-center gap-3 border-l border-white/5 pl-10">
        <DoorOpen size={18} className={hospital.emergency_bay ? "text-emerald-500" : "text-red-500 animate-pulse"} />
        <div>
          <div className="text-[9px] font-black font-syne text-white/30 tracking-widest uppercase">TRAUMA STATUS</div>
          <div className={`text-[11px] font-black font-syne tracking-tight ${hospital.emergency_bay ? 'text-emerald-500' : 'text-red-500'}`}>
            {hospital.emergency_bay ? 'RECEIVING PATIENTS' : 'DIVERSION ACTIVE'}
          </div>
        </div>
      </div>

      {/* Staff Check */}
      <div className="flex items-center gap-3 border-l border-white/5 pl-10 ml-auto mr-4">
        <Users size={18} className="text-white/30" />
        <div>
          <div className="text-[9px] font-black font-syne text-white/30 tracking-widest uppercase">STAFF ON CALL</div>
          <div className="text-[11px] font-black font-syne text-white/70 tracking-tight">12 PHYSICIANS / 34 NURSES</div>
        </div>
      </div>

      {isIcuWarning && (
        <div className="absolute -top-12 right-6 bg-red-600/10 border border-red-600 text-red-500 text-[10px] px-3 py-1.5 rounded-sm font-black font-syne tracking-widest animate-bounce shadow-2xl">
          CRITICAL: ICU CAPACITY &gt; 75%
        </div>
      )}

    </footer>
  );
}
