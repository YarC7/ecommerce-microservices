# Auth Service

This service provides Authentication and Authorization for the Go Microservices project.

## Endpoints

- POST /auth/register { email, password } -> 201 created
- POST /auth/login { email, password } -> 200 { access_token, refresh_token }
- POST /auth/refresh { refresh_token } -> 200 { access_token, refresh_token }
- POST /auth/logout { refresh_token } -> 200

## Environment

- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET (required)

## Notes

- Uses HS256 JWT with `JWT_SECRET`.
- Access tokens are short-lived (15m); refresh tokens rotate and are stored as bcrypt hashes in `sessions` table.
- Passwords are stored with bcrypt.
