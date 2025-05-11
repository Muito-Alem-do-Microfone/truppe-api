# BSB API

Core API for the BSB platform, providing backend services and data access via REST.

---

📘 **Looking for setup instructions, API reference, or usage details?**  
👉 [Check out the full documentation on Confluence](https://muitoalemdomicrofone.atlassian.net/wiki/spaces/MADM/pages/13238276/BSB+API+Documentation) ← _(update with actual link)_

---

## Features

- **Announcements**: Full CRUD, image upload (AWS S3) and Discord webhook integration
- **Genres, Instruments, Tags**: Public endpoints and relational linking to announcements
- **States**: Endpoints and seeds for Brazilian states
- **Mailing Service**: Integrated email sending via MailerSend
- **CI/CD**: GitHub Actions + Docker-based deploy

## Technologies

- **Node.js** / **Express**
- **Prisma** + **PostgreSQL**
- **AWS SDK v3** (S3 uploads)
- **Vitest** + **Supertest**
- **Docker** / `docker-compose`
- **Husky** (pre-commit hooks)

## License

This project is licensed under the MIT License.
