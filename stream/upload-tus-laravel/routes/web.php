<?php

use App\Services\BunnyStream;
use Illuminate\Support\Facades\Route;

Route::get('/', fn (BunnyStream $bunny) => view('upload', ['configured' => $bunny->isConfigured()]));
