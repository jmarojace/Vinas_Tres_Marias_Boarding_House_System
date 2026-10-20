# Local API setup

This repo uses a small PHP API with MySQL so it can run with the installed XAMPP tools without downloading Composer packages.

1. Start **Apache** and **MySQL** in XAMPP Control Panel.
2. Import `schema.sql`, then `seed.sql`, into the local MySQL server. The database `rental_bh_system`, demo owner account, and sample records are created by these scripts.
3. From the project root, run `npm run api` in a terminal. The API listens on `http://127.0.0.1:8123`.
4. In another terminal, run `npm run dev` and open the Vite URL.

Demo logins: owner `paulsobrio@gmail.com` / `sobrio123`; staff `staff.demo@vinas.test` / `StaffDemo2026!`; tenant Sofia `tenant.sofia@vinas.test` / `TenantDemo2026!`. These are local demonstration accounts. Change them before using real records. The default database connection is XAMPP's `root` account with no password. Set `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` before launching PHP if your MySQL credentials differ.

After signing in as the owner, open **User accounts** to create staff logins and tenant logins. A tenant login can be linked to one of the listed tenant records, or the form can create a linked tenant profile using a phone number. The tenant will then see only their own agreement, room, payments, and maintenance requests in **My home**. Staff accounts see day-to-day property pages; only admins see reports, settings, and account management.

The login screen also has a **Create an account** link for self-registration. Applicants can request only a tenant or staff role; they cannot create an admin. Requests remain pending until an admin approves them on **User accounts**. Tenant sign-ups create a tenant profile but still need a room agreement assigned before rental details and maintenance submission are available.

The API provides session login/logout/current-user endpoints, role checks for admin/staff/tenant, CRUD endpoints for rooms, tenants, rental agreements, payments, maintenance requests, user accounts and optional charges, paginated searchable lists, validation errors, and a dashboard endpoint that calculates rent balances by agreement and payment period. The current React demo also syncs its complete workspace snapshot to MySQL, so its existing screens share data between sessions and devices.

This is a local capstone implementation, not a hardened public deployment. It uses PHP sessions rather than Laravel Sanctum, and MySQL rather than SQLite. The API source is `index.php`; `schema.sql` defines relational foreign keys and data tables.
