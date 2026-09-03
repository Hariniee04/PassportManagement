const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
if (sessionStorage.getItem("loggedin") !== "true" || !sessionUser) {
    window.location.href = "login.html";
}

const draftKey = `passportApplicationDraft:${sessionUser?.id || sessionUser?.email?.toLowerCase()}`;
const appData = JSON.parse(localStorage.getItem(draftKey) || "null");

document.addEventListener("DOMContentLoaded", () => {
    if (!appData || !appData.submitted) {
        alert("Please complete and submit your passport application first.");
        window.location.href = "application.html";
        return;
    }

    populateSummary();
    renderDocumentChecklist();
});

function populateSummary() {
    document.getElementById("dispArn").textContent = appData.arn || "N/A";
    document.getElementById("dispName").textContent = `${appData.givenName || ''} ${appData.surname || ''}`.trim() || sessionUser.name;
    document.getElementById("dispType").textContent = `${appData.serviceType || 'Normal'} (${appData.bookletType || '36 pages'})`;
    document.getElementById("dispPsk").textContent = appData.pskLocation || "Not Scheduled";
    document.getElementById("dispDate").textContent = appData.appointmentDate || "Not Scheduled";
    document.getElementById("dispTime").textContent = appData.appointmentTime || "Not Scheduled";

    if (appData.serviceType === "Tatkaal") {
        document.getElementById("tatkaalSection")?.classList.remove("d-none");
    }
}

function renderDocumentChecklist() {
    const tbody = document.getElementById("documentChecklistBody");
    if (!tbody) return;

    const checklist = [
        { category: "Proof of Present Address", doc: appData.addressProof ? "Uploaded Address Document" : "Aadhaar Card / Utility Bill / Water Bill / Bank Passbook", orig: "YES", copies: "1 Self-Attested Copy" },
        { category: "Proof of Date of Birth", doc: appData.dobProof ? "Uploaded DOB Certificate" : "Birth Certificate / 10th Marksheet / PAN Card", orig: "YES", copies: "1 Self-Attested Copy" }
    ];

    if (appData.nonEcrStatus === "Yes") {
        checklist.push({
            category: "Non-ECR Category Proof",
            doc: appData.nonEcrProofType || "Matriculation (10th) Certificate / Higher Education Degree",
            orig: "YES",
            copies: "1 Self-Attested Copy"
        });
    }

    if (appData.serviceType === "Tatkaal") {
        checklist.push({
            category: "Tatkaal Undertaking & Proofs",
            doc: "Signed Tatkaal Annexure Undertaking + 3 Eligible Standard Annexure Proofs",
            orig: "YES",
            copies: "1 Set Self-Attested Copies"
        });
    }

    if (appData.heldPrevPassport === "Yes") {
        checklist.push({
            category: "Previous Indian Passport",
            doc: `Old Passport No: ${appData.prevPassNumber || 'N/A'}`,
            orig: "YES",
            copies: "Self-Attested Copy of First 2 & Last 2 Pages"
        });
    }

    tbody.innerHTML = checklist.map(item => `
        <tr>
            <td><strong>${item.category}</strong></td>
            <td>${item.doc}</td>
            <td class="text-center text-success font-weight-bold">✓ ${item.orig}</td>
            <td>${item.copies}</td>
        </tr>
    `).join('');
}
