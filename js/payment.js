const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
if (sessionStorage.getItem("loggedin") !== "true" || !sessionUser) {
    window.location.href = "login.html";
}

const draftKey = `passportApplicationDraft:${sessionUser?.id || sessionUser?.email?.toLowerCase()}`;
const appData = JSON.parse(localStorage.getItem(draftKey) || "null");

if (!appData || !appData.submitted) {
    alert("Please fill and submit your application prior to making payment.");
    window.location.href = "application.html";
}

if (appData.paymentStatus === "SUCCESSFUL") {
    alert("Payment already completed for this application.");
    window.location.href = "appointment.html";
}

document.addEventListener("DOMContentLoaded", () => {
    populatePaymentDetails();
    
    document.getElementById("paymentForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        processPayment();
    });
});

function calculatePassportFee(serviceType, bookletType, dobStr) {
    let age = 25;
    if (dobStr) {
        const birthDate = new Date(dobStr);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
    }
    const isMinor = age < 18;

    let baseFee = isMinor ? 1000 : (bookletType === "60 pages" ? 3500 : 2500);
    let tatkaalFee = serviceType === "Tatkaal" ? 2500 : 0;
    
    return {
        baseFee,
        tatkaalFee,
        totalFee: baseFee + tatkaalFee
    };
}

function populatePaymentDetails() {
    document.getElementById("dispArn").textContent = appData.arn || "N/A";
    document.getElementById("dispName").textContent = `${appData.givenName || ''} ${appData.surname || ''}`.trim() || sessionUser.name;
    document.getElementById("dispType").textContent = appData.serviceType || "Normal";
    document.getElementById("dispBooklet").textContent = appData.bookletType || "36 pages";

    const fee = calculatePassportFee(appData.serviceType, appData.bookletType, appData.dateOfBirth);

    document.getElementById("dispBaseFee").textContent = `₹${fee.baseFee.toLocaleString()}`;
    if (fee.tatkaalFee > 0) {
        document.getElementById("rowTatkaalFee")?.classList.remove("d-none");
        document.getElementById("dispTatkaalFee").textContent = `₹${fee.tatkaalFee.toLocaleString()}`;
    }
    document.getElementById("dispTotalFee").textContent = `₹${fee.totalFee.toLocaleString()}`;
}

function processPayment() {
    const txnId = `TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const fee = calculatePassportFee(appData.serviceType, appData.bookletType, appData.dateOfBirth);

    appData.paymentStatus = "SUCCESSFUL";
    appData.transactionId = txnId;
    appData.amountPaid = fee.totalFee;
    appData.paymentDate = new Date().toLocaleString();
    appData.status = "Payment Successful - Appointment Pending";

    localStorage.setItem(draftKey, JSON.stringify(appData));

    alert(`Payment Successful!\n\nTransaction ID: ${txnId}\nAmount Paid: ₹${fee.totalFee}\n\nYou can now proceed to schedule your appointment.`);
    window.location.href = "appointment.html";
}
