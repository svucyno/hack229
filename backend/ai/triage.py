# backend/ai/triage.py

SYMPTOM_SEVERITY_MAP = {
    "chest pain": 9, "chest pressure": 9, "heart attack": 10,
    "shortness of breath": 8, "can't breathe": 9,
    "stroke": 9, "face drooping": 9, "arm weakness": 8,
    "unconscious": 10, "not breathing": 10, "no pulse": 10,
    "severe bleeding": 9, "heavy bleeding": 8,
    "seizure": 8, "convulsion": 8,
    "severe burn": 8, "chemical burn": 8,
    "high fever": 5, "fever above 104": 7,
    "fracture": 6, "broken bone": 6,
    "severe headache": 7, "worst headache of life": 9,
    "allergic reaction": 7, "anaphylaxis": 10, "throat swelling": 9,
    "vomiting blood": 8, "abdominal pain": 5,
    "mild headache": 2, "fatigue": 2, "cold": 1,
}

CONDITION_MAP = {
    frozenset(["chest pain", "shortness of breath", "left arm"]): "Acute Coronary Syndrome",
    frozenset(["face drooping", "arm weakness", "speech"]): "Stroke",
    frozenset(["unconscious", "not breathing"]): "Cardiac Arrest",
    frozenset(["seizure"]): "Neurological Emergency",
    frozenset(["severe bleeding"]): "Hemorrhagic Emergency",
    frozenset(["throat swelling", "allergic"]): "Anaphylaxis",
}

def score_symptoms(symptoms: list[str]) -> float:
    scores = [SYMPTOM_SEVERITY_MAP.get(s.lower(), 1) for s in symptoms]
    return max(scores) if scores else 1

def score_vitals(hr: int, spo2: int) -> float:
    score = 0
    if hr > 130 or hr < 40:
        score += 3
    if spo2 < 90:
        score += 4
    elif spo2 < 94:
        score += 2
    return score

def detect_condition(symptoms: list[str]) -> str:
    lower = [s.lower() for s in symptoms]
    for key_set, condition in CONDITION_MAP.items():
        if any(k in " ".join(lower) for k in key_set):
            return condition
    return "General Emergency"

def classify(symptom_score, vitals_score, voice_stress=0):
    final = min(10, symptom_score * 0.6 + vitals_score * 0.2 + voice_stress * 0.2)
    if final >= 7.5:
        return "CRITICAL", round(final, 1)
    if final >= 4.0:
        return "MODERATE", round(final, 1)
    return "NORMAL", round(final, 1)

def analyze(symptoms: list, hr: int = 75, spo2: int = 98,
            transcript: str = "", wpm: int = 130):
    sym_score = score_symptoms(symptoms)
    vit_score = score_vitals(hr, spo2)
    # Voice stress: fast speech = higher stress (normal WPM is 130)
    stress = min(10, max(0, (wpm - 130) / 20)) if wpm > 130 else 0
    severity, score = classify(sym_score, vit_score, stress)
    condition = detect_condition(symptoms)
    confidence = min(99, int(75 + score * 2.5))
    actions = {
        "CRITICAL": "Seek emergency care immediately. Call ambulance 108.",
        "MODERATE": "Go to the nearest hospital urgently.",
        "NORMAL": "Visit a clinic or GP when available.",
    }
    return {
        "severity": severity,
        "score": score,
        "confidence": confidence,
        "condition": condition,
        "action": actions[severity],
    }