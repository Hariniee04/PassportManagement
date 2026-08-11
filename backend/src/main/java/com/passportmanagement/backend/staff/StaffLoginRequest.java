package com.passportmanagement.backend.staff;

public record StaffLoginRequest(String staffId, String name, String password, StaffRole role) { }
