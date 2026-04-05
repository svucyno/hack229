"""
seed_hospitals.py — Seeds the hospitals table from hospitals.json.
Run directly: python -m backend.data.seed_hospitals
Or called automatically by main.py on startup if DB is empty.
"""

import json
import os
from datetime import datetime

# ── Dynamic bed occupancy based on time-of-day ──────────────────────────────
def get_dynamic_beds_occupied(beds_total: int) -> int:
    """
    Simulate realistic occupancy:
    - Peak hours (8–10 AM, 5–9 PM): 60–90% occupied
    - Off-peak: 40–60% occupied
    """
    hour = datetime.now().hour
    if 8 <= hour <= 10 or 17 <= hour <= 21:
        ratio = 0.60 + (hour % 4) * 0.075   # 60–90%
    else:
        ratio = 0.40 + (hour % 6) * 0.033   # 40–60%
    ratio = min(ratio, 0.92)
    return int(beds_total * ratio)


def seed(db_session):
    from database import Hospital  # local import to avoid circular deps

    json_path = os.path.join(os.path.dirname(__file__), "hospitals.json")
    with open(json_path, "r") as f:
        hospitals_data = json.load(f)

    existing = db_session.query(Hospital).count()
    if existing > 0:
        print(f"[seed] {existing} hospitals already in DB — skipping seed.")
        return

    for h in hospitals_data:
        beds_total = h["beds_total"]
        hospital = Hospital(
            id              = h["id"],
            name            = h["name"],
            address         = h["address"],
            city            = h["city"],
            state           = h["state"],
            lat             = h["lat"],
            lng             = h["lng"],
            phone           = h["phone"],
            type            = h["type"],
            specializations = json.dumps(h["specializations"]),
            beds_total      = beds_total,
            beds_occupied   = get_dynamic_beds_occupied(beds_total),
            emergency_bay   = h["emergency_bay"],
            icu_beds        = h["icu_beds"],
            rating          = h["rating"],
        )
        db_session.add(hospital)

    db_session.commit()
    print(f"[seed] Seeded {len(hospitals_data)} hospitals successfully.")


if __name__ == "__main__":
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from database import SessionLocal, init_db
    init_db()
    db = SessionLocal()
    seed(db)
    db.close()
