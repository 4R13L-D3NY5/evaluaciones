<?php

namespace App\Services\Sea;

class SeaAcademicClientMock
{
    /**
     * Retorna datos sintéticos del catálogo académico para simulación SEA
     */
    public function getSedes(): array
    {
        return [
            ['id' => 1, 'sea_id' => 'SEA-SEDE-CBBA', 'codigo' => 'CBBA', 'nombre' => 'Cochabamba'],
            ['id' => 2, 'sea_id' => 'SEA-SEDE-COB', 'codigo' => 'COB', 'nombre' => 'Cobija'],
            ['id' => 3, 'sea_id' => 'SEA-SEDE-GUA', 'codigo' => 'GUA', 'nombre' => 'Guayaramerín'],
        ];
    }

    public function getCarreras(string $sedeCodigo = 'CBBA'): array
    {
        return [
            ['id' => 101, 'sea_id' => 'SEA-CAR-MED', 'sede_codigo' => 'CBBA', 'codigo' => 'MED', 'nombre' => 'Medicina'],
            ['id' => 102, 'sea_id' => 'SEA-CAR-ICO', 'sede_codigo' => 'CBBA', 'codigo' => 'ICO', 'nombre' => 'Ingeniería Comercial'],
            ['id' => 103, 'sea_id' => 'SEA-CAR-BYF', 'sede_codigo' => 'GUA', 'codigo' => 'BYF', 'nombre' => 'Bioquímica y Farmacia'],
        ];
    }

    public function getAsignaturas(string $carreraCodigo = 'MED'): array
    {
        return [
            ['id' => 201, 'sea_id' => 'SEA-ASI-MED212', 'carrera_codigo' => 'MED', 'codigo' => 'MED-212', 'nombre' => 'Anatomía Humana II', 'semestre' => 2],
            ['id' => 202, 'sea_id' => 'SEA-ASI-ICO311', 'carrera_codigo' => 'ICO', 'codigo' => 'ICO-311', 'nombre' => 'Redes y Telecomunicaciones', 'semestre' => 5],
            ['id' => 203, 'sea_id' => 'SEA-ASI-BYF511', 'carrera_codigo' => 'BYF', 'codigo' => 'BYF-511', 'nombre' => 'Farmacología Clínica', 'semestre' => 6],
        ];
    }

    public function getGrupos(string $asignaturaCodigo = 'MED-212'): array
    {
        return [
            ['id' => 301, 'sea_id' => 'SEA-GRP-G1', 'asignatura_codigo' => 'MED-212', 'codigo' => 'G1', 'nombre' => 'Grupo 1 - Teoría', 'tipo_grupo' => 'TEORICO'],
            ['id' => 302, 'sea_id' => 'SEA-GRP-G2', 'asignatura_codigo' => 'MED-212', 'codigo' => 'G2', 'nombre' => 'Grupo 2 - Práctica', 'tipo_grupo' => 'PRACTICO'],
        ];
    }

    public function getDocentes(): array
    {
        return [
            ['id' => 501, 'sea_id' => 'SEA-DOC-101', 'ci' => '4567891', 'nombres' => 'Carlos', 'apellidos' => 'Mendoza Vargas', 'email' => 'cmendoza@unitepc.edu.bo'],
            ['id' => 502, 'sea_id' => 'SEA-DOC-102', 'ci' => '7891234', 'nombres' => 'Mariana', 'apellidos' => 'Siles Ramos', 'email' => 'msiles@unitepc.edu.bo'],
        ];
    }
}
