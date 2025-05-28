// Variables de estado
let intentosRestantes = 0;
let estadoMaquina = ESTADOS.INICIANDO;
let selectedIndex = 0;
let garraX = AREA_SIZE / 2 - STEP_SIZE / 2;
let garraY = AREA_SIZE / 2 - STEP_SIZE / 2;

// Mapa de movimiento entre casillas (layout irregular)
const mapaMovimiento = {
  0: { izquierda: 4, derecha: 1, abajo: 2, arriba: null },
  1: { izquierda: 0, derecha: null, abajo: 3, arriba: null },
  2: { izquierda: 4, derecha: 3, abajo: null, arriba: 0 },
  3: { izquierda: 2, derecha: null, abajo: null, arriba: 1 },
  4: { izquierda: null, derecha: 0, abajo: 2, arriba: 0 }
};

// ——— UI ———
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

    // Mostrar muñecos en áreas 0–3
    if (idx < 4 && area.state === STATES.HAS_DOLL) {
      img.src = `Capa_Datos/Assets/muneco${area.doll}.jpg`;
    } else {
      img.src = '';
    }

    // Etiqueta en las áreas
    if (idx < 4) {
      span.textContent = area.state === STATES.HAS_DOLL ? '🎁' : '';
    }

    cell.classList.toggle('selected', idx === selectedIndex);
  });

  updateIndicator();
}

// Dibuja la imagen de la garra (y muñeco colgando)
function updateIndicator() {
  document.querySelectorAll('.garra-indicator').forEach(el => el.remove());
  const cell = document.querySelector(`.area[data-index="${selectedIndex}"]`);
  const div = document.createElement('div');
  div.className = 'garra-indicator';
  div.style.left = `${garraX}px`;
  div.style.top = `${garraY}px`;

  // Imagen de la garra
  const garraImg = document.createElement('img');
  garraImg.src = 'Capa_Datos/Assets/garra.png';
  div.appendChild(garraImg);

  // Si hay muñeco en la garra, lo colgamos
  if (muñecoEnGarra !== null) {
    const muñ = document.createElement('img');
    muñ.src = `Capa_Datos/Assets/muneco${muñecoEnGarra}.jpg`;
    muñ.classList.add('muñeco');
    div.appendChild(muñ);
  }

  cell.appendChild(div);
}

// ——— Funciones de juego ———

// Recarga muñecos en áreas vacías
function recargarAreas() {
  updateEstado(ESTADOS.RECARGANDO_AREAS);
  areas.forEach((a, i) => {
    if (i < 4 && a.state === STATES.EMPTY) {
      a.state = STATES.HAS_DOLL;
      a.doll = Math.floor(Math.random() * DOLL_COUNT) + 1;
    }
  });
  updateEstado(ESTADOS.ESPERANDO_MONEDA);
  renderAreas();
}

// Captura el muñeco si está alineado en el centro
function intentarCaptura() {
  const area   = areas[selectedIndex];
  const centro = AREA_SIZE / 2 - STEP_SIZE / 2;
  const dx     = Math.abs(garraX - centro);
  const dy     = Math.abs(garraY - centro);

  estadoMaquina = ESTADOS.ATRAPANDO_MUNECO;
  updatePanel();

  if (
    area.state === STATES.HAS_DOLL &&
    dx < CAPTURE_TH &&
    dy < CAPTURE_TH &&
    muñecoEnGarra === null
  ) {
    // ✅ Éxito: muñeco atrapado correctamente
    muñecoEnGarra = area.doll;
    celdaOriginal = selectedIndex;
    area.state    = STATES.EMPTY;
    area.doll     = null;
    estadoMaquina = ESTADOS.LLEVANDO_MUNECO;
  } else {
    // ❌ Falló por mala alineación o por estar vacío
    intentosRestantes--;
    if (intentosRestantes > 0) {
      estadoMaquina = ESTADOS.MONEDA_INSERTADA;
    } else {
      estadoMaquina = ESTADOS.ESPERANDO_MONEDA;
      toggleControles(false);
    }
  }

  updatePanel();
  renderAreas();
}


// Abre la garra y entrega o devuelve el muñeco
function abrirGarra() {
  estadoMaquina = ESTADOS.ABRIENDO_GARRA;
  updatePanel();

  const centro = AREA_SIZE / 2 - STEP_SIZE / 2;
  const dx = Math.abs(garraX - centro),
        dy = Math.abs(garraY - centro);

  if (muñecoEnGarra !== null) {
    if (selectedIndex === 4 && dx < CAPTURE_TH && dy < CAPTURE_TH) {
      // Entrega correcta
      document.getElementById('muñeco-entregado').src =
        `Capa_Datos/Assets/muneco${muñecoEnGarra}.jpg`;
      ganados++;
      muñecoEnGarra = null;
      celdaOriginal = null;
      estadoMaquina = ESTADOS.MUNECO_ENTREGADO;
      updatePanel();

      // Esperar 2s y limpiar entrega
      setTimeout(() => {
        document.getElementById('muñeco-entregado').src = '';
        intentosRestantes = 0;
        estadoMaquina = ESTADOS.ESPERANDO_MONEDA;
        ganados = 0;
        toggleControles(false); // ⛔ Bloquear controles
        updatePanel();
        renderAreas();
      }, 2000);
      return;
    } else {
      // Falló la entrega, devolver muñeco
      areas[celdaOriginal].state = STATES.HAS_DOLL;
      areas[celdaOriginal].doll = muñecoEnGarra;
      muñecoEnGarra = null;
      celdaOriginal = null;
      intentosRestantes--;

      if (intentosRestantes > 0) {
        estadoMaquina = ESTADOS.MONEDA_INSERTADA;
      } else {
        estadoMaquina = ESTADOS.ESPERANDO_MONEDA;
        toggleControles(false);
      }
    }
  } else {
    // Abrió sin muñeco
    intentosRestantes--;

    if (intentosRestantes > 0) {
      estadoMaquina = ESTADOS.MONEDA_INSERTADA;
    } else {
      estadoMaquina = ESTADOS.ESPERANDO_MONEDA;
      toggleControles(false);
    }
  }

  updatePanel();
  renderAreas();
}


// Movimiento entre casillas según mapaMovimiento
function move(dx, dy) {
  const maxPos = AREA_SIZE - STEP_SIZE;
  const nextX = garraX + dx;
  const nextY = garraY + dy;

  // Horizontal
  if (nextX < 0 && mapaMovimiento[selectedIndex].izquierda != null) {
    selectedIndex = mapaMovimiento[selectedIndex].izquierda;
    garraX = maxPos;
  } else if (nextX > maxPos && mapaMovimiento[selectedIndex].derecha != null) {
    selectedIndex = mapaMovimiento[selectedIndex].derecha;
    garraX = 0;
  } else {
    garraX = Math.max(0, Math.min(maxPos, nextX));
  }

  // Vertical
  if (nextY < 0 && mapaMovimiento[selectedIndex].arriba != null) {
    selectedIndex = mapaMovimiento[selectedIndex].arriba;
    garraY = maxPos;
  } else if (nextY > maxPos && mapaMovimiento[selectedIndex].abajo != null) {
    selectedIndex = mapaMovimiento[selectedIndex].abajo;
    garraY = 0;
  } else {
    garraY = Math.max(0, Math.min(maxPos, nextY));
  }

  estadoMaquina = ESTADOS.MOVIENDO_GARRA;
  updateIndicator();
}

// ——— Gestor de estado general ———
function updateEstado(nuevoEstado) {
  estadoMaquina = nuevoEstado;
  updatePanel();
}

function toggleControles(habilitar) {
  const botones = ['btn-izq', 'btn-der', 'btn-arriba', 'btn-abajo', 'btn-bajar', 'btn-abrir'];
  botones.forEach(id => {
    document.getElementById(id).disabled = !habilitar;
  });
}

function reiniciarJuego() {
  ganados = 0;
  intentosRestantes = 0;
  estadoMaquina = ESTADOS.ESPERANDO_MONEDA;
  areas.forEach((a, i) => {
    if (i < 4) a.state = STATES.EMPTY;
  });
  recargarAreas();
  toggleControles(false); // Deshabilita controles
  updatePanel();
}

// En abrirGarra(), después de decrementar intentos:
if (intentosRestantes <= 0) {
  setTimeout(() => {
    reiniciarJuego();
  }, 1000);
}
// ——— Eventos ———
document.getElementById('btn-insertar-coin').onclick = () => {
  if (estadoMaquina === ESTADOS.ESPERANDO_MONEDA || estadoMaquina === ESTADOS.INICIANDO) {
    intentosRestantes = 3;
    updateEstado(ESTADOS.MONEDA_INSERTADA);
    toggleControles(true); // ¡Habilita controles!
    renderAreas();
  }
};


document.getElementById('btn-recargar').onclick = recargarAreas;
document.getElementById('btn-bajar').onclick = () => {
  if (estadoMaquina !== ESTADOS.MONEDA_INSERTADA || intentosRestantes <= 0) return;

  updateEstado(ESTADOS.ATRAPANDO_MUNECO);

  setTimeout(() => {
    intentarCaptura();  // siempre llama a intentarCaptura()
  }, 300);
};


document.getElementById('btn-abrir').onclick = abrirGarra;

document.getElementById('btn-der').onclick = () => move(STEP_SIZE, 0);
document.getElementById('btn-izq').onclick = () => move(-STEP_SIZE, 0);
document.getElementById('btn-arriba').onclick = () => move(0, -STEP_SIZE);
document.getElementById('btn-abajo').onclick = () => move(0, STEP_SIZE);
document.getElementById('estado-maquina').textContent = estadoMaquina;

document.addEventListener('keydown', e => {
  if (estadoMaquina !== ESTADOS.MONEDA_INSERTADA) return; 
  if (e.key === 'ArrowLeft') move(-STEP_SIZE, 0);
  if (e.key === 'ArrowRight') move(STEP_SIZE, 0);
  if (e.key === 'ArrowUp') move(0, -STEP_SIZE);
  if (e.key === 'ArrowDown') move(0, STEP_SIZE);
  if (e.key === ' ') document.getElementById('btn-bajar').click();
});

// Inicialización
window.onload = () => {
  updateEstado(ESTADOS.INICIANDO)              // Mostrar interfaz básica

  setTimeout(() => {
    recargarAreas();               // Recarga muñecos
    updateEstado(ESTADOS.ESPERANDO_MONEDA); // Cambia estado tras 2s
    renderAreas();
  }, 5000);
};



