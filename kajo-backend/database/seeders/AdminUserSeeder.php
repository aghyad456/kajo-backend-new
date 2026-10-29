<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $name = env('KAJO_ADMIN_NAME', 'Kajo Admin');
        $email = env('KAJO_ADMIN_EMAIL');
        $password = env('KAJO_ADMIN_PASSWORD');

        if (
            !is_string($email) ||
            !filter_var($email, FILTER_VALIDATE_EMAIL)
        ) {
            throw new RuntimeException(
                'KAJO_ADMIN_EMAIL is missing or invalid.'
            );
        }

        if (
            !is_string($password) ||
            strlen($password) < 12
        ) {
            throw new RuntimeException(
                'KAJO_ADMIN_PASSWORD must contain at least 12 characters.'
            );
        }

        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            throw new RuntimeException(
                'An account with the admin email already exists. Seeder stopped.'
            );
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => User::ROLE_ADMIN,
        ]);

        $this->command?->info(
            'Kajo administrator created successfully.'
        );
    }
}
