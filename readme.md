# BSB API

Core API for the BSB platform, providing backend services and data access via REST.

---

📘 **Looking for setup instructions, API reference, or usage details?**  
👉 [Check out the full documentation on Confluence](https://muitoalemdomicrofone.atlassian.net/wiki/spaces/MADM/pages/13238276/BSB+API+Documentation)

---

## Features

- **User Management**: Complete user registration, authentication, and email confirmation system
- **Announcements**: Full CRUD with user association, image upload (AWS S3) and Discord webhook integration
- **Genres, Instruments, Tags**: Public endpoints and relational linking to announcements
- **States**: Endpoints and seeds for Brazilian states
- **Mailing Service**: Integrated email sending via generic email service
- **CI/CD**: GitHub Actions + Docker-based deploy

## Technologies

- **Node.js** / **Express**
- **Prisma** + **PostgreSQL**
- **AWS SDK v3** (S3 uploads)
- **Vitest** + **Supertest**
- **Docker** / `docker-compose`
- **Husky** (pre-commit hooks)

## Key Architecture

- **User-Centric Design**: All announcements are linked to registered users with proper foreign key relationships
- **Email Verification**: Users must confirm their email addresses with 6-digit verification codes
- **Data Integrity**: Cascade delete ensures data consistency when users are removed
- **Comprehensive Testing**: 74+ tests covering all endpoints with proper mocking and validation

## License

This project is licensed under the MIT License.
