// public/cliente.js (FLUJO FINAL DE JUEGO Y BOTONES DE HOST CORREGIDOS)

// =================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// =================================================================
const firebaseConfig = {
    // TUS CREDENCIALES (Reemplaza con tu configuración real de Firebase)
    apiKey: "AIzaSyBFWEizn6Nn1iDkvZr2FkN3Vfn7IWGIuG0", 
    authDomain: "juego-impostor-firebase.firebaseapp.com",
    databaseURL: "https://juego-impostor-firebase-default-rtdb.firebaseio.com",
    projectId: "juego-impostor-firebase",
    storageBucket: "juego-impostor-firebase.firebasestorage.app",
    messagingSenderId: "337084843090",
    appId: "1:337084843090:web:41b0ebafd8a21f1420cb8b"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// =================================================================
// 2. DATOS DEL JUEGO
// =================================================================
const MAX_JUGADORES = 10;
let codigoSalaActual = ''; 
let miId = Date.now().toString() + Math.random().toString(36).substring(2, 9); // Generar un ID único para cada cliente.

const PALABRAS_POR_TEMA = {
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín', 'Pato', 'Rana'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana', 'Pera', 'Plátano'],
    'Países 🌎': ['España', 'México', 'Colombia', 'Japón', 'Francia', 'Canadá', 'Brasil', 'Alemania', 'Italia', 'Perú'],
    'Profesiones 💼': ['Médico', 'Maestro', 'Ingeniero', 'Cocinero', 'Policía', 'Bombero', 'Abogado', 'Piloto', 'Artista', 'Cartero'],
    'Objetos Cotidianos 💡': ['Teléfono', 'Taza', 'Llaves', 'Reloj', 'Libro', 'Silla', 'Mesa', 'Ventana', 'Espejo', 'Móvil']
};

let configuracionActual = {
    numImpostores: 1,
    incluirAgenteDoble: false, // Ahora se maneja con checkbox e input de numAgentes
    numAgentes: 0,
    incluirSinPalabra: false,
    temaSeleccionado: Object.keys(PALABRAS_POR_TEMA)[0]
};

// =================================================================
// 3. REFERENCIAS DEL DOM
// =================================================================
const vistas = document.querySelectorAll('.vista');
const nombreInput = document.getElementById('input-nombre');
const nombreDisplay = document.getElementById('nombre-jugador-display');

// Lobby
const listaJugadoresLobby = document.getElementById('lista-jugadores-lobby');
const contadorJugadoresDisplay = document.getElementById('contador-jugadores');
const configuracionHostDiv = document.getElementById('configuracion-host');
const btnIniciarJuego = document.getElementById('btn-iniciar-juego');
const numImpostoresInput = document.getElementById('num-impostores');
const numAgentesInput = document.getElementById('num-agentes');
const incluirAgenteDobleCheckbox = document.getElementById('incluir-agente-doble');
const incluirSinPalabraCheckbox = document.getElementById('incluir-sin-palabra');
const selectTema = document.getElementById('select-tema');

// Juego
const listaJugadoresJuego = document.getElementById('lista-jugadores-juego');
const miRolDisplay = document.getElementById('mi-rol-juego');
const miPalabraDisplay = document.getElementById('mi-palabra-juego');
const miTemaDisplay = document.getElementById('mi-tema-juego');
const btnIniciarVotacion = document.getElementById('btn-iniciar-votacion');

// Revelación de Rol
const revelacionTitulo = document.getElementById('revelacion-titulo');
const revelacionDetalle = document.getElementById('revelacion-detalle');
const palabraSecretaRevelacion = document.getElementById('palabra-secreta-revelacion');
const temaRevelacion = document.getElementById('tema-revelacion');
const btnComenzarJuego = document.getElementById('btn-comenzar-juego');

// Votación
const listaJugadoresVotacion = document.getElementById('lista-jugadores-votacion');
const btnFinalizarVotacion = document.getElementById('btn-finalizar-votacion');
const accionesVotacionHost = document.getElementById('acciones-votacion-host');
const miVotoDisplayContainer = document.getElementById('mi-voto-display');
const votoJugadorDisplay = document.getElementById('voto-jugador-display');

// Resultado
const listaVotosRecibidos = document.getElementById('lista-votos-recibidos');
const jugadorEliminadoDisplay = document.getElementById('jugador-eliminado-display');
const btnReiniciarPartidaResultado = document.getElementById('btn-reiniciar-partida-resultado');
const btnFinalizarJuegoResultado = document.getElementById('btn-finalizar-juego-resultado');
const accionesFinalesHostResultado = document.getElementById('acciones-finales-host-resultado');

// Final
const ganadorDisplay = document.getElementById('ganador-display');
const listaRolesFinal = document.getElementById('lista-roles-final');
const btnReiniciarPartidaFinal = document.getElementById('btn-reiniciar-partida-final');
const btnFinalizarJuegoFinal = document.getElementById('btn-finalizar-juego-final');
const accionesFinalesHostFinal = document.getElementById('acciones-finales-final-host');

// NUEVAS REFERENCIAS PARA ADIVINACIÓN DEL IMPOSTOR
const adivinarContainer = document.getElementById('adivinar-impostor-container');
const adivinarForm = document.getElementById('form-adivinar-palabra');
const adivinarInput = document.getElementById('input-palabra-adivinar');
const adivinarBoton = document.getElementById('btn-adivinar');
const adivinarMensaje = document.getElementById('mensaje-adivinanza');


// =================================================================
// 4. FUNCIONES DE UTILIDAD
// =================================================================

function cambiarVista(idVista) {
    vistas.forEach(vista => {
        vista.classList.remove('activa');
    });
    document.getElementById(idVista).classList.add('activa');
}

function generarCodigo(length = 4) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * Normaliza la palabra para comparación, quitando acentos, mayúsculas y espacios.
 */
function normalizarPalabra(palabra) {
    if (!palabra) return '';
    // Quita acentos, convierte a minúsculas, quita espacios al inicio/final
    // y reemplaza múltiples espacios internos por uno solo.
    return palabra.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, ' ');
}

/**
 * Obtiene la palabra secreta de la partida de una fuente confiable (un tripulante vivo).
 */
function getPalabraSecreta(sala) {
    if (!sala || !sala.jugadores) return null;
    
    // Buscar la palabra secreta en el primer tripulante no eliminado que la tenga
    const jugadores = Object.values(sala.jugadores);
    const tripulanteVivo = jugadores.find(j => j.rol === 'Tripulante' && !j.eliminado && j.palabraSecreta);

    if (tripulanteVivo) {
        return tripulanteVivo.palabraSecreta;
    }
    
    // Fallback: Si la palabra se guardó en el objeto sala principal al iniciar
    return sala.palabraSecretaJuego || null;
}


// =================================================================
// 5. LÓGICA DE FIREBASE (ESCUCHADORES Y ACTUALIZACIÓN)
// =================================================================

function configurarEscuchadorSala(codigo) {
    if (codigoSalaActual) {
        // Desactivar escuchador anterior si existe
        db.ref('salas/' + codigoSalaActual).off();
    }
    codigoSalaActual = codigo;
    db.ref('salas/' + codigo).on('value', (snapshot) => {
        const sala = snapshot.val();
        if (sala) {
            manejarCambioSala(sala);
        } else {
            // La sala fue eliminada (por el host)
            alert('¡La sala ha sido cerrada por el Host!');
            window.location.reload();
        }
    }, (error) => {
        console.error("Error al escuchar sala:", error);
    });
}

function manejarCambioSala(sala) {
    const miJugador = sala.jugadores[miId];
    if (!miJugador) {
        // Jugador eliminado/desconectado.
        return;
    }

    if (sala.estado === 'esperando') {
        actualizarVistaLobby(sala);
        cambiarVista('vista-lobby');
    } else if (sala.estado === 'revelacion') {
        actualizarVistaRevelacion(sala);
        cambiarVista('vista-revelacion-rol');
    } else if (sala.estado === 'jugando') {
        actualizarVistaJuego(sala);
        cambiarVista('vista-juego');
    } else if (sala.estado === 'votacion') {
        actualizarVistaVotacion(sala);
        cambiarVista('vista-votacion');
    } else if (sala.estado === 'resultado') {
        actualizarVistaResultado(sala);
        cambiarVista('vista-resultado');
    } else if (sala.estado === 'finalizado') {
        actualizarVistaFinal(sala);
        cambiarVista('vista-final');
    }
}


// =================================================================
// 6. ACTUALIZACIÓN DE VISTAS
// =================================================================

function actualizarVistaLobby(sala) {
    const jugadores = Object.values(sala.jugadores || {});
    listaJugadoresLobby.innerHTML = '';
    contadorJugadoresDisplay.textContent = jugadores.length;
    
    let hostNombre = 'Cargando...';
    let miEsHost = false;

    jugadores.forEach(j => {
        const esMiJugador = j.id === miId;
        
        if (j.esHost) {
            hostNombre = j.nombre;
            if (esMiJugador) {
                miEsHost = true;
            }
        }

        const li = document.createElement('li');
        li.textContent = `${j.nombre} ${esMiJugador ? '(Tú)' : ''}`;
        if (j.esHost) {
            li.classList.add('host');
            li.textContent += ' (Host)';
        }
        listaJugadoresLobby.appendChild(li);
    });

    document.getElementById('host-lobby-display').textContent = hostNombre;
    
    // Configuración Host
    configuracionHostDiv.style.display = miEsHost ? 'block' : 'none';
    btnIniciarJuego.style.display = (miEsHost && jugadores.length >= 4) ? 'block' : 'none'; // Mínimo 4 jugadores
    
    if (miEsHost) {
        // Cargar temas si es Host
        if (selectTema.options.length === 0) {
            Object.keys(PALABRAS_POR_TEMA).forEach(tema => {
                const option = document.createElement('option');
                option.value = tema;
                option.textContent = tema;
                selectTema.appendChild(option);
            });
        }
        
        // Sincronizar inputs con la configuración actual (o la de la sala)
        const config = sala.configuracion || configuracionActual;
        numImpostoresInput.value = config.numImpostores;
        numAgentesInput.value = config.numAgentes;
        incluirAgenteDobleCheckbox.checked = config.incluirAgenteDoble;
        incluirSinPalabraCheckbox.checked = config.incluirSinPalabra;
        selectTema.value = config.temaSeleccionado;
        
        document.getElementById('configuracion-lobby-display').textContent = 
            `Impostores: ${config.numImpostores}, Agentes: ${config.numAgentes}, Sin Palabra: ${config.incluirSinPalabra ? 'Sí' : 'No'}`;
    }
}

function actualizarVistaRevelacion(sala) {
    const miJugador = sala.jugadores[miId];
    if (!miJugador) return;

    revelacionTitulo.textContent = `Tu Rol: ${miJugador.rol.toUpperCase()}`;
    revelacionTitulo.className = miJugador.rol.toLowerCase().replace(' ', '-');

    palabraSecretaRevelacion.textContent = miJugador.palabraSecreta || 'N/A';
    temaRevelacion.textContent = miJugador.tema || 'N/A';

    let detalle = '';
    switch (miJugador.rol) {
        case 'Tripulante':
            detalle = '¡Eres un tripulante! Tu objetivo es descubrir al impostor y eliminarlo antes de que adivine tu palabra secreta.';
            break;
        case 'Impostor':
            detalle = '¡Eres el Impostor! Tu objetivo es confundir a los demás y adivinar la palabra secreta antes de ser descubierto.';
            palabraSecretaRevelacion.textContent = '???'; // La palabra secreta no es la suya, es la que debe adivinar
            break;
        case 'Agente Doble':
            detalle = '¡Eres un Agente Doble! Conocés las dos palabras. Tu objetivo es hacer que el equipo elimine al jugador "Sin Palabra".';
            palabraSecretaRevelacion.textContent = `Palabra 1: ${miJugador.palabraTripulante} | Palabra 2: ${miJugador.palabraSinPalabra}`;
            break;
        case 'Sin Palabra':
            detalle = '¡Eres el Sin Palabra! No tienes palabra, pero debes actuar como si tuvieras la misma palabra que los Tripulantes. El Agente Doble debe hacer que te eliminen para ganar. Los Impostores ganan si no te eliminan.';
            palabraSecretaRevelacion.textContent = 'NINGUNA';
            break;
    }
    revelacionDetalle.textContent = detalle;
    
    // El host es el único que ve el botón para pasar a la vista de juego (Discusión)
    if (miJugador.esHost) {
        btnComenzarJuego.style.display = 'block';
    } else {
        btnComenzarJuego.style.display = 'none';
    }
}

function actualizarVistaJuego(sala) {
    const jugadores = Object.values(sala.jugadores || {});
    const miJugador = sala.jugadores[miId];

    if (!miJugador) return;

    // Actualizar info del jugador
    document.getElementById('mi-nombre-juego').textContent = miJugador.nombre;
    miRolDisplay.textContent = miJugador.rol.toUpperCase();
    miRolDisplay.className = miJugador.rol.toLowerCase().replace(' ', '-');
    miPalabraDisplay.textContent = miJugador.palabraSecreta || '???';
    miTemaDisplay.textContent = miJugador.tema || 'N/A';

    if (miJugador.rol === 'Impostor') {
        miPalabraDisplay.textContent = 'Adivina la Palabra Secreta'; // Recordatorio para el impostor
    } else if (miJugador.rol === 'Agente Doble') {
        miPalabraDisplay.textContent = `P1: ${miJugador.palabraTripulante} | P2: ${miJugador.palabraSinPalabra}`;
    } else if (miJugador.rol === 'Sin Palabra') {
        miPalabraDisplay.textContent = 'NINGUNA (Actúa normal)';
    }

    // Lógica NUEVA para la adivinación del Impostor
    const esImpostorVivo = miJugador && miJugador.rol === 'Impostor' && !miJugador.eliminado;

    if (adivinarContainer) {
        if (esImpostorVivo && sala.estado === 'jugando') {
            adivinarContainer.style.display = 'block';
        } else {
            adivinarContainer.style.display = 'none';
        }
        // Limpiar el mensaje y el input al cambiar de estado/actualizar
        adivinarMensaje.textContent = ''; 
        adivinarInput.value = ''; 
    }
    
    // Actualizar lista de jugadores
    listaJugadoresJuego.innerHTML = '';
    let contadorActivos = 0;
    jugadores.forEach(j => {
        if (!j.eliminado) contadorActivos++;
        const li = document.createElement('li');
        li.textContent = `${j.nombre} ${j.id === miId ? '(Tú)' : ''}`;
        li.classList.add('jugador-item');
        
        // Agregar estado eliminado/activo
        if (j.eliminado) {
            li.classList.add('eliminado');
            li.textContent += ' (Eliminado)';
        } else {
            // Dar color al borde si es host y está activo
            if (j.esHost) {
                li.style.borderLeftColor = 'var(--color-secondary)';
            } else {
                li.style.borderLeftColor = 'var(--color-green)';
            }
        }
        listaJugadoresJuego.appendChild(li);
    });

    // Control del botón de votación (Solo Host y si hay al menos 4 activos o 1 impostor)
    const impostoresVivos = jugadores.filter(j => j.rol === 'Impostor' && !j.eliminado).length;
    const tripulantesVivos = jugadores.filter(j => j.rol === 'Tripulante' && !j.eliminado).length;
    const agentesVivos = jugadores.filter(j => j.rol === 'Agente Doble' && !j.eliminado).length;
    const sinPalabraVivos = jugadores.filter(j => j.rol === 'Sin Palabra' && !j.eliminado).length;

    const tripulantesYAgentesActivos = tripulantesVivos + agentesVivos + sinPalabraVivos;

    const puedeTerminar = (impostoresVivos === 0 || (tripulantesYAgentesActivos) <= impostoresVivos + 1);
    
    if (miJugador.esHost && !puedeTerminar) {
        btnIniciarVotacion.style.display = 'block';
    } else {
        btnIniciarVotacion.style.display = 'none';
    }
    
    // Chequear Fin de Juego por eliminación/mayoría (solo el Host lo hace)
    if (miJugador.esHost) {
        chequearFinDeJuego(sala);
    }
}

function actualizarVistaVotacion(sala) {
    const jugadores = Object.values(sala.jugadores || {});
    const miJugador = sala.jugadores[miId];
    
    if (!miJugador) return;
    
    listaJugadoresVotacion.innerHTML = '';
    
    jugadores.forEach(j => {
        if (!j.eliminado && j.id !== miId) {
            const li = document.createElement('li');
            li.textContent = j.nombre + (j.esHost ? ' (Host)' : '');
            li.dataset.jugadorId = j.id;
            li.addEventListener('click', () => votarJugador(sala.codigo, j.id));

            if (sala.votos && sala.votos[miId] === j.id) {
                li.classList.add('voto-seleccionado');
                votoJugadorDisplay.textContent = j.nombre;
                miVotoDisplayContainer.style.display = 'block';
            }
            listaJugadoresVotacion.appendChild(li);
        }
    });

    // Display del voto
    if (sala.votos && sala.votos[miId]) {
         miVotoDisplayContainer.style.display = 'block';
    } else {
        votoJugadorDisplay.textContent = 'Nadie';
         miVotoDisplayContainer.style.display = 'block'; // Mostrar siempre para ver "Nadie"
    }

    // Botón de finalizar votación (Host y si todos votaron)
    const jugadoresActivos = jugadores.filter(j => !j.eliminado).length;
    const votosEmitidos = Object.keys(sala.votos || {}).length;

    if (miJugador.esHost && (votosEmitidos >= jugadoresActivos)) {
        accionesVotacionHost.style.display = 'block';
    } else {
        accionesVotacionHost.style.display = 'none';
    }
}

function actualizarVistaResultado(sala) {
    const miJugador = sala.jugadores[miId];
    if (!miJugador) return;
    
    const eliminadoId = sala.ultimoEliminado;
    const eliminado = sala.jugadores[eliminadoId];
    const votos = sala.votos || {};
    const conteoVotos = {};
    
    // Contar votos
    Object.values(votos).forEach(votoId => {
        conteoVotos[votoId] = (conteoVotos[votoId] || 0) + 1;
    });

    // Mostrar votos recibidos
    listaVotosRecibidos.innerHTML = '';
    const jugadoresParaMostrarVotos = Object.values(sala.jugadores).filter(j => j.id !== 'abstencion');
    
    jugadoresParaMostrarVotos.forEach(j => {
        const numVotos = conteoVotos[j.id] || 0;
        const li = document.createElement('li');
        li.textContent = `${j.nombre}: ${numVotos} voto(s)`;
        listaVotosRecibidos.appendChild(li);
    });

    // Mostrar jugador eliminado
    if (eliminado) {
        jugadorEliminadoDisplay.textContent = `¡${eliminado.nombre} ha sido eliminado! Su rol era: ${eliminado.rol}.`;
        jugadorEliminadoDisplay.className = `aviso-eliminado ${eliminado.rol.toLowerCase().replace(' ', '-')}`;
    } else {
        jugadorEliminadoDisplay.textContent = 'Nadie fue eliminado. La votación fue un empate.';
        jugadorEliminadoDisplay.className = 'aviso-eliminado tripulante'; // Color neutro/tripulante
    }
    
    // Botones de Host
    const esHost = miJugador.esHost;
    accionesFinalesHostResultado.style.display = esHost ? 'flex' : 'none';
    
    if (esHost) {
        btnReiniciarPartidaResultado.textContent = '▶️ Continuar (Nueva Discusión)';
        btnFinalizarJuegoResultado.style.display = 'none'; // Por defecto, se continúa
        
        // El host chequeará si el juego terminó
        if (sala.estado !== 'finalizado') {
            chequearFinDeJuego(sala, true); // Chequea de nuevo para ver si se finaliza inmediatamente
        }
        
        if (sala.estado === 'finalizado') {
            // Si ya terminó, el botón cambia
            btnReiniciarPartidaResultado.style.display = 'none';
            btnFinalizarJuegoResultado.style.display = 'block'; // Pide al Host cerrar
        }
    }
}

function actualizarVistaFinal(sala) {
    const miJugador = sala.jugadores[miId];
    if (!miJugador) return;
    
    ganadorDisplay.textContent = sala.mensajeGanador || 'Juego Finalizado';
    ganadorDisplay.className = sala.claseGanador || ''; // La clase para el color del texto

    listaRolesFinal.innerHTML = '';
    const jugadores = Object.values(sala.jugadores || {});

    jugadores.forEach(j => {
        if (j.id === 'abstencion') return; // Ignorar el jugador "abstención"
        const rolClase = j.rol.toLowerCase().replace(' ', '-');
        const li = document.createElement('li');
        
        // La palabra secreta es diferente para el Agente Doble
        let palabraFinal = j.palabraSecreta || '???';
        if (j.rol === 'Agente Doble') {
            palabraFinal = `P1: ${j.palabraTripulante} | P2: ${j.palabraSinPalabra}`;
        } else if (j.rol === 'Sin Palabra') {
            palabraFinal = 'NINGUNA';
        } else if (j.rol === 'Impostor') {
            // Para el impostor mostramos la palabra que debía adivinar si la tenemos
            palabraFinal = getPalabraSecreta(sala) || 'N/A';
        }
        
        li.innerHTML = `
            ${j.nombre} ${j.esHost ? ' (Host)' : ''} 
            <span class="${rolClase}">[${j.rol}]</span>
            <span style="font-weight: normal; margin-left: 10px;">Palabra: ${palabraFinal}</span>
        `;
        listaRolesFinal.appendChild(li);
    });
    
    // Botones de Host en la vista final
    if (miJugador.esHost) {
        accionesFinalesHostFinal.style.display = 'flex';
    } else {
        accionesFinalesHostFinal.style.display = 'none';
    }
}

// =================================================================
// 7. LÓGICA DEL JUEGO
// =================================================================

async function crearSala() {
    const nombreJugador = nombreInput.value;
    if (!nombreJugador) return alert('Por favor, ingresa tu nombre.');

    let codigo = generarCodigo();
    while ((await db.ref('salas/' + codigo).once('value')).exists()) {
        codigo = generarCodigo();
    }
    
    // Configuración inicial de la sala (usando la configuración predeterminada/actual del cliente)
    const nuevaSala = {
        codigo: codigo,
        estado: 'esperando',
        hostId: miId,
        configuracion: configuracionActual,
        jugadores: {
            [miId]: {
                id: miId,
                nombre: nombreJugador,
                esHost: true,
                rol: 'Tripulante',
                eliminado: false,
                palabraSecreta: null,
                tema: null
            }
        },
        // Propiedades de juego
        palabraSecretaJuego: null,
        temaJuego: null,
        rondaVotacion: 0,
        votos: {},
        ultimoEliminado: null,
        // Propiedades de finalización
        ganador: null,
        mensajeGanador: null,
        claseGanador: null
    };

    try {
        await db.ref('salas/' + codigo).set(nuevaSala);
        document.getElementById('codigo-lobby-display').textContent = codigo;
        configurarEscuchadorSala(codigo);
    } catch (error) {
        console.error("Error al crear la sala en Firebase:", error);
        alert('🔴 ERROR AL CREAR SALA: Fallo de red o de permisos.');
    }
}

async function unirseASala() {
    const nombreJugador = nombreInput.value;
    const codigo = document.getElementById('input-codigo').value.toUpperCase();
    
    if (!nombreJugador) return alert('Por favor, ingresa tu nombre.');
    if (codigo.length !== 4) return alert('El código de sala debe ser de 4 letras.');
    
    try {
        const salaRef = db.ref('salas/' + codigo);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        if (!snapshot.exists()) {
            return alert('ERROR: La sala con el código ' + codigo + ' no existe.');
        }

        if (sala.estado !== 'esperando') {
            return alert('ERROR: El juego ya inició o la sala está cerrada.');
        }
        
        const numJugadores = Object.keys(sala.jugadores || {}).length;
        if (numJugadores >= MAX_JUGADORES) {
             return alert('ERROR: La sala está llena. ¡Máximo ' + MAX_JUGADORES + ' jugadores!');
        }

        const nuevoJugador = { 
             id: miId, 
             nombre: nombreJugador, 
             esHost: false, 
             rol: 'Tripulante', 
             eliminado: false,
             palabraSecreta: null,
             tema: null,
             hostId: sala.hostId 
        };
        
        const jugadoresRef = db.ref('salas/' + codigo + '/jugadores/' + miId);
        await jugadoresRef.set(nuevoJugador);

        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;

    } catch (error) {
        console.error("Error al unirse a la sala en Firebase:", error);
        alert(`🔴 ERROR AL UNIRSE: ${error.message}`);
    }
}

function asignarRolesYPalabras(jugadores, config, tema, palabraTripulante, palabraImpostor, palabraSinPalabra) {
    const jugadoresArray = Object.values(jugadores);
    let rolesAsignados = 0;
    
    // 1. Asignar Impostores
    const impostoresParaAsignar = [];
    for (let i = 0; i < config.numImpostores; i++) {
        impostoresParaAsignar.push('Impostor');
    }

    // 2. Asignar Agente Doble y Sin Palabra
    if (config.numAgentes > 0) {
        impostoresParaAsignar.push('Agente Doble');
    }
    if (config.incluirSinPalabra) {
        impostoresParaAsignar.push('Sin Palabra');
    }

    // Shuffle jugadoresArray
    for (let i = jugadoresArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [jugadoresArray[i], jugadoresArray[j]] = [jugadoresArray[j], jugadoresArray[i]];
    }

    // Asignar roles especiales
    for (const rol of impostoresParaAsignar) {
        const idx = jugadoresArray.findIndex(j => j.rol === 'Tripulante' && !j.esHost);
        if (idx !== -1) {
            jugadoresArray[idx].rol = rol;
            rolesAsignados++;
        }
    }
    
    // Asignar palabra a todos
    jugadoresArray.forEach(j => {
        j.tema = tema;
        j.palabraSecreta = palabraTripulante; // Por defecto

        if (j.rol === 'Impostor') {
            j.palabraSecreta = palabraImpostor;
        } else if (j.rol === 'Agente Doble') {
            j.palabraSecreta = null; // No tiene una "sola" palabra
            j.palabraTripulante = palabraTripulante;
            j.palabraSinPalabra = palabraSinPalabra;
        } else if (j.rol === 'Sin Palabra') {
            j.palabraSecreta = null;
        }
    });

    // Convertir de nuevo a objeto
    const jugadoresActualizados = {};
    jugadoresArray.forEach(j => {
        jugadoresActualizados[j.id] = j;
    });
    
    return jugadoresActualizados;
}

async function iniciarJuego(codigo) {
    const salaRef = db.ref('salas/' + codigo);
    const snapshot = await salaRef.once('value');
    const sala = snapshot.val();
    
    if (!sala || sala.estado !== 'esperando') return;
    
    const config = sala.configuracion || configuracionActual;
    const tema = config.temaSeleccionado;
    const palabras = PALABRAS_POR_TEMA[tema];
    
    // Elegir dos palabras distintas (o la misma si no hay suficientes)
    if (palabras.length < 2) return alert('ERROR: El tema seleccionado no tiene suficientes palabras.');
    
    const idx1 = Math.floor(Math.random() * palabras.length);
    let idx2 = Math.floor(Math.random() * palabras.length);
    while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * palabras.length);
    }
    
    const palabraTripulante = palabras[idx1];
    const palabraImpostor = palabras[idx2];
    
    // Palabra para el "Sin Palabra" (se elige una tercera palabra distinta a la del tripulante)
    let palabraSinPalabra = 'N/A';
    if (config.incluirSinPalabra || config.numAgentes > 0) {
        let idx3 = Math.floor(Math.random() * palabras.length);
        while (idx3 === idx1 || idx3 === idx2) {
            idx3 = Math.floor(Math.random() * palabras.length);
        }
        palabraSinPalabra = palabras[idx3];
    }
    
    const jugadoresActualizados = asignarRolesYPalabras(
        sala.jugadores, 
        config, 
        tema, 
        palabraTripulante, 
        palabraImpostor,
        palabraSinPalabra
    );
    
    // Actualizar sala en Firebase para iniciar juego y revelar roles
    await salaRef.update({
        estado: 'revelacion',
        jugadores: jugadoresActualizados,
        palabraSecretaJuego: palabraTripulante, // La palabra 'real'
        temaJuego: tema,
        rondaVotacion: 1,
        votos: {},
        ultimoEliminado: null,
        ganador: null,
        mensajeGanador: null,
        claseGanador: null
    });
}

async function manejarAdivinanza(e) {
    e.preventDefault();
    const codigoSala = document.getElementById('codigo-lobby-display').textContent;
    const palabraAdivinada = adivinarInput.value;
    
    // Deshabilitar para evitar spam
    adivinarInput.disabled = true;
    adivinarBoton.disabled = true;
    adivinarMensaje.textContent = 'Verificando palabra...';

    try {
        const salaRef = db.ref('salas/' + codigoSala);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();
        
        if (!sala || sala.estado !== 'jugando') {
            adivinarMensaje.textContent = '❌ ERROR: El juego no está en curso.';
            return;
        }

        const palabraSecreta = getPalabraSecreta(sala);
        
        if (!palabraSecreta) {
            adivinarMensaje.textContent = '❌ ERROR: No se pudo obtener la palabra secreta de la partida.';
            return;
        }

        const normalizadaAdivinada = normalizarPalabra(palabraAdivinada);
        const normalizadaSecreta = normalizarPalabra(palabraSecreta);

        if (normalizadaAdivinada === normalizadaSecreta) {
            adivinarMensaje.textContent = `✅ ¡Correcto! ¡"${palabraSecreta}" es la palabra! Has ganado.`;
            // El impostor gana, terminar juego con nueva razón
            await manejarFinDeJuego(codigoSala, 'impostor-adivina');
        } else {
            adivinarMensaje.textContent = '❌ Palabra incorrecta. ¡Sigue disimulando!';
            adivinarInput.value = ''; // Limpiar el input para otro intento
        }

    } catch (error) {
        console.error("Error al adivinar palabra:", error);
        adivinarMensaje.textContent = `🔴 ERROR: Fallo de red o DB.`;
    } finally {
        adivinarInput.disabled = false;
        adivinarBoton.disabled = false;
    }
}

async function manejarInicioVotacion(codigo) {
    const salaRef = db.ref('salas/' + codigo);
    // Eliminar votos anteriores y cambiar a estado votacion
    await salaRef.update({
        estado: 'votacion',
        votos: {} // Resetear votos
    });
}

async function votarJugador(codigo, jugadorVotadoId) {
    const salaRef = db.ref('salas/' + codigo);
    const miVotoRef = db.ref('salas/' + codigo + '/votos/' + miId);

    // Si ya votó por ese jugador, quitar el voto
    const currentVotoSnapshot = await miVotoRef.once('value');
    if (currentVotoSnapshot.val() === jugadorVotadoId) {
        // Voto por abstención (o eliminar el voto)
        await miVotoRef.remove();
    } else {
        // Votar por el nuevo jugador
        await miVotoRef.set(jugadorVotadoId);
    }
}

function calcularResultadoVotacion(jugadores, votos) {
    const conteoVotos = {};
    Object.values(votos || {}).forEach(votoId => {
        conteoVotos[votoId] = (conteoVotos[votoId] || 0) + 1;
    });

    let maxVotos = 0;
    let candidatoEliminado = null;
    let candidatosEmpatados = 0;

    Object.keys(conteoVotos).forEach(jugadorId => {
        if (conteoVotos[jugadorId] > maxVotos) {
            maxVotos = conteoVotos[jugadorId];
            candidatoEliminado = jugadores[jugadorId];
            candidatosEmpatados = 1;
        } else if (conteoVotos[jugadorId] === maxVotos) {
            candidatosEmpatados++;
        }
    });

    // Si hay empate o no hay votos, nadie es eliminado
    if (candidatosEmpatados > 1 || !candidatoEliminado) {
        return null; // Nadie eliminado
    }

    return candidatoEliminado;
}

async function manejarFinalizarVotacion(codigo) {
    const salaRef = db.ref('salas/' + codigo);
    const snapshot = await salaRef.once('value');
    const sala = snapshot.val();
    
    if (!sala || sala.estado !== 'votacion') return;

    const jugadorEliminado = calcularResultadoVotacion(sala.jugadores, sala.votos);

    if (jugadorEliminado) {
        // Marcar al jugador como eliminado
        await db.ref('salas/' + codigo + '/jugadores/' + jugadorEliminado.id + '/eliminado').set(true);
        await salaRef.update({
            estado: 'resultado',
            ultimoEliminado: jugadorEliminado.id,
            rondaVotacion: sala.rondaVotacion + 1
        });
    } else {
        // Nadie fue eliminado (empate o abstención)
        await salaRef.update({
            estado: 'resultado',
            ultimoEliminado: null,
            rondaVotacion: sala.rondaVotacion + 1
        });
    }
}

function chequearFinDeJuego(sala, forzarCambioFinal = false) {
    const jugadores = Object.values(sala.jugadores || {});
    const impostoresActivos = jugadores.filter(j => j.rol === 'Impostor' && !j.eliminado).length;
    const agentesActivos = jugadores.filter(j => j.rol === 'Agente Doble' && !j.eliminado).length;
    const sinPalabraActivos = jugadores.filter(j => j.rol === 'Sin Palabra' && !j.eliminado).length;
    const tripulantesPurosActivos = jugadores.filter(j => j.rol === 'Tripulante' && !j.eliminado).length;
    
    const tripulantesYAgentesActivos = tripulantesPurosActivos + agentesActivos + sinPalabraActivos;

    // 1. Ganador: Tripulantes (Impostores eliminados)
    if (impostoresActivos === 0 && tripulantesPurosActivos > 0) {
        manejarFinDeJuego(sala.codigo, 'impostor-eliminado');
        return true;
    }
    
    // 2. Ganador: Impostor (Mayoría de Impostores/Agentes)
    // El impostor gana si los tripulantes/agentes/sin-palabra son iguales o menos a los impostores + 1
    if (impostoresActivos > tripulantesYAgentesActivos) {
        manejarFinDeJuego(sala.codigo, 'impostor-no-eliminado');
        return true;
    }
    
    // 3. Ganador: Agente Doble (Solo gana si el "Sin Palabra" es eliminado)
    const sinPalabraEliminado = jugadores.find(j => j.rol === 'Sin Palabra')?.eliminado;
    if (agentesActivos > 0 && sinPalabraEliminado) {
        // Si el agente doble está vivo y el sin palabra fue eliminado
        const todosLosOtrosMuertos = (impostoresActivos === 0 && tripulantesPurosActivos === 0);
        if (agentesActivos > 0 && todosLosOtrosMuertos) {
             // Si el agente doble es el último que queda (o solo quedan agentes) y logró eliminar al Sin Palabra.
             manejarFinDeJuego(sala.codigo, 'agente-doble-gana');
             return true;
        }
    }
    
    // 4. Chequeo de fin forzado (ej: desde vista-resultado)
    if (forzarCambioFinal) {
        // En este caso, si no se cumple ninguna condición de victoria, el juego continúa (se vuelve a vista-juego)
        if (sala.estado === 'resultado') {
            db.ref('salas/' + sala.codigo).update({
                estado: 'jugando',
                votos: {},
                ultimoEliminado: null
            });
        }
    }
    
    return false;
}

async function manejarFinDeJuego(codigo, razon) {
    const salaRef = db.ref('salas/' + codigo);
    const snapshot = await salaRef.once('value');
    const sala = snapshot.val();
    
    if (!sala || sala.estado === 'finalizado') return;
    
    let ganador = 'Tripulantes'; // Predeterminado
    let mensajeGanador = '🏆 ¡Los Tripulantes ganan!';
    let claseGanador = 'tripulante';
    
    if (razon === 'impostor-eliminado') {
        ganador = 'Tripulantes';
        mensajeGanador = '🏆 ¡Los Tripulantes Ganan! El Impostor ha sido eliminado.';
        claseGanador = 'tripulante';

    } else if (razon === 'impostor-no-eliminado') {
        ganador = 'Impostor';
        mensajeGanador = '🏆 ¡El Impostor Gana! Nadie lo descubrió a tiempo.';
        claseGanador = 'impostor';
        
    } else if (razon === 'agente-doble-gana') {
        ganador = 'Agente Doble';
        mensajeGanador = '🏆 ¡El Agente Doble Gana! Logró que el jugador Sin Palabra fuera eliminado.';
        claseGanador = 'agente-doble';
        
    } else if (razon === 'impostor-adivina') { // <-- NUEVO CASO
        ganador = 'Impostor';
        mensajeGanador = '🏆 ¡El Impostor ha adivinado la palabra secreta y GANA la partida!';
        claseGanador = 'impostor';
    }

    // Actualizar la sala en Firebase
    await salaRef.update({
        estado: 'finalizado',
        ganador: ganador,
        mensajeGanador: mensajeGanador,
        claseGanador: claseGanador
    });
}

// =================================================================
// 8. FUNCIONES DE HOST / MANTENIMIENTO DE SALA
// =================================================================

async function guardarConfiguracion(codigo) {
    const salaRef = db.ref('salas/' + codigo);
    
    const numImpostores = parseInt(numImpostoresInput.value);
    const numAgentes = incluirAgenteDobleCheckbox.checked ? 1 : 0;
    const incluirSinPalabra = incluirSinPalabraCheckbox.checked;
    const temaSeleccionado = selectTema.value;
    
    // Validaciones
    const jugadoresActivos = Object.keys(await salaRef.once('value').then(s => s.val()?.jugadores || {})).length;
    if (numImpostores + numAgentes + (incluirSinPalabra ? 1 : 0) >= jugadoresActivos) {
        alert('ERROR: Demasiados roles especiales para la cantidad de jugadores.');
        return;
    }

    const nuevaConfiguracion = {
        numImpostores,
        numAgentes,
        incluirAgenteDoble: incluirAgenteDobleCheckbox.checked,
        incluirSinPalabra,
        temaSeleccionado
    };
    
    configuracionActual = nuevaConfiguracion; // Actualizar local
    
    await salaRef.child('configuracion').set(nuevaConfiguracion);
    alert('Configuración guardada.');
}

async function abandonarSala() {
    if (!codigoSalaActual) return;
    
    const salaRef = db.ref('salas/' + codigoSalaActual);
    const jugadorRef = db.ref('salas/' + codigoSalaActual + '/jugadores/' + miId);

    try {
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();
        
        if (!sala) return;
        
        const miJugador = sala.jugadores[miId];
        
        // 1. Si es Host y hay otros jugadores, transferir host
        if (miJugador.esHost) {
            const jugadoresArray = Object.values(sala.jugadores).filter(j => j.id !== miId);
            if (jugadoresArray.length > 0) {
                // Transferir Host al primero que quede
                const nuevoHost = jugadoresArray[0];
                await db.ref('salas/' + codigoSalaActual + '/jugadores/' + nuevoHost.id + '/esHost').set(true);
                await db.ref('salas/' + codigoSalaActual + '/hostId').set(nuevoHost.id);
            } else {
                // Si es el único, eliminar la sala
                await salaRef.remove();
            }
        }
        
        // 2. Eliminar al jugador de la sala
        await jugadorRef.remove();

    } catch (error) {
        console.error("Error al abandonar sala:", error);
    } finally {
        window.location.reload(); // Volver a la vista de inicio
    }
}

async function finalizarJuego(codigo) {
    if (!confirm('¿Estás seguro de que quieres CERRAR la sala? Esto desconectará a todos.')) return;
    await db.ref('salas/' + codigo).remove();
    window.location.reload();
}

async function reiniciarPartida(codigo) {
    const salaRef = db.ref('salas/' + codigo);
    const snapshot = await salaRef.once('value');
    const sala = snapshot.val();
    
    if (!sala) return;
    
    // Resetear roles y estado de eliminado
    const jugadoresActualizados = {};
    Object.values(sala.jugadores).forEach(j => {
        if (j.id !== 'abstencion') { // Asegurarse de no resetear el jugador "abstención"
            jugadoresActualizados[j.id] = {
                ...j,
                rol: 'Tripulante', // Rol temporal por defecto
                eliminado: false,
                palabraSecreta: null,
                tema: null
            };
        }
    });

    // Cambiar estado a esperando y resetear variables de juego
    await salaRef.update({
        estado: 'esperando',
        jugadores: jugadoresActualizados,
        palabraSecretaJuego: null,
        temaJuego: null,
        rondaVotacion: 0,
        votos: {},
        ultimoEliminado: null,
        ganador: null,
        mensajeGanador: null,
        claseGanador: null
    });
}


// =================================================================
// 9. LISTENERS (EVENTOS DOM)
// =================================================================

document.getElementById('form-inicio').addEventListener('submit', (e) => {
    e.preventDefault();
    if (nombreInput.value) {
        nombreDisplay.textContent = nombreInput.value;
        document.getElementById('mi-nombre-juego').textContent = nombreInput.value; // set for juego view
        cambiarVista('vista-seleccion');
    }
});

document.getElementById('btn-crear-sala').addEventListener('click', crearSala);
document.getElementById('form-unirse-sala').addEventListener('submit', (e) => {
    e.preventDefault();
    unirseASala();
});

// Listeners de Host en Lobby
document.getElementById('btn-guardar-configuracion').addEventListener('click', () => {
    guardarConfiguracion(codigoSalaActual);
});
btnIniciarJuego.addEventListener('click', () => {
    iniciarJuego(codigoSalaActual);
});

// Listener de Revelación de Rol
btnComenzarJuego.addEventListener('click', () => {
    db.ref('salas/' + codigoSalaActual).update({
        estado: 'jugando'
    });
});

// Listener de Juego (Iniciar Votación)
btnIniciarVotacion.addEventListener('click', () => {
    manejarInicioVotacion(codigoSalaActual);
});

// Listener de Votación (Finalizar Votación)
btnFinalizarVotacion.addEventListener('click', () => {
    manejarFinalizarVotacion(codigoSalaActual);
});

// Listeners de Resultado (Host)
btnReiniciarPartidaResultado.addEventListener('click', () => {
    // Si el juego está en resultado pero no ha terminado (no es finalizado)
    db.ref('salas/' + codigoSalaActual).update({
        estado: 'jugando', // Volver a la discusión
        votos: {},
        ultimoEliminado: null
    });
});
btnFinalizarJuegoResultado.addEventListener('click', () => {
    finalizarJuego(codigoSalaActual);
});

// Listeners de Final (Host)
btnReiniciarPartidaFinal.addEventListener('click', () => {
    reiniciarPartida(codigoSalaActual); // Volver a Lobby
});
btnFinalizarJuegoFinal.addEventListener('click', () => {
    finalizarJuego(codigoSalaActual);
});

// Listener para el formulario de adivinación del Impostor
if (adivinarForm) {
    adivinarForm.addEventListener('submit', manejarAdivinanza);
}