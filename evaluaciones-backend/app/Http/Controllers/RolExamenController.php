<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateRolExamenPackageJob;
use App\Models\RolExamen;
use App\Services\TrazabilidadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RolExamenController extends Controller
{
    public function __construct(
        protected TrazabilidadService $trazabilidadService
    ) {}

    /**
     * Lista los roles de exámenes con relaciones y filtros
     */
    public function index(Request $request): JsonResponse
    {
        $query = RolExamen::with(['gestion', 'sede', 'carrera', 'asignatura', 'grupo', 'docente', 'examenesGenerados']);

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('carrera_id')) {
            $query->where('carrera_id', $request->carrera_id);
        }

        $roles = $query->orderBy('fecha_examen', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * Registro/Programación inicial por parte del Director de Carrera
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'gestion_id' => 'required|integer',
            'sede_id' => 'required|integer',
            'carrera_id' => 'required|integer',
            'asignatura_id' => 'required|integer',
            'grupo_id' => 'required|integer',
            'docente_id' => 'required|integer',
            'tipo_evaluacion' => 'required|string',
            'fecha_examen' => 'required|date',
            'hora_inicio' => 'required',
            'hora_fin' => 'required',
            'con_cartilla' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $rolExamen = RolExamen::create([
            'gestion_id' => $request->gestion_id,
            'sede_id' => $request->sede_id,
            'campus_id' => $request->campus_id,
            'carrera_id' => $request->carrera_id,
            'asignatura_id' => $request->asignatura_id,
            'grupo_id' => $request->grupo_id,
            'docente_id' => $request->docente_id,
            'tipo_evaluacion' => $request->tipo_evaluacion,
            'fecha_examen' => $request->fecha_examen,
            'hora_inicio' => $request->hora_inicio,
            'hora_fin' => $request->hora_fin,
            'aula' => $request->aula ?? 'Aula Magna',
            'con_cartilla' => $request->con_cartilla,
            'estado' => 'PROGRAMADO',
            'total_estudiantes' => $request->total_estudiantes ?? 40,
        ]);

        // Registrar auditoría inicial
        $this->trazabilidadService->registrarTransicion(
            $rolExamen,
            'PROGRAMADO',
            $request->header('X-User-Id', 'DIR-101'),
            $request->header('X-User-Name', 'Director de Carrera'),
            'DIRECTOR',
            'Examen programado en el sistema por la Dirección de Carrera. Usa cartillas: ' . ($request->con_cartilla ? 'SÍ' : 'NO')
        );

        return response()->json([
            'success' => true,
            'message' => 'Rol de Examen programado exitosamente',
            'data' => $rolExamen->load(['carrera', 'asignatura', 'grupo', 'docente']),
        ], 201);
    }

    /**
     * Retorna el detalle completo de un Rol de Examen con historial de auditoría
     */
    public function show(int $id): JsonResponse
    {
        $rolExamen = RolExamen::with(['gestion', 'sede', 'carrera', 'asignatura', 'grupo', 'docente', 'examenesGenerados', 'trazabilidad'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $rolExamen,
        ]);
    }

    /**
     * Carga de planilla Excel por el Departamento de Evaluaciones
     */
    public function cargarExcel(Request $request, int $id): JsonResponse
    {
        $rolExamen = RolExamen::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'excel' => 'required|file|mimes:xlsx,xls,tsv,csv|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $path = $request->file('excel')->store('bancos_excel', 'local');
        $rolExamen->excel_banco_path = $path;
        $rolExamen->save();

        // Transición a BANCO_RECIBIDO
        $this->trazabilidadService->registrarTransicion(
            $rolExamen,
            'BANCO_RECIBIDO',
            $request->header('X-User-Id', 'EVAL-201'),
            $request->header('X-User-Name', 'Dpto. de Evaluaciones'),
            'DEPT_EVALUACIONES',
            'Planilla de banco de preguntas en Excel recepcionada y cargada exitosamente.'
        );

        return response()->json([
            'success' => true,
            'message' => 'Excel recepcionado y cargado correctamente.',
            'data' => $rolExamen,
        ]);
    }

    /**
     * Gatilla la generación asíncrona de variante de examen
     */
    public function generar(Request $request, int $id): JsonResponse
    {
        $rolExamen = RolExamen::findOrFail($id);

        $versionCodigo = $request->input('version_codigo', 'v1.0-REGULAR');
        $esCasoEspecial = $request->boolean('es_caso_especial', false);
        $descripcionVersion = $request->input('descripcion_version', null);

        // Despachar Job a colas
        GenerateRolExamenPackageJob::dispatch(
            $rolExamen,
            $versionCodigo,
            $esCasoEspecial,
            $descripcionVersion,
            $request->header('X-User-Id', 'EVAL-201'),
            $request->header('X-User-Name', 'Dpto. de Evaluaciones'),
            'DEPT_EVALUACIONES'
        );

        return response()->json([
            'success' => true,
            'message' => "Proceso de generación de exámenes gatillado en segundo plano ({$versionCodigo}).",
        ]);
    }

    /**
     * Transición regular de estados (IMPRESO, ENTREGADO, EJECUTADO, SUBIDO)
     */
    public function cambiarEstado(Request $request, int $id): JsonResponse
    {
        $rolExamen = RolExamen::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nuevo_estado' => 'required|in:IMPRESO,ENTREGADO,EJECUTADO,SUBIDO',
            'comentario' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $nuevoEstado = $request->nuevo_estado;
        $comentario = $request->comentario ?? "Estado actualizado a {$nuevoEstado}";

        $this->trazabilidadService->registrarTransicion(
            $rolExamen,
            $nuevoEstado,
            $request->header('X-User-Id', 'USER-100'),
            $request->header('X-User-Name', $request->header('X-User-Name', 'Usuario Operativo')),
            $request->header('X-User-Role', 'OPERADOR'),
            $comentario
        );

        return response()->json([
            'success' => true,
            'message' => "Estado actualizado exitosamente a {$nuevoEstado}",
            'data' => $rolExamen,
        ]);
    }

    /**
     * Requisito: Suspensión de examen en CUALQUIER estado con motivo obligatorio
     */
    public function suspender(Request $request, int $id): JsonResponse
    {
        $rolExamen = RolExamen::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'motivo' => 'required|string|min:5',
        ], [
            'motivo.required' => 'El motivo de la suspensión es estrictamente obligatorio.',
            'motivo.min' => 'El motivo debe contener al menos 5 caracteres explicativos.',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $this->trazabilidadService->registrarTransicion(
            $rolExamen,
            'SUSPENDIDO',
            $request->header('X-User-Id', 'ADMIN-001'),
            $request->header('X-User-Name', $request->header('X-User-Name', 'Autoridad Académica')),
            'DIRECTOR',
            "EXAMEN SUSPENDIDO. Motivo: {$request->motivo}"
        );

        return response()->json([
            'success' => true,
            'message' => 'El examen ha sido SUSPENDIDO exitosamente.',
            'data' => $rolExamen,
        ]);
    }
}
