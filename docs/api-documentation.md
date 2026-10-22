# TeaLedger API Development Guide

This guide is both an API reference and a development aid for the TeaLedger farmer mobile app, collector mobile app, and admin web application. It preserves the initial route ideas and expands them with implementation notes, examples, and suggested behaviors. It separates the endpoint that exists today from routes to implement. Proposed payloads are examples only: confirm field names and business rules with the domain models/DTOs before implementing them.

## 1. Current status

The API is an ASP.NET Core Web API targeting .NET 10, backed by PostgreSQL through Entity Framework Core. Controllers use the route convention `/api/{controller}`. At this checkout, `GET /api/Health` is the only implemented action. The other controller files, DTO files, and most model files are empty placeholders.

| State | Meaning |
|---|---|
| Implemented | Controller action exists in the repository. |
| Proposed | Route is recommended for development and is not available yet. |

### Technology

| Component | Technology / status |
|---|---|
| API | ASP.NET Core Web API |
| Language | C# |
| Framework | .NET 10 |
| ORM | Entity Framework Core |
| Database | PostgreSQL |
| API documentation | Swagger / OpenAPI in Development |
| Authentication | JWT foundation exists; middleware is not wired |
| Architecture | REST-style HTTP API |

## 2. Run locally

Read the active HTTPS port from `backend/TeaLedger.API/Properties/launchSettings.json`, start the API in Development, then open:

```text
https://localhost:{port}/swagger
```

Base path: `https://localhost:{port}/api`.

Swagger is enabled only in Development. The configured database provider is PostgreSQL (`UseNpgsql`).

## 3. API conventions

- Use JSON request bodies with `Content-Type: application/json`.
- Use camelCase JSON property names in examples and DTOs.
- Use `Guid` identifiers in URL path parameters.
- Use ISO 8601 date/time values. Store event timestamps in UTC; use `DateOnly` for business dates when time-of-day is irrelevant.
- Return a single resource from `GET /{resource}/{id}` and a JSON array from unpaged list endpoints. For paged lists, use the common response shown below.
- Use `201 Created` for successful create requests, `200 OK` for reads/updates, and `204 No Content` for successful deletes with no body.
- Use `400 Bad Request` for invalid input, `401 Unauthorized` for missing/invalid authentication, `403 Forbidden` for insufficient role, `404 Not Found` for unknown IDs, and `409 Conflict` for duplicate or invalid state transitions. Implement only the errors relevant to each action.
- Do not expose password hashes, refresh-token secrets, or internal EF navigation objects in responses. Define request/response DTOs rather than binding EF entities directly.

### Request format

Send JSON requests with `Content-Type: application/json`. For example, the proposed login action accepts:

```json
{
  "phoneNumber": "+94771234567",
  "password": "example-password"
}
```

### Common status codes

| Status | Meaning / when to use |
|---:|---|
| 200 | Successful read or update with a response body |
| 201 | Resource created; include a `Location` header where practical |
| 204 | Successful action with no response body |
| 400 | Malformed or invalid request |
| 401 | Missing or invalid authentication credentials |
| 403 | Authenticated caller lacks permission |
| 404 | Requested resource does not exist or is not visible to caller |
| 409 | Duplicate resource or invalid business-state transition |
| 422 | Optional alternative for domain validation failures; choose consistently with 400 |
| 500 | Unexpected server error; do not return stack traces or secrets |

### Suggested paged list shape

Use this for collections that may grow large (collections, requests, activity logs, reports):

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "totalCount": 0,
  "totalPages": 0
}
```

Suggested query parameters: `page` (default 1), `pageSize` (default 20, maximum 100), plus resource-specific filters. The project has pagination helper classes; align their actual property names before implementation.

### Suggested validation error

```json
{
  "status": 400,
  "title": "Validation failed",
  "errors": {
    "phoneNumber": ["Phone number is required."]
  }
}
```

Use ASP.NET Core `ProblemDetails` / `ValidationProblemDetails` consistently when adding exception and model-validation handling.

## 4. Implemented endpoint

### `GET /api/Health`

No authentication. Returns `200 OK`:

```json
{
  "status": "ok",
  "service": "TeaLedger API",
  "timestamp": "2026-10-22T00:00:00Z"
}
```

The timestamp is generated with `DateTime.UtcNow`.

The action is implemented in `backend/TeaLedger.API/Controllers/HealthController.cs` using `[Route("api/[controller]")]` and `[HttpGet]`.

## 5. Authentication (proposed)

JWT services and DTO placeholders exist, but authentication is not wired into `Program.cs`: no authentication scheme is registered and `UseAuthentication()` is absent. These routes and token behavior are proposals, not working endpoints. Implement JWT configuration and middleware before marking protected routes active.

| Method | Route | Purpose | Access |
|---|---|---|---|
| POST | `/api/Auth/register` | Create a user and matching role profile | Admin, or explicitly approved public registration policy |
| POST | `/api/Auth/login` | Exchange credentials for tokens | Public |
| POST | `/api/Auth/refresh` | Rotate refresh token and issue access token | Refresh token |
| POST | `/api/Auth/logout` | Revoke current refresh token | Authenticated |
| GET | `/api/Auth/me` | Return current user's safe profile | Authenticated |

Login request example:

```json
{ "phoneNumber": "+94771234567", "password": "example-password" }
```

Login response example:

```json
{
  "accessToken": "{jwt}",
  "refreshToken": "{opaque-token}",
  "tokenType": "Bearer",
  "expiresAt": "2026-10-22T01:00:00Z",
  "user": { "id": "00000000-0000-0000-0000-000000000001", "fullName": "Example User", "phoneNumber": "+94771234567", "role": "Farmer" }
}
```

Protected requests use `Authorization: Bearer {accessToken}`. Never return password hashes. Define token expiry, rotation, revocation, and registration policy in configuration/business rules.

The older draft used a shorter login response containing `role` and `userId`. Prefer the richer response above as the proposed shape, or settle on one DTO before implementing clients; neither response is currently implemented.

## 6. Proposed endpoint catalog

All routes below are proposed. Unless noted otherwise, list/detail/create/update/delete operations should follow the common conventions above. Use role policies after authentication is wired: `Admin`, `Farmer`, `Collector`.

### Users

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Users` | Search/list users; filter by `role`, `isActive`, `q` | Admin |
| GET | `/api/Users/{id}` | Read safe user profile | Admin or self |
| POST | `/api/Users` | Create user | Admin |
| PUT | `/api/Users/{id}` | Update profile/active state | Admin |
| DELETE | `/api/Users/{id}` | Deactivate user (soft delete) | Admin |

Never include `passwordHash` in any user response. Prefer a dedicated password-change/reset action over accepting arbitrary password updates in `PUT`.

A safe detail response could contain `id`, `fullName`, `phoneNumber`, `role`, `isActive`, and `createdAt`; return only fields the caller may see. Include `fullName` if the UI needs to display the account holder's name.

### Farmers

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Farmers` | List/search farmers; filters `q`, `isActive`, `area` | Admin, Collector |
| GET | `/api/Farmers/{id}` | Farmer details | Admin, Collector, self |
| POST | `/api/Farmers` | Create farmer and associated user/profile as defined by service | Admin |
| PUT | `/api/Farmers/{id}` | Update farmer details | Admin |
| DELETE | `/api/Farmers/{id}` | Deactivate farmer; preserve ledger history | Admin |
| GET | `/api/Farmers/{id}/balance` | Current payable/loan/deduction summary | Admin, Collector, self |
| GET | `/api/Farmers/{id}/collections` | Farmer collection history | Admin, Collector, self |
| GET | `/api/Farmers/{id}/settlements` | Farmer settlement history | Admin, self |

Example create payload (confirm fields against the final DTO):

```json
{
  "fullName": "Example Farmer",
  "phoneNumber": "+94771234567",
  "password": "initial-password",
  "farmerCode": "FMR-00001",
  "address": "Example village",
  "teaLandSize": 1.25
}
```

The older draft used `name` and a client-provided `userId`. This proposal uses `fullName` and lets the server create/link the user profile in the farmer creation service. If account creation is a separate workflow, document the linking rules explicitly. The Farmer model contains `UserId`, `FarmerCode`, `Address`, and optional `TeaLandSize`; phone number and full name belong to the related user.

### Collectors

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Collectors` | List/search collectors | Admin |
| GET | `/api/Collectors/{id}` | Collector profile | Admin or self |
| POST | `/api/Collectors` | Create collector and associated user/profile | Admin |
| PUT | `/api/Collectors/{id}` | Update collector details/area | Admin |
| DELETE | `/api/Collectors/{id}` | Deactivate collector; retain historical collections | Admin |
| GET | `/api/Collectors/{id}/collections` | Collections recorded by collector | Admin or self |

Example create payload (confirm fields against the final DTO):

```json
{
  "fullName": "Example Collector",
  "phoneNumber": "+94771234568",
  "password": "initial-password",
  "collectorCode": "COL-00001",
  "area": "Example area"
}
```

The Collector model contains `UserId`, `CollectorCode`, and optional `Area`; account name and phone number belong to its related user. Avoid accepting arbitrary user IDs unless the endpoint verifies role and linkage.

### Collections

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Collections` | Search/paginate collection records | Admin; Collector sees own; Farmer sees own |
| GET | `/api/Collections/{id}` | Collection detail | Admin or related farmer/collector |
| POST | `/api/Collections` | Record a tea collection | Admin, Collector |
| PUT | `/api/Collections/{id}` | Correct a collection while editable | Admin; optionally recording Collector |
| POST | `/api/Collections/{id}/cancel` | Cancel with reason and audit trail | Admin |

Suggested filters: `farmerId`, `collectorId`, `status`, `from`, `to`, `page`, `pageSize`. The current model names weight fields `GrossWeight`, `WaterReduction`, `BagWeight`, `OtherReduction`, `FinalWeight`, `PricePerKg`, `TotalAmount`, `Status`, and `CollectedAt`; use DTO camelCase equivalents and calculate/validate derived values on the server.

Example create payload (confirm required fields and calculation rules):

```json
{
  "farmerId": "00000000-0000-0000-0000-000000000001",
  "collectorId": "00000000-0000-0000-0000-000000000002",
  "grossWeight": 25.5,
  "waterReduction": 0.5,
  "bagWeight": 0.2,
  "otherReduction": 0,
  "collectedAt": "2026-10-22T08:30:00Z"
}
```

Define whether `FinalWeight`, `PricePerKg`, and `TotalAmount` are calculated from reductions and the effective tea price. Avoid trusting client-submitted totals.

The older draft used `collectionDate` and `weightKg`, which do not match the current Collection model. Prefer the explicit `collectedAt` and weight/reduction fields above, and keep DTO naming consistent. A detail response should show farmer and collector IDs/names, measured weights, reductions, final weight, captured price, total, status, and collection timestamp. Define the meaning of `Synced` before exposing it as a client-visible status.

### Collection requests

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/CollectionRequests` | List requests; scope by caller role | Admin, Collector, Farmer (own) |
| GET | `/api/CollectionRequests/{id}` | Request details | Admin or related farmer/collector |
| POST | `/api/CollectionRequests` | Farmer requests a pickup | Farmer |
| PUT | `/api/CollectionRequests/{id}` | Edit request before assignment | Requesting Farmer |
| POST | `/api/CollectionRequests/{id}/approve` | Approve/assign collector | Admin, Collector policy TBD |
| POST | `/api/CollectionRequests/{id}/reject` | Reject with reason | Admin |
| POST | `/api/CollectionRequests/{id}/cancel` | Cancel pending request | Requesting Farmer, Admin |

Suggested request fields: `requestedDate`, `estimatedWeightKg`, `notes`. Define statuses and legal transitions (for example Pending → Approved/Rejected/Cancelled) in one service; return `409 Conflict` for an invalid transition.

The original draft proposed `PUT` for approve/reject. This guide uses `POST` for these commands because they perform state transitions and may accept a reason or assigned collector. If the team retains `PUT`, document the state-setting semantics and make retries idempotent.

### Loans and repayments

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Loans` | Search loans; filter `farmerId`, `status` | Admin; Farmer sees own |
| GET | `/api/Loans/{id}` | Loan details including balance | Admin or borrower |
| POST | `/api/Loans` | Issue a loan | Admin |
| PUT | `/api/Loans/{id}` | Update permitted loan terms/status | Admin; define restrictions |
| POST | `/api/Loans/{id}/repayments` | Record repayment | Admin |
| GET | `/api/Loans/{id}/repayments` | Loan repayment history | Admin or borrower |
| GET | `/api/LoanRepayments` | Search repayments | Admin |

Suggested loan payload:

```json
{
  "farmerId": "00000000-0000-0000-0000-000000000001",
  "principalAmount": 50000.00,
  "interestRate": 0,
  "issuedAt": "2026-10-22T00:00:00Z",
  "notes": "Seasonal advance"
}
```

Suggested repayment payload:

```json
{
  "amount": 5000.00,
  "paidAt": "2026-10-22T00:00:00Z",
  "reference": "CASH-001"
}
```

Validate positive amounts and prevent repayment above outstanding balance unless the business rules explicitly allow credit. Calculate outstanding balance on the server.

The initial draft proposed `/api/LoanRepayments` as a general resource. Nested `/api/Loans/{id}/repayments` routes make the parent loan explicit; the optional top-level `GET /api/LoanRepayments` is retained for admin-wide search. The loan and repayment model/DTO files are placeholders in this checkout, so finalize field names (such as `amount` vs. `principalAmount` and `issuedDate` vs. `issuedAt`) together with the DTOs before clients depend on them.

### Deductions

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Deductions` | Search deductions; filter `farmerId`, `status`, dates | Admin; Farmer sees own |
| GET | `/api/Deductions/{id}` | Deduction detail | Admin or related Farmer |
| POST | `/api/Deductions` | Create deduction | Admin |
| PUT | `/api/Deductions/{id}` | Update while not settled | Admin |
| DELETE | `/api/Deductions/{id}` | Void deduction with audit trail | Admin |

Suggested payload: `{ "farmerId": "...", "description": "Farm supplies", "amount": 1500.00, "effectiveDate": "2026-10-22" }`. Define whether deduction is one-time or recurring and how it affects settlement.

### Settlements

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Settlements` | Search settlements; filter `farmerId`, `from`, `to`, `status` | Admin; Farmer sees own |
| GET | `/api/Settlements/{id}` | Settlement statement/detail | Admin or related Farmer |
| POST | `/api/Settlements` | Calculate and create settlement for a period | Admin |
| POST | `/api/Settlements/{id}/pay` | Mark paid and record payment reference | Admin |
| GET | `/api/Settlements/{id}/summary` | Totals for statement | Admin or related Farmer |

Suggested create payload: `{ "farmerId": "...", "periodStart": "2026-10-01", "periodEnd": "2026-10-31" }`. Define inclusive/exclusive period boundaries and rules for collections, repayments, deductions, and already-settled entries. Prevent duplicate overlapping settlements or return `409`.

### Tea prices

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/TeaPrices/current` | Current effective price per kg | Authenticated users |
| GET | `/api/TeaPrices` | Price history by effective date | Admin; optionally Collector |
| POST | `/api/TeaPrices` | Set price effective from a date | Admin |
| PUT | `/api/TeaPrices/{id}` | Correct a price before it is used | Admin |

Suggested payload: `{ "pricePerKg": 125.50, "effectiveFrom": "2026-10-22T00:00:00Z" }`. Define currency and whether historical collections retain the price captured at collection time.

### Weight verification

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| POST | `/api/WeightVerification` | Submit scale/weight verification data | Collector |
| GET | `/api/WeightVerification/{id}` | Read verification record | Admin or related Collector |
| GET | `/api/Collections/{id}/weight-verification` | Verification associated with collection | Admin or related Collector |

The `WeightVerification` model is currently a placeholder. Define device/source, measurements, timestamp, actor, and validation/audit requirements before finalizing the payload.

### Notifications

No notifications controller file exists in the current controller list. Proposed routes:

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Notifications` | Current user's notifications | Authenticated |
| POST | `/api/Notifications/{id}/read` | Mark notification as read | Recipient |
| POST | `/api/Notifications/read-all` | Mark all current user's notifications as read | Authenticated |

Always scope results and updates to the authenticated recipient.

The earlier draft used `PUT /api/Notifications/{id}/read`; `POST` is used here as a command. Either is reasonable if the operation is idempotent. No Notifications controller currently exists.

### Dashboard and analytics

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Dashboard/summary` | Operational summary cards | Admin |
| GET | `/api/Dashboard/collections` | Collection totals over a date range | Admin |
| GET | `/api/Analytics/collections` | Collection trends/groupings | Admin |
| GET | `/api/Analytics/farmers` | Farmer activity metrics | Admin |

Suggested query parameters: `from`, `to`, optional `groupBy` (`day`, `week`, `month`). Return explicit units, currency, timezone, and empty-period behavior.

### Reports

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Reports/collections` | Collection report; filters `from`, `to`, `farmerId`, `collectorId` | Admin |
| GET | `/api/Reports/settlements` | Settlement report; filters `from`, `to`, `farmerId` | Admin |
| GET | `/api/Reports/farmer-balances` | Outstanding farmer balances | Admin |

Start with JSON responses. Add CSV/PDF only with an agreed format, filename, and content type.

### Activity logs

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/ActivityLogs` | Search audit events; filter actor, entity, date range | Admin |
| GET | `/api/ActivityLogs/{id}` | Audit event detail | Admin |

Activity logs should be append-only and written by the server for sensitive state changes; do not expose a public create/update/delete API.

### Settings

| Method | Route | Purpose | Suggested access |
|---|---|---|---|
| GET | `/api/Settings` | Read non-secret system settings | Admin |
| GET | `/api/Settings/{key}` | Read one setting | Admin |
| PUT | `/api/Settings/{key}` | Update a setting with validation and audit | Admin |

Never return secrets from settings endpoints. Prefer a typed settings DTO over returning arbitrary persistence entities.

## 7. Proposed endpoint status by module

“Proposed” means documented for implementation, not available to clients.

| Module | Documentation | Current implementation |
|---|---|---|
| Health | Complete | Implemented (`GET /api/Health`) |
| Authentication | Proposed contract | Controller empty; middleware not configured |
| Users | Proposed contract | Controller empty |
| Farmers | Proposed contract | Controller empty |
| Collectors | Proposed contract | Controller empty |
| Collections | Proposed contract | Controller empty |
| Collection requests | Proposed contract | Controller empty |
| Loans and repayments | Proposed contract | Controller empty |
| Deductions | Proposed contract | Controller empty |
| Settlements | Proposed contract | Controller empty |
| Notifications | Proposed contract | No controller file currently present |
| Tea prices | Proposed contract | Controller empty |
| Weight verification | Proposed contract | Controller empty |
| Dashboard and analytics | Proposed contract | Controllers empty |
| Reports | Proposed contract | Controller empty |
| Activity logs | Proposed contract | Controller empty |
| Settings | Proposed contract | Controller empty |

The old EF Core summary listed only User, Farmer, Collector, and Collection as context entities. Check `ApplicationDbContext` and migrations as the source of truth when implementing persistence. Several additional model files exist but are empty placeholders here. A model or table does not mean an API route is implemented.

## 8. Authorization matrix (proposal)

| Resource/action | Admin | Collector | Farmer |
|---|---:|---:|---:|
| Manage users, prices, settings | Yes | No | No |
| Read all farmers and collections | Yes | Assigned area/purpose | Own records |
| Record collection | Yes | Yes | No |
| Request collection | Yes | No | Own |
| Issue loan / create deduction / settle | Yes | No | No |
| Read own loan, deductions, settlement | Yes | No | Own |
| Read audit logs and reports | Yes | No | No |

Enforce resource ownership in services/queries as well as role attributes. Do not trust a client-supplied farmer ID to establish ownership.

## 9. Suggested implementation order

1. Add DTO validation, consistent error handling, and integration tests.
2. Wire authentication/authorization and test role/ownership rules.
3. Implement users, farmers, and collectors.
4. Implement tea prices and collections, including server-side weight/amount calculations.
5. Implement collection requests and state transitions.
6. Implement loans, repayments, and deductions.
7. Implement settlement calculations and idempotency/duplicate-period rules.
8. Add reports, dashboard/analytics, activity logs, settings, and notifications.
9. Keep Swagger examples and this guide synchronized with the actual actions.

## 10. Controller checklist

For each endpoint:

1. Add an action to the correct controller with an explicit route and HTTP verb.
2. Accept/return DTOs; validate with data annotations or a validator.
3. Put business calculations and transaction boundaries in a service.
4. Scope database queries to the caller and permitted records.
5. Return the documented status code and error shape.
6. Add Swagger summaries/examples and tests for success, validation, not found, authorization, and business-rule failures.
7. Update the endpoint catalog's status to Implemented only after the action and behavior are verified.

## 11. Current authentication wiring note

The current `Program.cs` calls `UseAuthorization()` but does not register an authentication scheme or call `UseAuthentication()`. No controller action currently has an authorization attribute. JWT-related helpers/services alone do not enforce authentication. Wire the middleware in this order before relying on bearer tokens:

```csharp
app.UseAuthentication();
app.UseAuthorization();
```

Register JWT bearer authentication and role/policy configuration in the service setup before adding protected actions.

## 12. Swagger / OpenAPI workflow

Swagger is registered in `Program.cs` using `AddEndpointsApiExplorer()` and `AddSwaggerGen()`, then served with Swagger UI only in Development. Use it during development to:

1. Inspect routes actually registered by controllers.
2. Submit requests with realistic DTO examples.
3. Check serialization, response bodies, and status codes.
4. Once authentication is configured, authorize with a development token and verify role/ownership behavior.
5. Confirm mobile/admin clients can use the documented contract before integration.

Swagger reflects implemented actions; proposed routes will not appear until their controller actions are added.

## 13. API naming and versioning

Use resource names for standard operations:

```text
GET    /api/Resources
GET    /api/Resources/{id}
POST   /api/Resources
PUT    /api/Resources/{id}
DELETE /api/Resources/{id}
```

Use nested routes when a child belongs to a parent (for example `/api/Loans/{id}/repayments`) and action routes for explicit commands/state transitions (for example `/api/CollectionRequests/{id}/approve`). This guide recommends `POST` for commands; consistency within the API is more important than mixing styles.

API versioning is not currently configured. Keep initial routes under `/api/...`; before a production breaking change, agree and implement a prefix such as `/api/v1/...` rather than silently changing existing shapes.

## 14. Development workflow

Typical request flow:

```text
Mobile/Admin client -> Controller -> Service -> Repository/Unit of Work -> EF Core -> PostgreSQL
```

Controllers handle HTTP concerns and delegate business rules to services. Services validate state transitions and calculations. Repositories/EF Core persist the operation; use a transaction when a workflow updates multiple related records. Follow the team's branch and pull request process (for example `feature/auth-api`, `feature/collection-api`, or `feature/loan-api`).

## 15. Database entities and API resources

The project includes model files for users, farmers, collectors, collections, activity logs, collection requests, deductions, loans, repayments, notifications, refresh tokens, settlements, settings, tea prices, and weight verification. Some are empty placeholders. Use the EF Core context and migrations as the source of truth for persisted entities, and API DTOs as the source of truth for the public contract. Add a resource to the endpoint catalog as implemented only when its controller behavior is implemented and verified.
