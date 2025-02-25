# Madm API

## Features

- **Announcement Management**: Users can create, update, and delete announcements.
- **Genres and Instruments**: Associated genres and instruments with each announcement.
- **Swagger Documentation**: Interactive API documentation for testing and exploring the API endpoints.

## Technologies

- **Node.js**: JavaScript runtime for building the backend.
- **Prisma**: ORM to interact with the PostgreSQL database.
- **Express.js**: Web framework for building APIs.
- **PostgreSQL**: Relational database used for storing application data.
- **Swagger**: Open-source tool used to generate interactive API documentation.

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/)

### Steps

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/yourusername/madm-api.git
   cd madm-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory of the project and configure the following environment variables:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"
   ```

   Replace `user`, `password`, `localhost`, and `database_name` with your actual database details.

4. Set up the Prisma database schema:

   - Run the following command to generate Prisma client and apply the migrations:
     ```bash
     npx prisma migrate dev
     ```

5. Seed the database (optional):
   If you'd like to seed the database with initial data, run:

   ```bash
   npx prisma db seed
   ```

6. Run the application:

   ```bash
   npm run start
   ```

   The server will start at `http://localhost:8080`.

## API Documentation

### Access Swagger UI

Once the server is running, you can access the interactive API documentation at the following URL:

- Swagger UI: `http://localhost:8080/api-docs`

Here, you can view and interact with all available API endpoints.

### API Endpoints

`POST api/announcements`

Create a new announcement.

**Request Body**:

```json
{
  "title": "Guitarrista de Ska procura banda profissional",
  "name": "Matheus Alexandre",
  "number": "123456789",
  "email": "john@example.com",
  "type": "musician",
  "genreIds": [1, 2, 3],
  "state": "SP",
  "city": "São Paulo",
  "description": "Sou guitarrista há 10 anos, gosto muito de tocar Ska, hardcore e coisas parecidas. Procuro algo sério.",
  "instrumentIds": [4, 5, 6]
}
```

**Response**:

```json
{
  "status": "success",
    {
      "id": 1,
      "title": "Guitarrista de Ska procura banda profissional",
      "name": "Matheus Alexandre",
      "number": "123456789",
      "email": "john@example.com",
      "type": "musician",
      "state": "SP",
      "city": "São Paulo",
      "description": "Sou guitarrista há 10 anos, gosto muito de tocar Ska, hardcore e coisas parecidas. Procuro algo sério.",
      "createdAt": "2025-02-25T11:06:49.909Z",
      "updateAt": "2025-02-25T11:06:49.909Z"
    }
}
```

### `GET api/announcements`

Retrieve a list of all announcements.

**Response**:

```json
{
  "data": [
    {
      "id": 2,
      "title": "Guitarrista de Ska procura banda profissional",
      "name": "Matheus Alexandre",
      "number": "123456789",
      "email": "john@example.com",
      "type": "musician",
      "state": "SP",
      "city": "São Paulo",
      "description": "Sou guitarrista há 10 anos, gosto muito de tocar Ska, hardcore e coisas parecidas. Procuro algo sério.",
      "createdAt": "2025-02-25T11:06:49.909Z",
      "updateAt": "2025-02-25T11:06:49.909Z"
    }
  ]
}
```

### `GET api/instruments`

Retrieve a list of all genres.

**Response**:

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Adufe",
      "type": "Percussão"
    },
    {
      "id": 2,
      "name": "Afoxé",
      "type": "Percussão"
    },
    {
      "id": 3,
      "name": "Agogô",
      "type": "Percussão"
    }
  ]
}
```

## Environment Variables

| Variable       | Description                                |
| -------------- | ------------------------------------------ |
| `DATABASE_URL` | Connection string for PostgreSQL           |
| `PORT`         | Port where the app will run (default 3000) |

## License

This project is licensed under the MIT License.
