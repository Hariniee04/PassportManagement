package com.passportmanagement.backend.staff;

import com.passportmanagement.backend.applicant.LoginResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {
    private final StaffMemberRepository staffRepository;
    private final String passportOfficerPassword;
    private final String verificationOfficerPassword;
    private final String adminPassword;

    public StaffController(StaffMemberRepository staffRepository,
            @Value("${app.staff-password.passport-officer}") String passportOfficerPassword,
            @Value("${app.staff-password.verification-officer}") String verificationOfficerPassword,
            @Value("${app.staff-password.admin}") String adminPassword) {
        this.staffRepository = staffRepository;
        this.passportOfficerPassword = passportOfficerPassword;
        this.verificationOfficerPassword = verificationOfficerPassword;
        this.adminPassword = adminPassword;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody StaffLoginRequest request) {
        if (request.role() == null || isBlank(request.staffId()) || isBlank(request.name()) || isBlank(request.password())) {
            return ResponseEntity.badRequest().body("Name, ID, and password are required.");
        }
        if (!passwordFor(request.role()).equals(request.password())) {
            return ResponseEntity.status(401).body("Invalid password for this staff role.");
        }

        String staffId = request.staffId().trim().toUpperCase();
        String name = request.name().trim();
        StaffMember staff = staffRepository.findByStaffIdAndRole(staffId, request.role()).orElse(null);

        if (staff == null) {
            if (staffRepository.existsByStaffId(staffId)) {
                return ResponseEntity.badRequest().body("This ID is already assigned to another role.");
            }
            staff = new StaffMember();
            staff.setStaffId(staffId);
            staff.setName(name);
            staff.setRole(request.role());
            staffRepository.save(staff);
        } else if (!staff.getName().equalsIgnoreCase(name)) {
            return ResponseEntity.status(401).body("The name does not match this staff ID.");
        }

        return ResponseEntity.ok(new LoginResult(staff.getId(), staff.getName(), staff.getRole().name()));
    }

    private String passwordFor(StaffRole role) {
        return switch (role) {
            case PASSPORT_OFFICER -> passportOfficerPassword;
            case VERIFICATION_OFFICER -> verificationOfficerPassword;
            case ADMIN -> adminPassword;
        };
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
