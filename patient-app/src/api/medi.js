// patient-app/src/api/medirush.js

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const WS_BASE = import.meta.env.VITE_WS_BASE || "ws://localhost:8000";

export const analyzeSymptoms = async ({ symptoms, vitals, transcript, wpm }) => {
  const res = await fetch(`${BASE}/api/analyze_symptoms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms, vitals, transcript, wpm }),
  });
  return res.json();
};

export const getHospitalRecommendations = async ({ lat, lng, condition, severity }) => {
  const res = await fetch(`${BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, condition, severity }),
  });
  return res.json();
};

export const notifyHospital = async ({ hospital_id, patient_data, condition, severity, priority_score, eta_seconds }) => {
  const res = await fetch(`${BASE}/api/notify_hospital`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hospital_id, patient_data, condition, severity, priority_score, eta_seconds }),
  });
  return res.json();
};

export const updateLocation = async (token, hospital_id, lat, lng) => {
  await fetch(`${BASE}/api/tracking/${token}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng, hospital_id }),
  });
};

export const getDrugInfo = async (drug_name) => {
  const res = await fetch(`${BASE}/api/drug_info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drug_name }),
  });
  return res.json();
};

export const connectPatientSocket = (token, onMessage) => {
  const ws = new WebSocket(`${WS_BASE}/ws/patient/${token}`);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  return ws;
};

export const connectHospitalSocket = (hospital_id, onMessage) => {
  const ws = new WebSocket(`${WS_BASE}/ws/hospital/${hospital_id}`);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  return ws;
};