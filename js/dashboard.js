const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
if (sessionStorage.getItem("loggedin") !== "true" || !sessionUser) {
    window.location.href = "login.html";
}

document.getElementById("username").textContent = sessionUser?.name || "Applicant";
document.getElementById("logout").addEventListener("click", () => { 
    sessionStorage.clear(); 
    window.location.href = "index.html"; 
});

const draftKey = `passportApplicationDraft:${sessionUser?.id || sessionUser?.email?.toLowerCase()}`;
const appData = JSON.parse(localStorage.getItem(draftKey) || "null");

if (appData) {
    const isSubmitted = appData.submitted === true;
    const isPaid = appData.paymentStatus === "SUCCESSFUL";
    const isApptConfirmed = appData.appointmentStatus === "Confirmed";

    let overallProgress = 25;
    if (isSubmitted) overallProgress = 50;
    if (isPaid) overallProgress = 75;
    if (isApptConfirmed) overallProgress = 100;

    document.getElementById("overallProgress").textContent = `${overallProgress}% Complete`;
    document.getElementById("progressBar").style.width = `${overallProgress}%`;

    // Step Badges
    const stepApp = document.getElementById("stepApplication");
    const stepPay = document.getElementById("stepPayment");
    const stepAppt = document.getElementById("stepAppointment");

    if (isSubmitted) {
        stepApp.classList.add("complete");
        stepPay.classList.add("current");
    } else {
        stepApp.classList.add("current");
    }

    if (isPaid) {
        stepPay.classList.remove("current");
        stepPay.classList.add("complete");
        stepAppt.classList.add("current");
    }

    if (isApptConfirmed) {
        stepAppt.classList.remove("current");
        stepAppt.classList.add("complete");
    }

    // Populate active application summary card
    if (isSubmitted) {
        document.getElementById("activeAppSummary")?.classList.remove("d-none");
        document.getElementById("postAppointmentTimeline")?.classList.remove("d-none");

        document.getElementById("dashArn").textContent = appData.arn || "N/A";
        document.getElementById("dashType").textContent = `${appData.serviceType || 'Normal'} (${appData.bookletType || '36 pages'})`;
        document.getElementById("dashStatus").textContent = appData.status || "Submitted";
        document.getElementById("dashPayment").textContent = appData.paymentStatus || "Pending";

        if (isPaid) {
            document.getElementById("dashPayment").innerHTML = `<span class="text-success fw-bold">Paid (₹${appData.amountPaid || 0})</span>`;
        }

        if (isApptConfirmed) {
            document.getElementById("dashApptId").textContent = appData.appointmentId || "N/A";
            document.getElementById("dashPsk").textContent = appData.pskLocation || "N/A";
            document.getElementById("dashDate").textContent = appData.appointmentDate || "N/A";
            document.getElementById("dashTime").textContent = appData.appointmentTime || "N/A";

            const maxRes = appData.serviceType === "Tatkaal" ? 1 : 2;
            const left = maxRes - (appData.rescheduleCount || 0);
            document.getElementById("dashReschedules").textContent = `${left} left`;

            document.getElementById("btnPrintAppt")?.classList.remove("d-none");

            if (left > 0) {
                document.getElementById("btnReschedule")?.classList.remove("d-none");
            }
        } else if (isPaid) {
            document.getElementById("btnBookAppt")?.classList.remove("d-none");
        } else {
            document.getElementById("btnPayFee")?.classList.remove("d-none");
        }

        // Card update
        document.getElementById("journeyMessage").textContent = `Active Application: ${appData.arn}`;
        document.getElementById("applicationCardTitle").textContent = "View Submitted Application";
        document.getElementById("applicationCardText").textContent = `Application ${appData.arn} submitted on ${appData.submissionDate || 'N/A'}.`;
        document.getElementById("applicationAction").textContent = "View Details";
        document.getElementById("applicationAction").href = isApptConfirmed ? "#" : (isPaid ? "appointment.html" : "payment.html");
    }
}
