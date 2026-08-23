<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Gestiones Académicas
        Schema::create('gestiones', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->string('codigo')->unique(); // Ej: 2-2026
            $table->string('nombre');
            $table->boolean('activo')->default(true);
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->timestamps();
        });

        // Sedes
        Schema::create('sedes', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->string('codigo')->unique(); // CBBA, COB, GUA
            $table->string('nombre');
            $table->timestamps();
        });

        // Campus por Sede
        Schema::create('campus', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->foreignId('sede_id')->constrained('sedes')->onDelete('cascade');
            $table->string('codigo');
            $table->string('nombre');
            $table->timestamps();
        });

        // Carreras por Sede
        Schema::create('carreras', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->foreignId('sede_id')->constrained('sedes')->onDelete('cascade');
            $table->string('codigo'); // MED, ICO, BYF
            $table->string('nombre');
            $table->timestamps();
        });

        // Asignaturas por Carrera
        Schema::create('asignaturas', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->foreignId('carrera_id')->constrained('carreras')->onDelete('cascade');
            $table->string('codigo'); // MED-212, ICO-311
            $table->string('nombre');
            $table->integer('semestre')->default(1);
            $table->timestamps();
        });

        // Grupos por Asignatura
        Schema::create('grupos', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->foreignId('asignatura_id')->constrained('asignaturas')->onDelete('cascade');
            $table->string('codigo'); // G1, G2, G3
            $table->string('nombre');
            $table->string('tipo_grupo')->default('TEORICO'); // TEORICO, PRACTICO
            $table->timestamps();
        });

        // Horarios por Grupo
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->foreignId('grupo_id')->constrained('grupos')->onDelete('cascade');
            $table->string('dia'); // LUNES, MARTES...
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->string('aula')->nullable();
            $table->string('bloque')->nullable();
            $table->timestamps();
        });

        // Docentes (Catálogo Mínimo)
        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->string('ci')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('email')->nullable();
            $table->timestamps();
        });

        // Estudiantes Matriculados por Grupo
        Schema::create('matriculas_grupo', function (Blueprint $table) {
            $table->id();
            $table->string('sea_id')->nullable()->index();
            $table->foreignId('grupo_id')->constrained('grupos')->onDelete('cascade');
            $table->string('estudiante_ci');
            $table->string('estudiante_nombre');
            $table->string('estudiante_codigo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matriculas_grupo');
        Schema::dropIfExists('docentes');
        Schema::dropIfExists('horarios');
        Schema::dropIfExists('grupos');
        Schema::dropIfExists('asignaturas');
        Schema::dropIfExists('carreras');
        Schema::dropIfExists('campus');
        Schema::dropIfExists('sedes');
        Schema::dropIfExists('gestiones');
    }
};
