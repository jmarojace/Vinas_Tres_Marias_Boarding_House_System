# Vinas Tres Marias Boarding House System

React and Vite frontend with a Laravel 12, Sanctum, and MySQL backend.

## Folders

- `frontend/` contains the React user interface.
- `backend/` contains the Laravel API and database migrations.
- `backend-php-backup/` preserves the previous PHP API for reference.

## Run locally with XAMPP

1. Start **MySQL** in XAMPP. In phpMyAdmin, create a database named `rental_bh_laravel` using `utf8mb4`. This keeps the previous PHP database (`rental_bh_system`) untouched.
2. In a terminal at the project root, install the API dependencies and prepare Laravel:

   ```powershell
   cd backend
   composer install
   Copy-Item .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   cd ..
   ```

3. Start the API and frontend in separate terminals from the project root:

   ```powershell
   npm run api
   ```

   ```powershell
   npm install
   npm run dev
   ```

4. Open the Vite address shown in the terminal. API requests are proxied to Laravel at `127.0.0.1:8124`.

## Initial administrator

The local admin account is `paulsobrio@gmail.com` / `sobrio123`.

Staff and tenant registrations are pending until an administrator approves them. The administrator can also create accounts in **User accounts**. Tenant access needs a linked tenant profile and room assignment.

See [backend/README.md](backend/README.md) for API and data notes. This project has been prepared for local XAMPP use; it is not configured for public production hosting.
