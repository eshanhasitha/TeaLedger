# TeaLedger

TeaLedger is a tea collection and settlement platform with three client surfaces:

- `backend/TeaLedger.API`: ASP.NET Core Web API on .NET 10
- `admin-web`: React, TypeScript, and Vite administration portal
- `mobile/tea_ledger_mobile`: Flutter application for collectors and farmers
- PostgreSQL: local development database managed by Docker Compose

## Repository Layout

```text
TeaLedger/
├── admin-web/                 # React administration portal
├── backend/TeaLedger.API/     # ASP.NET Core API and EF Core migrations
├── database/                  # Database-related assets
├── docs/                      # Project documentation
├── infrastructure/            # Infrastructure and deployment assets
├── mobile/tea_ledger_mobile/  # Flutter mobile application
└── docker-compose.yml         # Local PostgreSQL service
```

## Prerequisites

Install the following tools:

- Docker Desktop with Docker Compose
- .NET SDK 10
- Node.js and npm
- Flutter SDK 3.12 or later
- Android Studio or Xcode if running the mobile application on a device or emulator

## Quick Start

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
```

The database is exposed at `localhost:5432` with these development credentials:

```text
Database: tea_ledger
Username: tea_ledger
Password: tea_ledger@123
```

### 2. Run the API

Open a terminal in `backend/TeaLedger.API`:

```bash
dotnet restore
dotnet run --launch-profile http
```

The API is available at `http://localhost:5252`. In development, Swagger is available at `http://localhost:5252/swagger` and the health endpoint is available at `http://localhost:5252/api/health`.

To use the HTTPS profile instead:

```bash
dotnet run --launch-profile https
```

The HTTPS endpoint is `https://localhost:7100`. A trusted local development certificate may be required by your browser or client.

### 3. Run the admin web app

Open another terminal in `admin-web`:

```bash
npm install
```

Create `admin-web/.env.local` with the API URL:

```dotenv
VITE_API_URL=http://localhost:5252/api
```

Start the Vite development server:

```bash
npm run dev
```

Vite prints the local admin portal URL, normally `http://localhost:5173`.

Useful frontend commands:

```bash
npm run build
npm run lint
npm run preview
```

### 4. Run the Flutter mobile app

Open a terminal in `mobile/tea_ledger_mobile`:

```bash
flutter pub get
flutter devices
flutter run
```

Before running locally, update `lib/config/api_config.dart` to point to the API. For an Android emulator, use the host alias `10.0.2.2` and the HTTP API port:

```dart
static const String baseUrl = 'http://10.0.2.2:5252/api';
```

For a physical device, replace `10.0.2.2` with the host machine's LAN IP address and make sure the device can reach port `5252`.

Useful Flutter commands:

```bash
flutter analyze
flutter test
flutter run -d chrome
```

## Database Migrations

The API uses Entity Framework Core with PostgreSQL. To apply the existing migrations:

```bash
dotnet tool install --global dotnet-ef
dotnet ef database update --project backend/TeaLedger.API
```

If `dotnet-ef` is already installed, use only the second command. The default development connection string is in `backend/TeaLedger.API/appsettings.Development.json`.

To create a migration after changing the data model:

```bash
dotnet ef migrations add <MigrationName> --project backend/TeaLedger.API
dotnet ef database update --project backend/TeaLedger.API
```

## Configuration and Security

- `VITE_API_URL` controls the admin web API base URL.
- The API connection string is configured through `ConnectionStrings:DefaultConnection`.
- The checked-in appsettings file contains development-only credentials and a JWT key. Replace these values with environment variables or user secrets before using the application outside local development.
- Do not commit production connection strings, JWT keys, Firebase configuration, or other credentials.

## Development Checks

Run the relevant checks before submitting changes:

```bash
# Admin web
cd admin-web
npm run lint
npm run build

# API
cd ../backend/TeaLedger.API
dotnet build

# Mobile
cd ../../mobile/tea_ledger_mobile
flutter analyze
flutter test
```

## Stopping Local Services

Stop the PostgreSQL container without deleting its data volume:

```bash
docker compose stop postgres
```

Stop the container and remove the local database volume:

```bash
docker compose down -v
```