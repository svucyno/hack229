import { useState } from "react"
import "./index.css"
import HomeScreen from "./screens/Home"
import EmergencyInputScreen from "./screens/EmergencyInput"
import TriageResultScreen from "./screens/TriageResult"
import HospitalSelectScreen from "./screens/HospitalSelect"
import NavigationScreen from "./screens/Navigation"
import ConfirmationScreen from "./screens/Confirmation"
import HealthRecordsScreen from "./screens/HealthRecords"
import FeedbackScreen from "./screens/Feedback"

export default function App() {
  const [screen, setScreen] = useState("home")
  const [triageData, setTriageData] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [token, setToken] = useState(null)
  const [toast, setToast] = useState(null)
  const [language, setLanguage] = useState(localStorage.getItem("medirush_lang") || "en")

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const go = (s) => setScreen(s)

  const updateLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem("medirush_lang", lang)
  }

  const ctx = {
    go, triageData, setTriageData,
    hospitals, setHospitals,
    selectedHospital, setSelectedHospital,
    token, setToken, showToast,
    language, updateLanguage
  }

  const screens = {
    home: <HomeScreen {...ctx} />,
    input: <EmergencyInputScreen {...ctx} />,
    triage: <TriageResultScreen {...ctx} />,
    hospitals: <HospitalSelectScreen {...ctx} />,
    navigation: <NavigationScreen {...ctx} />,
    confirmation: <ConfirmationScreen {...ctx} />,
    records: <HealthRecordsScreen {...ctx} />,
    feedback: <FeedbackScreen {...ctx} />,
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", maxWidth: 430, margin: "0 auto", overflow: "hidden", background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
      {/* FEATURE 13: LANGUAGE BANNER */}
      {language !== "en" && screen !== "home" && (
        <div style={{ background: "#FFF9C4", padding: "6px 12px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#827717", zIndex: 100 }}>
          Full {language === "te" ? "Telugu" : "Hindi"} support coming soon
        </div>
      )}
      
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {screens[screen]}
        {toast && <div className="toast" style={{ zIndex: 1000 }}>{toast}</div>}
      </div>
    </div>
  )
}