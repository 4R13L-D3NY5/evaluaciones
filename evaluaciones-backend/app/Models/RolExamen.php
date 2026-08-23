<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RolExamen extends Model
{
    use HasFactory;

    protected $table = 'roles_examenes';

    protected $fillable = [
        'sea_id',
        'gestion_id',
        'sede_id',
        'campus_id',
        'carrera_id',
        'asignatura_id',
        'grupo_id',
        'docente_id',
        'tipo_evaluacion',
        'fecha_examen',
        'hora_inicio',
        'hora_fin',
        'aula',
        'con_cartilla',
        'estado',
        'excel_banco_path',
        'total_estudiantes',
        'motivo_suspension',
        'suspendido_por_user_id',
        'fecha_suspension',
        'observaciones',
    ];

    protected $casts = [
        'fecha_examen' => 'date',
        'con_cartilla' => 'boolean',
        'fecha_suspension' => 'datetime',
    ];

    public function gestion(): BelongsTo
    {
        return $this->belongsTo(Gestion::class);
    }

    public function sede(): BelongsTo
    {
        return $this->belongsTo(Sede::class);
    }

    public function campus(): BelongsTo
    {
        return $this->belongsTo(Campus::class);
    }

    public function carrera(): BelongsTo
    {
        return $this->belongsTo(Carrera::class);
    }

    public function asignatura(): BelongsTo
    {
        return $this->belongsTo(Asignatura::class);
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class);
    }

    public function examenesGenerados(): HasMany
    {
        return $this->hasMany(ExamenGenerado::class, 'rol_examen_id');
    }

    public function trazabilidad(): HasMany
    {
        return $this->hasMany(EvaluacionTrazabilidad::class, 'rol_examen_id')->orderBy('created_at', 'asc');
    }
}
