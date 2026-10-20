<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => env('SEED_ADMIN_EMAIL', 'paulsobrio@gmail.com')],
            ['name' => env('SEED_ADMIN_NAME', 'Paul Sobrio'), 'password' => env('SEED_ADMIN_PASSWORD', 'sobrio123'), 'role' => 'admin', 'status' => 'active']
        );
    }
}
