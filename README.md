# CrediTrack 

**A full-stack KTU activity point management system**

Every semester, collecting certificates, manually calculating points, following up with faculty — it's a lot. And most of the time students don't even know where they stand until it's too late. CrediTrack solves this.

> Built as S6 Mini Project — Government Engineering College Thrissur (KTU)

---

##  Features

- **Certificate Upload & OCR** — Upload PDF or image certificates; Tesseract OCR automatically extracts event name, date, and activity type
- **Auto Activity Detection** — Keyword-based classifier maps certificates to the correct KTU activity head and activity automatically
- **Points Calculation Engine** — Rule-based engine calculates activity points based on KTU 2019 scheme (level, prize, role)
- **Faculty Approval Workflow** — Faculty review pending submissions filtered by their assigned class (branch, division, semester)
- **Student Dashboard** — Students track total approved points, pending submissions, and full activity history
- **Multi-role Auth** — Separate login for students and faculty with hashed passwords

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-CORS |
| Database | MySQL |
| OCR | Tesseract OCR, PyMuPDF, Pillow |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Auth | Werkzeug password hashing |
| Containerization | Docker |

---

## 📁 Project Structure

```
creditrack/
├── backend/
│   ├── app.py              # Flask routes and API endpoints
│   ├── rules.py            # KTU points calculation engine + certificate classifier
│   ├── ocr_extractor.py    # OCR pipeline (PDF + image support)
│   ├── Dockerfile          # Docker configuration
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variable template
│   └── uploads/            # Certificate storage (gitignored)
├── frontend/
│   ├── Student_dash.html   # Student dashboard
│   ├── faculty_dashboard.html
│   ├── upload.html
│   ├── upload_details.html
│   └── script.js           # OCR polling, form logic, auth
└── README.md
```

---

##  How It Works

```
Student uploads certificate (PDF / image)
        ↓
OCR runs in background thread (Tesseract)
        ↓
Keyword classifier detects activity head + activity
        ↓
Student reviews auto-filled form → submits
        ↓
Points calculated by KTU rules engine
        ↓
Faculty reviews → approves / rejects
        ↓
Student dashboard updates with approved points
```

---

##  Local Setup

### Prerequisites
- Python 3.10+
- MySQL
- Tesseract OCR ([installation guide](https://github.com/tesseract-ocr/tesseract))

### 1. Clone the repository
```bash
git clone https://github.com/Vidyalakshmi-cn/CrediTrack.git
cd CrediTrack/backend
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=credi
```

### 4. Set up the database
```bash
mysql -u root -p -e "CREATE DATABASE credi;"
mysql -u root -p credi < schema.sql
```

### 5. Run the app
```bash
python app.py
```

Open `frontend/Student_dash.html` in your browser or serve via Live Server.

---

##  KTU Activity Heads Supported

- Sports & Games Participation
- Cultural Activities Participation
- Professional Self Initiatives *(workshops, MOOCs, internships, conferences)*
- Entrepreneurship and Innovation
- Leadership & Management
- National Initiatives Participation *(NSS, NCC, Blood Donation)*

---

##  Team

| Name | Role |
|---|---|
| Vidhyalakshmi C N | Full Stack Development, OCR Integration, Rules Engine |
| Aswathi V | Frontend Development, UI Design |
| Upasana Udayan | Backend Development, Database Design |

> S6 CSE — Government Engineering College Thrissur, Kerala Technological University

---

##  Connect

**Vidhyalakshmi C N**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/YOUR_LINKEDIN)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/Vidyalakshmi-cn)

---

##  License

This project is for educational purposes as part of KTU S6 Mini Project.
