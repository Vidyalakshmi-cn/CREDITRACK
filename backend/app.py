
import json
import threading
import uuid
import os
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime, date
from contextlib import contextmanager
from rules import calculate_points, classify_certificate
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector

import ocr_extractor
import rules

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}

DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "port": int(os.getenv("MYSQL_PORT", "3306")),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD"),
    "database": os.getenv("MYSQL_DATABASE", "credi"),
    "ssl_disabled": False,
}

@contextmanager
def get_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor(dictionary=True)
    try:
        yield conn, cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def row_to_dict(row):
    if row is None:
        return None
    result = {}
    for key, value in row.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, date):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result

def parse_json():
    return request.get_json(silent=True) or {}

@app.route("/signup-student", methods=["POST"])
def signup_student():
    data = parse_json()
    required = ["name", "email", "password", "rollno", "course", "branch", "division", "semester"]
    for field in required:
        if not str(data.get(field, "")).strip():
            return jsonify({"success": False, "message": f"Missing field: {field}"}), 400

    with get_db() as (_, cur):
        cur.execute("SELECT id FROM students WHERE email = %s", (data["email"],))
        if cur.fetchone():
            return jsonify({"success": False, "message": "Email already registered"}), 409

        cur.execute(
            """
            INSERT INTO students (name, email, password, rollno, course, branch, division, semester)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data["name"], data["email"], generate_password_hash(data["password"]),
                data["rollno"], data["course"], data["branch"], data["division"],
                data["semester"]
            )
        )
        new_id = cur.lastrowid
        cur.execute("SELECT id, name, email, rollno, course, branch, division, semester FROM students WHERE id = %s", (new_id,))
        student = row_to_dict(cur.fetchone())
    return jsonify({"success": True, "student": student}), 201

@app.route("/login-student", methods=["POST"])
def login_student():
    data = parse_json()
    email = str(data.get("email", "")).strip()
    password = str(data.get("password", "")).strip()

    with get_db() as (_, cur):
        cur.execute("SELECT * FROM students WHERE email = %s", (email,))
        student = cur.fetchone()

    if not student or not check_password_hash(student["password"], password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    student = row_to_dict(student)
    student.pop("password", None)
    return jsonify({"success": True, "student": student})

@app.route("/signup-faculty", methods=["POST"])
def signup_faculty():
    data = parse_json()
    for field in ["name", "email", "password"]:
        if not str(data.get(field, "")).strip():
            return jsonify({"success": False, "message": f"Missing field: {field}"}), 400

    with get_db() as (_, cur):
        cur.execute("SELECT id FROM faculty WHERE email = %s", (data["email"],))
        if cur.fetchone():
            return jsonify({"success": False, "message": "Email already registered"}), 409

        cur.execute("INSERT INTO faculty (name, email, password) VALUES (%s, %s, %s)", (data["name"], data["email"], generate_password_hash(data["password"])))
        new_id = cur.lastrowid
        cur.execute("SELECT id, name, email FROM faculty WHERE id = %s", (new_id,))
        faculty = row_to_dict(cur.fetchone())
    return jsonify({"success": True, "faculty": faculty}), 201

@app.route("/login-faculty", methods=["POST"])
def login_faculty():
    data = parse_json()
    email = str(data.get("email", "")).strip()
    password = str(data.get("password", "")).strip()

    with get_db() as (_, cur):
        cur.execute("SELECT * FROM faculty WHERE email = %s", (email,))
        faculty = cur.fetchone()

    if not faculty or not check_password_hash(faculty["password"], password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    faculty = row_to_dict(faculty)
    faculty.pop("password", None)
    return jsonify({"success": True, "faculty": faculty})

# In-memory store for OCR results keyed by filename
ocr_results = {}

def run_ocr_background(filepath, filename):
    """Runs OCR in a background thread and stores result."""
    try:
        result = ocr_extractor.extract(filepath)
        app.logger.info("OCR TEXT: %s", str(result.get("raw_text", ""))[:200])  # debug
    except Exception as e:
        result = {}
        app.logger.warning("OCR failed for %s: %s", filename, e)
    ocr_results[filename] = result

@app.route("/upload-certificate", methods=["POST"])
def upload_certificate():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "No file provided"}), 400

    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"success": False, "message": "Empty file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"success": False, "message": "Only PDF, JPG, JPEG, PNG allowed"}), 400

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "bin"
    filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)

    # Start OCR in background — don't wait for it
    ocr_results[filename] = None  # mark as processing
    t = threading.Thread(target=run_ocr_background, args=(filepath, filename), daemon=True)
    t.start()

    return jsonify({"success": True, "file_path": filename, "ocr_status": "processing"})

@app.route("/ocr-result/<filename>", methods=["GET"])
def ocr_result(filename):
    """Frontend polls this to get OCR results once ready."""
    if filename not in ocr_results:
        return jsonify({"success": False, "message": "File not found"}), 404

    result = ocr_results[filename]
    if result is None:
        return jsonify({"success": True, "ready": False, "extracted": {}})

    # ── Classify certificate to auto-detect activity_head and activity ──
    raw_text = result.get("raw_text", "")
    classification = classify_certificate(raw_text)
    app.logger.info("CLASSIFICATION: %s", classification)  # debug

    return jsonify({
        "success": True,
        "ready": True,
        "extracted": result,
        "activity_head": classification["activity_head"],
        "activity": classification["activity"],
    })

@app.route("/submit-activity", methods=["POST"])
def submit_activity():
    data = parse_json()
    required = ["student_id", "file_path", "head", "activity", "semester", "event_date"]
    for field in required:
        if not str(data.get(field, "")).strip():
            return jsonify({"success": False, "message": f"Missing field: {field}"}), 400

    result = rules.calculate_points(
        head=data.get("head", ""),
        activity=data.get("activity", ""),
        level=data.get("level", ""),
        prize=data.get("prize", ""),
        role=data.get("role", "")
    )

    upload_path = os.path.join(app.config["UPLOAD_FOLDER"], data.get("file_path", ""))
    extracted = {}
    if os.path.exists(upload_path):
        try:
            extracted = ocr_extractor.extract(upload_path)
        except Exception:
            extracted = {}

    with get_db() as (_, cur):
        cur.execute("SELECT id FROM students WHERE id = %s", (data["student_id"],))
        if not cur.fetchone():
            return jsonify({"success": False, "message": "Student not found"}), 404

        cur.execute(
            """
            INSERT INTO activities (
                student_id, event_name, semester, zone, head, activity, level,
                prize, role, event_date, file_path, points, max_points, reason,
                status, extracted_text, extracted_json
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s)
            """,
            (
                data["student_id"], data.get("event_name", ""), data.get("semester", ""), data.get("zone", ""),
                data.get("head", ""), data.get("activity", ""), data.get("level", ""), data.get("prize", ""),
                data.get("role", ""), data.get("event_date"), data.get("file_path", ""), result["points"],
                result["max"], result["reason"], extracted.get("raw_text", ""), json.dumps(extracted, ensure_ascii=False)
            )
        )
        activity_id = cur.lastrowid

    return jsonify({
        "success": True,
        "message": "Activity submitted for faculty approval",
        "activity_id": activity_id,
        "points": result["points"],
        "reason": result["reason"]
    }), 201

@app.route("/student-dashboard/<int:student_id>", methods=["GET"])
def student_dashboard(student_id):
    with get_db() as (_, cur):
        cur.execute("SELECT id, name, email, rollno, course, branch, division, semester FROM students WHERE id = %s", (student_id,))
        student = cur.fetchone()
        if not student:
            return jsonify({"success": False, "message": "Student not found"}), 404

        cur.execute("SELECT * FROM activities WHERE student_id = %s ORDER BY submitted_at DESC", (student_id,))
        activities = [row_to_dict(row) for row in cur.fetchall()]

    approved = [a for a in activities if a["status"] == "approved"]
    pending  = [a for a in activities if a["status"] == "pending"]
    total_points = sum(int(a.get("points") or 0) for a in approved)

    return jsonify({
        "success": True,
        "student": row_to_dict(student),
        "total_points": total_points,
        "approved_count": len(approved),
        "pending_count": len(pending),
        "activities": activities,
    })

@app.route("/faculty-dashboard", methods=["GET"])
def faculty_dashboard():
    faculty_id = request.args.get("faculty_id")

    with get_db() as (_, cur):
        cur.execute("""
            SELECT id, name, email, course, branch, division, semester
            FROM faculty
            WHERE id = %s
        """, (faculty_id,))
        faculty = cur.fetchone()

        if not faculty:
            return jsonify({"success": False, "message": "Faculty not found"}), 404

        faculty_data = row_to_dict(faculty)

        cur.execute("""
            SELECT s.id, s.name, s.rollno, s.course, s.branch, s.division, s.semester,
                   COALESCE(SUM(CASE WHEN a.status = 'approved' THEN a.points ELSE 0 END), 0) AS total_points,
                   COUNT(CASE WHEN a.status = 'approved' THEN 1 END) AS approved_count,
                   COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending_count
            FROM students s
            LEFT JOIN activities a ON a.student_id = s.id
            WHERE s.branch = %s AND s.division = %s AND s.semester = %s
            GROUP BY s.id, s.name, s.rollno, s.course, s.branch, s.division, s.semester
            ORDER BY s.name
        """, (faculty_data["branch"], faculty_data["division"], faculty_data["semester"]))
        students = [row_to_dict(row) for row in cur.fetchall()]

        cur.execute("""
            SELECT a.id, a.student_id, a.event_name, a.activity, a.head, a.level, a.event_date,
                   a.file_path, a.status, a.points,
                   s.name AS student_name, s.rollno,
                   CONCAT(s.branch, '-', s.division) AS student_class
            FROM activities a
            JOIN students s ON s.id = a.student_id
            WHERE s.branch = %s AND s.division = %s AND s.semester = %s
            ORDER BY a.id DESC
        """, (faculty_data["branch"], faculty_data["division"], faculty_data["semester"]))
        activities = [row_to_dict(row) for row in cur.fetchall()]

    return jsonify({
        "success": True,
        "faculty": faculty_data,
        "students": students,
        "activities": activities
    })

@app.route("/student-activities/<int:student_id>", methods=["GET"])
def student_activities(student_id):
    with get_db() as (_, cur):
        cur.execute("SELECT * FROM activities WHERE student_id = %s ORDER BY submitted_at DESC", (student_id,))
        activities = [row_to_dict(row) for row in cur.fetchall()]
    return jsonify({"success": True, "activities": activities})

@app.route("/review-activity/<int:activity_id>", methods=["POST"])
def review_activity(activity_id):
    data = parse_json()
    action = data.get("action")
    faculty_id = data.get("faculty_id")
    note = data.get("note", "")

    if action not in ("approve", "reject"):
        return jsonify({"success": False, "message": "action must be 'approve' or 'reject'"}), 400

    new_status = "approved" if action == "approve" else "rejected"

    with get_db() as (_, cur):
        cur.execute("SELECT id FROM faculty WHERE id = %s", (faculty_id,))
        if not cur.fetchone():
            return jsonify({"success": False, "message": "Faculty not found"}), 404

        cur.execute(
            """
            UPDATE activities
            SET status = %s, reviewed_at = NOW(), reviewed_by = %s, faculty_note = %s
            WHERE id = %s
            """,
            (new_status, faculty_id, note, activity_id)
        )
        if cur.rowcount == 0:
            return jsonify({"success": False, "message": "Activity not found"}), 404

    return jsonify({"success": True, "message": f"Activity {action}d successfully"})

@app.route("/uploads/<path:filename>", methods=["GET"])
def serve_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)