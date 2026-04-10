import { useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, FileText, CheckCircle, MapPin } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function PatientCard({ patient, hospitalId }) {
  const [accepted, setAccepted] = useState(false);
  const [arrived, setArrived] = useState(false);

  const handleAccept = async () => {
    try {
      await axios.post(`${API_BASE}/api/accept_case`, {
        token: patient.token,
        hospital_id: parseInt(hospitalId),
        doctor_name: "Dr. On Call",
        message: "We are ready. Follow the green route to Emergency Bay 1."
      });
      setAccepted(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkArrived = async () => {
    try {
      await axios.post(`${API_BASE}/api/mark_arrived`, {
        token: patient.token
      });
      setArrived(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (!patient) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden text-white bg-[#080808] p-6 rounded-2xl border border-[#111] shadow-2xl">
      <div className="flex justify-between items-start mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-black font-syne tracking-tight leading-tight uppercase text-white">{patient.patient?.name || 'Unknown Protocol'}</h2>
          <div className="font-mono text-xs text-white/40 mt-2 font-bold tracking-widest flex items-center gap-3">
            <span>AGE: {patient.patient?.age || '??'}</span>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <span>TOKEN: <span className="text-red-500">{patient.token}</span></span>
          </div>
        </div>
        <div className={`p-4 rounded-xl border-2 text-center min-w-[120px] transition-all duration-500
          ${patient.severity === 'CRITICAL' ? 'bg-red-600/10 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'bg-orange-600/10 border-orange-600'}`}>
          <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1 font-syne">AI SEVERITY</div>
          <div className={`text-3xl font-black font-mono ${patient.severity === 'CRITICAL' ? 'text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'text-orange-500'}`}>
            {patient.priority_score?.toFixed(1) || '0.0'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
        {/* Condition Box */}
        <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-4 h-4 text-red-500/70" />
            <h3 className="font-syne font-black text-[10px] text-white/40 uppercase tracking-[0.2em]">PATHOLOGY CLASSIFIED</h3>
          </div>
          <div className="font-syne font-black text-2xl text-white tracking-tight uppercase">{patient.condition}</div>
        </div>

        {/* Medical History */}
        <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-5">
            <FileText className="w-4 h-4 text-white/30" />
            <h3 className="font-syne font-black text-[10px] text-white/40 uppercase tracking-[0.2em]">CLINICAL INTELLIGENCE</h3>
          </div>
          <div className="grid grid-cols-2 gap-6 font-mono text-[13px] font-bold">
            <div>
              <span className="text-white/30 block mb-2 tracking-widest uppercase text-[10px]">Blood Analytics</span>
              <span className="text-white text-lg">O- NEGATIVE</span>
            </div>
            <div>
              <span className="text-white/30 block mb-2 tracking-widest uppercase text-[10px]">Known Contraindications</span>
              <span className="text-red-500 bg-red-500/10 px-3 py-1 rounded-sm flex items-center inline-flex gap-2 border border-red-500/20">
                <AlertTriangle size={12}/> PENICILLIN
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 shrink-0 grid grid-cols-2 gap-4">
        <button 
          onClick={handleAccept}
          disabled={accepted}
          className={`py-4 rounded-xl font-black font-syne text-xs tracking-[0.1em] flex items-center justify-center gap-3 transition-all duration-300
            ${accepted ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/50' : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-xl'}`}
        >
          {accepted ? <><CheckCircle size={18} /> CONFIRMED</> : 'ACCEPT PROTOCOL'}
        </button>
        <button 
          onClick={handleMarkArrived}
          disabled={arrived}
          className={`py-4 rounded-xl font-black font-syne text-xs tracking-[0.1em] flex items-center justify-center gap-3 transition-all duration-300
            ${arrived ? 'bg-blue-600/20 text-blue-400 border border-blue-400/50' : 'bg-transparent text-white border-2 border-white/20 hover:border-blue-600 hover:bg-blue-600/10'}`}
        >
          {arrived ? <><MapPin size={18} /> AT BASE</> : 'MARK ARRIVAL'}
        </button>
      </div>
    </div>
  );
}
