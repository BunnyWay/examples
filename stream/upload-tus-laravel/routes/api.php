<?php

use App\Http\Controllers\UploadController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

Route::post('/uploads', UploadController::class);
Route::get('/videos/{id}', VideoController::class);
