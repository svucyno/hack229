import { useState } from 'react'
import Home from './screens/Home'
import EmergencyInput from './screens/EmergencyInput'
import TriageResult from './screens/TriageResult'
import HospitalSelect from './screens/HospitalSelect'

/**
 * App state machine:
 *  'home' → 'input' → 'triage' → 'hospital' → 'navigate' (Phase 2)
 *
 * emergencyState holds all data flowing between screens.
 */
export default function App() {
  const [screen, setScreen] = useState('home')
  const [emergencyState, setEmergencyState] = useState({
    symptoms:       [],
    vitals:         { hr: 75, spo2: 98 },
    transcript:     '',
    wpm:            null,
    triageResult:   null,   // from /api/analyze_symptoms
    hospitals:      [],     // from /api/recommend
    selectedHospital: null,
    token:          null,
    emergencyId:    null,
    patientLat:     13.6289,  // Default: Tirupati
    patientLng:     79.4178,
  })

  const navigate = (nextScreen, updates = {}) => {
    setEmergencyState(prev => ({ ...prev, ...updates }))
    setScreen(nextScreen)
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden" style={{ background: '#0D0D0D' }}>
      {screen === 'home'     && <Home navigate={navigate} />}
      {screen === 'input'    && <EmergencyInput navigate={navigate} state={emergencyState} setState={setEmergencyState} />}
      {screen === 'triage'   && <TriageResult navigate={navigate} state={emergencyState} />}
      {screen === 'hospital' && <HospitalSelect navigate={navigate} state={emergencyState} setState={setEmergencyState} />}
    </div>
  )
}
