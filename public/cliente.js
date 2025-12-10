// public/cliente.js (CÓDIGO FINAL - CONEXIÓN UNIVERSAL)

// ¡CORRECCIÓN CRÍTICA! Conexión a la raíz del host (Render, Railway, Local)
const socket = io(); // <-- ¡Así es como debe quedar!

let nombreJugador = ''; 
let codigoSalaActual = '';
const MIN_JUGADORES_CLIENTE = 3; 
let configuracionActual = { tema: 'Animales 🐾', tiempoRondaSegundos: 0, numRondas: 3, incluirAgenteDoble: false }; 
let jugadoresActuales = []; 
let miRolActual = ''; 
let miPalabraSecreta = ''; 
let miTemaActual = ''; 
let votoSeleccionadoId = 'none'; 

// --- LISTA DE CATEGORÍAS (Mismo contenido de categorías) ---
const categorias = [
    { nombre: 'Animales', emoji: '🐾', valor: 'Animales 🐾' },
    { nombre: 'Comida', emoji: '🍔', valor: 'Comida 🍔' },
    { nombre: 'Países', emoji: '🌎', valor: 'Países 🌎' },
    { nombre: 'Profesiones', emoji: '💼', valor: 'Profesiones 💼' },
    { nombre: 'Objetos', emoji: '💡', valor: 'Objetos Cotidianos 💡' },
    { nombre: 'Películas', emoji: '🎬', valor: 'Películas 🎬' },
    { nombre: 'Casa', emoji: '🏠', valor: 'Partes de la Casa 🏠' },
    { nombre: 'Juguetes', emoji: '🧸', valor: 'Juguetes 🧸' },
    { nombre: 'Licores', emoji: '🍸', valor: 'Licores 🍸' },
    { nombre: 'Dulces', emoji: '🍬', valor: 'Dulces 🍬' },
    { nombre: 'Deportes', emoji: '⚽', valor: 'Deportes ⚽' },
    { nombre: 'Instrumentos', emoji: '🎸', valor: 'Instrumentos 🎸' },
    { nombre: 'Marcas', emoji: '™️', valor: 'Marcas ™️' },
    { nombre: 'Ciudades', emoji: '🏙️', valor: 'Ciudades 🏙️' },
    { nombre: 'Frutas', emoji: '🍎', valor: 'Frutas 🍎' },
    { nombre: 'Cuerpo', emoji: '🧠', valor: 'Cuerpo Humano 🧠' },
    { nombre: 'Héroes', emoji: '🦸', valor: 'Superhéroes 🦸' },
    { nombre: 'Moda', emoji: '👗', valor: 'Moda 👗' },
    { nombre: 'Plantas', emoji: '🌿', valor: 'Plantas 🌿' },
    { nombre: 'Tecnología', emoji: '💻', valor: 'Tecnología 💻' },
    { nombre: 'Picante', emoji: '🔥', valor: 'Picante 🔥' }
];


// --- UTILIDADES ---
function cambiarVista(vistaId) {
    document.querySelectorAll('.vista').forEach(vista => {
        vista.classList.remove('activa');
    });
    document.getElementById(vistaId).classList.add('activa');
    if (vistaId === 'vista-lobby') {
        actualizarBotonInicioJuego();
        renderConfiguracion(); 
    }
}

function actualizarListaJugadores(jugadores) {
    jugadoresActuales = jugadores;
    const listaHost = document.getElementById('lista-jugadores-host');
    const listaLobby = document.getElementById('lista-jugadores-lobby');
    
    const renderJugadores = (listaElement, isHostView) => {
        listaElement.innerHTML = '';
        jugadores.forEach(j => {
            if (j.id === socket.id) {
                nombreJugador = j.nombre; // Asegura que el nombre esté actualizado
            }
            const li = document.createElement('li');
            li.className = j.esHost ? 'host' : '';
            li.innerHTML = `
                ${j.esHost ? '👑' : '👤'} ${j.nombre}
                ${(isHostView && !j.esHost) ? `<button onclick="expulsarJugador('${j.id}')">Expulsar</button>` : ''}
            `;
            listaElement.appendChild(li);
        });
    };

    if (listaHost) renderJugadores(listaHost, true);
    if (listaLobby) renderJugadores(listaLobby, false);

    // Actualizar botón de inicio
    actualizarBotonInicioJuego();
}

function actualizarBotonInicioJuego() {
    const btnIniciar = document.getElementById('btn-iniciar-juego');
    if (!btnIniciar) return;

    const esHost = jugadoresActuales.find(j => j.id === socket.id)?.esHost;
    
    if (esHost) {
        btnIniciar.style.display = 'block';
        if (jugadoresActuales.length < MIN_JUGADORES_CLIENTE) {
            btnIniciar.disabled = true;
            btnIniciar.textContent = `Se necesitan ${MIN_JUGADORES_CLIENTE - jugadoresActuales.length} jugadores más (Min: ${MIN_JUGADORES_CLIENTE})`;
        } else {
            btnIniciar.disabled = false;
            btnIniciar.textContent = `INICIAR JUEGO ( ${jugadoresActuales.length} / ${MAX_JUGADORES} )`;
        }
    } else {
        btnIniciar.style.display = 'none';
    }
}

function renderConfiguracion() {
    const selectorTema = document.getElementById('selector-tema');
    if (selectorTema) {
        selectorTema.innerHTML = categorias.map(c => 
            `<option value="${c.valor}" ${configuracionActual.tema === c.valor ? 'selected' : ''}>${c.emoji} ${c.nombre}</option>`
        ).join('');
        document.getElementById('input-tiempo-ronda').value = configuracionActual.tiempoRondaSegundos;
        document.getElementById('checkbox-agente-doble').checked = configuracionActual.incluirAgenteDoble;
    }
    
    // Solo el Host puede editar la configuración
    const esHost = jugadoresActuales.find(j => j.id === socket.id)?.esHost;
    const form = document.getElementById('form-configuracion');
    if(form) {
        form.style.pointerEvents = esHost ? 'auto' : 'none';
        form.style.opacity = esHost ? 1 : 0.6;
    }
}

// --- MANEJADORES DE VISTA ---
document.getElementById('form-inicio').addEventListener('submit', (e) => {
    e.preventDefault();
    nombreJugador = document.getElementById('input-nombre').value.trim();
    if (!nombreJugador) return alert('Por favor, ingresa tu nombre.');
    cambiarVista('vista-seleccion');
});

document.getElementById('btn-crear-sala').addEventListener('click', () => {
    socket.emit('crearSala', nombreJugador);
});

document.getElementById('form-unirse-sala').addEventListener('submit', (e) => {
    e.preventDefault();
    const codigo = document.getElementById('input-codigo').value.trim().toUpperCase();
    if (codigo) {
        socket.emit('unirseSala', { codigoSala: codigo, nombreJugador });
    }
});

// Guardar configuración automáticamente (Host)
document.getElementById('form-configuracion').addEventListener('change', () => {
    const tema = document.getElementById('selector-tema').value;
    const tiempo = parseInt(document.getElementById('input-tiempo-ronda').value);
    const doble = document.getElementById('checkbox-agente-doble').checked;
    
    const nuevaConfig = {
        tema: tema,
        tiempoRondaSegundos: isNaN(tiempo) ? 0 : tiempo,
        numRondas: 99, // Fijo, ya no se usa en el cliente
        incluirAgenteDoble: doble
    };

    // Actualizar configuración local y emitir al servidor
    configuracionActual = nuevaConfig;
    socket.emit('guardarConfiguracion', { codigoSala: codigoSalaActual, nuevaConfig });
});


document.getElementById('btn-iniciar-juego').addEventListener('click', () => {
    if (jugadoresActuales.length >= MIN_JUGADORES_CLIENTE) {
        socket.emit('iniciarJuego', codigoSalaActual);
    } else {
        alert(`Se necesitan al menos ${MIN_JUGADORES_CLIENTE} jugadores.`);
    }
});

document.getElementById('btn-pasar-eliminacion').addEventListener('click', () => {
    socket.emit('pasarAEliminacion', codigoSalaActual);
});

function votar() {
    if (votoSeleccionadoId) {
        socket.emit('votarJugador', { codigoSala: codigoSalaActual, jugadorVotadoId: votoSeleccionadoId });
    } else {
        alert('Por favor, selecciona a alguien para votar.');
    }
}

function seleccionarVoto(jugadorId) {
    votoSeleccionadoId = jugadorId;
    document.querySelectorAll('.jugador-opcion').forEach(el => {
        el.classList.remove('seleccionado');
    });
    if (jugadorId !== 'none') {
        document.getElementById(`opcion-${jugadorId}`).classList.add('seleccionado');
    }
}

function expulsarJugador(idJugador) {
    if (confirm("¿Estás seguro de que quieres expulsar a este jugador?")) {
        socket.emit('expulsarJugador', { codigoSala: codigoSalaActual, idJugador });
    }
}


// --- MANEJADORES DE SOCKETS ---

socket.on('salaCreada', (data) => {
    codigoSalaActual = data.codigoSala;
    actualizarListaJugadores(data.jugadores);
    document.getElementById('codigo-sala-display').textContent = codigoSalaActual;
    document.getElementById('codigo-lobby-display').textContent = codigoSalaActual;
    cambiarVista('vista-lobby');
});

socket.on('unidoExitosamente', (codigoSala) => {
    codigoSalaActual = codigoSala;
    document.getElementById('codigo-sala-display').textContent = codigoSalaActual;
    document.getElementById('codigo-lobby-display').textContent = codigoSalaActual;
    cambiarVista('vista-lobby');
});

socket.on('jugadorUnido', (jugadores) => {
    actualizarListaJugadores(jugadores);
});

socket.on('configuracionActualizada', (config) => {
    configuracionActual = config;
    renderConfiguracion();
});

socket.on('juegoIniciado', (data) => {
    miRolActual = data.rol;
    miPalabraSecreta = data.palabraSecreta;
    miTemaActual = data.tema;
    jugadoresActuales = data.jugadores; 
    
    // Ocultar botones de Host si no lo es (p. ej., Expulsar)
    document.querySelectorAll('.control-host').forEach(el => {
        el.style.display = data.jugadores.find(j => j.id === socket.id)?.esHost ? 'block' : 'none';
    });

    cambiarVista('vista-juego');
    manejarInicioRonda(1); // La primera ronda

    document.getElementById('rol-display').textContent = miRolActual;
    document.getElementById('tema-display').textContent = miTemaActual;
    document.getElementById('palabra-secreta').textContent = miPalabraSecreta;
    
    let rolClase = 'tripulante';
    if (miRolActual === 'Impostor') rolClase = 'impostor';
    if (miRolActual === 'Agente Doble') rolClase = 'agente-doble';
    
    document.getElementById('rol-display').className = rolClase;

    // Mostrar jugadores y estados de eliminación
    actualizarEstadoJugadoresJuego(jugadoresActuales);
});

socket.on('actualizarTiempo', (tiempoRestante) => {
    document.getElementById('contador-tiempo').textContent = `Tiempo restante: ${tiempoRestante}s`;
});

socket.on('rondaTerminada', (data) => {
    document.getElementById('contador-tiempo').textContent = `¡Votación Iniciada!`;
    document.getElementById('estado-ronda').textContent = `RONDA ${data.ronda} - Votación`;
});

socket.on('iniciarVotacion', (data) => {
    cambiarVista('vista-votacion');
    document.getElementById('titulo-votacion').textContent = `RONDA ${data.ronda}: ¿Quién es el impostor?`;
    renderOpcionesVoto(data.jugadoresActivos);
    votoSeleccionadoId = 'none'; // Resetear selección
    document.getElementById('info-voto-emitido').textContent = ''; 
    document.getElementById('btn-emitir-voto').disabled = false;
});

socket.on('votoEmitidoConfirmacion', (data) => {
    document.getElementById('info-voto-emitido').textContent = `¡Voto emitido a: ${data.nombreVotado}! Esperando a los demás...`;
    document.getElementById('btn-emitir-voto').disabled = true;
});

socket.on('actualizarVotos', (data) => {
     document.getElementById('progreso-votos').textContent = `Votos emitidos: ${data.votosEmitidos} / ${data.totalVotantes}`;
});

socket.on('resultadoVotacion', (data) => {
    cambiarVista('vista-resultado');
    mostrarResultadoVotacion(data.conteo, data.jugadorEliminado);
});

socket.on('jugadorEliminado', (data) => {
    jugadoresActuales = data.jugadores;
    // La eliminación se maneja antes de la siguiente ronda
    if (data.jugadorEliminado && data.jugadorEliminado === nombreJugador) {
        miRolActual = 'Eliminado';
        document.getElementById('rol-display').textContent = 'ELIMINADO 💀';
        document.getElementById('rol-display').className = 'eliminado';
    }
});

socket.on('iniciarNuevaRonda', (data) => {
    manejarInicioRonda(data.ronda, data.mensajeEliminacion);
});

socket.on('juegoFinalizado', (data) => {
    manejarFinDeJuego(data.ganador, data.jugadores);
});

socket.on('error', (mensaje) => {
    alert('ERROR: ' + mensaje);
});

socket.on('expulsadoDeSala', (mensaje) => {
    alert(mensaje);
    cambiarVista('vista-inicio'); // Volver al inicio
    codigoSalaActual = '';
    jugadoresActuales = [];
});

// --- FUNCIONES DE RENDERIZADO DEL JUEGO ---

function actualizarEstadoJugadoresJuego(jugadores) {
    const listaJuego = document.getElementById('lista-jugadores-juego');
    listaJuego.innerHTML = '';
    
    jugadores.forEach(j => {
        const li = document.createElement('li');
        let estado = '';
        let rolClase = '';
        
        if (j.eliminado) {
            estado = '💀 ELIMINADO';
            rolClase = 'eliminado';
        } else if (j.id === socket.id) {
            estado = '(Tú)';
            rolClase = miRolActual === 'Impostor' ? 'impostor' : (miRolActual === 'Agente Doble' ? 'agente-doble' : 'tripulante');
        } else {
            estado = '🟢 Activo';
        }

        li.className = rolClase;
        li.textContent = `${j.nombre} ${estado}`;
        listaJuego.appendChild(li);
    });
}

function manejarInicioRonda(ronda, mensajeAnterior = '') {
    cambiarVista('vista-juego');
    document.getElementById('estado-ronda').textContent = `RONDA ${ronda} - Discusión`;
    document.getElementById('mensaje-eliminacion').textContent = mensajeAnterior;
    actualizarEstadoJugadoresJuego(jugadoresActuales);
}

function renderOpcionesVoto(jugadoresActivos) {
    const contenedorVotos = document.getElementById('opciones-votacion');
    contenedorVotos.innerHTML = '';

    jugadoresActivos.forEach(j => {
        if (j.id !== socket.id && !jugadoresActuales.find(p => p.id === socket.id)?.eliminado) {
            const div = document.createElement('div');
            div.className = 'jugador-opcion';
            div.id = `opcion-${j.id}`;
            div.innerHTML = `
                <input type="radio" name="voto" id="radio-${j.id}" onclick="seleccionarVoto('${j.id}')">
                <label for="radio-${j.id}">${j.nombre}</label>
            `;
            contenedorVotos.appendChild(div);
        }
    });

    // Opción Abstención (voto 'none')
    const divNone = document.createElement('div');
    divNone.className = 'jugador-opcion';
    divNone.id = 'opcion-none';
    divNone.innerHTML = `
        <input type="radio" name="voto" id="radio-none" onclick="seleccionarVoto('none')">
        <label for="radio-none">Abstenerse / Nadie</label>
    `;
    contenedorVotos.appendChild(divNone);
}

function mostrarResultadoVotacion(conteo, jugadorEliminadoNombre) {
    document.getElementById('resultado-ronda-titulo').textContent = `Resultados de la Votación:`;
    const resultadosDiv = document.getElementById('resultado-votos-lista');
    let listaVotos = '<ul>';
    
    // Mapear y ordenar los resultados
    const itemsVotados = Object.keys(conteo)
                               .filter(id => id !== 'none') // Excluir 'none' del mapeo inicial
                               .map(id => {
        const j = jugadoresActuales.find(jug => jug.id === id);
        if (!j) return null;

        let icono = '';
        if (j.nombre === jugadorEliminadoNombre) {
            icono = '❌';
        } else if (conteo[id] > 0) {
            icono = '🗳️';
        }
        return { id, nombre: j.nombre, votos: conteo[id], icono };
    }).filter(item => item !== null);
    
    // Agregar la abstención al final
    itemsVotados.push({ id: 'none', nombre: 'Abstención (Nadie)', votos: conteo['none'] || 0, icono: conteo['none'] > 0 ? '🚫' : '' });


    itemsVotados.sort((a, b) => b.votos - a.votos); 

    itemsVotados.forEach(item => {
        const estilo = (item.nombre === jugadorEliminadoNombre) ? 'color: var(--color-red); font-weight: bold;' : '';
        listaVotos += `<li style="${estilo}">${item.icono} ${item.nombre}: <span style="font-size: 1.1em;">${item.votos} votos</span></li>`;
    });

    listaVotos += `</ul>`;
    resultadosDiv.innerHTML = listaVotos;
}

function manejarFinDeJuego(ganador, jugadores) {
    cambiarVista('vista-final');
    document.getElementById('resultado-ganador').innerHTML = `🎉 ¡VICTORIA DE LOS <span class="${ganador === 'Impostores' ? 'impostor' : 'tripulante'}">${ganador.toUpperCase()}</span>! 🎉`;
    
    const listaFinal = document.getElementById('lista-final');
    listaFinal.innerHTML = '';
    
    jugadores.forEach(j => {
        const li = document.createElement('li');
        let rolClass = (j.rol === 'Impostor') ? 'impostor' : (j.rol === 'Agente Doble' ? 'agente-doble' : 'tripulante');
        const estado = j.eliminado ? '💀' : '✅';
        
        li.className = rolClass;
        li.innerHTML = `${estado} <strong>${j.nombre}</strong> - ${j.rol}`;
        listaFinal.appendChild(li);
    });
}