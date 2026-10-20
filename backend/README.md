# Laravel API

This is a Laravel 12 API using Sanctum bearer tokens, adapted from the structure of the supplied student document portal repository. Its document-request code is not included; the API here serves boarding-house users and property records.

## Setup

Create the `rental_bh_laravel` MySQL database in XAMPP, then from this folder run:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8124
```

Configure `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `.env` for your MySQL instance. Laravel uses its own database name so it will not collide with your older PHP database `rental_bh_system`. Update the `SEED_ADMIN_*` values before seeding if needed.

## API

- Public: `POST /api/login`, `POST /api/register`
- Signed in: `POST /api/logout`, `GET /api/me`, `GET /api/notifications`
- Admin/staff: `GET|PUT /api/snapshot`, `PATCH /api/maintenance/{id}`
- Admin: `GET|POST /api/users`, `PATCH /api/users/{id}`, `DELETE /api/maintenance/{id}`
- Tenant: `GET /api/tenant-portal`, `POST /api/tenant-maintenance`

Login returns a Sanctum personal access token. The React app stores it locally and sends it in the `Authorization: Bearer` header. Roles are enforced on API routes as well as in the interface.

## Data

Users and Sanctum tokens use relational tables. The current UI's rooms, tenant profiles, rental agreements, payments, and maintenance list are stored as a shared JSON property snapshot to preserve the existing interface and allow staff and admin to work from the same records. Tenant portal views and submitted maintenance requests use that snapshot. Move-in, room, agreement, and payment data can be normalized into dedicated tables in a later migration without changing the login setup.
