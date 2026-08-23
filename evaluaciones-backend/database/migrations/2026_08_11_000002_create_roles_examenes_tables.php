<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles_examenes', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->foreignId('gestion_id')->constrained('gestiones');
            $table->foreignId('sede_id')->constrained('sedes');
            $table->foreignId('campus_id')->nullable()->constrained('campus');
            $table->foreignId('carrera_id')->constrained('carreras');
            $table->foreignId('asignatura_id')->constrained('asignaturas');
            $table->foreignId('grupo_id')->constrained('grupos');
            $table->foreignId('docente_id')->constrained('docentes');
            
            $table->enum('tipo_evaluacion', [
                '1ER_PARCIAL',
                '2DO_PARCIAL',
                'EXAMEN_FINAL',
                '2DA_INSTANCIA',
                'EXTRAORDINARIO'
            ])->default('1ER_PARCIAL');
            
            $table->date('fecha_examen');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->string('aula')->nullable();
            
            // Requisito: Director define si la prueba usa cartillas de lectura óptica
            $table->boolean('con_cartilla')->default(true);
            
            // Requisito: Estados con flujo riguroso + opción de SUSPENDIDO
            $table->enum('estado', [
                'PROGRAMADO',
                'BANCO_RECIBIDO',
                'GENERADO',
                'IMPRESO',
                'ENTREGADO',
                'EJECUTADO',
                'SUBIDO',
                'SUSPENDIDO'
            ])->default('PROGRAMADO');
            
            $table->string('excel_banco_path')->nullable();
            $table->integer('total_estudiantes')->default(0);
            
            // Campos obligatorios para estado SUSPENDIDO
            $table->text('motivo_suspension')->nullable();
            $table->string('suspendido_por_user_id')->nullable();
            $table->timestamp('fecha_suspension')->nullable();
            
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        Schema::create('evaluaciones_configuracion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gestion_id')->constrained('gestiones')->onDelete('cascade');
            $table->string('tipo_evaluacion');
            $table->integer('preguntas_por_examen')->default(30);
            $table->integer('tiempo_limite_minutos')->default(90);
            $table->text('instrucciones_header')->nullable();
            $table->integer('variantes_requeridas')->default(3); // A, B, C
            $table->timestamps();
        });

        Schema::create('evaluaciones_tiempos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gestion_id')->constrained('gestiones')->onDelete('cascade');
            $table->string('tipo_evaluacion');
            $table->dateTime('fecha_apertura');
            $table->dateTime('fecha_cierre');
            $table->integer('duracion_maxima')->default(90);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluaciones_tiempos');
        Schema::dropIfExists('evaluaciones_configuracion');
        Schema::dropIfExists('roles_examenes');
    }
};
