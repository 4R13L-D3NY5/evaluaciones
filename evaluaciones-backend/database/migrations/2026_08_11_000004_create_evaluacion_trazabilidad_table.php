<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluacion_trazabilidad', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rol_examen_id')->constrained('roles_examenes')->onDelete('cascade');
            
            // Requisito: Registrar usuario, rol, fecha exacta y estados anterior/nuevo en cada etapa
            $table->string('user_id')->default('system');
            $table->string('user_nombre')->default('Sistema');
            $table->string('user_rol')->default('SISTEMA'); // DIRECTOR, DEPT_EVALUACIONES, DOCENTE, SISTEMA
            
            $table->string('estado_anterior');
            $table->string('estado_nuevo');
            $table->text('motivo_comentario')->nullable();
            $table->string('ip_address')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluacion_trazabilidad');
    }
};
