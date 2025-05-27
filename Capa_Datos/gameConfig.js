// Número de áreas (4 muñecos + 1 salida)
const NUM_AREAS  = 5;
const DOLL_COUNT = 12;

// Tamaño de cada área y paso de la garra
const AREA_SIZE  = 200;  // px
const STEP_SIZE  = 20;   // px
const CAPTURE_TH = 50;   // px umbral para capturar o entregar

// Estados de cada área (modelo)
const STATES = {
  EMPTY:     'vacía',
  HAS_DOLL:  'con-muñeco',
  SALIDA:    'salida'
};

// Máquina de estados (presentación) en **español**
const ESTADOS = {
  INICIANDO:          'Iniciando',
  ESPERANDO_MONEDA:   'Esperando moneda',
  MONEDA_INSERTADA:   'Moneda insertada',
  MOVIENDO_GARRA:     'Moviendo garra',
  ATRAPANDO_MUNECO:   'Atrapando muñeco',
  LLEVANDO_MUNECO:    'Llevando muñeco',
  ABRIENDO_GARRA:     'Abriendo garra',
  MUNECO_ENTREGADO:   'Muñeco entregado',
  FALLO:              'Fallo'
};

// Inicialización de áreas: las 4 primeras vacías, la quinta es salida
const areas = Array.from({ length: NUM_AREAS }, (_, i) => ({
  state: i < 4 ? STATES.EMPTY : STATES.SALIDA,
  doll:  null
}));

// Variables globales de juego
let muñecoEnGarra = null;   // ID del muñeco atrapado
let celdaOriginal = null;   // Índice de donde fue atrapado
let ganados       = 0;
