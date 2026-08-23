<?php

namespace App\Services;

use App\Models\EvaluacionTrazabilidad;
use App\Models\RolExamen;
use Illuminate\Support\Facades\DB;

class TrazabilidadService
{
    /**
     * Registra un cambio de estado e historial inmutable en la tabla de trazabilidad
     */
    public function registrarTransicion(
        RolExamen $rolExamen,
        string $nuevoEstado,
        string $userId,
        string $userNombre,
        string $userRol,
        ?string $motivo = null,
        ?string $ip = null
    ): EvaluacionTrazabilidad {
        return DB::transaction(function () use ($rolExamen, $nuevoEstado, $userId, $userNombre, $userRol, $motivo, $ip) {
            $estadoAnterior = $rolExamen->estado;

            // Actualizar estado en el modelo principal
            $rolExamen->estado = $nuevoEstado;
            
            if ($nuevoEstado === 'SUSPENDIDO') {
                $rolExamen->motivo_suspension = $motivo;
                $rolExamen->suspendido_por_user_id = $userId;
                $rolExamen->fecha_suspension = now();
            }
            
            $rolExamen->save();

            // Guardar registro inmutable de trazabilidad
            return EvaluacionTrazabilidad::create([
                'rol_examen_id' => $rolExamen->id,
                'user_id' => $userId,
                'user_nombre' => $userNombre,
                'user_rol' => $userRol,
                'estado_anterior' => $estadoAnterior,
                'estado_nuevo' => $nuevoEstado,
                'motivo_comentario' => $motivo,
                'ip_address' => $ip,
                'created_at' => now(),
            ]);
        });
    }
}
