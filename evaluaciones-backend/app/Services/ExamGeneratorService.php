<?php

namespace App\Services;

use App\Models\ExamenGenerado;
use App\Models\RolExamen;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExamGeneratorService
{
    /**
     * Procesa la generación de variantes y versiones de exámenes para un RolExamen
     */
    public function generarPaqueteExamen(
        RolExamen $rolExamen,
        string $versionCodigo = 'v1.0-REGULAR',
        bool $esCasoEspecial = false,
        ?string $descripcionVersion = null,
        array $variantes = ['A', 'B', 'C']
    ): array {
        $examenesCreados = [];
        $totalPreguntas = 30; // Configuración estándar de preguntas

        foreach ($variantes as $variante) {
            // Estructura de patrón de respuestas sintético
            $patronRespuestas = [];
            for ($i = 1; $i <= $totalPreguntas; $i++) {
                $opciones = ['A', 'B', 'C', 'D'];
                $patronRespuestas[$i] = $opciones[array_rand($opciones)];
            }

            // Path simulado de almacenamiento del PDF generado
            $fileName = "examenes/{$rolExamen->id}_{$versionCodigo}_Var{$variante}_" . Str::random(6) . ".pdf";
            
            // Guardar o simular el archivo en storage local
            Storage::disk('local')->put($fileName, "PDF Mock Banner - RolExamen #{$rolExamen->id} | Variante {$variante} | Versión {$versionCodigo}");

            $examenGenerado = ExamenGenerado::create([
                'rol_examen_id' => $rolExamen->id,
                'version_codigo' => $versionCodigo,
                'es_caso_especial' => $esCasoEspecial,
                'descripcion_version' => $descripcionVersion ?? ($esCasoEspecial ? 'Versión Caso Especial' : 'Versión Regular'),
                'variante' => $variante,
                'archivo_pdf_path' => $fileName,
                'patron_respuestas_json' => $patronRespuestas,
                'total_preguntas' => $totalPreguntas,
                'checksum' => md5("rol_{$rolExamen->id}_var_{$variante}_" . time()),
            ]);

            $examenesCreados[] = $examenGenerado;
        }

        return $examenesCreados;
    }
}
