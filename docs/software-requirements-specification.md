# Software Requirements Specification

## TeaLedger — Digital Tea Collection and Farmer Management System

| Document control | Details |
|---|---|
| Document | Software Requirements Specification (SRS) |
| System | TeaLedger — Digital Tea Collection and Farmer Management System |
| Project | IS Project for Community — Group 07 |
| Version | 1.0 (edited for consistency) |
| Status | Prepared; stakeholder approval should be recorded separately |
| Primary users | Admin, Collector, Farmer |
| Source basis | TeaLedger Community Project Proposal (Group 07) |
| Original date | September 2026 |

This SRS consolidates the supplied project requirements. It does not claim that proposed features are already implemented. Where the source does not settle a policy, the requirement identifies the decision that stakeholders must make before implementation.

## Table of contents

1. Introduction
2. Overall description
3. System scope
4. User classes and roles
5. Functional requirements
6. Non-functional requirements
7. Security requirements
8. External interface requirements
9. System modules
10. Data and business rules
11. Technology and development environment
12. Constraints and assumptions
13. Acceptance criteria
14. Development methodology
15. Future enhancement areas
16. References
Appendix A. Traceability summary

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification defines the functional, non-functional, security, interface, data, and operational requirements for TeaLedger. The system digitizes tea-leaf collection, farmer records, digital passbooks, earnings, loans, deductions, and monthly settlements between smallholder tea farmers and tea collectors.

### 1.2 Background

The partner community currently manages tea collection through phone calls, memory, paper passbooks, notebooks, and manual calculations. Farmers notify collectors when tea leaves are ready; collection weights, reductions, prices, loans, supplies, transport charges, and monthly payments are recorded manually. This creates risks of missed requests, damaged or inconsistent records, calculation errors, limited visibility, and disputes.

### 1.3 Objectives

- Digitize the existing manual tea-leaf collection and passbook process.
- Allow farmers to notify their collector when tea leaves are ready.
- Give collectors a daily view of pending, collected, and not-collected requests.
- Record gross weight, reductions, and verified final weight for each collection.
- Maintain a digital passbook for each farmer.
- Manage monthly tea prices and calculate farmer earnings automatically.
- Record loans, advances, and repayments with accurate outstanding balances.
- Manage fertilizer, dolomite, tea-bag, transport, and other approved deductions.
- Generate monthly settlements showing gross income, deductions, installments, and net payment.
- Give farmers access to their collection and financial history.
- Give administrators centralized management of collectors and system users.
- Provide reports and statistics to relevant users.

### 1.4 Intended audience

This SRS is intended for the project team, supervisor, partner community stakeholders, UI/UX designers, backend and database developers, mobile and web developers, testers, and future maintainers of TeaLedger.

## 2. Overall description

### 2.1 Product perspective

TeaLedger consists of three user-facing applications backed by a central API and database.

| Component | Primary users | Purpose |
|---|---|---|
| Admin Web Application | Admin | Manage collectors and users, monitor activity, and view reports/statistics. |
| Farmer Mobile Application | Farmer | Notify the collector; view collections, passbook, earnings, loans, deductions, and settlements. |
| Collector Mobile Application | Collector | Manage assigned farmers, process requests, record verified weights, prices, loans, deductions, and settlements. |
| Central Backend API | All | Authentication, authorization, business logic, data access, notifications, and integration. |
| Central Database | System | Persist users, profiles, collections, financial records, and system activity. |

### 2.2 Product functions

- Authentication and role-based authorization.
- Admin, collector, and farmer account/profile management.
- Tea availability requests and notifications.
- Tea collection recording and weight verification.
- Digital passbook management.
- Monthly tea price and earnings calculation.
- Loan and repayment management.
- Material and other deduction management.
- Monthly settlement calculation and recording.
- Reports and analytics.
- Offline collection recording by collectors and later synchronization.

### 2.3 User characteristics

| Role | Characteristics and needs |
|---|---|
| Admin | Needs centralized management, system monitoring, activity visibility, and reports. |
| Collector | Works in the field, manages assigned farmers, records collections and financial transactions, and may have intermittent connectivity. |
| Farmer | May have limited technical experience; needs simple screens, large controls, minimal typing, Sinhala/English support, and easy access to personal financial records. |

## 3. System scope

### 3.1 In scope

- Three-role access model: Admin, Collector, Farmer.
- Farmer registration and collector relationship management.
- Farmer tea-ready requests with estimated quantity.
- Collector notification and daily request tracking.
- Collection weight entry and verification.
- Automatic final-weight and earnings calculations.
- Digital passbook.
- Monthly tea price management.
- Loans, advances, repayments, and outstanding balances.
- Fertilizer, dolomite, tea-bag, transport, and other approved deductions.
- Monthly settlements.
- Role-specific reports and statistics.
- Push notifications for key events.
- Offline collection recording for the collector and later synchronization.

### 3.2 Out of scope or not specified in source

The source proposal does not specify factory-side processing, bank/payment-gateway integration, GPS route optimization, advanced machine learning, or integration with external tea-factory ERP systems. These are not baseline requirements unless separately approved.

## 4. User classes and roles

| Role | Access boundary | Main capabilities |
|---|---|---|
| Admin | System-wide | Manage collectors and users; view system statistics, activity, and reports. |
| Collector | Assigned collection area and assigned farmers | Manage farmers; receive requests; record collections; set monthly prices; manage loans/deductions; prepare settlements; view permitted reports. |
| Farmer | Own records only | Submit tea-ready requests; view own collection history, passbook, earnings, loans, deductions, and settlements. |

The method for assigning collection areas and associating farmers with collectors is a stakeholder decision. The system must enforce the resulting assignment on the server, regardless of client-supplied IDs.

## 5. Functional requirements

| ID | Requirement | Description |
|---|---|---|
| FR01 | Authentication and authorization | The system shall allow users to log in securely and access features according to Admin, Collector, or Farmer role. |
| FR02 | Collector administration | Admin shall register, update, activate, and deactivate collectors. |
| FR03 | Farmer management | A Collector shall register and manage farmers assigned to that Collector's collection area. |
| FR04 | Tea availability request | A Farmer shall notify the assigned Collector when tea leaves are ready and may include an estimated quantity. |
| FR05 | Request tracking | A Collector shall receive notifications and view a daily list of requests grouped as Pending, Collected, and Not Collected. |
| FR06 | Collection recording | A Collector shall record gross weight, water reduction, bag weight, and other reductions for each collection. |
| FR07 | Final weight and passbook | The system shall calculate final weight and update the Farmer's digital passbook from the verified collection record. |
| FR08 | Tea price management | A Collector shall set the tea price per kilogram for each month, within the assigned collection scope. |
| FR09 | Earnings calculation | The system shall calculate earnings from verified final weight and the applicable monthly price. |
| FR10 | Loan management | The system shall record loans, advances, and repayments and maintain the outstanding balance. |
| FR11 | Deduction management | The system shall record approved fertilizer, dolomite, tea-bag, transport, and other deductions. |
| FR12 | Monthly settlement | The system shall generate a monthly settlement showing gross income, approved deductions, loan installments (if applicable), and net payment. |
| FR13 | Farmer financial history | A Farmer shall view their own collection history, passbook, earnings, loans, deductions, and settlements. |
| FR14 | Reports | The system shall generate collection and financial reports for each applicable role, restricted to that role's access scope. |
| FR15 | Notifications | The system shall create notifications for key events, including tea-ready requests, recorded collections, and finalized settlements. Push delivery is subject to device registration and connectivity. |

### 5.1 Authentication and authorization requirements

- Users shall authenticate before accessing protected functions.
- The system shall issue JWT-based authentication tokens.
- Access shall be restricted according to the user's role.
- A Farmer shall only access that Farmer's own financial and collection information.
- A Collector shall only manage/access farmers assigned to that Collector's collection area.
- Administrative functions shall be restricted to Admin users.
- The server shall enforce these rules; client-side UI restrictions alone are insufficient.

### 5.2 Tea availability and collection requirements

- A Farmer can mark tea leaves as ready for collection for the current collection cycle.
- A Farmer can provide an estimated quantity.
- A Collector can view requests grouped as Pending, Collected, and Not Collected.
- The Collector records collection date and weight details.
- Final weight shall be calculated as:

  `Final Weight = Gross Weight - Water Reduction - Bag Weight - Other Reduction`

- Final weight shall not be negative. The system shall reject invalid input and shall not save an invalid verified collection.
- Collectors can record collections while offline and synchronize them when connectivity returns. Synchronization shall not create duplicate collection or financial records when a submission is retried.

### 5.3 Earnings and settlement requirements

The baseline earnings calculation is:

`Gross Tea Income = Verified Final Weight × Applicable Price per kg`

At month end, the system shall total verified tea, apply the applicable monthly price, subtract approved deductions and applicable loan installments, update outstanding balances, and produce the Farmer's net payment.

The source proposal gives this baseline formula:

`Net Payment = Gross Tea Income - Total Approved Deductions`

The source also requires loan installments to be applied at month end. Before settlement implementation, stakeholders shall confirm whether loan installments are included in “Total Approved Deductions” or shown as a separate subtraction. Until confirmed, settlement records and reports shall expose gross income, approved non-loan deductions, loan installments, and net payment as separate amounts so the calculation is auditable. Do not subtract the same repayment both as a deduction and as a loan installment.

The source does not define currency, rounding precision, monthly price effective-date boundaries, or whether settlements may be recalculated after finalization. These policies require stakeholder decisions before financial implementation.

## 6. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR01 | Performance | Normal operations should respond within 2 seconds on a typical mobile data connection. |
| NFR02 | Usability | Screens should be simple, use large buttons, support Sinhala and English, and require minimal training. |
| NFR03 | Reliability | Financial records must be saved accurately and not be lost or duplicated; database transactions shall be used for financial operations. |
| NFR04 | Availability | The system should be available whenever a network connection exists; collector collection recording shall support offline operation and later synchronization. |
| NFR05 | Scalability | The system should support adding collectors and farmers without redesign. |
| NFR06 | Maintainability | The backend should use a modular structure so modules can be changed and tested independently. |
| NFR07 | Compatibility | Mobile applications should run on Android 8.0 and later; the admin web application should run on current major browsers. |

## 7. Security requirements

| ID | Security requirement |
|---|---|
| SEC01 | JWT authentication shall be used for authenticated API access. |
| SEC02 | Passwords shall use secure password hashing; plaintext passwords shall not be stored. |
| SEC03 | Role-based access control shall be enforced for Admin, Collector, and Farmer. |
| SEC04 | HTTPS shall be used for network communication in deployed environments. |
| SEC05 | All user-provided input shall be validated on the server. |
| SEC06 | API endpoints shall enforce authorization, not merely rely on client-side UI restrictions. |
| SEC07 | Database constraints shall protect data integrity and uniqueness. |
| SEC08 | Authentication tokens shall be stored securely on mobile devices. |
| SEC09 | Important system activities shall be auditable through activity/audit logs. |
| SEC10 | A Farmer must not obtain another Farmer's financial information by changing an identifier in an API request. |

## 8. External interface requirements

### 8.1 User interface

- Farmer and Collector mobile applications shall use simple navigation and large, clear controls.
- Interfaces shall minimize typing for field users.
- Sinhala and English language support is required by the source requirements.
- The Admin web application shall provide dashboard-style management and reporting interfaces.

### 8.2 Software interfaces

| Interface | Technology / purpose |
|---|---|
| Mobile applications | Flutter / Dart |
| Admin web application | React.js / TypeScript / Vite / Tailwind CSS |
| Backend API | ASP.NET Core Web API / C# |
| Data access | Entity Framework Core |
| Database | PostgreSQL |
| Push notifications | Firebase Cloud Messaging (FCM) |
| Local storage | SQLite and Flutter Secure Storage |
| Deployment | Docker and cloud hosting |

### 8.3 Communication interfaces

- Client applications shall communicate with the backend through secure HTTP(S) APIs.
- Push notifications shall use Firebase Cloud Messaging.
- Offline Collector data shall synchronize with the backend when connectivity becomes available.
- Financial write operations and synchronization shall be retry-safe and protected against duplicate application.

## 9. System modules

| No. | Module | Description |
|---:|---|---|
| 01 | Authentication and authorization | Login, logout, password change/reset, JWT issue/refresh, and role-based access. |
| 02 | Admin management | Collector registration, activation/deactivation, user management, statistics, and activity logs. |
| 03 | Collector management | Collector profile, collection area, and administration visibility. |
| 04 | Farmer management | Farmer registration, search, editing, deactivation, profile/contact/land details, and collector relationship. |
| 05 | Tea availability and notification | Tea-ready requests, estimated quantity, push notification, and daily request status. |
| 06 | Tea collection and weight verification | Collection date, gross weight, water reduction, bag weight, other reductions, final weight, and offline synchronization. |
| 07 | Digital passbook | Date-wise verified collection records visible within the Farmer's and Collector's permitted scope. |
| 08 | Tea price and earnings | Monthly price per kg and daily/monthly/total earnings calculations. |
| 09 | Loan and debt management | Loans, advances, repayments, installments, and outstanding balances. |
| 10 | Material and deduction management | Fertilizer, dolomite, tea bags, transport, and other approved deductions. |
| 11 | Monthly settlement and payments | Monthly totals, deductions, installments, net payment, and balance updates. Payment gateway integration is out of scope unless approved. |
| 12 | Reports and analytics | Farmer, Collector, and Admin collection/financial reports and statistics, each scoped by role. |

## 10. Data and business rules

### 10.1 Core data areas

- User and role information.
- Farmer and Collector profiles and their assignment relationship.
- Collection requests and collection records.
- Weight and reduction details, including verification and sync metadata as needed.
- Digital passbook entries (these may be derived from verified collections rather than stored separately; data design shall prevent duplicate ledger totals).
- Monthly tea prices and calculated earnings.
- Loans, advances, repayments, and installment allocations.
- Material issues and approved deductions.
- Monthly settlements and their component totals.
- Notifications and activity/audit records.

### 10.2 Business rules

| ID | Rule |
|---|---|
| BR01 | Each user shall have an assigned role that determines access. |
| BR02 | A Collector manages only farmers assigned to that Collector's collection area. The assignment method must be defined by the project. |
| BR03 | A collection record must retain gross weight and each applicable reduction. |
| BR04 | Final weight cannot be negative; validation shall prevent invalid weight calculations. |
| BR05 | The applicable monthly tea price shall be used for earnings calculation and retained with the verified collection or otherwise reproducibly linked to it. |
| BR06 | Loan repayments reduce the outstanding loan balance exactly once. |
| BR07 | Approved deductions reduce settlement amounts; unapproved deductions must not affect a finalized settlement. |
| BR08 | Monthly settlement totals shall be based on verified collections and approved financial records. |
| BR09 | Farmer-facing financial data is restricted to that Farmer's own records. |
| BR10 | Retrying an offline collection synchronization request must not create duplicate collection, passbook, earnings, or settlement entries. |
| BR11 | Financial changes that affect a finalized settlement must be prevented or handled through an auditable adjustment process. The exact correction workflow requires stakeholder approval. |

## 11. Technology and development environment

| Layer / purpose | Technology |
|---|---|
| Mobile applications | Flutter, Dart |
| Admin web | React.js, TypeScript, Vite, Tailwind CSS |
| Backend | ASP.NET Core Web API, C# |
| ORM | Entity Framework Core |
| Database | PostgreSQL |
| Authentication | JWT |
| Notifications | Firebase Cloud Messaging |
| Mobile local storage | SQLite, Flutter Secure Storage |
| Deployment | Docker, cloud hosting |
| Version control | Git, GitHub |
| API testing/documentation | Postman, Swagger/OpenAPI |
| UI/UX | Figma |
| Project management | Trello |

### 11.1 Hardware requirements

| User/device | Minimum requirement |
|---|---|
| Developer laptop/desktop | Intel Core i5 or equivalent, 8 GB RAM (16 GB recommended), 30 GB free storage, internet. |
| Developer Android test phone | Android 8.0+, 3 GB RAM. |
| Farmer smartphone | Android 8.0+, 2 GB RAM, mobile data. |
| Collector smartphone | Android 8.0+, 3 GB RAM, mobile data. |
| Admin computer | System capable of running current Chrome, Edge, or Firefox. |
| Server | Cloud VM/hosting service, approximately 1–2 vCPU, 2 GB RAM, 20 GB storage; validate through deployment/load testing. |

## 12. Constraints and assumptions

- The baseline target for mobile applications is Android 8.0 or later.
- The system assumes Farmers and Collectors have Android smartphones.
- Some users may have limited technical experience, so usability is a key constraint.
- Mobile connectivity may be intermittent in field locations; Collector collection recording therefore requires offline support.
- The system is designed around the existing Farmer–Collector workflow rather than replacing it with a factory-wide process.
- Initial development is intended to use low-cost/free technologies and the team's existing equipment.
- Detailed external payment integration is not specified in the source proposal.
- The source proposal does not settle the definition of collection area, currency, financial rounding, loan installment calculation, or post-finalization settlement corrections; obtain stakeholder decisions before implementing those policies.

## 13. Acceptance criteria

- Admin can securely log in and manage collectors.
- Collector can register and manage farmers assigned to that Collector's area.
- Farmer can submit a tea-ready request with estimated quantity.
- Collector can receive/view requests and record collection details.
- The system calculates final weight from gross weight and reductions correctly and rejects negative results.
- The digital passbook reflects verified collections without duplicate entries after synchronization retries.
- Monthly price and verified weight produce the expected earnings.
- Loans and repayments update outstanding balances exactly once.
- Material and transport deductions appear in the Farmer's financial records and only approved deductions affect settlements.
- Monthly settlement shows gross income, deductions, loan installment treatment, and net payment according to the approved calculation policy.
- Role restrictions prevent unauthorized access to another Farmer's records and prevent cross-area Collector access.
- Key notifications are delivered for supported events when the recipient has a valid push registration and network delivery is available; notification records remain available in the system.
- Collector collection records can be created offline and synchronized later without duplication or silent data loss.
- The mobile UI is usable with large controls and Sinhala/English support.
- Core operations meet the stated performance target under typical mobile connectivity.

## 14. Development methodology

The source proposal specifies Scrum-based Agile development. Work is organized into eight two-week sprints, with sprint planning, regular stand-ups, sprint reviews/demos, and retrospectives. The product backlog is maintained in Trello, and feedback from the supervisor and partner Collector is incorporated into subsequent iterations.

| Sprint | Focus | Main activities |
|---:|---|---|
| 1 | Requirements and analysis | Community discussion, requirement gathering, problem analysis, SRS, use cases. |
| 2 | UI/UX | Farmer screens, Collector screens, Admin dashboard. |
| 3 | Backend and database | Database, authentication, API, user roles. |
| 4 | Farmer application | Login, dashboard, tea notification, passbook. |
| 5 | Collector application | Farmer management, collection, weight verification, tea pricing. |
| 6 | Financial module | Loans, fertilizer, dolomite, tea bags, transport, deductions. |
| 7 | Admin web | Dashboard, Collector management, user management, reports. |
| 8 | Integration and testing | API integration, mobile/web testing, security testing, user acceptance testing. |

## 15. Future enhancement areas

The proposal identifies advanced analytics, automated notifications, and additional financial management features as future improvements. They are not mandatory baseline requirements unless separately approved. The baseline notifications in FR05 and FR15 remain in scope; “automated notifications” here means enhancements beyond those specified events.

## 16. References

1. TeaLedger — Digital Tea Collection and Farmer Management System, Community Project Proposal (Group 07), September 2026.
2. Microsoft Learn — ASP.NET documentation.
3. Flutter documentation.
4. React documentation.
5. PostgreSQL documentation.
6. Microsoft Learn — Entity Framework Core documentation.
7. Firebase Cloud Messaging documentation.
8. Microsoft Learn — Azure Virtual Machines.
9. Docker documentation.
10. Schwaber, K. and Sutherland, J. — The 2020 Scrum Guide.

## Appendix A. Traceability summary

| Objective area | Related requirements/modules |
|---|---|
| Digitize collection/passbook | FR04–FR07; Modules 05–07 |
| Automate earnings | FR08–FR09; Module 08 |
| Manage loans | FR10; Module 09 |
| Manage deductions | FR11; Module 10 |
| Monthly settlements | FR12; Module 11 |
| Farmer transparency | FR13; Modules 07–11 |
| Admin management | FR02; Module 02 |
| Reports | FR14; Module 12 |
| Notifications | FR05, FR15; Module 05 |
| Security | SEC01–SEC10 |

**End of Software Requirements Specification**
