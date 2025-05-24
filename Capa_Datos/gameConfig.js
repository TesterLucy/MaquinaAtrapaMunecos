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
const areas = Array.from({ length: NUM_AREAS }, () => ({
  state: STATES.EMPTY,
  doll:  null    // ruta de la imagen del muñeco o null
}));

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