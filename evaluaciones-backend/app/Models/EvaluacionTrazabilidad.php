<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluacionTrazabilidad extends Model
{
    use HasFactory;

    protected $table = 'evaluacion_trazabilidad';

    public $timestamps = false; // Solo se guarda created_at vía migration default

    protected $fillable = [
        'rol_examen_id',
        'user_id',
        'user_nombre',
        'user_rol',
        'estado_anterior',
        'estado_nuevo',
        'motivo_comentario',
        'ip_address',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function rolExamen(): BelongsTo
    {
        return $this->belongsTo(RolExamen::class, 'rol_examen_id');
    }
}
