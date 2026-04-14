
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
    formTitle.textContent = isSignup ? "Student Sign Up" : "Student Login";
    formSubtitle.textContent = isSignup ? "Create your student account." : "Sign in to track your activity points.";
    mainBtn.textContent = isSignup ? "Sign Up" : "Login";
  }

  loginTab.addEventListener("click", () => switchMode(false));
  signupTab.addEventListener("click", () => switchMode(true));

  mainBtn.addEventListener("click", async () => {
    const email = document.getElementById("studentEmail").value.trim();
    const password = document.getElementById("studentPassword").value.trim();
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    mainBtn.disabled = true;
    mainBtn.textContent = isSignup ? "Signing up..." : "Logging in...";
    try {
      if (isSignup) {
        const payload = {
          name: document.getElementById("studentName").value.trim(),
          course: document.getElementById("course").value.trim(),
          branch: document.getElementById("branch").value.trim(),
          division: document.getElementById("division").value.trim(),
          semester: document.getElementById("semester").value.trim(),
          rollno: document.getElementById("rollno").value.trim(),
          email,
          password
        };
        const res = await fetch(`${API_BASE}/signup-student`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Signup failed");
        sessionStorage.setItem("student", JSON.stringify(data.student));
      } else {
        const res = await fetch(`${API_BASE}/login-student`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Login failed");
        sessionStorage.setItem("student", JSON.stringify(data.student));
      }
      window.location.href = "Student_dash.html";
    } catch (error) {
      alert(error.message || "Request failed");
      mainBtn.disabled = false;
      mainBtn.textContent = isSignup ? "Sign Up" : "Login";
    }
  });
});
