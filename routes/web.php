<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Route per servire i dati dei giocatori
Route::get('/api/players', function () {
    $filePath = public_path('players-data.json');
    
    if (!file_exists($filePath)) {
        return response()->json(['error' => 'Players data not found'], 404);
    }
    
    $data = file_get_contents($filePath);
    return response($data)->header('Content-Type', 'application/json');
});

// Route fallback per servire i file statici
Route::get('/styles.css', function () {
    $filePath = public_path('styles.css');
    if (file_exists($filePath)) {
        return response(file_get_contents($filePath))->header('Content-Type', 'text/css');
    }
    return response('/* CSS not found */', 404);
});

Route::get('/app.js', function () {
    $filePath = public_path('app.js');
    if (file_exists($filePath)) {
        return response(file_get_contents($filePath))->header('Content-Type', 'application/javascript');
    }
    return response('// JS not found', 404);
});
