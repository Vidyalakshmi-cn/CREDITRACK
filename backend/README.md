# CrediTrack fixed backend

## Setup
1. Install Python packages:
   pip install -r requirements.txt
2. Install MySQL and create the database:
   mysql -u root -p < schema.sql
3. Install Tesseract OCR in your system and make sure `tesseract` is available in PATH.
4. Set DB environment variables if needed:
   - MYSQL_HOST
   - MYSQL_PORT
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE
5. Run backend:
   python app.py

Backend starts at `http://127.0.0.1:5000`
