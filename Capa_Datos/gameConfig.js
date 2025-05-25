// Configuración del juego
const NUM_AREAS    = 4;
const DOLL_COUNT   = 12;
const AREA_SIZE    = 200;  // px (ancho y alto de cada área)
const STEP_SIZE    = 20;   // px (paso de la garra)
const CAPTURE_TH   = 30;   // px umbral para acierto


// Estados posibles de cada área
const STATES = {
  EMPTY: 'vacía',
  HAS_DOLL: 'con-muñeco'
};

// Inicializo 4 áreas vacías
const areas = Array.from({ length: NUM_AREAS }, (_, i) => ({
  state: i < 4 ? STATES.EMPTY : 'salida',
  doll: null
}));

let muñecoEnGarra = null;         // ID del muñeco atrapado
let celdaOriginal = null;         // Índice de donde fue atrapado
let ganados = 0;

// Umbral de captura en px
const CAPTURE_THRESHOLD = 20;

// Estado inicial
const initialState = {
  estadoMaquina: 'esperando_moneda',
  intentos: 0,
  ganados: 0,
  posicion: 0,
  areas: Array(NUM_AREAS).fill().map(() => ({ estado: 'sin_muñeco', img: '' }))
};