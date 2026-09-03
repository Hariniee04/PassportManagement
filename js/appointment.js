const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
if (sessionStorage.getItem("loggedin") !== "true" || !sessionUser) {
    window.location.href = "login.html";
}

const draftKey = `passportApplicationDraft:${sessionUser?.id || sessionUser?.email?.toLowerCase()}`;
const appData = JSON.parse(localStorage.getItem(draftKey) || "null");

// Guard 1: Must be submitted
if (!appData || !appData.submitted) {
    alert("Please submit your application prior to booking an appointment.");
    window.location.href = "application.html";
}

// Guard 2: Must be paid
if (appData.paymentStatus !== "SUCCESSFUL") {
    alert("Please pay the applicable fee prior to scheduling an appointment.");
    window.location.href = "payment.html";
}

document.addEventListener("DOMContentLoaded", () => {
    setupPage();

    document.getElementById("appointmentForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        confirmAppointment();
    });
});

function setupPage() {
    const quotaInput = document.getElementById("appQuota");
    if (quotaInput) {
        quotaInput.value = appData.serviceType === "Tatkaal" ? "Tatkaal" : "Normal";
    }

    // Set minimum date to tomorrow
    const dateInput = document.getElementById("appDate");
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split("T")[0];
    }

    // Setup Reschedule counters if rescheduling
    const maxReschedules = appData.serviceType === "Tatkaal" ? 1 : 2;
    const currentReschedules = appData.rescheduleCount || 0;
    const remaining = maxReschedules - currentReschedules;

    if (appData.appointmentStatus === "Confirmed") {
        document.getElementById("rescheduleNotice")?.classList.remove("d-none");
        document.getElementById("dispRescheduleCount").textContent = `${remaining} reschedule(s) remaining for ${appData.serviceType} quota (Max: ${maxReschedules}).`;

        if (remaining <= 0) {
            alert("You have reached the maximum allowed reschedule limit for your application quota.");
            document.getElementById("btnConfirmAppointment").disabled = true;
        }
    }
}

function confirmAppointment() {
    const pskLocation = document.getElementById("pskLocation").value;
    const appDate = document.getElementById("appDate").value;
    const appTime = document.getElementById("appTime").value;

    const maxReschedules = appData.serviceType === "Tatkaal" ? 1 : 2;
    const isReschedule = appData.appointmentStatus === "Confirmed";

    if (isReschedule) {
        const currentCount = appData.rescheduleCount || 0;
        if (currentCount >= maxReschedules) {
            alert("Cannot reschedule. Maximum reschedule limit reached.");
            return;
        }
        appData.rescheduleCount = currentCount + 1;
    } else {
        appData.rescheduleCount = 0;
    }

    const appointmentId = `APT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    appData.appointmentStatus = "Confirmed";
    appData.appointmentId = appointmentId;
    appData.pskLocation = pskLocation;
    appData.appointmentDate = appDate;
    appData.appointmentTime = appTime;
    appData.status = "Appointment Confirmed";

    localStorage.setItem(draftKey, JSON.stringify(appData));

    alert(`Appointment Confirmed!\n\nAppointment ID: ${appointmentId}\nLocation: ${pskLocation}\nDate: ${appDate}\nTime: ${appTime}\n\nPlease carry all required original documents to the PSK on your appointment date.`);
    window.location.href = "dashboard.html";
}
