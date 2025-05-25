// === VARIABLES GLOBALES ===
let intentosRestantes = 0;
let estadoMaquina = 'IDLE';
let selectedIndex = 0;
let garraX = AREA_SIZE / 2 - STEP_SIZE / 2;
let garraY = AREA_SIZE / 2 - STEP_SIZE / 2;

const mapaMovimiento = {
  0: { izquierda: 4, derecha: 1, abajo: 2, arriba: null },
  1: { izquierda: 0, derecha: null, abajo: 3, arriba: null },
  2: { izquierda: 4, derecha: 3, abajo: null, arriba: 0 },
  3: { izquierda: 2, derecha: null, abajo: null, arriba: 1 },
  4: { izquierda: null, derecha: 0, abajo: 2, arriba: 0 }
};

// === ACTUALIZACIÓN DE PANEL Y ÁREAS ===
function updatePanel() {
  document.getElementById('estado-maquina').textContent = estadoMaquina;
  document.getElementById('intentos').textContent = intentosRestantes;
  document.getElementById('ganados').textContent = ganados;
}

function renderAreas() {
  areas.forEach((area, idx) => {
    const cell = document.querySelector(`.area[data-index="${idx}"]`);
    const img = cell.querySelector('img');
    const span = cell.querySelector('.area-state');

    if (area.state === STATES.HAS_DOLL) {
      img.src = `Capa_Datos/Assets/muneco${area.doll}.jpg`;
    } else if (idx === 4 && muñecoEnGarra === null) {
      img.src = '';
    } else if (idx < 4) {
      img.src = '';
    }

    if (idx !== 4) {
      span.textContent = area.state === STATES.HAS_DOLL ? '🎁' : '';
    }

    cell.classList.toggle('selected', idx === selectedIndex);
  });

  updateIndicator();
}

function updateIndicator() {
  document.querySelectorAll('.garra-indicator').forEach(el => el.remove());
  const cell = document.querySelector(`.area[data-index="${selectedIndex}"]`);
  const div = document.createElement('div');
  div.className = 'garra-indicator';
  div.style.left = `${garraX}px`;
  div.style.top = `${garraY}px`;

  const img = document.createElement('img');
  img.src = 'Capa_Datos/Assets/garra.png';
  div.appendChild(img);

  if (muñecoEnGarra !== null) {
    const muñeco = document.createElement('img');
    muñeco.src = `Capa_Datos/Assets/muneco${muñecoEnGarra}.jpg`;
    muñeco.classList.add('muñeco');
    div.appendChild(muñeco);
  }

  cell.appendChild(div);
}

// ==========================================
// 1) Movimiento libre dentro de la casilla
function move(dx, dy) {
  const maxPos = AREA_SIZE - STEP_SIZE;
  garraX = Math.max(0, Math.min(maxPos, garraX + dx));
  garraY = Math.max(0, Math.min(maxPos, garraY + dy));

  // Si chocó en un borde, cambiar de casilla y reposicionar
  if (garraX === 0 && mapaMovimiento[selectedIndex].izquierda != null) {
    selectedIndex = mapaMovimiento[selectedIndex].izquierda;
    garraX = maxPos;
  } else if (garraX === maxPos && mapaMovimiento[selectedIndex].derecha != null) {
    selectedIndex = mapaMovimiento[selectedIndex].derecha;
    garraX = 0;
  }
  if (garraY === 0 && mapaMovimiento[selectedIndex].arriba != null) {
    selectedIndex = mapaMovimiento[selectedIndex].arriba;
    garraY = maxPos;
  } else if (garraY === maxPos && mapaMovimiento[selectedIndex].abajo != null) {
    selectedIndex = mapaMovimiento[selectedIndex].abajo;
    garraY = 0;
  }

  updateIndicator();
  checkEntrega();
}

// ==========================================
// 2) Cambio de celda “manual” (si aún lo necesitas)
function moverCelda(dir) {
  const dest = mapaMovimiento[selectedIndex][dir];
  if (dest != null) {
    selectedIndex = dest;
    // Centrar garra en la nueva casilla:
    garraX = AREA_SIZE/2 - STEP_SIZE/2;
    garraY = AREA_SIZE/2 - STEP_SIZE/2;
    updateIndicator();
    checkEntrega();
  }
}


function abrirGarra() {
  if (estadoMaquina !== 'GRABBING') return;

  const center = AREA_SIZE / 2 - STEP_SIZE / 2;
  const dx = Math.abs(garraX - center);
  const dy = Math.abs(garraY - center);

  if (muñecoEnGarra !== null) {
    if (selectedIndex === 4 && dx < CAPTURE_TH && dy < CAPTURE_TH) {
      document.getElementById('muñeco-entregado').src = `Capa_Datos/Assets/muneco${muñecoEnGarra}.jpg`;
      muñecoEnGarra = null;
      celdaOriginal = null;
      ganados++;
    } else {
      areas[celdaOriginal].state = STATES.HAS_DOLL;
      areas[celdaOriginal].doll = muñecoEnGarra;
      muñecoEnGarra = null;
      celdaOriginal = null;
    }
  }

  intentosRestantes--;
  estadoMaquina = intentosRestantes > 0 ? 'COIN_INSERTED' : 'IDLE';
  updatePanel();
  renderAreas();
}

function recargarAreas() {
  areas.forEach((area, i) => {
    if (i < 4 && area.state === STATES.EMPTY) {
      area.state = STATES.HAS_DOLL;
      area.doll = Math.floor(Math.random() * DOLL_COUNT) + 1;
    }
  });
  renderAreas();
}

function intentarCaptura() {
  const area = areas[selectedIndex];
  const center = AREA_SIZE / 2 - STEP_SIZE / 2;
  const dx = Math.abs(garraX - center);
  const dy = Math.abs(garraY - center);

  if (area.state === STATES.HAS_DOLL && dx < CAPTURE_TH && dy < CAPTURE_TH && muñecoEnGarra === null) {
    muñecoEnGarra = area.doll;
    celdaOriginal = selectedIndex;
    area.state = STATES.EMPTY;
    area.doll = null;
  }

  estadoMaquina = 'GRABBING';
  updatePanel();
  renderAreas();
}

function checkEntrega() {
  if (selectedIndex === 4 && muñecoEnGarra !== null) {
    const center = AREA_SIZE / 2 - STEP_SIZE / 2;
    const dx = Math.abs(garraX - center);
    const dy = Math.abs(garraY - center);
    if (dx < CAPTURE_TH && dy < CAPTURE_TH) {
      document.getElementById('muñeco-entregado').src = `Capa_Datos/Assets/muneco${muñecoEnGarra}.jpg`;
      muñecoEnGarra = null;
      ganados++;
      updatePanel();
    }
  }
}

// === EVENTOS ===
document.getElementById('btn-insertar-coin').onclick = () => {
  if (estadoMaquina === 'IDLE') {
    intentosRestantes = 3;
    estadoMaquina = 'COIN_INSERTED';
    updatePanel();
  }
};

document.getElementById('btn-recargar').onclick = recargarAreas;

document.getElementById('btn-izq').onclick    = () => move(-STEP_SIZE, 0);
document.getElementById('btn-der').onclick    = () => move(STEP_SIZE, 0);
document.getElementById('btn-arriba').onclick = () => move(0, -STEP_SIZE);
document.getElementById('btn-abajo').onclick  = () => move(0, STEP_SIZE);

document.getElementById('btn-bajar').onclick = () => {
  if (estadoMaquina === 'COIN_INSERTED' && intentosRestantes > 0) {
    estadoMaquina = 'GRABBING';
    updatePanel();
    // Espera breve para simular la bajada antes de abrir
    setTimeout(() => {
      intentarCaptura();
    }, 400);
  }
};

// === Botón “Abrir Garra” ===
document.getElementById('btn-abrir').onclick = () => {
  if (estadoMaquina === 'GRABBING') {
    // Aquí sí procesamos captura/fallo y descontamos
    abrirGarra();      // dentro de abrirGarra() haces intentosRestantes-- y renderizas
  }
};

document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowLeft':  move(-STEP_SIZE, 0); break;
    case 'ArrowRight': move(STEP_SIZE, 0); break;
    case 'ArrowUp':    move(0, -STEP_SIZE); break;
    case 'ArrowDown':  move(0, STEP_SIZE); break;
    case ' ':          document.getElementById('btn-bajar').click(); break;
  }
});

window.onload = () => {
  recargarAreas();
  updatePanel();
  renderAreas();
};