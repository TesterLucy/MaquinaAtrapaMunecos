/* gameLogic.js */

// Variables de estado y configuración (importadas de gameConfig.js)
// STATES, NUM_AREAS, DOLL_COUNT, AREA_SIZE, STEP_SIZE, CAPTURE_TH, areas

let intentosRestantes = 0;
let estadoMaquina     = 'IDLE';
let selectedIndex     = 0;       // índice del área activa (0–3)
// Posición de la garra dentro del área seleccionada
let garraX            = AREA_SIZE/2 - STEP_SIZE/2;
let garraY            = AREA_SIZE/2 - STEP_SIZE/2;

// Actualiza el panel de estado (estado de la máquina e intentos)
function updatePanel() {
  document.getElementById('estado-maquina').textContent = estadoMaquina;
  document.getElementById('intentos').textContent       = intentosRestantes;
}

// Dibuja las áreas y el indicador de la garra
function renderAreas() {
  areas.forEach((area, idx) => {
    const cell     = document.querySelector(`.area[data-index="${idx}"]`);
    const imgElem   = cell.querySelector('img');
    const spanState = cell.querySelector('.area-state');

    if (area.state === STATES.HAS_DOLL) {
      imgElem.src       = `Capa_Datos/Assets/muneco${area.doll}.jpg`;
      spanState.textContent = '🎁';
    } else {
      imgElem.src       = '';
      spanState.textContent = '';
    }

    cell.classList.toggle('selected', idx === selectedIndex);
  });
  updateIndicator();
}

// Dibuja o mueve el círculo rojo de la garra
function updateIndicator() {
  document.querySelectorAll('.garra-indicator').forEach(el => el.remove());
  const cell = document.querySelector(`.area[data-index="${selectedIndex}"]`);
  const div  = document.createElement('div');
  div.className = 'garra-indicator';
  div.style.left = `${garraX}px`;
  div.style.top  = `${garraY}px`;
  cell.appendChild(div);
}

// Recarga muñecos en áreas vacías
function recargarAreas() {
  areas.forEach(a => {
    if (a.state === STATES.EMPTY) {
      a.state = STATES.HAS_DOLL;
      a.doll  = Math.floor(Math.random() * DOLL_COUNT) + 1;
    }
  });
  renderAreas();
}

// Lógica de captura: éxito si la garra está cerca del centro del muñeco
function intentarCaptura() {
  const area   = areas[selectedIndex];
  const center = AREA_SIZE/2 - STEP_SIZE/2;
  const dx     = Math.abs(garraX - center);
  const dy     = Math.abs(garraY - center);

  if (area.state === STATES.HAS_DOLL && dx < CAPTURE_TH && dy < CAPTURE_TH) {
    area.state    = STATES.EMPTY;
    estadoMaquina = 'SUCCESS';
  } else {
    estadoMaquina = 'FAIL';
  }

  intentosRestantes--;
  if (intentosRestantes > 0) {
    estadoMaquina = 'COIN_INSERTED';
  } else {
    estadoMaquina = 'IDLE';
  }

  updatePanel();
  renderAreas();
}

// Funciones de movimiento con cruce automático de casilla
function moveLeft() {
  const nextX = garraX - STEP_SIZE;
  if (nextX >= 0) {
    garraX = nextX;
  } else {
    const col = selectedIndex % 2;
    if (col > 0) {
      selectedIndex--;
      garraX = AREA_SIZE - STEP_SIZE;
    }
  }
  updateIndicator();
}

function moveRight() {
  const nextX = garraX + STEP_SIZE;
  if (nextX <= AREA_SIZE - STEP_SIZE) {
    garraX = nextX;
  } else {
    const col = selectedIndex % 2;
    if (col < 1) {
      selectedIndex++;
      garraX = 0;
    }
  }
  updateIndicator();
}

function moveUp() {
  const nextY = garraY - STEP_SIZE;
  if (nextY >= 0) {
    garraY = nextY;
  } else {
    if (selectedIndex >= 2) {
      selectedIndex -= 2;
      garraY = AREA_SIZE - STEP_SIZE;
    }
  }
  updateIndicator();
}

function moveDown() {
  const nextY = garraY + STEP_SIZE;
  if (nextY <= AREA_SIZE - STEP_SIZE) {
    garraY = nextY;
  } else {
    if (selectedIndex < 2) {
      selectedIndex += 2;
      garraY = 0;
    }
  }
  updateIndicator();
}

// Eventos de botones
document.getElementById('btn-insertar-coin').onclick = () => {
  if (estadoMaquina === 'IDLE') {
    intentosRestantes = 3;
    estadoMaquina     = 'COIN_INSERTED';
    updatePanel();
  }
};

document.getElementById('btn-recargar').onclick = recargarAreas;
document.getElementById('btn-izq').onclick      = moveLeft;
document.getElementById('btn-der').onclick      = moveRight;
document.getElementById('btn-arriba').onclick   = moveUp;
document.getElementById('btn-abajo').onclick    = moveDown;
document.getElementById('btn-bajar').onclick     = () => {
  if (estadoMaquina === 'COIN_INSERTED' && intentosRestantes > 0) {
    estadoMaquina = 'GRABBING';
    updatePanel();
    setTimeout(intentarCaptura, 400);
  }
};

// Eventos de teclado
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowLeft':  moveLeft();  break;
    case 'ArrowRight': moveRight(); break;
    case 'ArrowUp':    moveUp();    break;
    case 'ArrowDown':  moveDown();  break;
    case ' ':          document.getElementById('btn-bajar').click(); break;
  }
});

// Inicialización al cargar la página
window.onload = () => {
  estadoMaquina = 'IDLE';
  recargarAreas();
  updatePanel();
  renderAreas();
};
