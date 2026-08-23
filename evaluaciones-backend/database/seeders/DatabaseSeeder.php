<?php

namespace Database\Seeders;

use App\Models\Asignatura;
use App\Models\Campus;
use App\Models\Carrera;
use App\Models\Docente;
use App\Models\Gestion;
use App\Models\Grupo;
use App\Models\Horario;
use App\Models\RolExamen;
use App\Models\Sede;
use App\Services\TrazabilidadService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $trazabilidadService = new TrazabilidadService();

        // 1. Gestión Activa
        $gestion = Gestion::create([
            'sea_id' => 'SEA-GEST-2-2026',
            'codigo' => '2-2026',
            'nombre' => 'Gestión Académica II-2026',
            'activo' => true,
            'fecha_inicio' => '2026-08-01',
            'fecha_fin' => '2026-12-20',
        ]);

        // 2. Sedes
        $sedeCbba = Sede::create(['sea_id' => 'SEA-SEDE-CBBA', 'codigo' => 'CBBA', 'nombre' => 'Cochabamba']);
        $sedeGua = Sede::create(['sea_id' => 'SEA-SEDE-GUA', 'codigo' => 'GUA', 'nombre' => 'Guayaramerín']);

        // 3. Campus
        $campusCentral = Campus::create(['sea_id' => 'SEA-CAM-01', 'sede_id' => $sedeCbba->id, 'codigo' => 'CENTRAL', 'nombre' => 'Campus Central Cochabamba']);

        // 4. Carreras
        $carreraMed = Carrera::create(['sea_id' => 'SEA-CAR-MED', 'sede_id' => $sedeCbba->id, 'codigo' => 'MED', 'nombre' => 'Medicina']);
        $carreraByf = Carrera::create(['sea_id' => 'SEA-CAR-BYF', 'sede_id' => $sedeGua->id, 'codigo' => 'BYF', 'nombre' => 'Bioquímica y Farmacia']);

        // 5. Asignaturas
        $asigMed = Asignatura::create(['sea_id' => 'SEA-ASI-212', 'carrera_id' => $carreraMed->id, 'codigo' => 'MED-212', 'nombre' => 'Anatomía Humana II', 'semestre' => 2]);
        $asigByf = Asignatura::create(['sea_id' => 'SEA-ASI-511', 'carrera_id' => $carreraByf->id, 'codigo' => 'BYF-511', 'nombre' => 'Farmacología Clínica', 'semestre' => 6]);

        // 6. Grupos
        $grupoMed1 = Grupo::create(['sea_id' => 'SEA-GRP-M1', 'asignatura_id' => $asigMed->id, 'codigo' => 'G3', 'nombre' => 'Grupo 3 - Medicina', 'tipo_grupo' => 'TEORICO']);
        $grupoByf1 = Grupo::create(['sea_id' => 'SEA-GRP-B1', 'asignatura_id' => $asigByf->id, 'codigo' => 'G1', 'nombre' => 'Grupo 1 - Bioquímica', 'tipo_grupo' => 'TEORICO']);

        // 7. Horarios
        Horario::create(['sea_id' => 'SEA-HOR-01', 'grupo_id' => $grupoMed1->id, 'dia' => 'LUNES', 'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'Aula 302', 'bloque' => 'Bloque A']);

        // 8. Docentes
        $docente1 = Docente::create(['sea_id' => 'SEA-DOC-456', 'ci' => '4567891', 'nombres' => 'Carlos', 'apellidos' => 'Mendoza Vargas', 'email' => 'cmendoza@unitepc.edu.bo']);
        $docente2 = Docente::create(['sea_id' => 'SEA-DOC-789', 'ci' => '7891234', 'nombres' => 'Mariana', 'apellidos' => 'Siles Ramos', 'email' => 'msiles@unitepc.edu.bo']);

        // 9. Roles de Exámenes de Demostración
        $rol1 = RolExamen::create([
            'gestion_id' => $gestion->id,
            'sede_id' => $sedeCbba->id,
            'campus_id' => $campusCentral->id,
            'carrera_id' => $carreraMed->id,
            'asignatura_id' => $asigMed->id,
            'grupo_id' => $grupoMed1->id,
            'docente_id' => $docente1->id,
            'tipo_evaluacion' => '1ER_PARCIAL',
            'fecha_examen' => '2026-08-20',
            'hora_inicio' => '08:00:00',
            'hora_fin' => '09:30:00',
            'aula' => 'Aula 302',
            'con_cartilla' => true,
            'estado' => 'PROGRAMADO',
            'total_estudiantes' => 45,
        ]);

        $trazabilidadService->registrarTransicion(
            $rol1,
            'PROGRAMADO',
            'DIR-MED-01',
            'Dr. Roberto Flores (Director Medicina)',
            'DIRECTOR',
            'Examen programado en sistema con cartillas de lectura óptica.'
        );

        $rol2 = RolExamen::create([
            'gestion_id' => $gestion->id,
            'sede_id' => $sedeGua->id,
            'carrera_id' => $carreraByf->id,
            'asignatura_id' => $asigByf->id,
            'grupo_id' => $grupoByf1->id,
            'docente_id' => $docente2->id,
            'tipo_evaluacion' => '1ER_PARCIAL',
            'fecha_examen' => '2026-08-22',
            'hora_inicio' => '10:00:00',
            'hora_fin' => '11:30:00',
            'aula' => 'Laboratorio 1',
            'con_cartilla' => false,
            'estado' => 'BANCO_RECIBIDO',
            'excel_banco_path' => 'bancos_excel/banco_byf511_1P.xlsx',
            'total_estudiantes' => 30,
        ]);

        $trazabilidadService->registrarTransicion(
            $rol2,
            'PROGRAMADO',
            'DIR-BYF-01',
            'Dra. Elena Prado (Directora Bioquímica)',
            'DIRECTOR',
            'Examen programado en sistema.'
        );

        $trazabilidadService->registrarTransicion(
            $rol2,
            'BANCO_RECIBIDO',
            'EVAL-GUA-01',
            'Lic. Gabriel Paz (Dpto. Evaluaciones Guayaramerín)',
            'DEPT_EVALUACIONES',
            'Excel recibido por correo y cargado a la plataforma.'
        );
    }
}
