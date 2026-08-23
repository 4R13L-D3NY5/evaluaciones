<?php

namespace App\Jobs;

use App\Models\RolExamen;
use App\Services\ExamGeneratorService;
use App\Services\TrazabilidadService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateRolExamenPackageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public RolExamen $rolExamen,
        public string $versionCodigo = 'v1.0-REGULAR',
        public bool $esCasoEspecial = false,
        public ?string $descripcionVersion = null,
        public string $userId = 'system',
        public string $userNombre = 'Worker de Colas',
        public string $userRol = 'SISTEMA'
    ) {}

    public function handle(
        ExamGeneratorService $generatorService,
        TrazabilidadService $trazabilidadService
    ): void {
        Log::info("Iniciando Job de Generación de Examen para RolExamen #{$this->rolExamen->id} - Versión {$this->versionCodigo}");

        // Generar variantes PDF y patrón
        $generatorService->generarPaqueteExamen(
            $this->rolExamen,
            $this->versionCodigo,
            $this->esCasoEspecial,
            $this->descripcionVersion
        );

        // Registrar cambio de estado a GENERADO con trazabilidad
        $trazabilidadService->registrarTransicion(
            $this->rolExamen,
            'GENERADO',
            $this->userId,
            $this->userNombre,
            $this->userRol,
            "Paquete de exámenes en PDF generado con éxito ({$this->versionCodigo})."
        );

        Log::info("Job completado con éxito para RolExamen #{$this->rolExamen->id}");
    }
}
