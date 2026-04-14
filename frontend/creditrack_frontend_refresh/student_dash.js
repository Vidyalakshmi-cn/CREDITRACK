
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

function badgeClass(status){
  if(status === "approved") return "badge approved";
  if(status === "rejected") return "badge rejected";
  return "badge pending";
}

async function loadDashboard(){
  const student = JSON.parse(sessionStorage.getItem("student") || "null");
  if(!student){
    window.location.href = "student_login.html";
    return;
  }

  try{
    const res = await fetch(`${API_BASE}/student-dashboard/${student.id}`);
    const data = await res.json();
    if(!res.ok || !data.success) throw new Error(data.message || "Could not load dashboard");

    const s = data.student || {};
    document.getElementById("studentName").textContent = s.name || "-";
    document.getElementById("rollno").textContent = s.rollno || "-";
    document.getElementById("course").textContent = s.course || "-";
    document.getElementById("branch").textContent = s.branch || "-";
    document.getElementById("semester").textContent = s.semester || "-";
    document.getElementById("division").textContent = s.division || "-";
    document.getElementById("duration").textContent = "-";

    const activities = data.activities || [];
    const rejectedCount = activities.filter(a => a.status === "rejected").length;

    document.getElementById("totalPoints").textContent = data.total_points || 0;
    document.getElementById("approvedCount").textContent = data.approved_count || 0;
    document.getElementById("pendingCount").textContent = data.pending_count || 0;
    document.getElementById("rejectedCount").textContent = rejectedCount;

    const pct = Math.min(100, Number(data.total_points || 0));
    document.getElementById("progressFill").style.width = `${pct}%`;
    document.getElementById("progressText").textContent = `${data.total_points || 0} / 100`;

    const tbody = document.getElementById("activityTableBody");
    tbody.innerHTML = "";
    if(!activities.length){
      tbody.innerHTML = `<tr><td colspan="5">No activities submitted yet.</td></tr>`;
      return;
    }

    activities.forEach(item => {
      const tr = document.createElement("tr");
      const points = item.status === "approved" ? (item.points ?? 0) : "-";
      const fileUrl = item.file_path ? `${API_BASE}/uploads/${encodeURIComponent(item.file_path)}` : "";
      tr.innerHTML = `
        <td>${item.event_name || item.activity || "-"}</td>
        <td>${item.head || "-"}</td>
        <td><span class="${badgeClass(item.status)}">${(item.status || "pending").toUpperCase()}</span></td>
        <td><span class="points-chip">${points}</span></td>
        <td>${fileUrl ? `<a class="link-btn" target="_blank" href="${fileUrl}">View</a>` : "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  }catch(error){
    alert(error.message || "Failed to load dashboard");
  }
}

loadDashboard();
