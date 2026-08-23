<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examenes_generados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rol_examen_id')->constrained('roles_examenes')->onDelete('cascade');
            
            // Requisito: Soportar más de una versión por examen para casos especiales (rezagados, pruebas adaptadas)
            $table->string('version_codigo')->default('v1.0-REGULAR');
            $table->boolean('es_caso_especial')->default(false);
            $table->string('descripcion_version')->nullable();
            
            $table->string('variante')->default('A'); // A, B, C
            $table->string('archivo_pdf_path');
            $table->json('patron_respuestas_json')->nullable();
            $table->integer('total_preguntas')->default(0);
            $table->string('checksum')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examenes_generados');
    }
};
