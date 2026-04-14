
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

const fileInput = document.getElementById("certificateFile");
const preview = document.getElementById("filePreview");
const uploadBtn = document.getElementById("uploadBtn");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  preview.textContent = file ? `Selected file: ${file.name}` : "";
});

uploadBtn.addEventListener("click", async () => {
  const student = JSON.parse(sessionStorage.getItem("student") || "null");
  if(!student){
    alert("Please login first");
    return;
  }

  const file = fileInput.files[0];
  if(!file){
    alert("Please choose a certificate file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  try{
    const res = await fetch(`${API_BASE}/upload-certificate`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if(!res.ok || !data.success) throw new Error(data.message || "Upload failed");

    sessionStorage.setItem("upload_data", JSON.stringify({
      original_name: file.name,
      file_path: data.file_path,
      ocr_pending: data.ocr_status === "processing",
      extracted: {}
    }));

    window.location.href = "upload_details.html";
  }catch(error){
    alert(error.message || "Upload failed");
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Continue";
  }
});
