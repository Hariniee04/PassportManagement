const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
if (sessionStorage.getItem("loggedin") !== "true" || !sessionUser || sessionUser.role !== "VERIFICATION_OFFICER") {
    // Allow demo access if staff role logged in
    if (!sessionUser || (sessionUser.role !== "VERIFICATION_OFFICER" && sessionUser.role !== "ADMIN")) {
        window.location.href = "login.html?role=verification-officer";
    }
}

document.getElementById("officerNameDisplay").textContent = sessionUser?.name || "Verification Officer";
document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
});

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
                tokenNo: "TOK-101",
                verificationStatus: "SCHEDULED",
                pvrMode: "PRE-PV",
                policeVerificationStatus: "PENDING",
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
                tokenNo: "TOK-102",
                verificationStatus: "ARRIVED",
                pvrMode: "POST-PV",
                policeVerificationStatus: "PENDING",
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
        if (app.verificationStatus === "ARRIVED") cntArrived++;
        if (app.verificationStatus === "SCHEDULED" || app.verificationStatus === "ARRIVED") cntPending++;
        if (app.verificationStatus === "FORWARDED") cntForwarded++;

        if (filterTerm && !app.arn.toLowerCase().includes(filterTerm.toLowerCase()) && !`${app.givenName} ${app.surname}`.toLowerCase().includes(filterTerm.toLowerCase())) {
            return;
        }

        const isTatkaal = app.serviceType === "Tatkaal";
        const pvLabel = isTatkaal ? "POST-PV REQUIRED" : "PRE-PV REQUIRED";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><span class="badge bg-secondary">${app.tokenNo || 'Pending'}</span></td>
            <td class="fw-bold text-primary">${app.arn}</td>
            <td>${app.givenName || ''} ${app.surname || ''}</td>
            <td><span class="badge ${isTatkaal ? 'bg-danger' : 'bg-info'}">${app.serviceType || 'Normal'}</span></td>
            <td>${app.appointmentDate || ''} <br><small class="text-muted">${app.appointmentTime || ''}</small></td>
            <td><span class="status-badge ${getStatusBadgeClass(app.verificationStatus)}">${app.verificationStatus || 'SCHEDULED'}</span></td>
            <td>
                <span class="fw-bold small d-block ${isTatkaal ? 'text-primary' : 'text-warning'}">${pvLabel}</span>
                <span class="status-badge ${getPvrBadgeClass(app.policeVerificationStatus)}">${app.policeVerificationStatus || 'PENDING'}</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    ${app.verificationStatus === 'SCHEDULED' ? `<button class="btn btn-outline-success" onclick="markArrived('${app.arn}')">Mark Arrived</button>` : ''}
                    <button class="btn btn-outline-primary" onclick="openVerificationModal('${app.arn}')">Verify & View</button>
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
    if (status === "ARRIVED") return "status-pending";
    if (status === "FORWARDED" || status === "VERIFICATION_COMPLETED") return "status-success";
    return "bg-light text-dark";
}

function getPvrBadgeClass(status) {
    if (status === "CLEAR") return "status-success";
    if (status === "ADVERSE") return "bg-danger text-white";
    if (status === "PENDING" || status === "REQUESTED") return "status-pending";
    return "bg-light text-dark";
}

window.markArrived = function(arn) {
    const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
    const app = apps.find(a => a.arn === arn);
    if (app) {
        app.verificationStatus = "ARRIVED";
        app.status = "APPLICANT_VISITED";
        app.tokenNo = `TOK-${Math.floor(100 + Math.random() * 900)}`;
        localStorage.setItem("allPassportApplications", JSON.stringify(apps));
        renderQueue();
        alert(`Applicant marked as Arrived. Token Number generated: ${app.tokenNo}`);
    }
};

window.openVerificationModal = function(arn) {
    const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
    const app = apps.find(a => a.arn === arn);
    if (!app) return;

    activeModalApp = app;
    document.getElementById("modalArn").textContent = app.arn;

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
        <div class="col-md-4"><strong>Application Type:</strong> ${app.serviceType || 'Normal'}</div>
        <div class="col-md-4"><strong>Booklet Type:</strong> ${app.bookletType || '36 pages'}</div>
        <div class="col-md-4"><strong>Submission Date:</strong> ${app.submissionDate || '-'}</div>
        <div class="col-md-4"><strong>Payment Status:</strong> ${app.paymentStatus || 'Pending'}</div>
        <div class="col-md-4"><strong>Appointment:</strong> ${app.appointmentDate || ''} ${app.appointmentTime || ''}</div>
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
                <div class="col-md-3"><label class="form-check-label"><input type="checkbox" class="form-check-input" checked> Original Presented</label></div>
                <div class="col-md-3"><label class="form-check-label"><input type="checkbox" class="form-check-input" checked> Matches Upload</label></div>
                <div class="col-md-3">
                    <select class="form-select form-select-sm">
                        <option value="VERIFIED" selected>VERIFIED</option>
                        <option value="MISMATCH">MISMATCH</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="border rounded p-3 mb-3">
            <h6 class="fw-bold">2. Date of Birth Proof Document</h6>
            <div class="row g-2 align-items-center">
                <div class="col-md-3"><span class="badge bg-secondary">Uploaded: DOB_Proof.pdf</span></div>
                <div class="col-md-3"><label class="form-check-label"><input type="checkbox" class="form-check-input" checked> Original Presented</label></div>
                <div class="col-md-3"><label class="form-check-label"><input type="checkbox" class="form-check-input" checked> Matches Upload</label></div>
                <div class="col-md-3">
                    <select class="form-select form-select-sm">
                        <option value="VERIFIED" selected>VERIFIED</option>
                        <option value="MISMATCH">MISMATCH</option>
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
    if (app.policeVerificationStatus) document.getElementById("pvrResult").value = app.policeVerificationStatus;
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

    document.getElementById("btnInitiatePvr")?.addEventListener("click", () => {
        if (!activeModalApp) return;
        const isTatkaal = activeModalApp.serviceType === "Tatkaal";
        const mode = isTatkaal ? "POST-PV" : "PRE-PV";
        const station = document.getElementById("pvrStation").value || "Designated Police Station";
        const pvrId = `PVR-2026-${Math.floor(100000 + Math.random() * 900000)}`;

        activeModalApp.pvrId = pvrId;
        activeModalApp.pvrMode = mode;
        activeModalApp.pvrStation = station;
        activeModalApp.policeVerificationStatus = "PENDING";

        alert(`Police Verification Request initiated!\n\nPVR Request ID: ${pvrId}\nStation: ${station}\nAuto-Assigned Mode: ${mode}`);
    });

    document.getElementById("btnForwardToPO")?.addEventListener("click", () => {
        if (!activeModalApp) return;

        const apps = JSON.parse(localStorage.getItem("allPassportApplications") || "[]");
        const index = apps.findIndex(a => a.arn === activeModalApp.arn);

        if (index !== -1) {
            const isTatkaal = activeModalApp.serviceType === "Tatkaal";
            const pvrRes = document.getElementById("pvrResult").value;
            
            apps[index].verificationStatus = "FORWARDED";
            apps[index].pvrMode = isTatkaal ? "POST-PV" : "PRE-PV";
            apps[index].policeVerificationStatus = pvrRes || "PENDING";
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
