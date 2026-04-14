
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

document.addEventListener("DOMContentLoaded", () => {
  let isSignup = false;
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const signupFields = document.getElementById("signupFields");
  const formTitle = document.getElementById("formTitle");
  const formSubtitle = document.getElementById("formSubtitle");
  const mainBtn = document.getElementById("mainBtn");

  function switchMode(signupMode){
    isSignup = signupMode;
    signupFields.classList.toggle("hidden", !isSignup);
    loginTab.classList.toggle("active", !isSignup);
    signupTab.classList.toggle("active", isSignup);
    formTitle.textContent = isSignup ? "Faculty Sign Up" : "Faculty Login";
    formSubtitle.textContent = isSignup ? "Create your faculty account." : "Sign in to verify student activity points.";
    mainBtn.textContent = isSignup ? "Sign Up" : "Login";
  }

  loginTab.addEventListener("click", () => switchMode(false));
  signupTab.addEventListener("click", () => switchMode(true));

  mainBtn.addEventListener("click", async () => {
    const email = document.getElementById("facultyEmail").value.trim();
    const password = document.getElementById("facultyPassword").value.trim();
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    mainBtn.disabled = true;
    mainBtn.textContent = isSignup ? "Signing up..." : "Logging in...";

    try {
      if (isSignup) {
        const payload = {
          name: document.getElementById("facultyName").value.trim(),
          course: document.getElementById("facultyCourse").value.trim(),
          branch: document.getElementById("facultyBranch").value.trim(),
          division: document.getElementById("facultyDivision").value.trim(),
          semester: document.getElementById("facultySemester").value.trim(),
          email,
          password
        };
        const res = await fetch(`${API_BASE}/signup-faculty`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Signup failed");
        sessionStorage.setItem("faculty", JSON.stringify(data.faculty));
      } else {
        const res = await fetch(`${API_BASE}/login-faculty`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Login failed");
        sessionStorage.setItem("faculty", JSON.stringify(data.faculty));
      }
      window.location.href = "faculty_dash.html";
    } catch (error) {
      alert(error.message || "Request failed");
      mainBtn.disabled = false;
      mainBtn.textContent = isSignup ? "Sign Up" : "Login";
    }
  });
});
