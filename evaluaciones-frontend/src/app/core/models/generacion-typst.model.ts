/**
 * Modelos de dominio para la generación de exámenes vía RabbitMQ / backend Typst.
 * Contrato: queue solicitud  evaluaciones.generacion.typst
 *           queue resultado evaluaciones.generacion.resultado
 */

export interface GeneracionTypstVariante {
  letra: 'A' | 'B' | 'C' | 'D' | 'E';
  semilla: number;
  patronClavesJson: string;
  ordenReactivosIdsJson: string;
  archivoPdfPath: string;
  archivoTypstPath: string;
  archivoRemarkXlsxPath?: string;
}

export interface GeneracionTypstMapeo {
  codigoEstudiante: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  letraVariante: 'A' | 'B' | 'C' | 'D' | 'E';
  hashControl: string;
  cuadernilloPdfPath: string;
}

export interface ConfiguracionGeneracion {
  rolExamenId: string;
  variantes: GeneracionTypstVariante[];
  mapeos: GeneracionTypstMapeo[];
}

export interface GeneracionTypstRequest {
  jobId: string;
  rolExamenId: string;
  bancoPreguntasId: string;
  seaGroupId?: string;
  variantes: ('A' | 'B' | 'C' | 'D' | 'E')[];
  ratioEstudiantesPorVariante?: number;
  soloVirtual?: boolean;
  outputBasePath?: string;
}

export interface GeneracionTypstResultado {
  jobId: string;
  rolExamenId: string;
  estado: string;
  mensaje: string;
  variantes: GeneracionTypstVariante[];
  mapeos: GeneracionTypstMapeo[];
}

export interface GeneracionColaItem {
  jobId: string;
  rolExamenId: string;
  estado: string;
  mensaje: string;
  variantesSolicitadas: number;
  variantesGeneradas: number;
}

export interface GeneracionColaResponse {
  cola: string;
  mensajesPendientes: number;
  tareas: GeneracionColaItem[];
}

export interface DocumentoExamen {
  rolExamenId: string;
  variante: string;
  archivoPdfPath: string;
  nombreArchivo: string;
}
