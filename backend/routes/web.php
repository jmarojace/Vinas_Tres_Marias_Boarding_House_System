<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'application' => config('app.name'),
        'status' => 'running',
        'frontend' => 'Run npm run dev from the project root to open the React app.',
    ]);
});
