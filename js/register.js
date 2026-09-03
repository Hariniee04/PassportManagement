document.getElementById("registerform").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:8080/api/applicants/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phoneNumber, password })
        });
        const message = await response.text();
        if (!response.ok) throw new Error(message || "Unable to create the account.");
        alert("Registration successful. You can now sign in.");
        window.location.href = "login.html?role=applicant";
    } catch (error) {
        alert(error.message || "Unable to register. Please check that the backend is running.");
    }
});
