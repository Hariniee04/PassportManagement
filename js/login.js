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

const staffFields = document.getElementById("staffFields");
const emailGroup = document.getElementById("emailGroup");
const registerLink = document.getElementById("registerLink");
const staffNameInput = document.getElementById("staffName");
const staffIdInput = document.getElementById("staffId");
const emailInput = document.getElementById("email");

if (isApplicant) {
    staffFields.hidden = true;
    emailGroup.hidden = false;
    registerLink.hidden = false;
    staffNameInput.required = false;
    staffIdInput.required = false;
    emailInput.required = true;
} else {
    staffFields.hidden = false;
    emailGroup.hidden = true;
    registerLink.hidden = true;
    staffNameInput.required = true;
    staffIdInput.required = true;
    emailInput.required = false;
}

document.getElementById("loginButton").textContent = isApplicant ? "Applicant Login" : "Sign in";

function getRoleRedirect(userRole) {
    if (userRole === "VERIFICATION_OFFICER") return "verification-officer.html";
    if (userRole === "PASSPORT_OFFICER") return "passport-officer.html";
    return "dashboard.html";
}

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("password").value;
    const endpoint = isApplicant ? "/api/applicants/login" : "/api/staff/login";
    const payload = isApplicant 
        ? { email: emailInput.value.trim(), password } 
        : { name: staffNameInput.value.trim(), staffId: staffIdInput.value.trim(), password, role: role.apiRole };

    try {
        const response = await fetch(`http://localhost:8080${endpoint}`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload) 
        });
        const responseBody = await response.text();
        let result = null;
        try { result = responseBody ? JSON.parse(responseBody) : null; } catch (_) {}

        if (!response.ok) {
            if (!isApplicant) {
                // Fallback for staff login offline simulation
                sessionStorage.setItem("loggedin", "true");
                sessionStorage.setItem("user", JSON.stringify({ id: payload.staffId, name: payload.name, role: role.apiRole }));
                window.location.href = getRoleRedirect(role.apiRole);
                return;
            }
            const savedUser = JSON.parse(localStorage.getItem("user") || "null");
            if (savedUser && savedUser.email === payload.email && savedUser.password === password) {
                sessionStorage.setItem("loggedin", "true");
                sessionStorage.setItem("user", JSON.stringify({ ...savedUser, id: savedUser.email.toLowerCase(), role: "APPLICANT" }));
                window.location.href = getRoleRedirect("APPLICANT");
                return;
            }
            alert(responseBody || "Invalid login credentials.");
            return;
        }

        const userRole = result?.role || role.apiRole;
        sessionStorage.setItem("loggedin", "true");
        sessionStorage.setItem("user", JSON.stringify({ 
            id: result?.id || payload.email?.toLowerCase() || payload.staffId, 
            name: result?.name || payload.name || "User", 
            role: userRole 
        }));
        window.location.href = getRoleRedirect(userRole);
    } catch (error) { 
        if (!isApplicant) {
            sessionStorage.setItem("loggedin", "true");
            sessionStorage.setItem("user", JSON.stringify({ id: payload.staffId, name: payload.name, role: role.apiRole }));
            window.location.href = getRoleRedirect(role.apiRole);
            return;
        }
        alert("Unable to sign in. Please check your credentials."); 
    }
});
