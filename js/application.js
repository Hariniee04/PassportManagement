const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
if (sessionStorage.getItem("loggedin") !== "true" || !sessionUser) {
    window.location.href = "login.html";
}

const draftKey = `passportApplicationDraft:${sessionUser?.id || sessionUser?.email?.toLowerCase()}`;
let currentStep = 1;
const totalSteps = 11;

const otherQuestionsList = [
    "1. Are any proceedings in respect of an offence alleged to have been committed by you pending before a criminal court in India?",
    "2. Has any warrant or summons for your appearance been issued and pending before a court?",
    "3. Has a warrant for your arrest been issued?",
    "4. Has an order prohibiting your departure from India been made by any court?",
    "5. Have you during the preceding five years been convicted by a court in India for an offence involving moral turpitude and sentenced to imprisonment for not less than two years?",
    "6. Have you ever been refused/denied a passport?",
    "7. Has your passport ever been impounded?",
    "8. Has your passport ever been revoked?",
    "9. Have you ever been granted citizenship by another country?",
    "10. Have you ever held the passport of another country?",
    "11. Have you ever surrendered your Indian passport?",
    "12. Have you ever applied for renunciation of Indian citizenship?",
    "13. Have you ever returned to India on an Emergency Certificate?",
    "14. Have you ever been deported from any country?",
    "15. Have you ever been repatriated from any country back to India?"
];

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
    renderOtherQuestions();
    setupEventListeners();
    loadDraft();
    updateStepUI();
});

function renderOtherQuestions() {
    const container = document.getElementById("otherQuestionsContainer");
    if (!container) return;
    container.innerHTML = "";
    
    otherQuestionsList.forEach((qText, index) => {
        const qId = index + 1;
        const div = document.createElement("div");
        div.className = "p-3 border rounded bg-light";
        div.innerHTML = `
            <label class="form-label font-weight-bold">${qText}</label>
            <div class="d-flex gap-4">
                <div class="form-check">
                    <input class="form-check-input other-q-radio" type="radio" name="otherQ_${qId}" id="otherQ_${qId}_no" value="No" checked>
                    <label class="form-check-label" for="otherQ_${qId}_no">No</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input other-q-radio" type="radio" name="otherQ_${qId}" id="otherQ_${qId}_yes" value="Yes">
                    <label class="form-check-label" for="otherQ_${qId}_yes">Yes</label>
                </div>
            </div>
            <div class="mt-2 d-none" id="otherQ_${qId}_detailsGroup">
                <input class="form-control" name="otherQ_${qId}_details" placeholder="Provide details/explanation for Yes response">
            </div>
        `;
        container.appendChild(div);
    });

    // Add listeners for Yes details
    document.querySelectorAll(".other-q-radio").forEach(radio => {
        radio.addEventListener("change", (e) => {
            const parts = e.target.name.split("_");
            const qId = parts[1];
            const detailsGroup = document.getElementById(`otherQ_${qId}_detailsGroup`);
            if (detailsGroup) {
                if (e.target.value === "Yes") {
                    detailsGroup.classList.remove("d-none");
                } else {
                    detailsGroup.classList.add("d-none");
                }
            }
        });
    });
}

function setupEventListeners() {
    // Stepper Tab Clicks
    document.querySelectorAll(".step-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const targetStep = parseInt(tab.getAttribute("data-step"));
            if (targetStep <= currentStep || validateCurrentStep()) {
                currentStep = targetStep;
                updateStepUI();
            }
        });
    });

    // Navigation buttons
    document.getElementById("btnNextStep")?.addEventListener("click", () => {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepUI();
                saveDraft(true);
            }
        }
    });

    document.getElementById("btnPrevStep")?.addEventListener("click", () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepUI();
        }
    });

    document.getElementById("saveDraft")?.addEventListener("click", () => saveDraft(false));

    // Dynamic field toggles
    document.getElementById("serviceType")?.addEventListener("change", (e) => {
        const isTatkaal = e.target.value === "Tatkaal";
        document.getElementById("tatkaalPanel")?.classList.toggle("d-none", !isTatkaal);
        document.getElementById("tatkaalUndertakingDocGroup")?.classList.toggle("d-none", !isTatkaal);
    });

    document.getElementById("hasAlias")?.addEventListener("change", (e) => {
        document.getElementById("aliasDetailsGroup")?.classList.toggle("d-none", e.target.value !== "Yes");
    });

    document.getElementById("hasNameChanged")?.addEventListener("change", (e) => {
        document.getElementById("nameChangeGroup")?.classList.toggle("d-none", e.target.value !== "Yes");
    });

    document.getElementById("birthOutsideIndia")?.addEventListener("change", (e) => {
        const outside = e.target.value === "Yes";
        document.getElementById("domesticBirthGroup")?.classList.toggle("d-none", outside);
        document.getElementById("foreignBirthGroup")?.classList.toggle("d-none", !outside);
    });

    document.getElementById("maritalStatus")?.addEventListener("change", (e) => {
        const isMarried = e.target.value === "Married";
        document.getElementById("spouseDetailsGroup")?.classList.toggle("d-none", !isMarried);
    });

    document.getElementById("employmentType")?.addEventListener("change", (e) => {
        const val = e.target.value;
        const requiresOrg = ["Government", "PSU", "Statutory Body"].includes(val);
        document.getElementById("orgNameGroup")?.classList.toggle("d-none", !requiresOrg);
    });

    document.getElementById("nonEcrStatus")?.addEventListener("change", (e) => {
        const isYes = e.target.value === "Yes";
        document.getElementById("nonEcrProofGroup")?.classList.toggle("d-none", !isYes);
        document.getElementById("nonEcrDocGroup")?.classList.toggle("d-none", !isYes);
    });

    document.getElementById("permanentSame")?.addEventListener("change", (e) => {
        document.getElementById("permanentAddressGroup")?.classList.toggle("d-none", e.target.value === "Yes");
    });

    document.getElementById("livedPresentOverOneYear")?.addEventListener("change", (e) => {
        document.getElementById("previousAddressGroup")?.classList.toggle("d-none", e.target.value === "Yes");
    });

    document.getElementById("heldIdentityCert")?.addEventListener("change", (e) => {
        document.getElementById("icGroup")?.classList.toggle("d-none", e.target.value !== "Yes");
    });

    document.getElementById("heldPrevPassport")?.addEventListener("change", (e) => {
        document.getElementById("prevPassportGroup")?.classList.toggle("d-none", e.target.value !== "Yes");
    });

    document.getElementById("appliedNotIssued")?.addEventListener("change", (e) => {
        document.getElementById("appliedNotIssuedGroup")?.classList.toggle("d-none", e.target.value !== "Yes");
    });

    document.getElementById("declarationAgree")?.addEventListener("change", (e) => {
        const btnSubmit = document.getElementById("btnSubmitApp");
        if (btnSubmit) btnSubmit.disabled = !e.target.checked;
    });

    // Form submission
    document.getElementById("passportForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        submitApplication();
    });
}

function updateStepUI() {
    // Hide all step panels
    document.querySelectorAll(".form-step-panel").forEach((panel, i) => {
        panel.classList.toggle("d-none", i + 1 !== currentStep);
    });

    // Stepper Tabs Styling
    document.querySelectorAll(".step-tab").forEach(tab => {
        const step = parseInt(tab.getAttribute("data-step"));
        tab.classList.toggle("active", step === currentStep);
        tab.classList.toggle("completed", step < currentStep);
    });

    // Progress bar calculation
    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    document.getElementById("formProgressText").textContent = `Step ${currentStep} of ${totalSteps} (${progressPercent}%)`;
    document.getElementById("formProgressBar").style.width = `${progressPercent}%`;

    // Nav Buttons Visibility
    document.getElementById("btnPrevStep").disabled = currentStep === 1;
    
    if (currentStep === totalSteps) {
        document.getElementById("btnNextStep")?.classList.add("d-none");
        document.getElementById("btnSubmitApp")?.classList.remove("d-none");
        renderPreviewSummary();
    } else {
        document.getElementById("btnNextStep")?.classList.remove("d-none");
        document.getElementById("btnSubmitApp")?.classList.add("d-none");
    }

    window.scrollTo({ top: 120, behavior: "smooth" });
}

function validateCurrentStep() {
    const currentPanel = document.getElementById(`stepPanel${currentStep}`);
    if (!currentPanel) return true;

    let isValid = true;
    const requiredInputs = currentPanel.querySelectorAll("[required]");

    requiredInputs.forEach(input => {
        // Skip hidden inputs
        if (input.closest(".d-none")) return;

        if (!input.value || (input.type === "checkbox" && !input.checked)) {
            input.classList.add("is-invalid");
            isValid = false;
        } else {
            input.classList.remove("is-invalid");
        }
    });

    // Specific Validations
    if (currentStep === 2) {
        const dobInput = document.getElementById("dateOfBirth");
        if (dobInput && dobInput.value) {
            const selectedDob = new Date(dobInput.value);
            if (selectedDob > new Date()) {
                alert("Date of Birth cannot be in the future.");
                dobInput.classList.add("is-invalid");
                return false;
            }
        }
    }

    if (currentStep === 5) {
        const mobile = document.getElementById("mobile")?.value;
        const pincode = document.getElementById("pincode")?.value;
        if (mobile && !/^\d{10}$/.test(mobile)) {
            alert("Mobile number must be exactly 10 digits.");
            return false;
        }
        if (pincode && !/^\d{6}$/.test(pincode)) {
            alert("PIN code must be exactly 6 digits.");
            return false;
        }
    }

    if (currentStep === 7) {
        const emMobile = document.getElementById("emergencyMobile")?.value;
        if (emMobile && !/^\d{10}$/.test(emMobile)) {
            alert("Emergency contact mobile number must be exactly 10 digits.");
            return false;
        }
    }

    if (!isValid) {
        alert("Please complete all required fields marked with (*) before proceeding.");
    }
    return isValid;
}

function saveDraft(silent = false) {
    const formData = serializeFormData();
    formData.currentStep = currentStep;
    formData.submitted = false;

    localStorage.setItem(draftKey, JSON.stringify(formData));

    if (!silent) {
        const statusEl = document.getElementById("saveStatus");
        if (statusEl) {
            statusEl.textContent = "Draft saved successfully!";
            setTimeout(() => { statusEl.textContent = ""; }, 3000);
        }
    }
}

function loadDraft() {
    const saved = localStorage.getItem(draftKey);
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        if (data.submitted) {
            alert("This application has already been submitted.");
            window.location.href = "dashboard.html";
            return;
        }

        // Repopulate form elements
        Object.keys(data).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                if (el.type === "checkbox") {
                    el.checked = data[key];
                } else {
                    el.value = data[key];
                }
                el.dispatchEvent(new Event("change"));
            }
        });

        if (data.currentStep) currentStep = data.currentStep;
    } catch (e) {
        console.error("Error loading draft", e);
    }
}

function serializeFormData() {
    const form = document.getElementById("passportForm");
    const formData = new FormData(form);
    const data = {};

    for (let [key, val] of formData.entries()) {
        data[key] = val;
    }

    // Capture explicit checkboxes
    document.querySelectorAll('#passportForm input[type="checkbox"]').forEach(cb => {
        if (cb.id) data[cb.id] = cb.checked;
    });

    return data;
}

function renderPreviewSummary() {
    const container = document.getElementById("previewContainer");
    if (!container) return;

    const data = serializeFormData();

    container.innerHTML = `
        <div class="preview-section">
            <h4>Passport & Application Type <button type="button" class="btn btn-sm btn-outline-primary" onclick="goToStep(1)">Edit</button></h4>
            <p><strong>Type:</strong> ${data.serviceType || '-'} | <strong>Booklet:</strong> ${data.bookletType || '-'}</p>
        </div>
        <div class="preview-section">
            <h4>Applicant Details <button type="button" class="btn btn-sm btn-outline-primary" onclick="goToStep(2)">Edit</button></h4>
            <p><strong>Name:</strong> ${data.givenName || ''} ${data.surname || ''}</p>
            <p><strong>DOB:</strong> ${data.dateOfBirth || '-'} | <strong>Gender:</strong> ${data.gender || '-'}</p>
            <p><strong>Marital Status:</strong> ${data.maritalStatus || '-'} | <strong>Citizenship:</strong> ${data.citizenship || '-'}</p>
        </div>
        <div class="preview-section">
            <h4>Present Address & Contact <button type="button" class="btn btn-sm btn-outline-primary" onclick="goToStep(5)">Edit</button></h4>
            <p>${data.address || ''}, ${data.city || ''}, ${data.district || ''}, ${data.state || ''} - ${data.pincode || ''}</p>
            <p><strong>Mobile:</strong> ${data.mobile || '-'} | <strong>Email:</strong> ${data.email || '-'}</p>
        </div>
        <div class="preview-section">
            <h4>Emergency Contact <button type="button" class="btn btn-sm btn-outline-primary" onclick="goToStep(7)">Edit</button></h4>
            <p><strong>Name:</strong> ${data.emergencyName || '-'} | <strong>Mobile:</strong> ${data.emergencyMobile || '-'}</p>
        </div>
    `;
}

window.goToStep = function(stepNum) {
    currentStep = stepNum;
    updateStepUI();
};

function submitApplication() {
    const arn = `PMS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const formData = serializeFormData();

    formData.arn = arn;
    formData.submitted = true;
    formData.submissionDate = new Date().toLocaleDateString();
    formData.status = "Application Submitted - Payment Pending";
    formData.paymentStatus = "Pending";
    formData.appointmentStatus = "Not Scheduled";

    localStorage.setItem(draftKey, JSON.stringify(formData));

    alert(`Application submitted successfully!\n\nYour Mock Application Reference Number (ARN) is: ${arn}`);
    window.location.href = "payment.html";
}
