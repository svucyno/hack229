"""
ai/triage.py — AI Triage Engine (pure Python, no external ML)

Scoring pipeline:
  1. symptom_score  — weighted max from SYMPTOM_SEVERITY_MAP
  2. vitals_score   — HR + SpO2 deviations  
  3. voice_stress   — words-per-minute proxy
  4. final          — min(10, s*0.6 + v*0.2 + vs*0.2)
  5. severity       — CRITICAL ≥7.5 | MODERATE ≥4.0 | NORMAL <4.0
"""

from __future__ import annotations
from typing import List, Dict, Optional, Tuple

# ─────────────────────────────────────────
#  Symptom → severity score map
# ─────────────────────────────────────────
SYMPTOM_SEVERITY_MAP: Dict[str, float] = {
    "chest pain":                9.0,
    "chest pressure":            9.0,
    "heart attack":             10.0,
    "shortness of breath":       8.0,
    "can't breathe":             9.0,
    "breathlessness":            8.0,
    "stroke":                    9.0,
    "face drooping":             9.0,
    "arm weakness":              8.0,
    "stroke signs":              9.0,
    "unconscious":              10.0,
    "not breathing":            10.0,
    "no pulse":                 10.0,
    "severe bleeding":           9.0,
    "heavy bleeding":            8.0,
    "bleeding":                  7.0,
    "seizure":                   8.0,
    "convulsion":                8.0,
    "severe burn":               8.0,
    "burns":                     7.0,
    "chemical burn":             8.0,
    "high fever":                5.0,
    "fever above 104":           7.0,
    "fracture":                  6.0,
    "broken bone":               6.0,
    "severe headache":           7.0,
    "worst headache of life":    9.0,
    "allergic reaction":         7.0,
    "severe allergy":            7.0,
    "anaphylaxis":              10.0,
    "throat swelling":           9.0,
    "vomiting blood":            8.0,
    "abdominal pain":            5.0,
    "mild headache":             2.0,
    "fatigue":                   2.0,
    "cold":                      1.0,
    "other":                     3.0,
}

# ─────────────────────────────────────────
#  Condition detection from symptom combos
# ─────────────────────────────────────────
CONDITION_MAP: List[Tuple[frozenset, str, str]] = [
    (frozenset(["chest pain", "shortness of breath"]),    "Acute Coronary Syndrome",    "Cardiology"),
    (frozenset(["chest pain", "breathlessness"]),         "Acute Coronary Syndrome",    "Cardiology"),
    (frozenset(["chest pain", "left arm"]),               "Acute Coronary Syndrome",    "Cardiology"),
    (frozenset(["face drooping", "arm weakness"]),        "Stroke",                     "Neurology"),
    (frozenset(["stroke signs"]),                         "Stroke",                     "Neurology"),
    (frozenset(["unconscious", "not breathing"]),         "Cardiac Arrest",             "Cardiology"),
    (frozenset(["unconscious"]),                          "Neurological Emergency",      "Neurology"),
    (frozenset(["seizure"]),                              "Neurological Emergency",      "Neurology"),
    (frozenset(["severe bleeding"]),                      "Hemorrhagic Emergency",       "Trauma"),
    (frozenset(["bleeding"]),                             "Hemorrhagic Emergency",       "Trauma"),
    (frozenset(["throat swelling", "allergic reaction"]), "Anaphylaxis",                "General Medicine"),
    (frozenset(["severe allergy"]),                       "Severe Allergic Reaction",    "General Medicine"),
    (frozenset(["severe burn"]),                          "Burns Emergency",             "Trauma"),
    (frozenset(["burns"]),                                "Burns Emergency",             "Trauma"),
    (frozenset(["fracture"]),                             "Orthopedic Emergency",        "Orthopedics"),
    (frozenset(["abdominal pain"]),                       "Acute Abdomen",               "General Surgery"),
    (frozenset(["high fever"]),                           "Febrile Illness",             "General Medicine"),
    (frozenset(["vomiting blood"]),                       "GI Bleed",                    "General Medicine"),
]

# ─────────────────────────────────────────
#  Recommended actions by severity
# ─────────────────────────────────────────
ACTIONS = {
    "CRITICAL": "Immediate emergency transport required. Call 108 if not already done.",
    "MODERATE": "Proceed to emergency department. Avoid driving alone.",
    "NORMAL":   "Visit outpatient department or nearest clinic.",
}


def _calculate_symptom_score(symptoms: List[str]) -> Tuple[float, str, str]:
    """Return (max_score, detected_condition, required_specialty)."""
    symptoms_lower = [s.lower().strip() for s in symptoms]
    symptom_set = set(symptoms_lower)

    # Find condition match
    detected_condition = "General Emergency"
    required_specialty = "General Medicine"
    for required_keys, condition, specialty in CONDITION_MAP:
        if required_keys.issubset(symptom_set) or any(
            k in " ".join(symptoms_lower) for k in required_keys
        ):
            detected_condition = condition
            required_specialty = specialty
            break

    # Score: weighted average of matched symptoms (cap at 10)
    scores = []
    for sym in symptoms_lower:
        # Exact match
        if sym in SYMPTOM_SEVERITY_MAP:
            scores.append(SYMPTOM_SEVERITY_MAP[sym])
            continue
        # Partial match
        for key, val in SYMPTOM_SEVERITY_MAP.items():
            if key in sym or sym in key:
                scores.append(val)
                break

    if not scores:
        score = 3.0
    elif len(scores) == 1:
        score = scores[0]
    else:
        # Weighted: highest symptom dominates (60%), rest averaged (40%)
        scores_sorted = sorted(scores, reverse=True)
        score = scores_sorted[0] * 0.6 + (sum(scores_sorted[1:]) / len(scores_sorted[1:])) * 0.4

    return min(10.0, score), detected_condition, required_specialty


def _calculate_vitals_score(hr: Optional[float], spo2: Optional[float]) -> float:
    """Score vitals deviations. Returns additive score (0–7)."""
    score = 0.0
    if hr is not None:
        if hr > 130 or hr < 40:
            score += 3.0
        elif hr > 110 or hr < 55:
            score += 1.5
    if spo2 is not None:
        if spo2 < 90:
            score += 4.0
        elif spo2 < 94:
            score += 2.0
    return score


def _calculate_voice_stress(wpm: Optional[float]) -> float:
    """
    Estimate voice stress from words-per-minute.
    Normal speech ~130 WPM. Very fast (panicked) > 170 WPM gets higher score.
    Returns 0–10.
    """
    if wpm is None:
        return 5.0  # neutral default
    if wpm > 180:
        return 9.0
    if wpm > 160:
        return 7.0
    if wpm > 140:
        return 5.5
    if wpm > 110:
        return 4.0
    return 2.5  # slow / calm


def analyze(
    symptoms: List[str],
    hr: Optional[float] = None,
    spo2: Optional[float] = None,
    wpm: Optional[float] = None,
) -> dict:
    """
    Main entry point for the triage engine.

    Returns:
        {
            "severity": "CRITICAL" | "MODERATE" | "NORMAL",
            "priority_score": float (1–10),
            "confidence": float (0–100),
            "condition": str,
            "specialty": str,
            "symptom_score": float,
            "vitals_score": float,
            "voice_stress_score": float,
            "action": str,
            "symptoms_detected": List[str],
        }
    """
    symptom_score, condition, specialty = _calculate_symptom_score(symptoms)
    vitals_score  = _calculate_vitals_score(hr, spo2)
    voice_score   = _calculate_voice_stress(wpm)

    # Normalize vitals to 0–10 scale (max raw vitals = 7)
    vitals_norm = min(10.0, (vitals_score / 7.0) * 10.0) if vitals_score > 0 else 0.0

    final_score = min(10.0, symptom_score * 0.6 + vitals_norm * 0.2 + voice_score * 0.2)

    if final_score >= 7.5:
        severity = "CRITICAL"
    elif final_score >= 4.0:
        severity = "MODERATE"
    else:
        severity = "NORMAL"

    # Confidence: how many symptoms matched the map
    matched = sum(1 for s in symptoms if s.lower().strip() in SYMPTOM_SEVERITY_MAP)
    confidence = min(99, max(60, int((matched / max(len(symptoms), 1)) * 100)))

    return {
        "severity":            severity,
        "priority_score":      round(final_score, 2),
        "confidence":          confidence,
        "condition":           condition,
        "specialty":           specialty,
        "symptom_score":       round(symptom_score, 2),
        "vitals_score":        round(vitals_score, 2),
        "voice_stress_score":  round(voice_score, 2),
        "action":              ACTIONS[severity],
        "symptoms_detected":   symptoms,
    }
