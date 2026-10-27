# University Club Management System

UCM is a React frontend, Node.js/Express backend, and MySQL database managed together with Docker Compose.

## Run locally

1. Install Docker Desktop and start it.
2. Copy `.env.example` to `.env` in the project root.
3. Set a private MySQL root password and a long random JWT secret in `.env`.
4. Start the application:

```sh
docker compose up -d --build
```

Open the frontend at http://localhost:3000. The backend is available at http://localhost:5001.

## Useful commands

```sh
docker compose ps
docker compose logs -f
docker compose stop
docker compose down
```

MySQL data is stored in the `mysql_data` Docker volume. `docker compose down -v` deletes that database volume and its data.

Never commit the real `.env` file or database backups. Use `.env.example` as a template.
