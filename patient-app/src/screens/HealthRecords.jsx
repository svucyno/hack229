import React, { useState } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { User, Activity, AlertTriangle, FileText, ChevronLeft, ChevronDown, Droplet, Plus } from 'lucide-react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// Dummy Data exactly as requested
const bpData = [
  { val: 120 }, { val: 125 }, { val: 130 }, { val: 140 }, { val: 135 }, { val: 142 }, { val: 145 },
]
const hrData = [
  { val: 72 }, { val: 75 }, { val: 68 }, { val: 80 }, { val: 85 }, { val: 82 }, { val: 88 },
]

export default function HealthRecords({ navigate, state }) {
  const [activeDrug, setActiveDrug] = useState(null)
  const [drugInfo, setDrugInfo] = useState(null)
  const [loadingDrug, setLoadingDrug] = useState(false)

  const meds = ["Amlodipine", "Metformin"]

  const fetchDrugInfo = async (drugName) => {
    setActiveDrug(drugName)
    setLoadingDrug(true)
    setDrugInfo(null)
    try {
      const res = await axios.get(`${API_BASE}/api/drug_info?name=${drugName}`)
      setDrugInfo(res.data)
    } catch (e) {
      setDrugInfo({ error: "Drug information not available." })
    } finally {
      setLoadingDrug(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#0D0D0D] text-white flex flex-col pb-safe">
      
      {/* Header */}
      <header className="flex justify-between items-center p-5 sticky top-0 bg-[#0D0D0D]/90 backdrop-blur z-20 border-b border-white/10 shrink-0">
        <button onClick={() => navigate('home')} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold font-syne">My Health Profile</h1>
        <button className="p-2 -mr-2 text-normal">
          <FileText size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto w-full px-5 pb-8 space-y-6 pt-4">

        {/* Top Summary Card */}
        <section className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#2A2A2A] shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-mono text-xs uppercase text-gray-400 tracking-widest">Base Metrics</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">
              <Droplet size={12} fill="currentColor" /> O+
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[10px] text-gray-500 uppercase mb-1.5">Allergies</p>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emergency/10 border border-emergency/30 text-emergency font-bold font-dm text-sm w-max">
                <AlertTriangle size={14} /> Penicillin
              </div>
            </div>
            
            <div>
              <p className="font-mono text-[10px] text-gray-500 uppercase mb-1.5">Chronic Conditions</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-gray-200 text-sm font-dm">Hypertension</span>
                <span className="px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-gray-200 text-sm font-dm">Type 2 Diabetes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Vitals Trend Section */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="font-mono text-xs uppercase text-gray-400 tracking-widest pl-1">Vitals Trend (7d)</h2>
            <button className="text-xs text-blue-400 font-dm">View All</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* BP Chart */}
            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#2A2A2A]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-red-400">SYS BP</span>
                <span className="font-bold font-syne text-lg">145</span>
              </div>
              <div className="h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bpData}>
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                    <Line type="monotone" dataKey="val" stroke="#E53935" strokeWidth={2} dot={false} isAnimationActive={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* HR Chart */}
            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#2A2A2A]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-blue-400">AVG HR</span>
                <span className="font-bold font-syne text-lg">88</span>
              </div>
              <div className="h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hrData}>
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                    <Line type="monotone" dataKey="val" stroke="#60A5FA" strokeWidth={2} dot={false} isAnimationActive={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Current Medications */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <h2 className="font-mono text-xs uppercase text-gray-400 tracking-widest pl-1">Current Medications</h2>
            <button className="text-xs bg-white/10 text-white px-2 py-1 rounded font-dm flex items-center gap-1 active:scale-95 transition-transform"><Plus size={12} /> Add</button>
          </div>
          
          <div className="space-y-2">
            {meds.map((drug) => (
              <button 
                key={drug} 
                onClick={() => fetchDrugInfo(drug)}
                className="w-full text-left bg-[#1A1A1A] hover:bg-[#252525] p-4 rounded-xl border border-[#2A2A2A] flex justify-between items-center transition-colors shadow-sm active:scale-[0.98] min-touch"
              >
                <div>
                  <h3 className="font-bold font-syne text-[15px]">{drug}</h3>
                  <p className="font-mono text-[10px] text-gray-500 mt-0.5">Tap for FDA Label Info</p>
                </div>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
            ))}
          </div>
        </section>

        {/* Past Visits */}
        <section>
          <h2 className="font-mono text-xs uppercase text-gray-400 tracking-widest pl-1 mb-3">Emergency History</h2>
          
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'none' }}>
            
            <div className="min-w-[240px] bg-[#1A1A1A] p-4 rounded-2xl border border-l-4 border-l-emergency border-y-[#2A2A2A] border-r-[#2A2A2A] shrink-0 snap-start">
              <p className="font-mono text-xs text-gray-500 mb-2">12 Jan 2025</p>
              <h3 className="font-bold font-syne text-sm text-red-200">Hypertensive Crisis</h3>
              <p className="font-dm text-xs text-gray-400 mt-2">Apollo Hospitals Tirupati</p>
            </div>
            
            <div className="min-w-[240px] bg-[#1A1A1A] p-4 rounded-2xl border border-l-4 border-l-moderate border-y-[#2A2A2A] border-r-[#2A2A2A] shrink-0 snap-start">
              <p className="font-mono text-xs text-gray-500 mb-2">04 Oct 2024</p>
              <h3 className="font-bold font-syne text-sm text-yellow-200">Hyperglycemia</h3>
              <p className="font-dm text-xs text-gray-400 mt-2">SVR Ruia Government Hospital</p>
            </div>

          </div>
        </section>

      </div>

      {/* Slide-Up Bottom Sheet Modal for FDA Drug Info */}
      {activeDrug && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setActiveDrug(null)}></div>
          <div className="fixed bottom-0 left-0 w-full bg-[#1A1A1A] rounded-t-3xl border-t border-[#2A2A2A] z-50 p-6 flex flex-col max-h-[80vh] animate-fade-up">
            <div className="w-12 h-1.5 bg-[#2A2A2A] rounded-full mx-auto mb-5"></div>
            
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold font-syne text-white">{activeDrug}</h2>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">FDA OPENFDA</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
              {loadingDrug ? (
                <div className="py-10 text-center animate-pulse text-gray-500 font-mono text-sm">
                  Fetching dataset from api.fda.gov ...
                </div>
              ) : drugInfo?.error ? (
                <div className="py-10 text-center text-red-400 font-mono text-sm border border-red-500/20 bg-red-500/5 rounded-xl">
                  {drugInfo.error}
                </div>
              ) : drugInfo ? (
                <>
                  <div>
                    <h3 className="font-bold font-dm text-sm text-gray-300 mb-1 flex items-center gap-1.5"><Activity size={14}/> Purpose & Usage</h3>
                    <p className="text-xs text-gray-400 font-dm leading-relaxed">
                      {drugInfo.indications_and_usage?.substring(0, 300)}...
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold font-dm text-sm text-red-300 mb-1 flex items-center gap-1.5"><AlertTriangle size={14}/> Boxed Warnings</h3>
                    <p className="text-xs text-red-200/80 font-dm leading-relaxed bg-red-900/10 p-3 rounded-lg border border-red-900/30">
                      {drugInfo.warnings ? drugInfo.warnings.substring(0, 300) + '...' : 'No extreme boxed warnings returned.'}
                    </p>
                  </div>

                  <div>
                     <h3 className="font-bold font-dm text-sm text-moderate mb-1 flex items-center gap-1.5"><User size={14}/> Common Side Effects</h3>
                    <p className="text-xs text-gray-400 font-dm leading-relaxed">
                      {drugInfo.adverse_reactions?.substring(0, 300)}...
                    </p>
                  </div>
                </>
              ) : null}
            </div>
            
            <button 
              onClick={() => setActiveDrug(null)}
              className="mt-6 w-full bg-[#2A2A2A] text-white py-4 rounded-xl font-bold font-syne active:scale-95 transition-transform"
            >
              Close
            </button>
          </div>
        </>
      )}

    </div>
  )
}
