RULES = {
    "Sports & Games Participation": {
        "activities": {
            "Sports": {"type": "LEVEL", "pointsByLevel": {"I": 8, "II": 15, "III": 25, "IV": 40, "V": 60}, "max": 60, "hasPrize": True},
            "Games":  {"type": "LEVEL", "pointsByLevel": {"I": 8, "II": 15, "III": 25, "IV": 40, "V": 60}, "max": 60, "hasPrize": True},
        },
        "prizeBonus": {
            "First Prize":  {"I": 10, "II": 10, "III": 10, "IV": 20, "V": 20},
            "Second Prize": {"I": 8,  "II": 8,  "III": 8,  "IV": 16, "V": 16},
            "Third Prize":  {"I": 5,  "II": 5,  "III": 5,  "IV": 12, "V": 12},
        },
        "winningCapEnhanceLevels": ["IV", "V"],
        "winningEnhancedMax": 80,
    },
    "Cultural Activities Participation": {
        "activities": {
            "Music":           {"type": "LEVEL", "pointsByLevel": {"I": 8, "II": 12, "III": 20, "IV": 40, "V": 60}, "max": 60, "hasPrize": True},
            "Performing arts": {"type": "LEVEL", "pointsByLevel": {"I": 8, "II": 12, "III": 20, "IV": 40, "V": 60}, "max": 60, "hasPrize": True},
            "Literary arts":   {"type": "LEVEL", "pointsByLevel": {"I": 8, "II": 12, "III": 20, "IV": 40, "V": 60}, "max": 60, "hasPrize": True},
        },
        "prizeBonus": {
            "First Prize":  {"I": 10, "II": 10, "III": 10, "IV": 20, "V": 20},
            "Second Prize": {"I": 8,  "II": 8,  "III": 8,  "IV": 16, "V": 16},
            "Third Prize":  {"I": 5,  "II": 5,  "III": 5,  "IV": 12, "V": 12},
        },
        "winningCapEnhanceLevels": ["IV", "V"],
        "winningEnhancedMax": 80,
    },
    "Professional Self Initiatives": {
        "activities": {
            "Tech Fest / Tech Quiz":                                                {"type": "LEVEL", "pointsByLevel": {"I": 10, "II": 20, "III": 30, "IV": 40, "V": 50}, "max": 50},
            "MOOC with final assessment certificate":                               {"type": "FIXED", "points": 50, "max": 50},
            "Competitions by Professional Societies (IEEE/IET/ASME/SAE/NASA etc.)": {"type": "LEVEL", "pointsByLevel": {"I": 10, "II": 15, "III": 20, "IV": 30, "V": 40}, "max": 40},
            "Full time Conference/Seminar/Exhibition/Workshop (IIT/NIT)":           {"type": "FIXED", "points": 20, "max": 40},
            "Paper presentation/publication (IIT/NIT)":                             {"type": "FIXED", "points": 30, "max": 40},
            "Poster presentation (IIT/NIT)":                                        {"type": "FIXED", "points": 20, "max": 30},
            "Industrial Training/Internship (>=5 full days)":                       {"type": "FIXED", "points": 20, "max": 20},
            "Industrial/Exhibition visits":                                          {"type": "FIXED", "points": 5,  "max": 10},
            "Foreign Language Skill (TOEFL/IELTS/BEC etc.)":                       {"type": "FIXED", "points": 50, "max": 50},
            "Workshop / Seminar Participation":                                      {"type": "FIXED", "points": 10, "max": 20},
        },
    },
    "Entrepreneurship and Innovation": {
        "activities": {
            "Start-up Company (Registered legally)":                              {"type": "FIXED", "points": 60, "max": 60},
            "Patent - Filed":                                                     {"type": "FIXED", "points": 30, "max": 60},
            "Patent - Published":                                                 {"type": "FIXED", "points": 35, "max": 60},
            "Patent - Approved":                                                  {"type": "FIXED", "points": 50, "max": 60},
            "Patent - Licensed":                                                  {"type": "FIXED", "points": 80, "max": 80},
            "Prototype developed and tested":                                     {"type": "FIXED", "points": 60, "max": 60},
            "Awards for products developed":                                      {"type": "FIXED", "points": 60, "max": 60},
            "Innovative technologies developed and used by industries/users":     {"type": "FIXED", "points": 60, "max": 60},
            "Venture capital funding for innovative ideas/products":              {"type": "FIXED", "points": 80, "max": 80},
            "Startup Employment (Offering jobs >=2 persons >=15000/month)":      {"type": "FIXED", "points": 80, "max": 80},
            "Societal innovations":                                               {"type": "FIXED", "points": 50, "max": 50},
        },
    },
    "Leadership & Management": {
        "activities": {
            "Student Professional Societies (IEEE/IET/ASME/SAE/NASA etc.)": {"type": "ROLE", "pointsByRole": {"Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5}, "max": 40},
            "College Association Chapters (Mech/Civil/EEE etc.)":           {"type": "ROLE", "pointsByRole": {"Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5}, "max": 40},
            "Festival & Technical Events (College approved)":               {"type": "ROLE", "pointsByRole": {"Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5}, "max": 40},
            "Hobby Clubs":                                                  {"type": "ROLE", "pointsByRole": {"Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5}, "max": 40},
            "Special Initiatives (College & University approval mandatory)": {"type": "ROLE", "pointsByRole": {"Core coordinator": 15, "Sub coordinator": 10, "Volunteer": 5}, "max": 40},
        },
    },
    "National Initiatives Participation": {
        "activities": {
            "NCC":                 {"type": "FIXED", "points": 60, "max": 60},
            "NSS":                 {"type": "FIXED", "points": 60, "max": 60},
            "NSS Activities":      {"type": "FIXED", "points": 30, "max": 30},
            "Swachh Bharat":       {"type": "FIXED", "points": 30, "max": 30},
            "Blood Donation Camp": {"type": "FIXED", "points": 20, "max": 20},
        },
    },
}


def calculate_points(head, activity, level="", prize="", role=""):
    head_rule = RULES.get(head)
    if not head_rule:
        return {"points": 0, "max": 0, "reason": "Invalid activity head"}

    activity_rule = head_rule.get("activities", {}).get(activity)
    if not activity_rule:
        return {"points": 0, "max": 0, "reason": "Invalid activity"}

    base = 0
    max_points = activity_rule.get("max", 0)
    reasons = []

    if activity_rule["type"] == "FIXED":
        base = activity_rule.get("points", 0)
        reasons.append(f"Fixed points: {base}")

    elif activity_rule["type"] == "LEVEL":
        if not level:
            return {"points": 0, "max": max_points, "reason": "Select a level"}
        base = activity_rule.get("pointsByLevel", {}).get(level, 0)
        reasons.append(f"Level {level} base: {base}")
        if activity_rule.get("hasPrize") and prize:
            bonus_map = head_rule.get("prizeBonus", {}).get(prize)
            if bonus_map and level in bonus_map:
                bonus = bonus_map[level]
                base += bonus
                reasons.append(f"{prize} bonus (Level {level}): +{bonus}")
                if level in head_rule.get("winningCapEnhanceLevels", []):
                    max_points = max(max_points, head_rule.get("winningEnhancedMax", max_points))
                    reasons.append(f"Winning at Level {level} allows max up to {max_points}")

    elif activity_rule["type"] == "ROLE":
        if not role:
            return {"points": 0, "max": max_points, "reason": "Select a role"}
        base = activity_rule.get("pointsByRole", {}).get(role, 0)
        reasons.append(f"Role '{role}' points: {base}")

    final_points = min(base, max_points)
    if final_points != base:
        reasons.append(f"Capped to max {max_points}")
    return {"points": final_points, "max": max_points, "reason": " | ".join(reasons)}


# ── Certificate Classification ─────────────────────────────────────────────

# ── Certificate Classification ─────────────────────────────────────────────

CERTIFICATE_KEYWORDS = [
    # --- Workshop / Seminar (checked FIRST — more specific phrases first) ---
    ("underwater robotics",         {"activity_head": "Professional Self Initiatives", "activity": "Workshop / Seminar Participation"}),
    ("robotics workshop",           {"activity_head": "Professional Self Initiatives", "activity": "Workshop / Seminar Participation"}),
    ("h2oforge",                    {"activity_head": "Professional Self Initiatives", "activity": "Workshop / Seminar Participation"}),
    ("certificate of appreciation", {"activity_head": "Professional Self Initiatives", "activity": "Workshop / Seminar Participation"}),
    ("workshop",                    {"activity_head": "Professional Self Initiatives", "activity": "Workshop / Seminar Participation"}),
    ("seminar",                     {"activity_head": "Professional Self Initiatives", "activity": "Workshop / Seminar Participation"}),
    ("webinar",                     {"activity_head": "Professional Self Initiatives", "activity": "Workshop / Seminar Participation"}),
    ("participation",               {"activity_head": "Professional Self Initiatives", "activity": "Workshop / Seminar Participation"}),

    # --- MOOC ---
    ("mooc",                        {"activity_head": "Professional Self Initiatives", "activity": "MOOC with final assessment certificate"}),
    ("coursera",                    {"activity_head": "Professional Self Initiatives", "activity": "MOOC with final assessment certificate"}),
    ("udemy",                       {"activity_head": "Professional Self Initiatives", "activity": "MOOC with final assessment certificate"}),
    ("nptel",                       {"activity_head": "Professional Self Initiatives", "activity": "MOOC with final assessment certificate"}),

    # --- Internship ---
    ("internship",                  {"activity_head": "Professional Self Initiatives", "activity": "Industrial Training/Internship (>=5 full days)"}),
    ("industrial training",         {"activity_head": "Professional Self Initiatives", "activity": "Industrial Training/Internship (>=5 full days)"}),

    # --- National Initiatives ---
    ("blood donation",              {"activity_head": "National Initiatives Participation", "activity": "Blood Donation Camp"}),
    ("donated blood",               {"activity_head": "National Initiatives Participation", "activity": "Blood Donation Camp"}),
    ("ksbtc",                       {"activity_head": "National Initiatives Participation", "activity": "Blood Donation Camp"}),
    ("kerala state blood",          {"activity_head": "National Initiatives Participation", "activity": "Blood Donation Camp"}),
    ("swachh bharat",               {"activity_head": "National Initiatives Participation", "activity": "Swachh Bharat"}),
    ("nss",                         {"activity_head": "National Initiatives Participation", "activity": "NSS Activities"}),
]

def classify_certificate(ocr_text: str) -> dict:
    text_lower = ocr_text.lower()
    for keyword, classification in CERTIFICATE_KEYWORDS:
        if keyword in text_lower:
            return classification
    return {"activity_head": "", "activity": ""}  # fallback → user fills manually

def classify_certificate(ocr_text: str) -> dict:
    text_lower = ocr_text.lower()
    for keyword, classification in CERTIFICATE_KEYWORDS:
        if keyword in text_lower:
            return classification
    return {"activity_head": "", "activity": ""}  # fallback → user fills manually