# Vinas Tres Marias Boarding House System

A responsive rental property system built with React, Vite, a PHP API, and MySQL. Manage rooms, tenants, rental agreements, payments, maintenance requests, and rental summaries.

## Demo sign in

- Email: `paulsobrio@gmail.com`
- Password: `sobrio123`

Staff demo: `staff.demo@vinas.test` / `StaffDemo2026!`  
Tenant demo: `tenant.sofia@vinas.test` / `TenantDemo2026!` (linked to Sofia Reyes)

## Run locally with XAMPP

```bash
npm install
npm run api
```

In another terminal:

```bash
npm run dev
```

Import `backend/schema.sql` into XAMPP MySQL first. Open the local address printed by Vite. Backend setup and API details are in [backend/README.md](backend/README.md).

## Features

- Dashboard summaries for rooms, tenants, collections, and outstanding balances
- Create, update, delete, search, and filter room, tenant, agreement, payment, and maintenance records
- Update maintenance requests through Pending, In Progress, and Resolved
- Export a tenant rental summary as CSV
- Settings for dark mode, compact tables, dashboard maintenance reminders, and JSON data backups
- Role-specific admin, staff, and tenant navigation; staff and tenant sign-up requests require administrator approval
- Responsive navigation and layouts for desktop and mobile screens

Authentication now uses the local PHP API and MySQL session-backed accounts. The proposal specifies Laravel/Sanctum; Composer could not download Laravel in this environment, so the available implementation uses PHP's built-in server and XAMPP MySQL. The current UI stores its complete workspace snapshot in MySQL, while the separate relational API endpoints are available for migrating each screen to normalized records. The UI still needs tenant-specific pages and role-based navigation before it fully matches the proposal.
# Vinas_Tres_Marias_Boarding_House_System
