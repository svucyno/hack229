import React, { useState } from 'react';
import axios from 'axios';
import { User, Activity, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function PatientCard({ patient, hospitalId }) {
  const [accepted, setAccepted] = useState(false);

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

  if (!patient) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden text-gray-200">
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight leading-tight">{patient.patient?.name || 'Unknown Patient'}</h2>
          <div className="font-mono text-sm text-gray-400 mt-1">
            AGE: {patient.patient?.age || '?'}, SEX: M | TOKEN: <span className="border-b border-dashed border-gray-500 text-white">{patient.token}</span>
          </div>
        </div>
        <div className={`p-3 rounded border text-center min-w-[100px]
          ${patient.severity === 'CRITICAL' ? 'bg-emergency/10 border-emergency' : 'bg-moderate/10 border-moderate'}`}>
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">AI SCORE</div>
          <div className={`text-2xl font-bold ${patient.severity === 'CRITICAL' ? 'text-emergency' : 'text-moderate'}`}>
            {patient.priority_score.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        
        {/* Condition Box */}
        <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <h3 className="font-mono text-xs text-gray-400 uppercase tracking-widest">Suspected Condition</h3>
          </div>
          <div className="font-sans text-xl text-red-200">{patient.condition}</div>
        </div>

        {/* Medical History */}
        <div className="bg-navy-800 p-4 rounded-xl border border-navy-700">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <h3 className="font-mono text-xs text-gray-400 uppercase tracking-widest">Medical Chart (AI summary)</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <span className="text-gray-500 block mb-1">Blood Type:</span>
              <span>O- (Verify)</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Allergies:</span>
              <span className="text-moderate bg-moderate/10 px-2 py-0.5 rounded flex items-center inline-flex gap-1">
                <AlertTriangle size={12}/> Penicillin
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 block mb-1">Chronic:</span>
              <span>Hypertension</span>
            </div>
          </div>
        </div>
        
      </div>

      <div className="mt-4 pt-4 border-t border-navy-700 shrink-0 grid grid-cols-3 gap-3">
        <button 
          onClick={handleAccept}
          disabled={accepted}
          className={`col-span-2 py-3 rounded-lg font-bold font-sans flex items-center justify-center gap-2 transition-colors
            ${accepted ? 'bg-normal/20 text-normal border border-normal/50' : 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-navy-900'}`}
        >
          {accepted ? <><CheckCircle size={18} /> DOCTOR ASSIGNED</> : 'ACCEPT CASE'}
        </button>
        <button className="py-3 bg-navy-800 text-gray-300 rounded-lg hover:bg-navy-700 font-mono text-xs uppercase transition-colors">
          ESCALATE ICU
        </button>
      </div>
    </div>
  );
}
