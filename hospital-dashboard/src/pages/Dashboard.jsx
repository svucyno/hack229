import { useState, useEffect, useRef } from 'react'
import LiveMap from '../components/LiveMap'

export default function Dashboard() {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'CRITICAL', patient: 'Rahul Sharma', age: 45, condition: 'Cardiac Arrest', loc: 'Tirupati Central', time: '2m ago', active: true, eto: '4m' },
    { id: 2, type: 'URGENT', patient: 'Lata Reddy', age: 32, condition: 'Severe Trauma', loc: 'Bypass Road', time: '5m ago', active: true, eto: '7m' },
    { id: 3, type: 'STABLE', patient: 'Anil Kumar', age: 28, condition: 'Acute Nausea', loc: 'SV University', time: '12m ago', active: false, eto: '15m' }
  ])
  
  const [activeAlert, setActiveAlert] = useState(alerts[0])
  const [stats, setStats] = useState({ active: 24, available: 12, icu: 3, er: 8 })

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* SCANLINE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.01] z-50" style={{ backgroundImage: 'linear-gradient(rgba(239, 68, 68, 0) 50%, rgba(239, 68, 68, 0.05) 50%), linear-gradient(90deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.02), rgba(239, 68, 68, 0.05))', backgroundSize: '100% 2px, 3px 100%' }}></div>

      {/* Sidebar - Control Panel */}
      <aside className="w-80 panel border-r flex flex-col z-20">
        <div className="p-8 border-b">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M12 2v20M2 12h20"/></svg>
            </div>
            <h1 className="font-syne italic text-2xl font-black tracking-tighter text-slate-900 uppercase">MEDIRUSH<span className="text-red-600">HQ</span></h1>
          </div>
          <p className="font-mono text-[9px] font-bold text-red-600 tracking-[0.3em]">MISSION CONTROL INTERFACE v4.0</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="mb-8">
            <p className="font-mono text-[10px] font-black text-slate-400 tracking-widest mb-6 p-2 bg-slate-50 rounded">ACTIVE ALERTS</p>
            <div className="space-y-4">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  onClick={() => setActiveAlert(alert)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border ${activeAlert?.id === alert.id ? 'bg-red-50 border-red-200 shadow-lg shadow-red-100' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`badge-${alert.type === 'CRITICAL' ? 'red' : alert.type === 'URGENT' ? 'amber' : 'green'}`}>{alert.type}</span>
                    <span className="font-mono text-[10px] font-black text-slate-400">{alert.time}</span>
                  </div>
                  <h3 className="font-syne font-black text-lg text-slate-900 leading-tight mb-2 uppercase">{alert.patient}</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[9px] font-black text-slate-400 tracking-tighter">CONDITION</p>
                       <p className="text-xs font-bold text-slate-800">{alert.condition}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 tracking-tighter">ETA</p>
                       <p className="text-xs font-black text-red-600">{alert.eto}</p>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-slate-50">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                 <img src="https://i.pravatar.cc/100?u=doc1" alt="doc" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 uppercase">Dr. Abhinav Reddy</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Chief In-Charge</p>
                </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Dashboard - Map & Analytics */}
      <main className="flex-1 relative flex flex-col">
        {/* Map Header Overlay */}
        <div className="absolute top-8 left-8 right-8 z-10 pointer-events-none">
           <div className="flex justify-between items-start">
              <div className="bg-white/95 backdrop-blur-xl border border-slate-200 p-6 rounded-3xl shadow-xl shadow-slate-200/50 pointer-events-auto flex gap-12">
                 <div>
                   <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-2 uppercase">TOTAL INTERCEPTS</p>
                   <p className="font-mono text-3xl font-black text-slate-900 leading-none tracking-tighter">1,280 <span className="text-green-500 text-xs ml-1">↑ 12%</span></p>
                 </div>
                 <div className="w-px h-10 bg-slate-200 mt-2"></div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-2 uppercase">SYSTEM LOAD</p>
                   <p className="font-mono text-3xl font-black text-red-600 leading-none tracking-tighter">HIGH</p>
                 </div>
              </div>

              <div className="flex gap-4 pointer-events-auto">
                 <div className="bg-white/95 backdrop-blur-xl border border-slate-200 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 mb-1 uppercase">ICU BEDS</p>
                      <p className="font-mono text-xl font-black text-red-600">{stats.icu}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 mb-1 uppercase">ER UNITS</p>
                      <p className="font-mono text-xl font-black text-slate-900">{stats.er}</p>
                    </div>
                 </div>
                 <button className="bg-red-600 text-white font-black px-8 rounded-2xl shadow-lg border border-red-500 text-xs tracking-widest uppercase italic">DEPLOY RESPONSE</button>
              </div>
           </div>
        </div>

        {/* Live Map */}
        <div className="flex-1 bg-[#E2E8F0]">
           <LiveMap activeAlert={activeAlert} />
        </div>

        {/* Global Registry Bar */}
        <footer className="bg-white h-24 border-t px-8 flex items-center justify-between z-10 shadow-2xl">
           <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                 <p className="font-mono text-xs font-black text-slate-900 uppercase">Live Handoff Active</p>
              </div>
              <div className="flex gap-16">
                 <div>
                   <p className="text-[9px] font-black text-slate-400 mb-1 uppercase">LAST SYNC</p>
                   <p className="font-mono text-xs font-bold text-slate-700">0.02ms ago</p>
                 </div>
                 <div>
                   <p className="text-[9px] font-black text-slate-400 mb-1 uppercase">NETWORK STATUS</p>
                   <p className="font-mono text-xs font-bold text-green-600">SECURE</p>
                 </div>
              </div>
           </div>
           
           <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                </div>
              ))}
           </div>
        </footer>
      </main>

      {/* Right Sidebar - Clinical Telemetry */}
      <aside className="w-96 panel border-l flex flex-col z-20">
         <div className="p-8 border-b">
           <p className="font-mono text-[10px] font-black text-red-600 tracking-[0.4em] mb-4 uppercase">PATIENT TELEMETRY</p>
           <h2 className="font-syne italic text-3xl font-black text-slate-900 tracking-tighter uppercase">{activeAlert?.patient || 'NO ACTIVE CASE'}</h2>
           <p className="text-slate-400 font-bold text-sm uppercase mt-1">ID: P-02931-HQ | {activeAlert?.age} YRS</p>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-red-500 animate-pulse"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
               </div>
               <p className="text-[10px] font-black text-red-600 mb-4 uppercase tracking-widest">CRITICAL DIAGNOSTIC</p>
               <h3 className="font-syne text-xl font-bold text-slate-900 mb-2 uppercase">{activeAlert?.condition}</h3>
               <p className="text-sm text-slate-600 font-medium leading-relaxed">System suspects Acute Coronary Syndrome. Redirecting to Cardiac Specialist Wing @ SVIMS Center.</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 mb-2 uppercase">HEART RATE</p>
                  <p className="font-mono text-3xl font-black text-red-600 leading-none tracking-tighter">114 <span className="text-[10px] font-bold text-slate-400">BPM</span></p>
               </div>
               <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 mb-2 uppercase">SPO2LEVEL</p>
                  <p className="font-mono text-3xl font-black text-slate-900 leading-none tracking-tighter">92 <span className="text-[10px] font-bold text-slate-400">%</span></p>
               </div>
               <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 mb-2 uppercase">SYSTOLIC</p>
                  <p className="font-mono text-3xl font-black text-slate-900 leading-none tracking-tighter">148 <span className="text-[10px] font-bold text-slate-400">HG</span></p>
               </div>
               <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 mb-2 uppercase">GCS SCORE</p>
                  <p className="font-mono text-3xl font-black text-amber-500 leading-none tracking-tighter">E3 <span className="text-[10px] font-bold text-slate-400">MED</span></p>
               </div>
            </div>

            <div className="border-t pt-8">
               <p className="font-mono text-[10px] font-black text-slate-400 tracking-widest mb-6 uppercase">INCIDENT TIMELINE</p>
               <div className="space-y-6">
                 {[
                   { time: '14:24:02', msg: 'System Triggered - Voice Input received' },
                   { time: '14:24:15', msg: 'AI Diagnostic complete - CRITICAL match' },
                   { time: '14:25:30', msg: 'Hospital selected - Handover initiated' },
                 ].map((log, i) => (
                   <div key={i} className="flex gap-4">
                     <p className="font-mono text-[10px] font-black text-slate-300 w-16">{log.time}</p>
                     <p className="text-xs font-bold text-slate-600">{log.msg}</p>
                   </div>
                 ))}
               </div>
            </div>
         </div>

         <div className="p-8 border-t bg-slate-50">
            <button className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl shadow-lg border border-slate-800 text-xs tracking-widest uppercase italic hover:bg-slate-800 transition-colors">INITIALIZE HANDOVER RECORD</button>
         </div>
      </aside>
    </div>
  )
}