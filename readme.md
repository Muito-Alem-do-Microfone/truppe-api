# Madm API

## Features

- **Announcement Management**: Users can create, update, and delete announcements.
- **Genres and Instruments**: Associated genres and instruments with each announcement.

## Technologies

- **Node.js**: JavaScript runtime for building the backend.
- **Prisma**: ORM to interact with the PostgreSQL database.
- **Express.js**: Web framework for building APIs.
- **PostgreSQL**: Relational database used for storing application data.

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

### Announcements Endpoints

`POST api/announcement`

Create a new announcement.

**Request Body**:

```json
{
  "title": "Looking for a Drummer",
  "name": "John Doe",
  "number": "123456789",
  "email": "john@example.com",
  "age": 25,
  "about": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam justo nisi, tristique nec elit ac, ornare mattis lectus. Suspendisse potenti. Sed sit amet neque at eros rutrum molestie pretium quis dui. Phasellus pellentesque pellentesque luctus.",
  "type": "Band",
  "genreIds": [1, 2],
  "state": "California",
  "city": "Los Angeles",
  "description": "We need a drummer for our rock band!",
  "instrumentIds": [3],
  "socialLinks": [
    { "socialMediaId": 1, "url": "myband" },
    { "socialMediaId": 2, "url": "myband" }
  ],
  "tagIds": [1, 2, 3]
}
```

**Response**:

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "title": "Looking for a Drummer",
    "name": "John Doe",
    "age": 25,
    "about": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam justo nisi, tristique nec elit ac, ornare mattis lectus. Suspendisse potenti. Sed sit amet neque at eros rutrum molestie pretium quis dui. Phasellus pellentesque pellentesque luctus.",
    "number": "123456789",
    "email": "john@example.com",
    "type": "Band",
    "state": "California",
    "city": "Los Angeles",
    "description": "We need a drummer for our rock band!",
    "createdAt": "2025-02-26T01:57:36.849Z",
    "updatedAt": "2025-02-26T01:57:36.849Z",
    "genres": [
      {
        "id": 1,
        "name": "Rock"
      },
      {
        "id": 2,
        "name": "Classic Rock"
      }
    ],
    "instruments": [
      {
        "id": 3,
        "name": "Agogô",
        "type": "Percussão"
      }
    ],
    "socialLinks": [
      {
        "id": 5,
        "url": "myband",
        "socialMediaId": 2,
        "announcementId": 3,
        "socialMedia": {
          "id": 2,
          "name": "Instagram"
        }
      },
      {
        "id": 6,
        "url": "myband",
        "socialMediaId": 1,
        "announcementId": 3,
        "socialMedia": {
          "id": 1,
          "name": "Facebook"
        }
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "Compositor(a)"
      },
      {
        "id": 2,
        "name": "Multi-instrumentista"
      },
      {
        "id": 3,
        "name": "Produtor(a) musical"
      }
    ]
  }
}
```

`GET api/announcement`

Retrieve a list of all announcements.

**Response**:

```json
{
  "data": [
    {
      "id": 2,
      "title": "Looking for a Drummer",
      "name": "John Doe",
      "age": 25,
      "type": "Band",
      "state": "California",
      "city": "Los Angeles",
      "description": "We need a drummer for our rock band!",
      "createdAt": "2025-02-26T01:53:52.926Z",
      "updatedAt": "2025-02-26T01:53:52.926Z",
      "genres": [
        {
          "id": 1,
          "name": "Rock"
        },
        {
          "id": 2,
          "name": "Classic Rock"
        }
      ],
      "instruments": [
        {
          "id": 3,
          "name": "Agogô",
          "type": "Percussão"
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": "Compositor(a)"
        },
        {
          "id": 2,
          "name": "Multi-instrumentista"
        },
        {
          "id": 3,
          "name": "Produtor(a) musical"
        }
      ]
    },
    {
      "id": 3,
      "title": "Looking for a Drummer",
      "name": "John Doe",
      "age": 25,
      "type": "Band",
      "state": "California",
      "city": "Los Angeles",
      "description": "We need a drummer for our rock band!",
      "createdAt": "2025-02-26T01:57:36.849Z",
      "updatedAt": "2025-02-26T01:57:36.849Z",
      "genres": [
        {
          "id": 1,
          "name": "Rock"
        },
        {
          "id": 2,
          "name": "Classic Rock"
        }
      ],
      "instruments": [
        {
          "id": 3,
          "name": "Agogô",
          "type": "Percussão"
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": "Compositor(a)"
        },
        {
          "id": 2,
          "name": "Multi-instrumentista"
        },
        {
          "id": 3,
          "name": "Produtor(a) musical"
        }
      ]
    }
  ]
}
```

`PUT api/announcement/:id`

Retrieve a list of all announcements.

**Request Body**:

```json
{
  "title": "Looking for a Drummer",
  "name": "John Doe",
  "number": "123456789",
  "email": "john@example.com",
  "age": 25,
  "about": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam justo nisi, tristique nec elit ac, ornare mattis lectus. Suspendisse potenti. Sed sit amet neque at eros rutrum molestie pretium quis dui. Phasellus pellentesque pellentesque luctus.",
  "type": "Band",
  "genreIds": [1, 2],
  "state": "California",
  "city": "Los Angeles",
  "description": "We need a drummer for our rock band!",
  "instrumentIds": [3],
  "socialLinks": [
    { "socialMediaId": 1, "url": "myband" },
    { "socialMediaId": 2, "url": "myband" }
  ],
  "tagIds": [1, 2, 3]
}
```

**Response**:

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "title": "Looking for a Drummer",
    "name": "John Doe",
    "age": 25,
    "about": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam justo nisi, tristique nec elit ac, ornare mattis lectus. Suspendisse potenti. Sed sit amet neque at eros rutrum molestie pretium quis dui. Phasellus pellentesque pellentesque luctus.",
    "number": "123456789",
    "email": "john@example.com",
    "type": "Band",
    "state": "California",
    "city": "Los Angeles",
    "description": "We need a drummer for our rock band!",
    "createdAt": "2025-02-26T01:57:36.849Z",
    "updatedAt": "2025-02-26T01:57:36.849Z",
    "genres": [
      {
        "id": 1,
        "name": "Rock"
      },
      {
        "id": 2,
        "name": "Classic Rock"
      }
    ],
    "instruments": [
      {
        "id": 3,
        "name": "Agogô",
        "type": "Percussão"
      }
    ],
    "socialLinks": [
      {
        "id": 5,
        "url": "myband",
        "socialMediaId": 2,
        "announcementId": 3,
        "socialMedia": {
          "id": 2,
          "name": "Instagram"
        }
      },
      {
        "id": 6,
        "url": "myband",
        "socialMediaId": 1,
        "announcementId": 3,
        "socialMedia": {
          "id": 1,
          "name": "Facebook"
        }
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "Compositor(a)"
      },
      {
        "id": 2,
        "name": "Multi-instrumentista"
      },
      {
        "id": 3,
        "name": "Produtor(a) musical"
      }
    ]
  }
}
```

`DELETE api/announcement/:id`

**Response**:

```json
{
  "message": "Announcement not found"
}
```

`GET api/announcement/:id`

**Response**:

```json
{
  "id": 4,
  "title": "Looking for a Drummer",
  "name": "John Doe",
  "age": 25,
  "about": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam justo nisi, tristique nec elit ac, ornare mattis lectus. Suspendisse potenti. Sed sit amet neque at eros rutrum molestie pretium quis dui. Phasellus pellentesque pellentesque luctus.",
  "number": "123456789",
  "email": "john@example.com",
  "type": "Band",
  "state": "California",
  "city": "Los Angeles",
  "description": "We need a drummer for our rock band!",
  "createdAt": "2025-02-26T02:09:09.036Z",
  "updatedAt": "2025-02-26T02:09:09.036Z",
  "socialLinks": [
    {
      "id": 7,
      "url": "myband",
      "socialMediaId": 2,
      "socialMediaName": "Instagram"
    },
    {
      "id": 8,
      "url": "myband",
      "socialMediaId": 1,
      "socialMediaName": "Facebook"
    }
  ],
  "genres": [
    {
      "id": 1,
      "name": "Rock"
    },
    {
      "id": 2,
      "name": "Classic Rock"
    }
  ],
  "instruments": [
    {
      "id": 3,
      "name": "Agogô",
      "type": "Percussão"
    }
  ],
  "tags": [
    {
      "id": 1,
      "name": "Compositor(a)"
    },
    {
      "id": 2,
      "name": "Multi-instrumentista"
    },
    {
      "id": 3,
      "name": "Produtor(a) musical"
    }
  ]
}
```

### Instruments Endpoints

`GET api/instruments`

Retrieve a list of all instruments.

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

### Genres Endpoints

`GET api/genre`

Retrieve a list of all genres.

**Response**:

```json
[
  {
    "id": 1,
    "name": "Rock"
  },
  {
    "id": 2,
    "name": "Classic Rock"
  },
  {
    "id": 3,
    "name": "Alternative Rock"
  },
  {
    "id": 4,
    "name": "Punk Rock"
  },
  {
    "id": 5,
    "name": "Indie Rock"
  },
  {
    "id": 6,
    "name": "Pop"
  }
]
```

### Tags Endpoints

`GET api/tag`

**Response**:

```json
[
  {
    "id": 1,
    "name": "Compositor(a)"
  },
  {
    "id": 2,
    "name": "Multi-instrumentista"
  },
  {
    "id": 3,
    "name": "Produtor(a) musical"
  }
]
```

### States Endpoints

`GET api/states`

**Response**:

```json
[
  {
    "id": 1,
    "name": "São Paulo"
  },
  {
    "id": 2,
    "name": "Rio de Janeiro"
  },
  {
    "id": 3,
    "name": "Acre"
  }
]
```

## Environment Variables

| Variable       | Description                                |
| -------------- | ------------------------------------------ |
| `DATABASE_URL` | Connection string for PostgreSQL           |
| `PORT`         | Port where the app will run (default 3000) |

## License

This project is licensed under the MIT License.
