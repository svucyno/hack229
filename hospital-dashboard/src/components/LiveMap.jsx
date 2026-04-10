import React, { useEffect, useState, useRef } from 'react';

const API_BASE_WS = import.meta.env.VITE_WS_BASE || 'ws://localhost:8000';

// MISSION CONTROL MAP STYLE: Deep Black & Neon Red
const MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#333333" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#111111" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#0d0d0d" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#111111" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#1a1a1a" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#FF3131" }, { "weight": 0.1 }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#050505" }] }
];

export default function LiveMap({ patient }) {
  const [location, setLocation] = useState(null);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const patientMarker = useRef(null);
  const hospitalMarker = useRef(null);
  const directionsRenderer = useRef(null);

  // WebSocket for real-time tracking
  useEffect(() => {
    setLocation(null);
    if (!patient?.token) return;
    const ws = new WebSocket(`${API_BASE_WS}/ws/tracking/${patient.token}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'LOCATION_UPDATE') {
        setLocation({ lat: data.lat, lng: data.lng });
      }
    };
    return () => ws.close();
  }, [patient?.token]);

  // Initialize Map
  useEffect(() => {
    if (!window.google || !mapRef.current) {
      setMapError(true);
      return;
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 13.6288, lng: 79.4192 },
      zoom: 14,
      styles: MAP_STYLE,
      disableDefaultUI: true,
      backgroundColor: '#000000'
    });

    googleMap.current = map;
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      map,
      preserveViewport: true,
      polylineOptions: { strokeColor: '#FF3131', strokeOpacity: 0.6, strokeWeight: 4 }
    });

    // Static Hospital Marker
    hospitalMarker.current = new window.google.maps.Marker({
      position: { lat: 13.6213, lng: 79.4091 },
      map,
      label: { text: "🏥", fontSize: "20px" },
      title: "CENTRAL TRIAGE"
    });

    return () => {
      if (googleMap.current) googleMap.current = null;
    };
  }, []);

  // Update markers and route
  useEffect(() => {
    if (!googleMap.current || !location) return;

    // Update or Create Patient Marker
    if (patientMarker.current) {
      patientMarker.current.setPosition(location);
    } else {
      patientMarker.current = new window.google.maps.Marker({
        position: location,
        map: googleMap.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#FFFFFF",
          fillOpacity: 1,
          strokeColor: "#FF3131",
          strokeWeight: 2,
        },
        title: patient.name
      });
    }

    // Auto-fit bounds
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(location);
    bounds.extend({ lat: 13.6213, lng: 79.4091 });
    googleMap.current.fitBounds(bounds, 50);

  }, [location]);

  if (!patient) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black text-white/20 font-black font-syne text-[10px] tracking-[0.4em] uppercase">
        SYSTEM IDLE • NO ACTIVE TRACKING
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden font-inter">
      {/* REAL GOOGLE MAP CONTAINER */}
      <div ref={mapRef} className="absolute inset-0 z-0" />
      
      {/* OVERLAY MISSION CONTROL INTERFACE */}
      {mapError && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center p-12 text-center">
          <div>
            <div className="w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3131" strokeWidth="2"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/></svg>
            </div>
            <h3 className="text-xl font-black font-syne text-white uppercase mb-2">GEOSPATIAL OFFLINE</h3>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest max-w-xs">Mission critical mapping requires a valid Google Maps API Key. Please verify VITE_GOOGLE_MAPS_API_KEY in system protocols.</p>
          </div>
        </div>
      )}

      {/* Map Control Bar */}
      <div className="absolute bottom-5 left-5 right-5 h-16 glass-panel border border-white/5 rounded-2xl flex items-center justify-between px-6 shadow-2xl overflow-hidden group z-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/30 to-transparent"></div>
        
        <div className="flex gap-8 items-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-black font-syne text-white/20 uppercase tracking-[0.2em] mb-1">INTERCEPT STATUS</span>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${location ? "bg-emerald-500 shadow-[0_0_8px_#10B981]" : "bg-red-500 animate-pulse"}`}></div>
              <span className="text-[10px] font-black font-syne text-white/80 uppercase tracking-widest">{location ? "SIGNAL LOCKED" : "ACQUIRING..."}</span>
            </div>
          </div>
          
          <div className="w-px h-8 bg-white/10"></div>
          
          <div className="flex flex-col">
            <span className="text-[9px] font-black font-syne text-white/20 uppercase tracking-[0.2em] mb-1">CHRONO INDEX</span>
            <span className="text-xl font-black font-syne text-red-500 italic tracking-tighter leading-none">
              {Math.floor(patient.eta_seconds / 60)}<span className="text-xs ml-0.5">M</span> {(patient.eta_seconds % 60).toString().padStart(2,'0')}<span className="text-xs ml-0.5">S</span>
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] font-black font-syne text-white/20 uppercase tracking-[0.2em] mb-1">LAST TELEMETRY</span>
          <p className="text-[10px] font-bold font-mono text-white/40 uppercase">{new Date().toLocaleTimeString()} UTC</p>
        </div>
      </div>
    </div>
  );
}
