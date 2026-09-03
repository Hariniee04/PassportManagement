const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
if (sessionStorage.getItem("loggedin") !== "true" || !sessionUser || sessionUser.role !== "PASSPORT_OFFICER") {
    if (!sessionUser || (sessionUser.role !== "PASSPORT_OFFICER" && sessionUser.role !== "ADMIN")) {
        window.location.href = "login.html?role=passport-officer";
    }
}

document.getElementById("poNameDisplay").textContent = sessionUser?.name || "Passport Officer";
document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
});

let activePoModalApp = null;

document.addEventListener("DOMContentLoaded", () => {
    renderPoQueue();
    setupPoEvents();
});

function renderPoQueue(filterTerm = "") {
    const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
    const tbody = document.getElementById("poQueueBody");
    if (!tbody) return;

    let cntReview = 0, cntAdverse = 0, cntGranted = 0, cntDispatched = 0;

    tbody.innerHTML = "";

    apps.forEach(app => {
        if (!app.submitted) return;

        if (app.status === "PASSPORT_OFFICER_REVIEW" || app.verificationStatus === "FORWARDED") cntReview++;
        if (app.policeVerificationStatus === "ADVERSE") cntAdverse++;
        if (app.status === "GRANTED" || app.status === "PRINTING" || app.status === "DISPATCHED") cntGranted++;
        if (app.status === "DISPATCHED") cntDispatched++;

        if (filterTerm && !app.arn.toLowerCase().includes(filterTerm.toLowerCase()) && !`${app.givenName} ${app.surname}`.toLowerCase().includes(filterTerm.toLowerCase())) {
            return;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="fw-bold text-primary">${app.arn}</td>
            <td>${app.givenName || ''} ${app.surname || ''}</td>
            <td><span class="badge ${app.serviceType === 'Tatkaal' ? 'bg-danger' : 'bg-info'}">${app.serviceType || 'Normal'}</span></td>
            <td><span class="status-badge ${getStatusBadgeClass(app.verificationStatus)}">${app.verificationStatus || 'FORWARDED'}</span></td>
            <td><span class="status-badge ${getPvrBadgeClass(app.policeVerificationStatus)}">${app.policeVerificationStatus || 'CLEAR'}</span></td>
            <td><strong class="text-navy">${app.status || 'PASSPORT_OFFICER_REVIEW'}</strong></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="openPoModal('${app.arn}')">Review Case</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("cntReview").textContent = cntReview;
    document.getElementById("cntAdverse").textContent = cntAdverse;
    document.getElementById("cntGranted").textContent = cntGranted;
    document.getElementById("cntDispatched").textContent = cntDispatched;
}

function getStatusBadgeClass(status) {
    if (status === "FORWARDED" || status === "VERIFICATION_COMPLETED") return "status-success";
    return "bg-light text-dark";
}

function getPvrBadgeClass(status) {
    if (status === "CLEAR") return "status-success";
    if (status === "ADVERSE") return "bg-danger text-white";
    return "status-pending";
}

window.openPoModal = function(arn) {
    const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
    const app = apps.find(a => a.arn === arn);
    if (!app) return;

    activePoModalApp = app;
    document.getElementById("poModalArn").textContent = app.arn;

    renderPoTabs(app);

    const modal = new bootstrap.Modal(document.getElementById("poReviewModal"));
    modal.show();
};

function renderPoTabs(app) {
    document.getElementById("poPassOverview").innerHTML = `
        <div class="col-md-4"><strong>ARN:</strong> ${app.arn}</div>
        <div class="col-md-4"><strong>Type:</strong> ${app.serviceType || 'Normal'} (${app.bookletType || '36 pages'})</div>
        <div class="col-md-4"><strong>Submission Date:</strong> ${app.submissionDate || '-'}</div>
    `;

    document.getElementById("poApplicantOverview").innerHTML = `
        <div class="col-md-6"><strong>Name:</strong> ${app.givenName || ''} ${app.surname || ''}</div>
        <div class="col-md-6"><strong>DOB / Gender:</strong> ${app.dateOfBirth || ''} / ${app.gender || ''}</div>
    `;

    document.getElementById("poFamilyOverview").innerHTML = `
        <div class="col-md-6"><strong>Father:</strong> ${app.fatherGivenName || ''} ${app.fatherSurname || ''}</div>
        <div class="col-md-6"><strong>Mother:</strong> ${app.motherGivenName || ''} ${app.motherSurname || ''}</div>
    `;

    document.getElementById("poAddressOverview").innerHTML = `
        <div class="col-12"><strong>Address:</strong> ${app.address || ''}, ${app.city || ''}, ${app.district || ''}, ${app.state || ''} - ${app.pincode || ''}</div>
    `;

    document.getElementById("poEmergencyOverview").innerHTML = `
        <div class="col-md-6"><strong>Emergency Contact:</strong> ${app.emergencyName || ''} (${app.emergencyMobile || ''})</div>
    `;

    document.getElementById("poPrevPassportOverview").innerHTML = `
        <div class="col-12"><strong>Held Identity Certificate / Prev Passport:</strong> ${app.heldPrevPassport || 'No'}</div>
    `;

    document.getElementById("poDeclarationsOverview").innerHTML = `
        <div class="alert alert-light border">No statutory legal issues flagged.</div>
    `;

    document.getElementById("poDocOverview").innerHTML = `
        <div class="alert alert-light border">✓ Address Proof & DOB Proof Files Verified</div>
    `;

    document.getElementById("poVoReportOverview").innerHTML = `
        <div class="alert alert-success border">
            <strong>Verification Officer Report:</strong>
            <p class="mb-0 small">Verified by Officer: ${app.verificationOfficerId || 'VO-101'} on ${app.verificationDate || 'Recently'}</p>
            <p class="mb-0 small">Original Documents Verified: YES | Data Mismatches: None</p>
        </div>
    `;

    document.getElementById("poBiometricsOverview").innerHTML = `
        <div class="alert alert-info border">
            <strong>Biometrics & Photograph:</strong> Photo Status: ${app.photoStatus || 'CAPTURED'} | Fingerprints: ${app.biometricStatus || 'CAPTURED'}
        </div>
    `;

    const isAdverse = app.policeVerificationStatus === "ADVERSE";
    document.getElementById("poPvrOverview").innerHTML = `
        <div class="alert ${isAdverse ? 'alert-danger' : 'alert-success'} border">
            <strong>Police Verification Report (PVR):</strong> Status: <strong>${app.policeVerificationStatus || 'CLEAR'}</strong>
            <p class="mb-0 small">PVR Request ID: ${app.pvrId || 'PVR-2026-102948'} | Station: ${app.pvrStation || 'Local PS'}</p>
            ${isAdverse ? '<p class="mt-2 text-danger fw-bold mb-0">⚠ WARNING: Police station filed adverse remarks. Exercise caution before granting.</p>' : ''}
        </div>
    `;

    // Tab 12 Dispatch Pipeline Controls
    const pipelineContainer = document.getElementById("poDispatchPipelineContainer");
    const isGranted = app.status === "GRANTED" || app.status === "PRINTING" || app.status === "LAMINATION" || app.status === "DISPATCHED";

    if (!isGranted) {
        pipelineContainer.innerHTML = `<div class="alert alert-secondary">Passport must be <strong>GRANTED</strong> first before initializing the printing and dispatch pipeline.</div>`;
    } else {
        pipelineContainer.innerHTML = `
            <div class="border rounded p-3">
                <h6>Passport Processing Pipeline Controls</h6>
                <p><strong>Mock Passport Number:</strong> <span class="text-primary fw-bold">${app.mockPassportNumber || 'P7482019'}</span></p>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-outline-primary" onclick="updatePipelineStatus('${app.arn}', 'PRINTING')">Send to Printing</button>
                    <button class="btn btn-sm btn-outline-primary" onclick="updatePipelineStatus('${app.arn}', 'LAMINATION')">Send to Lamination</button>
                    <button class="btn btn-sm btn-success" onclick="updatePipelineStatus('${app.arn}', 'DISPATCHED')">Mark Dispatched</button>
                </div>
                ${app.mockTrackingNumber ? `<div class="mt-3 alert alert-info small mb-0">Dispatched via Speed Post! Mock Tracking No: <strong>${app.mockTrackingNumber}</strong></div>` : ''}
            </div>
        `;
    }
}

window.updatePipelineStatus = function(arn, newStatus) {
    const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
    const app = apps.find(a => a.arn === arn);
    if (app) {
        app.status = newStatus;
        if (newStatus === "DISPATCHED") {
            app.mockTrackingNumber = `TRACK-2026-${Math.floor(100000 + Math.random() * 900000)}`;
            app.dispatchDate = new Date().toLocaleDateString();
        }
        localStorage.setItem("allPassportApplications", JSON.stringify(apps));
        alert(`Application ${arn} status updated to: ${newStatus}`);
        renderPoTabs(app);
        renderPoQueue();
    }
};

function setupPoEvents() {
    document.getElementById("poSearchInput")?.addEventListener("input", (e) => {
        renderPoQueue(e.target.value);
    });

    document.getElementById("btnConfirmDecision")?.addEventListener("click", () => {
        if (!activePoModalApp) return;

        const decision = document.getElementById("poDecisionSelect").value;
        const remarks = document.getElementById("poRemarksInput").value || "Decision executed by Passport Officer.";

        const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
        const index = apps.findIndex(a => a.arn === activePoModalApp.arn);

        if (index !== -1) {
            const targetApp = apps[index];
            const isNormal = targetApp.serviceType !== "Tatkaal";
            const pvStatus = targetApp.policeVerificationStatus || "PENDING";

            // Guard: Normal applications require PRE-PV CLEAR before GRANT
            if (decision === "GRANT" && isNormal && pvStatus !== "CLEAR") {
                alert(`Cannot Grant Normal Passport!\n\nNormal processing type requires Pre-Police Verification (PRE-PV) to be CLEAR before passport grant. Current PV Status: ${pvStatus}`);
                return;
            }

            targetApp.passportOfficerDecision = decision;
            targetApp.passportOfficerRemarks = remarks;
            targetApp.passportOfficerId = sessionUser.id;
            targetApp.decisionDate = new Date().toLocaleString();

            if (decision === "GRANT") {
                targetApp.status = "GRANTED";
                targetApp.mockPassportNumber = `P${Math.floor(1000000 + Math.random() * 9000000)}`;
                alert(`PASSPORT GRANTED!\n\nApplication ARN: ${activePoModalApp.arn}\nProcessing Type: ${targetApp.serviceType || 'Normal'}\nGenerated Mock Passport Number: ${targetApp.mockPassportNumber}`);
            } else {
                targetApp.status = decision;
                alert(`Decision executed: ${decision}`);
            }

            localStorage.setItem("allPassportApplications", JSON.stringify(apps));

            const modalEl = document.getElementById("poReviewModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            renderPoQueue();
        }
    });
}
