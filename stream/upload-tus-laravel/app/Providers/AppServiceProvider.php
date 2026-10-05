<?php

namespace App\Providers;

use Illuminate\Foundation\DevCommands;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Nothing here is queued, so `composer run dev` only starts the server and Vite.
        DevCommands::except('queue');
    }
}
