# TeaLedger Backend — Local Development

## Prerequisites

- .NET SDK compatible with the API project
- PostgreSQL
- The repository's configured development environment variables

## Start the API

1. Configure the PostgreSQL connection string using the project's existing configuration.
2. Open a terminal in the backend API project directory.
3. Restore dependencies:

   `dotnet restore`

4. Apply EF Core migrations if they are not applied automatically:

   `dotnet ef database update`

5. Run the API:

   `dotnet run`

## Verify the service

- `GET /api/health` — API health
- `GET /api/health/database` — database connectivity
- `GET /api/farmer/profile` — authenticated farmer profile

The farmer profile endpoint requires a valid JWT for a user with the Farmer role.

## Run tests

From the repository root:

`dotnet test`

Use a dedicated test database or test configuration. Never run development seed operations against production.

## Security notes

- Do not commit passwords, JWT secrets, or production connection strings.
- Do not return internal exception details to API clients.
- Use the existing password-hashing service for development accounts.
- Verify authorization for every role-protected endpoint.
