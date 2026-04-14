
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

const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get("id");

function badgeClass(status){
  if(status === "approved") return "badge approved";
  if(status === "rejected") return "badge rejected";
  return "badge pending";
}

async function reviewActivity(activityId, action){
  const faculty = JSON.parse(sessionStorage.getItem("faculty") || "null");
  if(!faculty){
    alert("Please login first");
    return;
  }
  try{
    const res = await fetch(`${API_BASE}/review-activity/${activityId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faculty_id: faculty.id, action, note: "" })
    });
    const data = await res.json();
    if(!res.ok || !data.success) throw new Error(data.message || "Review failed");
    showToast(`Activity ${action}d`);
    await loadStudent();
  }catch(error){
    alert(error.message || "Could not review activity");
  }
}

async function loadStudent(){
  const faculty = JSON.parse(sessionStorage.getItem("faculty") || "null");
  if(!faculty){
    window.location.href = "faculty_login.html";
    return;
  }
  if(!studentId){
    alert("Missing student id");
    return;
  }

  try{
    const res = await fetch(`${API_BASE}/student-dashboard/${studentId}`);
    const data = await res.json();
    if(!res.ok || !data.success) throw new Error(data.message || "Could not load student");

    const s = data.student || {};
    const activities = data.activities || [];
    const rejectedCount = activities.filter(a => a.status === "rejected").length;

    document.getElementById("studentName").textContent = s.name || "Student";
    document.getElementById("studentRegNo").textContent = s.rollno || "-";
    document.getElementById("course").textContent = s.course || "-";
    document.getElementById("branch").textContent = s.branch || "-";
    document.getElementById("semester").textContent = s.semester || "-";
    document.getElementById("division").textContent = s.division || "-";
    document.getElementById("duration").textContent = `${s.startyear || "-"} - ${s.endyear || "-"}`;

    document.getElementById("totalPoints").textContent = data.total_points || 0;
    document.getElementById("approvedCount").textContent = data.approved_count || 0;
    document.getElementById("pendingCount").textContent = data.pending_count || 0;
    document.getElementById("rejectedCount").textContent = rejectedCount;

    const tbody = document.getElementById("activityTableBody");
    tbody.innerHTML = "";
    if(!activities.length){
      tbody.innerHTML = `<tr><td colspan="6">No activities submitted yet.</td></tr>`;
      return;
    }

    activities.forEach(item => {
      const tr = document.createElement("tr");
      const fileUrl = item.file_path ? `${API_BASE}/uploads/${encodeURIComponent(item.file_path)}` : "";
      const actionHtml = item.status === "pending"
        ? `<button class="btn btn-primary" style="padding:.45rem .7rem" onclick="reviewActivity(${item.id}, 'approve')">Approve</button>
           <button class="btn btn-danger" style="padding:.45rem .7rem;margin-left:.35rem" onclick="reviewActivity(${item.id}, 'reject')">Reject</button>`
        : "-";

      tr.innerHTML = `
        <td>${item.event_name || item.activity || "-"}</td>
        <td>${item.head || "-"}</td>
        <td><span class="${badgeClass(item.status)}">${(item.status || "pending").toUpperCase()}</span></td>
        <td><span class="points-chip">${item.points ?? 0}</span></td>
        <td>${fileUrl ? `<a class="link-btn" target="_blank" href="${fileUrl}">View</a>` : "-"}</td>
        <td>${actionHtml}</td>
      `;
      tbody.appendChild(tr);
    });
  }catch(error){
    alert(error.message || "Failed to load student details");
  }
}

window.reviewActivity = reviewActivity;
loadStudent();
