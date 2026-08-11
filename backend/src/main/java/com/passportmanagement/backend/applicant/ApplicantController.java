package com.passportmanagement.backend.applicant;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applicants")
@CrossOrigin(origins = "*")
public class ApplicantController {
    private final ApplicantRepository applicantRepository;
    private final PasswordEncoder passwordEncoder;

    public ApplicantController(ApplicantRepository applicantRepository, PasswordEncoder passwordEncoder) {
        this.applicantRepository = applicantRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody ApplicantRegisterRequest request) {
        if (isBlank(request.name()) || isBlank(request.email()) || isBlank(request.phoneNumber()) || isBlank(request.password())) {
            return ResponseEntity.badRequest().body("Name, email, phone number, and password are required.");
        }

        String email = request.email().trim().toLowerCase();
        if (applicantRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("An applicant already exists for this email.");
        }

        Applicant applicant = new Applicant();
        applicant.setName(request.name().trim());
        applicant.setEmail(email);
        applicant.setPhoneNumber(request.phoneNumber().trim());
        applicant.setPasswordHash(passwordEncoder.encode(request.password()));
        applicantRepository.save(applicant);

        return ResponseEntity.ok("Registration successful. You can now log in as an applicant.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody ApplicantLoginRequest request) {
        if (isBlank(request.email()) || isBlank(request.password())) {
            return ResponseEntity.badRequest().body("Email and password are required.");
        }

        return applicantRepository.findByEmail(request.email().trim().toLowerCase())
                .filter(applicant -> passwordEncoder.matches(request.password(), applicant.getPasswordHash()))
                .<ResponseEntity<?>>map(applicant -> ResponseEntity.ok(new LoginResult(
                        applicant.getId(), applicant.getName(), "APPLICANT")))
                .orElseGet(() -> ResponseEntity.status(401).body("Invalid applicant email or password."));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
