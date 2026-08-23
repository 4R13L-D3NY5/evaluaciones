<?php

use App\Http\Controllers\RolExamenController;
use App\Services\Sea\SeaAcademicClientMock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Subproyecto Evaluaciones (Ecosistema XpertiFlow)
|--------------------------------------------------------------------------
*/

// Rutas de Catálogo Académico (Mock SEA)
Route::prefix('sea-catalog')->group(function () {
    $seaClient = new SeaAcademicClientMock();

    Route::get('/sedes', fn() => response()->json(['success' => true, 'data' => $seaClient->getSedes()]));
    Route::get('/carreras', fn(Request $request) => response()->json(['success' => true, 'data' => $seaClient->getCarreras($request->input('sede', 'CBBA'))]));
    Route::get('/asignaturas', fn(Request $request) => response()->json(['success' => true, 'data' => $seaClient->getAsignaturas($request->input('carrera', 'MED'))]));
    Route::get('/grupos', fn(Request $request) => response()->json(['success' => true, 'data' => $seaClient->getGrupos($request->input('asignatura', 'MED-212'))]));
    Route::get('/docentes', fn() => response()->json(['success' => true, 'data' => $seaClient->getDocentes()]));
});

// Rutas Principales de Roles de Exámenes y Evaluación
Route::prefix('rol-examenes')->group(function () {
    Route::get('/', [RolExamenController::class, 'index']);
    Route::post('/', [RolExamenController::class, 'store']); // Programación Director
    Route::get('/{id}', [RolExamenController::class, 'show']);
    
    // Carga de Excel por Dpto. Evaluaciones
    Route::post('/{id}/cargar-excel', [RolExamenController::class, 'cargarExcel']);
    
    // Generación de Variantes y Versiones Especiales
    Route::post('/{id}/generar', [RolExamenController::class, 'generar']);
    
    // Transición de Estados
    Route::post('/{id}/cambiar-estado', [RolExamenController::class, 'cambiarEstado']);
    
    // Requisito: Suspensión obligando Motivo
    Route::post('/{id}/suspender', [RolExamenController::class, 'suspender']);
});
