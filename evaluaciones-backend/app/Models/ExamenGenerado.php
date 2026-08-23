<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamenGenerado extends Model
{
    use HasFactory;

    protected $table = 'examenes_generados';

    protected $fillable = [
        'rol_examen_id',
        'version_codigo',
        'es_caso_especial',
        'descripcion_version',
        'variante',
        'archivo_pdf_path',
        'patron_respuestas_json',
        'total_preguntas',
        'checksum',
    ];

    protected $casts = [
        'es_caso_especial' => 'boolean',
        'patron_respuestas_json' => 'array',
    ];

    public function rolExamen(): BelongsTo
    {
        return $this->belongsTo(RolExamen::class, 'rol_examen_id');
    }
}
