
const API_BASE = "http://127.0.0.1:5000";

function showToast(message){
  let toast = document.getElementById("toast");
  if(!toast){
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function logoutStudent(){
  sessionStorage.removeItem("student");
  window.location.href = "student_login.html";
}

function logoutFaculty(){
  sessionStorage.removeItem("faculty");
  window.location.href = "faculty_login.html";
}

const headEl = document.getElementById("activityHead");
const activityEl = document.getElementById("activity");
const zoneEl = document.getElementById("zone");
const levelBox = document.getElementById("levelBox");
const levelEl = document.getElementById("level");
const prizeBox = document.getElementById("prizeBox");

const ZONE_TO_LEVEL = {
  College: "I",
  Zonal: "II",
  State: "III",
  National: "IV",
  International: "V"
};

function toDateInputValue(raw){
  if(!raw) return "";
  const direct = new Date(raw);
  if(!Number.isNaN(direct.getTime())) return direct.toISOString().slice(0,10);
  const parts = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if(parts){
    let [, d, m, y] = parts;
    if(y.length === 2) y = `20${y}`;
    return `${y.padStart(4,"0")}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
  }
  return "";
}

function populateActivities(head){
  activityEl.innerHTML = `<option value="">Select</option>`;
  if(!head || typeof RULES === "undefined" || !RULES[head]) return;
  Object.keys(RULES[head].activities).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    activityEl.appendChild(opt);
  });
}

function resetConditional(){
  levelBox.classList.add("hidden");
  prizeBox.classList.add("hidden");
  levelEl.value = "";
  document.getElementById("prize").value = "";
}

function applyExtracted(extracted){
  if(!extracted) return;
  if(extracted.event_name) document.getElementById("eventName").value = extracted.event_name;
  if(extracted.event_date) document.getElementById("eventDate").value = toDateInputValue(extracted.event_date);

  if(extracted.head){
    headEl.value = extracted.head;
    populateActivities(extracted.head);
  }

  // small delay so dropdown options are rendered before setting value
  setTimeout(() => {
    if(extracted.activity) activityEl.value = extracted.activity;
  }, 100);

  const zoneFromLevel = Object.entries(ZONE_TO_LEVEL).find(([,v]) => v === extracted.level)?.[0] || "";
  if(zoneFromLevel) zoneEl.value = zoneFromLevel;

  if(extracted.level){
    levelBox.classList.remove("hidden");
    levelEl.value = extracted.level;
  }
  if(extracted.prize){
    prizeBox.classList.remove("hidden");
    document.getElementById("prize").value = extracted.prize;
  }
  if(extracted.role) document.getElementById("role").value = extracted.role;
}

async function pollOCR(filename, statusEl){
  const maxAttempts = 15;
  let attempts = 0;
  const interval = setInterval(async () => {
    attempts++;
    try{
      const res = await fetch(`${API_BASE}/ocr-result/${encodeURIComponent(filename)}`);
      const data = await res.json();
      if(data.ready){
        clearInterval(interval);
        statusEl.textContent = "OCR complete. Fields auto-filled where possible.";

        // merge backend classification into extracted before applying
        const extracted = data.extracted || {};
        if(data.activity_head) extracted.head = data.activity_head;
        if(data.activity)      extracted.activity = data.activity;

        applyExtracted(extracted);

        const uploadData = JSON.parse(sessionStorage.getItem("upload_data") || "{}");
        uploadData.extracted = extracted;
        uploadData.ocr_pending = false;
        sessionStorage.setItem("upload_data", JSON.stringify(uploadData));

      }else if(attempts >= maxAttempts){
        clearInterval(interval);
        statusEl.textContent = "OCR timed out. Fill the fields manually.";
      }
    }catch(e){
      clearInterval(interval);
      statusEl.textContent = "OCR check failed. Fill the fields manually.";
    }
  }, 2000);
}

window.onload = () => {
  const uploadData = JSON.parse(sessionStorage.getItem("upload_data") || "{}");
  const student = JSON.parse(sessionStorage.getItem("student") || "{}");

  document.getElementById("certificateName").value = uploadData.original_name || uploadData.file_path || "";
  document.getElementById("semester").value = student.semester ? `S${student.semester}` : "";

  const statusEl = document.createElement("p");
  statusEl.className = "notice";
  const form = document.getElementById("uploadForm");
  form.prepend(statusEl);

  if(uploadData.ocr_pending && uploadData.file_path){
    statusEl.textContent = "Extracting certificate details in background...";
    pollOCR(uploadData.file_path, statusEl);
  }else{
    statusEl.textContent = "You can review and submit the activity details below.";
    applyExtracted(uploadData.extracted || {});
  }
};

headEl.addEventListener("change", () => {
  resetConditional();
  populateActivities(headEl.value);
});

activityEl.addEventListener("change", () => {
  resetConditional();
  const head = headEl.value;
  const activity = activityEl.value;
  if(!head || !activity || typeof RULES === "undefined" || !RULES[head]) return;
  const rule = RULES[head].activities[activity];
  if(rule.type === "LEVEL"){
    levelBox.classList.remove("hidden");
    const mapped = ZONE_TO_LEVEL[zoneEl.value] || "";
    if(mapped) levelEl.value = mapped;
    if(rule.hasPrize) prizeBox.classList.remove("hidden");
  }
});

zoneEl.addEventListener("change", () => {
  const mapped = ZONE_TO_LEVEL[zoneEl.value] || "";
  if(mapped){
    levelBox.classList.remove("hidden");
    levelEl.value = mapped;
  }
});

async function submitDetails(){
  const uploadData = JSON.parse(sessionStorage.getItem("upload_data") || "{}");
  const student = JSON.parse(sessionStorage.getItem("student") || "null");
  if(!student){
    alert("Please login first");
    return;
  }

  const payload = {
    student_id: student.id,
    file_path: uploadData.file_path,
    event_name: document.getElementById("eventName").value.trim(),
    semester: document.getElementById("semester").value,
    zone: document.getElementById("zone").value,
    head: document.getElementById("activityHead").value,
    activity: document.getElementById("activity").value,
    level: document.getElementById("level").value,
    prize: document.getElementById("prize").value,
    role: document.getElementById("role").value,
    event_date: document.getElementById("eventDate").value
  };

  try{
    const res = await fetch(`${API_BASE}/submit-activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(!res.ok || !data.success) throw new Error(data.message || "Submission failed");
    showToast(`Submitted successfully. Points: ${data.points}`);
    sessionStorage.removeItem("upload_data");
    setTimeout(() => window.location.href = "Student_dash.html", 600);
  }catch(error){
    alert(error.message || "Server error during submission");
  }
}