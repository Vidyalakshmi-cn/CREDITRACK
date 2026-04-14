
const API_BASE = "http://127.0.0.1:5000";

function logoutFaculty() {
  sessionStorage.removeItem("faculty");
  window.location.href = "faculty_login.html";
}

let studentsCache = [];
let allActivities = [];
let currentTab = "pending";

function statusClass(status) {
  if (status === "approved") return "status-pill status-approved";
  if (status === "rejected") return "status-pill status-rejected";
  return "status-pill status-pending";
}

function formatClass(student) {
  return `${student.branch || "-"}-${student.division || "-"}`;
}

function buildCertificateLink(filePath) {
  if (!filePath) return "-";
  return `<a href="${API_BASE}/uploads/${encodeURIComponent(filePath)}" target="_blank" class="student-link">View</a>`;
}

function renderPendingTable(rows) {
  const tbody = document.getElementById("pendingTableBody");
  tbody.innerHTML = "";

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="10">No pending submissions found.</td></tr>`;
    return;
  }

  rows.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.student_name || "-"}</td>
      <td>${item.rollno || "-"}</td>
      <td>${item.student_class || "-"}</td>
      <td>${item.event_name || item.activity || "-"}</td>
      <td>${item.head || "-"}</td>
      <td>${item.level || "-"}</td>
      <td>${item.event_date || "-"}</td>
      <td>${buildCertificateLink(item.file_path)}</td>
      <td><span class="${statusClass(item.status)}">${(item.status || "pending").toUpperCase()}</span></td>
      <td>
        <button class="approve-btn" onclick="reviewActivity(${item.id}, 'approve')">✓ Approve</button>
        <button class="reject-btn" onclick="reviewActivity(${item.id}, 'reject')">✕ Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAllTable(rows) {
  const tbody = document.getElementById("allTableBody");
  tbody.innerHTML = "";

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="10">No submissions found.</td></tr>`;
    return;
  }

  rows.forEach(item => {
    const actionHtml = item.status === "pending"
      ? `
        <button class="approve-btn" onclick="reviewActivity(${item.id}, 'approve')">✓ Approve</button>
        <button class="reject-btn" onclick="reviewActivity(${item.id}, 'reject')">✕ Reject</button>
      `
      : "—";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.student_name || "-"}</td>
      <td>${item.rollno || "-"}</td>
      <td>${item.student_class || "-"}</td>
      <td>${item.event_name || item.activity || "-"}</td>
      <td>${item.head || "-"}</td>
      <td>${item.level || "-"}</td>
      <td>${item.event_date || "-"}</td>
      <td>${buildCertificateLink(item.file_path)}</td>
      <td><span class="${statusClass(item.status)}">${(item.status || "pending").toUpperCase()}</span></td>
      <td>${actionHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderStudentsTable(rows) {
  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = "";

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7">No students found.</td></tr>`;
    return;
  }

  rows.forEach(student => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><a class="student-link" href="student_view.html?id=${student.id}">${student.name || "-"}</a></td>
      <td>${student.rollno || "-"}</td>
      <td>${formatClass(student)}</td>
      <td>${student.semester || "-"}</td>
      <td><span class="tiny-chip">${student.total_points || 0}</span></td>
      <td>${student.approved_count || 0}</td>
      <td>${student.pending_count || 0}</td>
    `;
    tbody.appendChild(tr);
  });
}

function applyFilters() {
  const search = document.getElementById("searchBox").value.trim().toLowerCase();
  const status = document.getElementById("statusFilter").value;

  const filteredActivities = allActivities.filter(item => {
    const textMatch =
      (item.student_name || "").toLowerCase().includes(search) ||
      (item.event_name || item.activity || "").toLowerCase().includes(search) ||
      String(item.rollno || "").toLowerCase().includes(search);

    const statusMatch = !status || item.status === status;
    return textMatch && statusMatch;
  });

  const filteredStudents = studentsCache.filter(student =>
    (student.name || "").toLowerCase().includes(search) ||
    String(student.rollno || "").toLowerCase().includes(search)
  );

  renderPendingTable(filteredActivities.filter(item => item.status === "pending"));
  renderAllTable(filteredActivities);
  renderStudentsTable(filteredStudents);
}

async function reviewActivity(activityId, action) {
  const faculty = JSON.parse(sessionStorage.getItem("faculty") || "null");
  if (!faculty) return;

  try {
    const res = await fetch(`${API_BASE}/review-activity/${activityId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        faculty_id: faculty.id,
        action,
        note: ""
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Action failed");

    await loadFacultyDashboard();
  } catch (error) {
    alert(error.message || "Could not update activity");
  }
}

async function loadFacultyDashboard() {
  const faculty = JSON.parse(sessionStorage.getItem("faculty") || "null");
  if (!faculty) {
    window.location.href = "faculty_login.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/faculty-dashboard?faculty_id=${faculty.id}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Could not load faculty dashboard");
    }

    const f = data.faculty || {};
    studentsCache = data.students || [];
    allActivities = data.activities || [];

    document.getElementById("facultyTopName").textContent = f.name || "faculty";
    document.getElementById("facultyName").textContent = f.name || "-";
    document.getElementById("facultyEmail").textContent = f.email || "-";
    document.getElementById("facultyBranch").textContent = f.branch || "-";
    document.getElementById("facultyClass").textContent =
      `${f.branch || "-"} ${f.division ? `- ${f.division}` : ""}`;
    document.getElementById("facultyBatch").textContent = "-";

    document.getElementById("totalStudents").textContent = studentsCache.length;
    document.getElementById("pendingApprovals").textContent =
      allActivities.filter(item => item.status === "pending").length;
    document.getElementById("approvedToday").textContent = 0;

    applyFilters();
  } catch (error) {
    alert(error.message || "Failed to load dashboard");
  }
}

document.querySelectorAll(".segmented-tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".segmented-tabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentTab = btn.dataset.tab;

    document.getElementById("pendingSection").classList.add("hidden");
    document.getElementById("allSection").classList.add("hidden");
    document.getElementById("studentsSection").classList.add("hidden");

    if (currentTab === "pending") {
      document.getElementById("tableTitle").textContent = "⏳ Pending Submissions";
      document.getElementById("pendingSection").classList.remove("hidden");
    } else if (currentTab === "all") {
      document.getElementById("tableTitle").textContent = "📋 All Submissions";
      document.getElementById("allSection").classList.remove("hidden");
    } else {
      document.getElementById("tableTitle").textContent = "🎓 Students";
      document.getElementById("studentsSection").classList.remove("hidden");
    }
  });
});

document.getElementById("searchBox").addEventListener("input", applyFilters);
document.getElementById("statusFilter").addEventListener("change", applyFilters);

window.reviewActivity = reviewActivity;
loadFacultyDashboard();