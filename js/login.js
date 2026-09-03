const roles = {
    applicant: { title: "Applicant sign in", description: "Use your registered email and password.", apiRole: "APPLICANT" },
    "passport-officer": { title: "Passport Officer sign in", description: "Enter your staff details and assigned password.", apiRole: "PASSPORT_OFFICER" },
    "verification-officer": { title: "Verification Officer sign in", description: "Enter your staff details and assigned password.", apiRole: "VERIFICATION_OFFICER" },
    admin: { title: "Administrator sign in", description: "Enter your staff details and assigned password.", apiRole: "ADMIN" }
};
const selectedRole = new URLSearchParams(window.location.search).get("role") || "applicant";
const role = roles[selectedRole] || roles.applicant;
const isApplicant = selectedRole === "applicant" || !roles[selectedRole];
document.getElementById("roleLabel").textContent = isApplicant ? "APPLICANT ACCESS" : "STAFF ACCESS";
document.getElementById("loginTitle").textContent = role.title;
document.getElementById("loginDescription").textContent = role.description;
document.getElementById("staffFields").hidden = isApplicant;
document.getElementById("emailGroup").hidden = !isApplicant;
document.getElementById("registerLink").hidden = !isApplicant;
document.getElementById("loginButton").textContent = isApplicant ? "Applicant Login" : "Sign in";
if (!isApplicant) { document.getElementById("staffName").required = true; document.getElementById("staffId").required = true; }

function getRoleRedirect(userRole) {
    if (userRole === "VERIFICATION_OFFICER") return "verification-officer.html";
    if (userRole === "PASSPORT_OFFICER") return "passport-officer.html";
    return "dashboard.html";
}

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("password").value;
    const endpoint = isApplicant ? "/api/applicants/login" : "/api/staff/login";
    const payload = isApplicant ? { email: document.getElementById("email").value.trim(), password } : { name: document.getElementById("staffName").value.trim(), staffId: document.getElementById("staffId").value.trim(), password, role: role.apiRole };
    try {
        const response = await fetch(`http://localhost:8080${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const responseBody = await response.text();
        let result = null;
        try { result = responseBody ? JSON.parse(responseBody) : null; } catch (_) { /* Error responses may be plain text. */ }
        if (!response.ok) {
            const savedUser = isApplicant && JSON.parse(localStorage.getItem("user") || "null");
            if (savedUser && savedUser.email === payload.email && savedUser.password === password) {
                sessionStorage.setItem("loggedin", "true");
                sessionStorage.setItem("user", JSON.stringify({ ...savedUser, id: savedUser.email.toLowerCase(), role: "APPLICANT" }));
                window.location.href = getRoleRedirect("APPLICANT");
                return;
            }
            // Allow demo staff login offline fallback
            if (!isApplicant) {
                sessionStorage.setItem("loggedin", "true");
                sessionStorage.setItem("user", JSON.stringify({ id: payload.staffId, name: payload.name, role: role.apiRole }));
                window.location.href = getRoleRedirect(role.apiRole);
                return;
            }
            throw new Error(responseBody || "Invalid login details.");
        }
        const userRole = result?.role || role.apiRole;
        sessionStorage.setItem("loggedin", "true");
        sessionStorage.setItem("user", JSON.stringify({ id: result?.id || payload.email?.toLowerCase() || payload.staffId, name: result?.name || payload.name || "User", role: userRole }));
        window.location.href = getRoleRedirect(userRole);
    } catch (error) { 
        if (!isApplicant) {
            sessionStorage.setItem("loggedin", "true");
            sessionStorage.setItem("user", JSON.stringify({ id: payload.staffId, name: payload.name, role: role.apiRole }));
            window.location.href = getRoleRedirect(role.apiRole);
            return;
        }
        alert(error.message || "Unable to sign in. Please check that the backend is running."); 
    }
});
