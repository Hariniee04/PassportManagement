# Passport Management Backend

## Database connection

The MySQL database must be named `passport_management` and the MySQL80 service must be running.

Set your MySQL password before starting the application. In IntelliJ, add this environment variable to the run configuration:

```text
DB_PASSWORD=your-mysql-root-password
```

Set the project SDK to Java 21, then run `PassportBackendApplication`.

## Temporary staff passwords

These are development-only defaults. Change them using environment variables in the run configuration:

```text
PASSPORT_OFFICER_PASSWORD=PASSPORT@2026
VERIFICATION_OFFICER_PASSWORD=VERIFY@2026
ADMIN_PASSWORD=ADMIN@2026
```

Staff members have no registration page. Their name and ID are saved to `staff_members` only after their first successful login with the correct role password.

Applicants register with name, email, phone number, and a password. Their records are stored in `applicants`; their passwords are BCrypt-hashed.
