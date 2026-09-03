// Demo seed applications if none exist in localStorage
function ensureSeedData() {
    let allApps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
    
    // Check if user draft exists and add it to allApps
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("passportApplicationDraft:")) {
            const userApp = JSON.parse(localStorage.getItem(key));
            if (userApp && userApp.submitted && !allApps.some(a => a.arn === userApp.arn)) {
                allApps.push(userApp);
            }
        }
    }

    if (allApps.length === 0) {
        allApps = [
            {
                arn: "PMS-2026-881029",
                givenName: "Keshav",
                surname: "Krishna",
                dateOfBirth: "1998-05-14",
                gender: "Male",
                maritalStatus: "Single",
                citizenship: "Birth",
                serviceType: "Normal",
                bookletType: "36 pages",
                submitted: true,
                submissionDate: "2026-09-01",
                paymentStatus: "SUCCESSFUL",
                appointmentStatus: "Confirmed",
                pskLocation: "Chennai PSK (Saligramam)",
                appointmentDate: "2026-09-03",
                appointmentTime: "10:00 AM",
                tokenNo: null,
                applicantArrived: false,
                verificationStatus: "NOT_STARTED",
                pvrMode: "PRE-PV",
                policeVerificationStatus: "NOT_INITIATED",
                status: "APPOINTMENT_CONFIRMED",
                address: "Flat 4B, Blue Lagoon Apts, Anna Nagar",
                city: "Chennai",
                district: "Chennai",
                state: "Tamil Nadu",
                pincode: "600040",
                mobile: "9876543210",
                email: "keshav@example.com",
                emergencyName: "Ramesh Krishna",
                emergencyMobile: "9876543211",
                emergencyAddress: "Chennai"
            },
            {
                arn: "PMS-2026-992104",
                givenName: "Priya",
                surname: "Sharma",
                dateOfBirth: "2000-11-20",
                gender: "Female",
                maritalStatus: "Single",
                citizenship: "Birth",
                serviceType: "Tatkaal",
                bookletType: "60 pages",
                submitted: true,
                submissionDate: "2026-09-02",
                paymentStatus: "SUCCESSFUL",
                appointmentStatus: "Confirmed",
                pskLocation: "Chennai PSK (Saligramam)",
                appointmentDate: "2026-09-03",
                appointmentTime: "10:30 AM",
                tokenNo: "#042",
                applicantArrived: true,
                arrivalTime: "10:12 AM",
                verificationStatus: "IN_PROGRESS",
                pvrMode: "POST-PV",
                policeVerificationStatus: "NOT_INITIATED",
                status: "APPLICANT_VISITED",
                address: "12, MG Road, Nungambakkam",
                city: "Chennai",
                district: "Chennai",
                state: "Tamil Nadu",
                pincode: "600034",
                mobile: "9123456789",
                email: "priya@example.com",
                emergencyName: "Sunita Sharma",
                emergencyMobile: "9123456780",
                emergencyAddress: "Chennai"
            }
        ];
    }

    localStorage.setItem("allPassportApplications", JSON.stringify(allApps));
    return allApps;
}

let activeModalApp = null;

document.addEventListener("DOMContentLoaded", () => {
    renderQueue();
    setupEvents();
});

function renderQueue(filterTerm = "") {
    const apps = ensureSeedData();
    const tbody = document.getElementById("queueTableBody");
    if (!tbody) return;

    let cntToday = 0, cntArrived = 0, cntPending = 0, cntForwarded = 0;

    tbody.innerHTML = "";
    
    apps.forEach(app => {
        if (!app.submitted) return;

        cntToday++;
        if (app.applicantArrived) cntArrived++;
        if (app.verificationStatus === "NOT_STARTED" || app.verificationStatus === "IN_PROGRESS") cntPending++;
        if (app.verificationStatus === "FORWARDED" || app.verificationStatus === "COMPLETED") cntForwarded++;

        if (filterTerm && !app.arn.toLowerCase().includes(filterTerm.toLowerCase()) && !`${app.givenName} ${app.surname}`.toLowerCase().includes(filterTerm.toLowerCase())) {
            return;
        }

        const isTatkaal = app.serviceType === "Tatkaal";
        const pvLabel = isTatkaal ? "POST-PV REQUIRED" : "PRE-PV REQUIRED";
        const isArrived = app.applicantArrived === true;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                ${isArrived ? `<span class="badge bg-primary fs-6">${app.tokenNo}</span>` : `<span class="badge bg-secondary">NOT GENERATED</span>`}
            </td>
            <td class="fw-bold text-primary">${app.arn}</td>
            <td>${app.givenName || ''} ${app.surname || ''}</td>
            <td><span class="badge ${isTatkaal ? 'bg-danger' : 'bg-info'}">${app.serviceType || 'Normal'}</span></td>
            <td>${app.appointmentDate || ''} <br><small class="text-muted">${app.appointmentTime || ''}</small></td>
            <td><span class="status-badge ${getStatusBadgeClass(app.verificationStatus)}">${app.verificationStatus || 'NOT_STARTED'}</span></td>
            <td>
                <span class="fw-bold small d-block ${isTatkaal ? 'text-primary' : 'text-warning'}">${pvLabel}</span>
                <span class="status-badge ${getPvrBadgeClass(app.policeVerificationStatus)}">${app.policeVerificationStatus || 'NOT_INITIATED'}</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    ${!isArrived ? `<button class="btn btn-outline-success" onclick="markArrived('${app.arn}')">Mark Applicant Arrived</button>` : ''}
                    ${isArrived ? `<button class="btn btn-primary" onclick="openVerificationModal('${app.arn}')">${app.verificationStatus === 'IN_PROGRESS' ? 'Continue Verification' : 'Start Verification'}</button>` : `<button class="btn btn-outline-secondary" disabled title="Mark arrived to start verification">Start Verification</button>`}
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById("cntToday").textContent = cntToday;
    document.getElementById("cntArrived").textContent = cntArrived;
    document.getElementById("cntPending").textContent = cntPending;
    document.getElementById("cntForwarded").textContent = cntForwarded;
}

function getStatusBadgeClass(status) {
    if (status === "IN_PROGRESS") return "status-pending";
    if (status === "FORWARDED" || status === "COMPLETED") return "status-success";
    return "bg-light text-dark";
}

function getPvrBadgeClass(status) {
    if (status === "CLEAR") return "status-success";
    if (status === "ADVERSE") return "bg-danger text-white";
    if (status === "INITIATED" || status === "PENDING" || status === "REQUESTED") return "status-pending";
    return "bg-light text-dark";
}

window.markArrived = function(arn) {
    const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
    const app = apps.find(a => a.arn === arn);
    if (!app) return;

    if (app.applicantArrived && app.tokenNo) {
        alert(`Applicant is already marked as arrived. Token Number: ${app.tokenNo}`);
        return;
    }

    const tokenNum = `#${Math.floor(100 + Math.random() * 900)}`;
    app.applicantArrived = true;
    app.arrivalTime = new Date().toLocaleTimeString();
    app.markedArrivedBy = sessionUser.name;
    app.tokenNo = tokenNum;
    app.verificationStatus = "IN_PROGRESS";
    app.status = "APPLICANT_VISITED";

    localStorage.setItem("allPassportApplications", JSON.stringify(apps));
    renderQueue();
    alert(`Applicant arrival confirmed!\n\nARN: ${arn}\nGenerated Token #: ${tokenNum}`);
};

window.openVerificationModal = function(arn) {
    const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
    const app = apps.find(a => a.arn === arn);
    if (!app) return;

    if (!app.applicantArrived) {
        alert("Applicant has not arrived yet. Please mark applicant as arrived first.");
        return;
    }

    activeModalApp = app;
    document.getElementById("modalArn").textContent = `${app.arn} (Token ${app.tokenNo || ''})`;

    renderTabDetails(app);

    const modal = new bootstrap.Modal(document.getElementById("verificationModal"));
    modal.show();
};

function renderTabDetails(app) {
    const isTatkaal = app.serviceType === "Tatkaal";
    const pvrModeText = isTatkaal ? "POST-PV (Post-Police Verification for Tatkaal)" : "PRE-PV (Pre-Police Verification for Normal)";

    // Tab 1: Passport
    document.getElementById("voPassDetails").innerHTML = `
        <div class="col-md-4"><strong>ARN:</strong> ${app.arn}</div>
        <div class="col-md-4"><strong>Token #:</strong> ${app.tokenNo || 'N/A'}</div>
        <div class="col-md-4"><strong>Application Type:</strong> ${app.serviceType || 'Normal'}</div>
        <div class="col-md-4"><strong>Booklet Type:</strong> ${app.bookletType || '36 pages'}</div>
        <div class="col-md-4"><strong>Submission Date:</strong> ${app.submissionDate || '-'}</div>
        <div class="col-md-4"><strong>Payment Status:</strong> ${app.paymentStatus || 'Pending'}</div>
        <div class="col-md-4"><strong>Appointment:</strong> ${app.appointmentDate || ''} ${app.appointmentTime || ''}</div>
        ${app.lastSavedAt ? `<div class="col-12 mt-2 alert alert-light py-1 small">Draft saved on: <strong>${app.lastSavedAt}</strong> by <strong>${app.lastSavedBy || 'Officer'}</strong></div>` : ''}
    `;

    // Tab 2: Applicant
    document.getElementById("voApplicantDetails").innerHTML = `
        <div class="col-md-6"><strong>Given Name:</strong> ${app.givenName || '-'}</div>
        <div class="col-md-6"><strong>Surname:</strong> ${app.surname || '-'}</div>
        <div class="col-md-4"><strong>DOB:</strong> ${app.dateOfBirth || '-'}</div>
        <div class="col-md-4"><strong>Gender:</strong> ${app.gender || '-'}</div>
        <div class="col-md-4"><strong>Marital Status:</strong> ${app.maritalStatus || '-'}</div>
        <div class="col-md-4"><strong>Citizenship:</strong> ${app.citizenship || '-'}</div>
        <div class="col-md-4"><strong>PAN:</strong> ${app.panNumber || 'N/A'}</div>
        <div class="col-md-4"><strong>Voter ID:</strong> ${app.voterId || 'N/A'}</div>
    `;

    // Tab 3: Family
    document.getElementById("voFamilyDetails").innerHTML = `
        <div class="col-md-6"><strong>Father:</strong> ${app.fatherGivenName || ''} ${app.fatherSurname || ''}</div>
        <div class="col-md-6"><strong>Mother:</strong> ${app.motherGivenName || ''} ${app.motherSurname || ''}</div>
        <div class="col-md-6"><strong>Spouse:</strong> ${app.spouseGivenName || ''} ${app.spouseSurname || 'N/A'}</div>
    `;

    // Tab 4: Address
    document.getElementById("voAddressDetails").innerHTML = `
        <div class="col-12"><strong>Present Address:</strong> ${app.address || '-'}, ${app.city || ''}, ${app.district || ''}, ${app.state || ''} - ${app.pincode || ''}</div>
        <div class="col-md-4"><strong>Mobile:</strong> ${app.mobile || '-'}</div>
        <div class="col-md-4"><strong>Email:</strong> ${app.email || '-'}</div>
    `;

    // Tab 5: Emergency
    document.getElementById("voEmergencyDetails").innerHTML = `
        <div class="col-md-6"><strong>Name:</strong> ${app.emergencyName || '-'}</div>
        <div class="col-md-6"><strong>Mobile:</strong> ${app.emergencyMobile || '-'}</div>
        <div class="col-12"><strong>Address:</strong> ${app.emergencyAddress || '-'}</div>
    `;

    // Tab 6: Prev Passport
    document.getElementById("voPrevPassportDetails").innerHTML = `
        <div class="col-md-6"><strong>Held Identity Certificate?</strong> ${app.heldIdentityCert || 'No'}</div>
        <div class="col-md-6"><strong>Held Prev Indian Passport?</strong> ${app.heldPrevPassport || 'No'}</div>
    `;

    // Tab 7: Declarations
    document.getElementById("voDeclarationsList").innerHTML = `
        <div class="alert alert-light border">
            <strong>Statutory Declarations:</strong> All 15 legal background questions declared by applicant.
            <div class="badge bg-success mt-1 d-block w-25">No Adverse Declarations Recorded</div>
        </div>
    `;

    // Tab 8: Document Verification
    const docsContainer = document.getElementById("voDocVerificationContainer");
    docsContainer.innerHTML = `
        <div class="border rounded p-3 mb-3">
            <h6 class="fw-bold">1. Address Proof Document</h6>
            <div class="row g-2 align-items-center">
                <div class="col-md-3"><span class="badge bg-secondary">Uploaded: Address_Proof.pdf</span></div>
                <div class="col-md-3"><label class="form-check-label"><input type="checkbox" id="chkAddrOrig" class="form-check-input" ${app.voAddrOrig ? 'checked' : ''}> Original Presented</label></div>
                <div class="col-md-3"><label class="form-check-label"><input type="checkbox" id="chkAddrMatch" class="form-check-input" ${app.voAddrMatch ? 'checked' : ''}> Matches Upload</label></div>
                <div class="col-md-3">
                    <select id="selAddrResult" class="form-select form-select-sm">
                        <option value="VERIFIED" ${app.voAddrResult === 'VERIFIED' ? 'selected' : ''}>VERIFIED</option>
                        <option value="MISMATCH" ${app.voAddrResult === 'MISMATCH' ? 'selected' : ''}>MISMATCH</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="border rounded p-3 mb-3">
            <h6 class="fw-bold">2. Date of Birth Proof Document</h6>
            <div class="row g-2 align-items-center">
                <div class="col-md-3"><span class="badge bg-secondary">Uploaded: DOB_Proof.pdf</span></div>
                <div class="col-md-3"><label class="form-check-label"><input type="checkbox" id="chkDobOrig" class="form-check-input" ${app.voDobOrig ? 'checked' : ''}> Original Presented</label></div>
                <div class="col-md-3"><label class="form-check-label"><input type="checkbox" id="chkDobMatch" class="form-check-input" ${app.voDobMatch ? 'checked' : ''}> Matches Upload</label></div>
                <div class="col-md-3">
                    <select id="selDobResult" class="form-select form-select-sm">
                        <option value="VERIFIED" ${app.voDobResult === 'VERIFIED' ? 'selected' : ''}>VERIFIED</option>
                        <option value="MISMATCH" ${app.voDobResult === 'MISMATCH' ? 'selected' : ''}>MISMATCH</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    // Tab 9 Biometrics Status
    document.getElementById("photoStatusText").textContent = app.photoStatus || "Status: Not Captured";
    document.getElementById("bioStatusText").textContent = app.biometricStatus || "Status: Not Captured";

    // Tab 10 PVR fields
    document.getElementById("pvrMode").value = pvrModeText;
    if (app.pvrStation) document.getElementById("pvrStation").value = app.pvrStation;

    const isPvrInitiated = app.policeVerificationStatus && app.policeVerificationStatus !== "NOT_INITIATED";
    const btnInitiate = document.getElementById("btnInitiatePvr");
    const pvrResultSelect = document.getElementById("pvrResult");
    const pvrRemarksInput = document.getElementById("pvrReportRemarks");

    if (!isPvrInitiated) {
        pvrResultSelect.disabled = true;
        pvrRemarksInput.disabled = true;
        document.getElementById("pvrInfoBox").innerHTML = `
            <div class="alert alert-secondary small">Police verification has not been initiated yet. Click <strong>Initiate PVR Request</strong> to start asynchronous police verification.</div>
        `;
    } else {
        pvrResultSelect.disabled = false;
        pvrRemarksInput.disabled = false;
        if (app.policeVerificationStatus) pvrResultSelect.value = app.policeVerificationStatus;
        if (app.pvrReportRemarks) pvrRemarksInput.value = app.pvrReportRemarks;

        document.getElementById("pvrInfoBox").innerHTML = `
            <div class="alert alert-info small">
                <strong>Police verification has been initiated.</strong><br>
                <strong>Request ID:</strong> ${app.pvrId || 'N/A'}<br>
                <strong>Initiated On:</strong> ${app.pvrInitiatedDate || '-'}<br>
                <strong>Status:</strong> <span class="fw-bold">${app.policeVerificationStatus}</span><br>
                <em>Expected completion: approximately 1–3 weeks (Academic Simulation Estimate).</em>
            </div>
        `;
    }
}

function setupEvents() {
    document.getElementById("btnSearchArn")?.addEventListener("click", () => {
        const term = document.getElementById("searchArnInput").value;
        renderQueue(term);
    });

    document.getElementById("btnCapturePhoto")?.addEventListener("click", () => {
        if (!activeModalApp) return;
        activeModalApp.photoStatus = "CAPTURED";
        document.getElementById("photoStatusText").textContent = "Status: CAPTURED ✓";
        alert("Mock Photograph Captured Successfully!");
    });

    document.getElementById("btnCaptureBiometrics")?.addEventListener("click", () => {
        if (!activeModalApp) return;
        activeModalApp.biometricStatus = "CAPTURED";
        document.getElementById("bioStatusText").textContent = "Status: CAPTURED ✓";
        alert("Mock Fingerprint Biometrics Captured Successfully!");
    });

    // Save Draft Event
    document.getElementById("btnSaveVerificationDraft")?.addEventListener("click", () => {
        saveVerificationData(false);
    });

    // Initiate PVR Event
    document.getElementById("btnInitiatePvr")?.addEventListener("click", () => {
        if (!activeModalApp) return;
        const isTatkaal = activeModalApp.serviceType === "Tatkaal";
        const mode = isTatkaal ? "POST-PV" : "PRE-PV";
        const station = document.getElementById("pvrStation").value || "Designated Police Station";
        const pvrId = `PVR-2026-${Math.floor(100000 + Math.random() * 900000)}`;

        activeModalApp.pvrId = pvrId;
        activeModalApp.pvrMode = mode;
        activeModalApp.pvrStation = station;
        activeModalApp.pvrInitiatedDate = new Date().toLocaleDateString();
        activeModalApp.policeVerificationStatus = "INITIATED";

        saveVerificationData(true);
        renderTabDetails(activeModalApp);

        alert(`Police Verification Request initiated!\n\nPVR Request ID: ${pvrId}\nStation: ${station}\nMode: ${mode}\nStatus: INITIATED (Estimated completion: 1–3 weeks)`);
    });

    // Forward to PO Event
    document.getElementById("btnForwardToPO")?.addEventListener("click", () => {
        if (!activeModalApp) return;

        saveVerificationData(true);

        const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
        const index = apps.findIndex(a => a.arn === activeModalApp.arn);

        if (index !== -1) {
            const isTatkaal = activeModalApp.serviceType === "Tatkaal";
            const pvrRes = document.getElementById("pvrResult").value;
            
            apps[index].verificationStatus = "FORWARDED";
            apps[index].pvrMode = isTatkaal ? "POST-PV" : "PRE-PV";
            if (pvrRes && pvrRes !== "PENDING") {
                apps[index].policeVerificationStatus = pvrRes;
            } else if (!apps[index].policeVerificationStatus || apps[index].policeVerificationStatus === "NOT_INITIATED") {
                apps[index].policeVerificationStatus = "INITIATED";
            }
            apps[index].status = "PASSPORT_OFFICER_REVIEW";
            apps[index].verificationOfficerId = sessionUser.id;
            apps[index].verificationDate = new Date().toLocaleString();

            localStorage.setItem("allPassportApplications", JSON.stringify(apps));
            alert(`Application ${activeModalApp.arn} verified and forwarded to Passport Officer.\nPV Mode: ${apps[index].pvrMode}`);
            
            const modalEl = document.getElementById("verificationModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            renderQueue();
        }
    });
}

function saveVerificationData(silent = false) {
    if (!activeModalApp) return;

    const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
    const index = apps.findIndex(a => a.arn === activeModalApp.arn);

    if (index !== -1) {
        activeModalApp.voAddrOrig = document.getElementById("chkAddrOrig")?.checked || false;
        activeModalApp.voAddrMatch = document.getElementById("chkAddrMatch")?.checked || false;
        activeModalApp.voAddrResult = document.getElementById("selAddrResult")?.value || "VERIFIED";

        activeModalApp.voDobOrig = document.getElementById("chkDobOrig")?.checked || false;
        activeModalApp.voDobMatch = document.getElementById("chkDobMatch")?.checked || false;
        activeModalApp.voDobResult = document.getElementById("selDobResult")?.value || "VERIFIED";

        activeModalApp.pvrStation = document.getElementById("pvrStation")?.value || activeModalApp.pvrStation;
        if (!document.getElementById("pvrResult")?.disabled) {
            activeModalApp.policeVerificationStatus = document.getElementById("pvrResult")?.value || activeModalApp.policeVerificationStatus;
            activeModalApp.pvrReportRemarks = document.getElementById("pvrReportRemarks")?.value || "";
        }

        activeModalApp.lastSavedAt = new Date().toLocaleString();
        activeModalApp.lastSavedBy = sessionUser.name;

        apps[index] = { ...apps[index], ...activeModalApp };
        localStorage.setItem("allPassportApplications", JSON.stringify(apps));

        if (!silent) {
            alert(`Verification draft saved successfully!\nSaved on: ${activeModalApp.lastSavedAt}`);
        }
    }
}
