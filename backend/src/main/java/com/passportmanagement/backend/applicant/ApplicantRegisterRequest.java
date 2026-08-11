package com.passportmanagement.backend.applicant;

public record ApplicantRegisterRequest(String name, String email, String phoneNumber, String password) { }
