export interface OpcionPregunta {
  letra: 'A' | 'B' | 'C' | 'D' | 'E';
  texto: string;
  esCorrecta: boolean;
}

export interface ReactivoExamen {
  id: number;
  numero: number;
  tipoSeccion: 'SELECCION DE LA MEJOR RESPUESTA';
  enunciado: string;
  formulaLatex?: string;
  dificultad: 'Fácil' | 'Medio' | 'Difícil';
  grupoTipo: 'G1' | 'G2' | 'G3';
  opciones: OpcionPregunta[];
  opcionCorrectaOriginal: 'A' | 'B' | 'C' | 'D' | 'E';
}

export interface VarianteCompilada {
  tipo: string;
  letraVariante: string;
  semilla: number;
  paginaInicio: number;
  totalPaginas: number;
  todasLasPreguntas: ReactivoExamen[];
  preguntasPagina1: ReactivoExamen[];
  preguntasPagina2: ReactivoExamen[];
  preguntasPagina3: ReactivoExamen[];
  preguntasPagina4: ReactivoExamen[];
  preguntasPagina5: ReactivoExamen[];
  patronClaves: { [numeroPregunta: number]: 'A' | 'B' | 'C' | 'D' | 'E' };
}
