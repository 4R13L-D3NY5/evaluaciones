export interface DimensionRiasec {
  letra: string;
  nombre: string;
  aciertos: number;
  totalPreguntas: number;
  porcentaje: number;
  descripcion: string;
  preguntasMarcadas: number[];
}

export interface FacultadAfinidad {
  facultad: string;
  perfilHolland: string;
  afinidadPorcentaje: number;
  enfoque: string;
  preguntasClave: number[];
  preguntasCoincidentes: number[];
}

export interface CarreraSugerida {
  carrera: string;
  facultad: string;
  codigoRiasec: string;
  afinidadPorcentaje: number;
  perfilVocacional: string;
  itemsDescripcion: string;
  preguntasClave: number[];
  preguntasCoincidentes: number[];
}

export interface InterpretacionVocacional {
  codigoHolland: string;
  facultadSugerida: string;
  dimensiones: Record<string, DimensionRiasec>;
  facultades: FacultadAfinidad[];
  carrerasRecomendadas: CarreraSugerida[];
}

export interface TestVocacionalItem {
  id: number;
  loteId: string;
  colegio: string;
  curso: string;
  fecha: string;
  sede?: string;
  gestion?: string;
  municipio?: string;
  nombreCompleto: string;
  celular: string;
  correo: string;
  candidatosNombre: string[];
  candidatosCelular: string[];
  candidatosCorreo: string[];
  numerosMarcados: number[];
  totalMarcados: number;
  codigoHolland?: string;
  facultadSugerida?: string;
  puntajesRiasec?: Record<string, DimensionRiasec>;
  facultadesAfinidad?: FacultadAfinidad[];
  carrerasSugeridas?: CarreraSugerida[];
  paginaNumero: number;
  archivoNombre: string;
  imagenPreviewPath: string;
  estado: string;
  observaciones?: string;
  creadoPor?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface TestVocacionalProcesarResponse {
  jobId: string;
  loteId: string;
  estado: 'EN_COLA' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR' | 'NO_ENCONTRADO' | string;
  mensaje: string;
  totalPaginas: number;
  paginaActual?: number;
  porcentaje?: number;
  resultados: TestVocacionalItem[];
}

export interface TestVocacionalActualizarRequest {
  colegio: string;
  curso: string;
  fecha: string;
  sede?: string;
  gestion?: string;
  municipio?: string;
  nombreCompleto: string;
  celular: string;
  correo: string;
  numerosMarcados: number[];
  observaciones?: string;
}

export interface TestVocacionalFiltros {
  colegios: string[];
  cursos: string[];
  sedes?: string[];
  gestiones?: string[];
  municipios?: string[];
}
