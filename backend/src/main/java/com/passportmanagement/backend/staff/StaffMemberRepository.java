package com.passportmanagement.backend.staff;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffMemberRepository extends JpaRepository<StaffMember, Long> {
    Optional<StaffMember> findByStaffIdAndRole(String staffId, StaffRole role);
    boolean existsByStaffId(String staffId);
}
