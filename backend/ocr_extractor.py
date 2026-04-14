import os
import re
from datetime import datetime
from typing import Dict, List, Tuple

# Safe imports — app works even if OCR libraries are not installed
try:
    import fitz
    FITZ_OK = True
except ImportError:
    FITZ_OK = False

try:
    from PIL import Image
    import pytesseract
    TESSERACT_OK = True
except ImportError:
    TESSERACT_OK = False

HEAD_ACTIVITY_KEYWORDS = {
    "Sports & Games Participation": {
        "Sports": ["football", "cricket", "athletics", "badminton", "volleyball", "basketball", "sports"],
        "Games":  ["chess", "carrom", "game", "games"],
    },
    "Cultural Activities Participation": {
        "Music":           ["music", "singing", "instrumental", "band"],
        "Performing arts": ["dance", "drama", "theatre", "performing", "mime"],
        "Literary arts":   ["essay", "debate", "quiz", "poem", "literary", "elocution"],
    },
    "Professional Self Initiatives": {
    "Tech Fest / Tech Quiz": ["hackathon", "tech fest", "tech quiz", "coding", "debugging", "project expo"],
    "MOOC with final assessment certificate": ["coursera", "udemy", "nptel", "mooc", "certified course", "online course"],
    "Competitions by Professional Societies (IEEE/IET/ASME/SAE/NASA etc.)": ["ieee competition", "iet competition", "asme", "sae", "nasa"],
    "Full time Conference/Seminar/Exhibition/Workshop (IIT/NIT)": ["iit", "nit"],
    "Paper presentation/publication (IIT/NIT)": ["paper presentation", "paper publication", "publication"],
    "Poster presentation (IIT/NIT)": ["poster presentation", "poster"],
    "Industrial Training/Internship (>=5 full days)": ["internship", "industrial training", "in-plant training"],
    "Industrial/Exhibition visits": ["industrial visit", "industry visit", "exhibition visit"],
    "Foreign Language Skill (TOEFL/IELTS/BEC etc.)": ["ielts", "toefl", "bec", "language skill"],
    "Workshop / Seminar Participation": ["workshop", "seminar", "webinar", "participation", "certificate of appreciation", "h2oforge"],
},
    "Entrepreneurship and Innovation": {
        "Start-up Company (Registered legally)": ["startup", "start-up company"],
        "Patent - Filed":     ["patent filed"],
        "Patent - Published": ["patent published"],
        "Patent - Approved":  ["patent approved"],
        "Patent - Licensed":  ["patent licensed"],
        "Prototype developed and tested": ["prototype"],
        "Awards for products developed":  ["product award", "awards for products"],
        "Innovative technologies developed and used by industries/users": ["innovative technology"],
        "Venture capital funding for innovative ideas/products": ["venture capital"],
        "Startup Employment (Offering jobs >=2 persons >=15000/month)": ["startup employment"],
        "Societal innovations": ["societal innovation"],
    },
    "Leadership & Management": {
        "Student Professional Societies (IEEE/IET/ASME/SAE/NASA etc.)": ["coordinator", "volunteer", "student professional society", "ieee", "iet"],
        "College Association Chapters (Mech/Civil/EEE etc.)": ["association chapter"],
        "Festival & Technical Events (College approved)": ["festival", "technical event"],
        "Hobby Clubs": ["club", "hobby club"],
        "Special Initiatives (College & University approval mandatory)": ["special initiative"],
    },
    "National Initiatives Participation": {
        "NCC": ["ncc", "national cadet corps"],
        "NSS": ["nss", "national service scheme"],
    },
}

LEVEL_KEYWORDS = {
    "I":   ["college level", "intra college"],
    "II":  ["zonal", "zone", "inter college"],
    "III": ["state level", "state"],
    "IV":  ["national level", "national"],
    "V":   ["international level", "international"],
}

PRIZE_KEYWORDS = {
    "First Prize":  ["first prize", "1st prize", "winner", "first place", "gold medal"],
    "Second Prize": ["second prize", "2nd prize", "runner up", "second place", "silver medal"],
    "Third Prize":  ["third prize", "3rd prize", "third place", "bronze medal"],
}

ROLE_KEYWORDS = {
    "Core coordinator": ["core coordinator"],
    "Sub coordinator":  ["sub coordinator"],
    "Volunteer":        ["volunteer"],
}


def extract_text_from_image(image_path: str) -> str:
    if not TESSERACT_OK:
        return ""
    try:
        image = Image.open(image_path)
        return pytesseract.image_to_string(image)
    except Exception:
        return ""


def extract_text_from_pdf(pdf_path: str) -> str:
    if not FITZ_OK:
        return ""
    text_parts = []
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            page_text = page.get_text("text")
            if page_text and page_text.strip():
                text_parts.append(page_text)
            elif TESSERACT_OK:
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                temp_path = pdf_path + "_page.png"
                pix.save(temp_path)
                try:
                    text_parts.append(extract_text_from_image(temp_path))
                finally:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
    except Exception:
        pass
    return "\n".join(text_parts)


def detect_best_activity(text: str) -> tuple:
    lower = text.lower()
    best_head, best_activity, best_score = "", "", 0
    for head, activities in HEAD_ACTIVITY_KEYWORDS.items():
        for activity, keywords in activities.items():
            score = sum(1 for kw in keywords if kw in lower)
            if score > best_score:
                best_head, best_activity, best_score = head, activity, score
    # If no confident match (score too low), return empty so classify_certificate() takes over
    if best_score < 2:
        return "", ""
    return best_head, best_activity


def detect_level(text: str) -> str:
    lower = text.lower()
    for level, keywords in LEVEL_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return level
    return ""


def detect_prize(text: str) -> str:
    lower = text.lower()
    for prize, keywords in PRIZE_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return prize
    return ""


def detect_role(text: str) -> str:
    lower = text.lower()
    for role, keywords in ROLE_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return role
    return ""


def detect_event_name(text: str) -> str:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for line in lines[:10]:
        if 4 < len(line) < 120 and not re.search(
            r"certificate|participation|awarded|presented to|this is to", line.lower()
        ):
            return line
    return lines[0] if lines else ""


def detect_date(text: str) -> str:
    patterns = [
        r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
        r"\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b",
        r"\b[A-Za-z]+\s+\d{1,2},\s+\d{4}\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            value = match.group(0)
            for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y", "%d-%m-%y",
                        "%d %B %Y", "%B %d, %Y"):
                try:
                    return datetime.strptime(value, fmt).date().isoformat()
                except ValueError:
                    continue
            return value
    return ""


def extract(filepath: str) -> dict:
    """Always returns a dict, never raises — safe to call from Flask route."""
    try:
        ext = os.path.splitext(filepath)[1].lower()
        raw_text = extract_text_from_pdf(filepath) if ext == ".pdf" else extract_text_from_image(filepath)
        raw_text = raw_text or ""
    except Exception:
        raw_text = ""

    try:
        head, activity = detect_best_activity(raw_text)
    except Exception:
        head, activity = "", ""

    return {
        "raw_text":   raw_text[:10000],
        "clean_text": re.sub(r"\s+", " ", raw_text).strip()[:3000],
        "event_name": detect_event_name(raw_text),
        "head":       head,
        "activity":   activity,
        "level":      detect_level(raw_text),
        "prize":      detect_prize(raw_text),
        "role":       detect_role(raw_text),
        "event_date": detect_date(raw_text),
    }