// public/cliente.js (CÓDIGO COMPLETO CON LÓGICA DE ADIVINACIÓN DEL IMPOSTOR)

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
let miId = localStorage.getItem('miId') || '';
let codigoSalaActual = '';
let salaListener = null; // Para guardar la referencia al listener de Firebase

// =================================================================
// 2. DATOS DEL JUEGO
// =================================================================
const PALABRAS_POR_TEMA = {
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Sushi', 'Pasta', 'Manzana', 'Pan', 'Té'],
    'Lugares 🗺️': ['Playa', 'Montaña', 'Ciudad', 'Bosque', 'Desierto', 'Museo', 'Escuela', 'Mercado'],
    'Objetos 💡': ['Lápiz', 'Teléfono', 'Silla', 'Coche', 'Reloj', 'Libro', 'Computadora', 'Botella'],
    'Héroes/Villanos 🦹': ['Batman', 'Superman', 'Joker', 'Thanos', 'IronMan', 'Hulk', 'WonderWoman', 'Flash']
};
const MAX_JUGADORES = 10;
const TIEMPO_VOTACION_SEGS = 30; // Tiempo en segundos para la fase de votación

// =================================================================
// 3. SELECTORES DE ELEMENTOS DEL DOM
// =================================================================
const vistas = document.querySelectorAll('.vista');

// VISTA INICIO
const formInicio = document.getElementById('form-inicio');
const inputNombre = document.getElementById('input-nombre');

// VISTA SELECCION
const nombreJugadorDisplay = document.getElementById('nombre-jugador-display');
const btnCrearSala = document.getElementById('btn-crear-sala');
const formUnirseSala = document.getElementById('form-unirse-sala');
const inputCodigo = document.getElementById('input-codigo');

// VISTA LOBBY
const codigoLobbyDisplay = document.getElementById('codigo-lobby-display');
const listaJugadoresLobby = document.getElementById('lista-jugadores-lobby');
const configuracionHost = document.getElementById('configuracion-host');
const selectTema = document.getElementById('select-tema');
const btnIniciarJuego = document.getElementById('btn-iniciar-juego');
const botonAbandonarLobby = document.getElementById('btn-abandonar-lobby');
const avisoJugadoresMin = document.getElementById('aviso-jugadores-min');

// VISTA REVELACION ROL
const revelacionTitulo = document.getElementById('revelacion-titulo');
const revelacionRol = document.getElementById('revelacion-rol');
const revelacionPalabra = document.getElementById('revelacion-palabra');
const revelacionDetalle = document.getElementById('revelacion-detalle');
const btnContinuarJuego = document.getElementById('btn-continuar-juego');

// VISTA JUEGO
const infoJugadorJuego = document.getElementById('info-jugador-juego');
const miRolJuego = document.getElementById('mi-rol-juego');
const miPalabraJuego = document.getElementById('mi-palabra-juego');
const listaJugadoresJuego = document.getElementById('lista-jugadores-juego');
const btnReportar = document.getElementById('btn-reportar');
const btnLlamarVotacion = document.getElementById('btn-llamar-votacion'); // El botón del host

// 📌 Selectores para la Lógica de Adivinación del Impostor
const containerAdivinacion = document.getElementById('container-adivinacion');
const inputPalabraAdivinar = document.getElementById('input-palabra-adivinar');
const btnAdivinarPalabra = document.getElementById('btn-adivinar-palabra');

// VISTA VOTACION
const listaJugadoresVotacion = document.getElementById('lista-jugadores-votacion');
const temporizadorDisplay = document.getElementById('temporizador-display');
const estadoVotoDisplay = document.getElementById('estado-voto-display');

// VISTA RESULTADO
const jugadorEliminadoDisplay = document.getElementById('jugador-eliminado-display');
const btnContinuarDiscursion = document.getElementById('btn-reiniciar-partida-resultado');
const btnFinalizarJuegoResultado = document.getElementById('btn-finalizar-juego-resultado');
const detallesVotacionContainer = document.getElementById('detalles-votacion-container');

// VISTA FINAL
const ganadorDisplay = document.getElementById('ganador-display');
const listaRolesFinal = document.getElementById('lista-roles-final');
const btnReiniciarPartidaFinal = document.getElementById('btn-reiniciar-partida-final');
const btnFinalizarJuegoFinal = document.getElementById('btn-finalizar-juego-final');


// =================================================================
// 4. FUNCIONES DE UTILIDAD Y VISTAS
// =================================================================

function generarCodigo(length = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function cambiarVista(idVista) {
    vistas.forEach(vista => {
        vista.classList.remove('activa');
        if (vista.id === idVista) {
            vista.classList.add('activa');
        }
    });
}

async function abandonarSala() {
    if (codigoSalaActual && miId) {
        try {
            // Detener el listener de la sala si existe
            if (salaListener) {
                db.ref(`salas/${codigoSalaActual}`).off('value', salaListener);
                salaListener = null;
            }

            const jugadorRef = db.ref(`salas/${codigoSalaActual}/jugadores/${miId}`);
            await jugadorRef.remove();
            
            // Si el host abandona, la sala se debe cerrar o transferir la hostía
            const salaRef = db.ref(`salas/${codigoSalaActual}`);
            const snapshot = await salaRef.once('value');
            const sala = snapshot.val();

            if (sala && sala.hostId === miId) {
                // Si el host actual es quien abandona
                // Filtra jugadores vivos y los que no son el jugador actual
                const jugadoresVivos = Object.values(sala.jugadores || {}).filter(j => j.id !== miId);
                if (jugadoresVivos.length > 0) {
                    // Transferir host a un nuevo jugador (el primero que quede)
                    const nuevoHost = jugadoresVivos[0];
                    await salaRef.update({ hostId: nuevoHost.id });
                    // No es necesario actualizar el esHost en el jugador porque se borrará al actual
                } else {
                    // Si no quedan jugadores, eliminar la sala
                    await salaRef.remove();
                }
            }
            
        } catch (error) {
            console.error("Error al abandonar la sala:", error);
        }
    }
    localStorage.removeItem('miId');
    miId = '';
    codigoSalaActual = '';
    window.location.reload(); // Volver a la pantalla de inicio
}

function seleccionarPalabras(tema) {
    const palabras = PALABRAS_POR_TEMA[tema];
    if (!palabras || palabras.length < 2) return null;

    // Seleccionar dos palabras al azar, una para el tripulante y una para el impostor
    let indicePalabra1 = Math.floor(Math.random() * palabras.length);
    let palabraTripulante = palabras[indicePalabra1];
    
    let indicePalabra2 = indicePalabra1;
    while (indicePalabra2 === indicePalabra1) {
        indicePalabra2 = Math.floor(Math.random() * palabras.length);
    }
    let palabraImpostor = palabras[indicePalabra2];

    return { palabraTripulante, palabraImpostor, tema };
}

function obtenerJugadorActual(sala) {
    return sala.jugadores ? sala.jugadores[miId] : null;
}

// =================================================================
// 5. LÓGICA DEL JUEGO (Host y General)
// =================================================================

// -----------------------------------------------------------------
// LÓGICA DE Adivinación del Impostor (NUEVA FUNCIÓN CLAVE)
// -----------------------------------------------------------------
async function manejarAdivinacionImpostor() {
    if (!codigoSalaActual || !miId) return;

    const palabraAdivinada = inputPalabraAdivinar.value.trim().toUpperCase();
    if (!palabraAdivinada) {
        return alert('Ingresa una palabra para adivinar.');
    }

    // 1. Deshabilitar botón para evitar spam
    btnAdivinarPalabra.disabled = true;

    try {
        const salaRef = db.ref(`salas/${codigoSalaActual}`);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();
        const jugador = obtenerJugadorActual(sala);

        if (!sala || !jugador || jugador.rol !== 'Impostor' || sala.estado !== 'juego') {
             btnAdivinarPalabra.disabled = false;
             return alert('ERROR: Acción no permitida en este momento.');
        }

        const palabraCorrecta = sala.palabraTripulante.toUpperCase();
        
        // 2. Chequear la adivinación
        if (palabraAdivinada === palabraCorrecta) {
            // ¡Adivinó! Ganan los Impostores.
            await salaRef.update({
                estado: 'final',
                ganador: 'Impostores',
                // Opcional: registrar el evento de adivinación
                evento: `El Impostor (${jugador.nombre}) ADIVINÓ la palabra secreta: "${palabraCorrecta}"` 
            });
            alert('¡FELICIDADES! ¡Has adivinado la palabra secreta!');
        } else {
            // Falló la adivinación. Impostor es eliminado y pierden.
            await db.ref(`salas/${codigoSalaActual}/jugadores/${miId}`).update({
                eliminado: true
            });
            
            // Chequear si esto termina el juego (si ya no quedan impostores)
            await chequearFinDeJuego(sala);

            alert(`Palabra incorrecta. Fuiste ELIMINADO por tu intento fallido: "${palabraAdivinada}"`);
        }

    } catch (error) {
        console.error("Error al manejar adivinación del Impostor:", error);
        alert(`🔴 ERROR: No se pudo procesar la adivinación. Detalle: ${error.message}`);
    } finally {
         inputPalabraAdivinar.value = ''; // Limpiar el input
         btnAdivinarPalabra.disabled = false; // Re-habilitar si es necesario
    }
}


async function manejarBotonReiniciar() {
    if (!codigoSalaActual) return alert('No estás en una sala.');
    
    try {
        const salaRef = db.ref(`salas/${codigoSalaActual}`);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        if (sala.hostId !== miId) return alert('Solo el Host puede reiniciar la partida.');

        // 1. Resetear el estado de los jugadores
        const jugadoresActualizados = {};
        Object.keys(sala.jugadores).forEach(id => {
            jugadoresActualizados[id] = {
                ...sala.jugadores[id],
                rol: 'Tripulante', // Rol base
                eliminado: false,
                palabraSecreta: null,
                voto: null,
                votoRecibido: 0 // Resetear conteo de votos
            };
        });

        // 2. Resetear el estado de la sala
        await salaRef.update({
            estado: 'esperando', // Vuelve al lobby
            palabraTripulante: null,
            palabraImpostor: null,
            tema: null,
            ganador: null, // Limpiar ganador anterior
            evento: null, // Limpiar evento anterior
            jugadores: jugadoresActualizados, // Aplicar el reseteo de jugadores
            votacion: {
                activa: false,
                temporizadorFin: null,
                jugadorLlamo: null,
                resultados: null
            }
        });

    } catch (error) {
        console.error("Error al reiniciar la partida:", error);
        alert(`🔴 ERROR: No se pudo reiniciar la partida. Detalle: ${error.message}`);
    }
}

async function finalizarJuego() {
    if (!codigoSalaActual) return alert('No estás en una sala.');

    try {
        const salaRef = db.ref(`salas/${codigoSalaActual}`);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        if (sala.hostId !== miId) return alert('Solo el Host puede finalizar el juego.');

        // Eliminar la sala completamente
        await salaRef.remove();
        
        // Limpieza local y vuelta al inicio
        codigoSalaActual = '';
        localStorage.removeItem('miId');
        miId = '';
        window.location.reload(); 

    } catch (error) {
        console.error("Error al finalizar el juego:", error);
        alert(`🔴 ERROR: No se pudo cerrar la sala. Detalle: ${error.message}`);
    }
}

async function iniciarJuego() {
    if (!codigoSalaActual) return alert('Error: No estás en una sala.');

    try {
        const salaRef = db.ref(`salas/${codigoSalaActual}`);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        if (sala.hostId !== miId) return alert('Solo el Host puede iniciar el juego.');

        const jugadoresArray = Object.values(sala.jugadores || {});
        if (jugadoresArray.length < 3) {
            return alert('Necesitas al menos 3 jugadores para iniciar.');
        }

        const temaSeleccionado = selectTema.value;
        if (!temaSeleccionado || !PALABRAS_POR_TEMA[temaSeleccionado]) {
            return alert('Por favor, selecciona un tema válido.');
        }

        const palabras = seleccionarPalabras(temaSeleccionado);
        if (!palabras) {
            return alert('Error al seleccionar las palabras. Revisa el tema.');
        }

        // Asignar roles: 1 Impostor, el resto Tripulantes
        const jugadoresIDs = Object.keys(sala.jugadores);
        const impostorID = jugadoresIDs[Math.floor(Math.random() * jugadoresIDs.length)];

        const updates = {
            estado: 'revelacion', // Primera fase: revelación de roles
            palabraTripulante: palabras.palabraTripulante,
            palabraImpostor: palabras.palabraImpostor,
            tema: palabras.tema,
            ganador: null, // Asegurar que esté limpio
            votacion: { // Resetear votación por si acaso
                activa: false, temporizadorFin: null, jugadorLlamo: null, resultados: null
            }
        };

        // Preparar las actualizaciones para cada jugador
        jugadoresIDs.forEach(id => {
            const esImpostor = id === impostorID;
            const rol = esImpostor ? 'Impostor' : 'Tripulante';
            const palabraSecreta = esImpostor ? palabras.palabraImpostor : palabras.palabraTripulante;

            updates[`jugadores/${id}/rol`] = rol;
            updates[`jugadores/${id}/palabraSecreta`] = palabraSecreta;
            updates[`jugadores/${id}/eliminado`] = false; // Resetear
            updates[`jugadores/${id}/voto`] = null; // Resetear
            updates[`jugadores/${id}/votoRecibido`] = 0; // Resetear
        });

        await salaRef.update(updates);

    } catch (error) {
        console.error("Error al iniciar el juego:", error);
        alert(`🔴 ERROR: No se pudo iniciar el juego. Detalle: ${error.message}`);
    }
}

async function manejarInicioVotacion() {
    if (!codigoSalaActual) return;
    
    try {
        const salaRef = db.ref(`salas/${codigoSalaActual}`);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        const jugador = obtenerJugadorActual(sala);
        if (jugador.eliminado || sala.estado !== 'juego') return;

        // Solo el Host puede llamar a votación
        if (sala.hostId !== miId) return alert('Solo el Host puede iniciar la votación.');

        const temporizadorFin = Date.now() + (TIEMPO_VOTACION_SEGS * 1000);

        await salaRef.update({
            estado: 'votacion',
            votacion: {
                activa: true,
                temporizadorFin: temporizadorFin,
                jugadorLlamo: miId,
                votos: {}, // Para rastrear quién votó por quién
                resultados: null
            }
        });
    } catch (error) {
        console.error("Error al iniciar votación:", error);
    }
}

async function votarJugador(jugadorIdVotado) {
    if (!codigoSalaActual || !miId) return;

    try {
        const salaRef = db.ref(`salas/${codigoSalaActual}`);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();
        const jugadorActual = obtenerJugadorActual(sala);

        // Validaciones básicas
        if (!sala || sala.estado !== 'votacion' || jugadorActual.eliminado) return;
        if (jugadorActual.voto !== null) return alert('Ya has votado en esta ronda.');
        if (jugadorIdVotado === miId) return alert('No puedes votar por ti mismo.');

        const jugadorVotado = sala.jugadores[jugadorIdVotado];
        if (!jugadorVotado || jugadorVotado.eliminado) return alert('Jugador no válido o ya eliminado.');

        // Registrar el voto
        const actualizaciones = {};
        actualizaciones[`jugadores/${miId}/voto`] = jugadorIdVotado;
        actualizaciones[`votacion/votos/${miId}`] = jugadorIdVotado; // Registrar en la sala quién votó

        await salaRef.update(actualizaciones);

        // Chequear si todos han votado
        const jugadoresVivos = Object.values(sala.jugadores).filter(j => !j.eliminado);
        const votosEmitidos = Object.keys(sala.votacion.votos || {}).length + 1; // +1 por el voto actual

        if (votosEmitidos >= jugadoresVivos.length) {
            await finalizarVotacion(sala);
        }

    } catch (error) {
        console.error("Error al votar:", error);
    }
}

async function finalizarVotacion(sala) {
    const salaRef = db.ref(`salas/${codigoSalaActual}`);
    const jugadores = Object.values(sala.jugadores);
    const jugadoresVivos = jugadores.filter(j => !j.eliminado);

    // Contar los votos
    const conteoVotos = {};
    const votosRegistrados = sala.votacion.votos || {};

    // Incluir los votos de los jugadores
    jugadoresVivos.forEach(jugador => {
        const votoPor = votosRegistrados[jugador.id] || jugador.voto; // Usar el voto de la BD o el del objeto local
        if (votoPor && jugadoresVivos.some(j => j.id === votoPor)) { // Asegurar que se vote por alguien vivo
            conteoVotos[votoPor] = (conteoVotos[votoPor] || 0) + 1;
        }
    });

    // Encontrar al más votado
    let jugadorMasVotadoId = null;
    let maxVotos = -1;

    Object.keys(conteoVotos).forEach(id => {
        if (conteoVotos[id] > maxVotos) {
            maxVotos = conteoVotos[id];
            jugadorMasVotadoId = id;
        } else if (conteoVotos[id] === maxVotos) {
            // Empate: no se elimina a nadie, o se elige al azar, o simplemente se salta la eliminación.
            jugadorMasVotadoId = 'EMPATE'; 
        }
    });

    let jugadorEliminado = null;

    if (jugadorMasVotadoId && jugadorMasVotadoId !== 'EMPATE') {
        jugadorEliminado = sala.jugadores[jugadorMasVotadoId];
        // Eliminar al jugador más votado en la base de datos
        await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorEliminado.id}/eliminado`).set(true);
    }

    // Actualizar el estado de la sala a 'resultado' y guardar resultados
    await salaRef.update({
        estado: 'resultado',
        votacion: {
            ...sala.votacion,
            activa: false,
            resultados: {
                conteo: conteoVotos,
                eliminadoId: jugadorEliminado ? jugadorEliminado.id : null,
                eliminadoNombre: jugadorEliminado ? jugadorEliminado.nombre : null,
                eliminadoRol: jugadorEliminado ? jugadorEliminado.rol : null,
                estado: jugadorMasVotadoId === 'EMPATE' ? 'EMPATE' : (jugadorEliminado ? 'ELIMINADO' : 'NADIE')
            }
        }
    });

    // Resetear votos de todos los jugadores locales para la próxima ronda
    const resetVotos = {};
    jugadores.forEach(j => {
         resetVotos[`jugadores/${j.id}/voto`] = null;
    });
    await salaRef.update(resetVotos);

    // Chequear fin de juego después de la eliminación
    const nuevaSalaSnapshot = await salaRef.once('value');
    await chequearFinDeJuego(nuevaSalaSnapshot.val());
}

async function chequearFinDeJuego(sala) {
    const jugadores = Object.values(sala.jugadores || {});
    const impostoresVivos = jugadores.filter(j => j.rol === 'Impostor' && !j.eliminado);
    const tripulantesVivos = jugadores.filter(j => j.rol !== 'Impostor' && !j.eliminado);

    let ganador = null;

    if (impostoresVivos.length === 0) {
        // Los impostores han sido eliminados
        ganador = 'Tripulantes';
    } else if (impostoresVivos.length >= tripulantesVivos.length) {
        // El número de impostores vivos iguala o supera al de tripulantes vivos
        ganador = 'Impostores';
    }

    if (ganador) {
        await db.ref(`salas/${codigoSalaActual}`).update({
            estado: 'final',
            ganador: ganador
        });
    }
}


// =================================================================
// 6. ACTUALIZACIONES DE UI BASADAS EN EL ESTADO DE LA SALA
// =================================================================

function actualizarLobby(sala) {
    const jugadores = Object.values(sala.jugadores || {});
    const soyHost = sala.hostId === miId;

    cambiarVista('vista-lobby');
    codigoLobbyDisplay.textContent = codigoSalaActual;

    // Actualizar lista de jugadores
    listaJugadoresLobby.innerHTML = jugadores.map(j => {
        const hostTag = j.id === sala.hostId ? ' (HOST)' : '';
        return `<li>${j.nombre}${hostTag}</li>`;
    }).join('');

    // Configuración del Host
    if (soyHost) {
        configuracionHost.style.display = 'block';
        btnIniciarJuego.disabled = jugadores.length < 3;
        avisoJugadoresMin.style.display = jugadores.length < 3 ? 'block' : 'none';

        // Llenar el select de temas la primera vez
        if (selectTema.options.length === 0) {
            Object.keys(PALABRAS_POR_TEMA).forEach(tema => {
                const option = document.createElement('option');
                option.value = tema;
                option.textContent = tema;
                selectTema.appendChild(option);
            });
            selectTema.value = 'Animales 🐾'; // Tema por defecto
        }

    } else {
        configuracionHost.style.display = 'none';
    }
}

function actualizarVistaRevelacion(sala) {
    const jugador = obtenerJugadorActual(sala);
    if (!jugador) return;

    cambiarVista('vista-revelacion-rol');

    if (jugador.rol === 'Impostor') {
        revelacionTitulo.textContent = '¡ERES EL IMPOSTOR! 😈';
        revelacionTitulo.style.color = 'var(--color-red)';
        revelacionRol.textContent = 'Tu palabra falsa es:';
        revelacionPalabra.textContent = jugador.palabraSecreta || 'Error';
        revelacionPalabra.style.color = 'var(--color-red)';
        revelacionDetalle.textContent = `Tu objetivo es adivinar la palabra secreta de los tripulantes antes de ser descubierto o eliminado.`;
    } else {
        revelacionTitulo.textContent = '¡ERES TRIPULANTE! 👷';
        revelacionTitulo.style.color = 'var(--color-green)';
        revelacionRol.textContent = 'La palabra secreta es:';
        revelacionPalabra.textContent = jugador.palabraSecreta || 'Error';
        revelacionPalabra.style.color = 'var(--color-green)';
        revelacionDetalle.textContent = `Tu objetivo es encontrar al jugador cuya palabra no coincide con la tuya.`;
    }
}

function actualizarVistaJuego(sala) {
    const jugador = obtenerJugadorActual(sala);
    if (!jugador) return;

    cambiarVista('vista-juego');

    miRolJuego.textContent = jugador.rol;
    miPalabraJuego.textContent = jugador.palabraSecreta || 'N/A';
    
    // Asignar color según el rol
    miRolJuego.className = jugador.rol === 'Impostor' ? 'rol impostor' : 'rol tripulante';

    // 📌 Lógica para el contenedor de Adivinación (solo Impostor)
    const esImpostor = jugador.rol === 'Impostor';
    containerAdivinacion.style.display = esImpostor ? 'block' : 'none';


    // Lógica para Host (Llamar votación)
    btnLlamarVotacion.style.display = sala.hostId === miId ? 'block' : 'none';

    // Lista de jugadores
    const jugadores = Object.values(sala.jugadores || {});
    listaJugadoresJuego.innerHTML = jugadores.map(j => {
        const estado = j.eliminado ? ' 💀 ELIMINADO' : ' 🟢 ACTIVO';
        const clase = j.eliminado ? 'eliminado' : '';
        return `<li class="${clase}">${j.nombre}${j.id === miId ? ' (Tú)' : ''}${estado}</li>`;
    }).join('');

    // Si el jugador fue eliminado, se queda en esta vista (o cambia a Final si el juego termina)
    if (jugador.eliminado) {
        infoJugadorJuego.innerHTML = `
            <h3>¡Has sido **eliminado**! 💀</h3>
            <p>Espera a que termine el juego.</p>
        `;
        containerAdivinacion.style.display = 'none'; // Asegurar que desaparezca si lo eliminaron
        btnLlamarVotacion.style.display = 'none';
        // Deshabilitar cualquier acción de juego
    } else {
        // Restaurar info del jugador si no fue eliminado
        infoJugadorJuego.innerHTML = `
            <p>Rol: <span id="mi-rol-juego" class="${jugador.rol === 'Impostor' ? 'rol impostor' : 'rol tripulante'}">${jugador.rol}</span></p>
            <p>Palabra: <strong id="mi-palabra-juego">${jugador.palabraSecreta || 'N/A'}</strong></p>
        `;
    }
}

let temporizadorInterval;

function actualizarVistaVotacion(sala) {
    const jugador = obtenerJugadorActual(sala);
    const votacion = sala.votacion;
    if (!jugador || !votacion || !votacion.activa) return;

    cambiarVista('vista-votacion');

    const tiempoRestante = Math.max(0, Math.floor((votacion.temporizadorFin - Date.now()) / 1000));
    temporizadorDisplay.textContent = `Tiempo restante: ${tiempoRestante}s`;

    // Si el jugador ya votó
    if (jugador.voto) {
        estadoVotoDisplay.textContent = `✅ Has votado por ${sala.jugadores[jugador.voto].nombre}`;
        estadoVotoDisplay.style.color = 'var(--color-green)';
    } else if (jugador.eliminado) {
        estadoVotoDisplay.textContent = '💀 Estás eliminado y no puedes votar.';
        estadoVotoDisplay.style.color = 'var(--color-red)';
    } else {
        estadoVotoDisplay.textContent = '⏳ ¡Selecciona al jugador que crees que es el Impostor!';
        estadoVotoDisplay.style.color = 'var(--color-text)';
    }

    // Actualizar la lista de jugadores para votar
    const jugadoresVivos = Object.values(sala.jugadores || {}).filter(j => !j.eliminado);
    listaJugadoresVotacion.innerHTML = jugadoresVivos.map(j => {
        // Deshabilitar si ya votó, si es él mismo, o si el jugador actual está eliminado
        const deshabilitado = jugador.voto !== null || j.id === miId || jugador.eliminado;
        const nombreDisplay = j.id === miId ? `${j.nombre} (Tú)` : j.nombre;
        const miVotoPorEl = jugador.voto === j.id ? ' (Tu Voto)' : '';
        const claseVoto = jugador.voto === j.id ? 'btn-principal' : 'btn-secundario';

        return `
            <li>
                <span>${nombreDisplay}${miVotoPorEl}</span>
                <button 
                    data-jugador-id="${j.id}" 
                    class="${claseVoto}"
                    ${deshabilitado ? 'disabled' : ''}>
                    Votar
                </button>
            </li>
        `;
    }).join('');


    // Lógica del temporizador (solo se inicia una vez)
    if (!temporizadorInterval) {
        temporizadorInterval = setInterval(async () => {
            const tiempoAhora = Date.now();
            const tiempoRestanteActual = Math.max(0, Math.floor((votacion.temporizadorFin - tiempoAhora) / 1000));
            temporizadorDisplay.textContent = `Tiempo restante: ${tiempoRestanteActual}s`;

            if (tiempoRestanteActual <= 0) {
                clearInterval(temporizadorInterval);
                temporizadorInterval = null;
                
                // Si el Host no está ya en la fase de resultado, fuerza la finalización
                if (sala.estado === 'votacion' && sala.hostId === miId) {
                    await finalizarVotacion(sala);
                }
            }
        }, 1000);
    }
}

function actualizarVistaResultado(sala) {
    const jugador = obtenerJugadorActual(sala);
    const votacion = sala.votacion;
    const resultados = votacion.resultados;

    if (!jugador || !votacion || !resultados) return;

    cambiarVista('vista-resultado');

    const conteo = resultados.conteo;
    
    // Mostrar detalles de votación
    const detallesVotosHTML = `
        <h4>Conteo de Votos</h4>
        <ul>
            ${Object.keys(conteo).map(jugadorId => `
                <li>${sala.jugadores[jugadorId].nombre}: <strong>${conteo[jugadorId]} votos</strong></li>
            `).join('')}
        </ul>
    `;
    detallesVotacionContainer.innerHTML = detallesVotosHTML;

    // Mostrar resultado de la eliminación
    const isHost = sala.hostId === miId;
    
    let mensaje = '';
    let colorClase = 'aviso-eliminado';

    if (resultados.estado === 'EMPATE') {
        mensaje = '🚨 ¡Empate! Nadie fue eliminado en esta ronda.';
        colorClase = 'aviso-eliminado aviso-naranja';
    } else if (resultados.eliminadoNombre) {
        const eliminado = sala.jugadores[resultados.eliminadoId];
        const rolEliminado = eliminado.rol;
        
        mensaje = `💥 ¡${resultados.eliminadoNombre} ha sido eliminado! Era ${rolEliminado}.`;
        
        if (rolEliminado === 'Impostor') {
            colorClase = 'aviso-eliminado aviso-green'; // Eliminaron al impostor!
        } else {
            colorClase = 'aviso-eliminado aviso-red'; // Eliminaron a un inocente
        }
    } else {
        mensaje = '😴 Votación inconclusa o nadie fue votado.';
        colorClase = 'aviso-eliminado aviso-naranja';
    }

    jugadorEliminadoDisplay.textContent = mensaje;
    jugadorEliminadoDisplay.className = colorClase; // Aplicar la clase para el color/estilo

    // Mostrar/Ocultar botones del Host
    const juegoTerminado = !!sala.ganador; // Si hay ganador, el juego terminó
    const accionesHost = document.getElementById('acciones-finales-host');

    if (isHost) {
        accionesHost.style.display = 'flex';
        btnFinalizarJuegoResultado.style.display = juegoTerminado ? 'block' : 'none';
        btnContinuarDiscursion.style.display = juegoTerminado ? 'none' : 'block';
    } else {
        accionesHost.style.display = 'none';
    }
}

function actualizarVistaFinal(sala) {
    const jugadores = Object.values(sala.jugadores || {});
    
    // Determinar ganador
    const ganador = sala.ganador || 'ERROR';
    let ganadorRol = '';
    
    if (ganador === 'Tripulantes') {
        ganadorRol = '¡GANAN LOS TRIPULANTES! 🥇';
        ganadorDisplay.style.color = 'var(--color-green)';
    } else if (ganador === 'Impostores') {
        ganadorRol = '¡GANAN LOS IMPOSTORES! 😈';
        ganadorDisplay.style.color = 'var(--color-red)';
    } else {
        ganadorRol = 'Juego Terminado';
        ganadorDisplay.style.color = 'var(--color-text)';
    }
    
    ganadorDisplay.textContent = ganadorRol;

    // Llenar lista final de roles
    listaRolesFinal.innerHTML = jugadores.map(j => {
        let rolDisplay = j.rol;
        let claseColor = j.rol === 'Impostor' ? 'impostor' : 'tripulante';
        let eliminadoTexto = j.eliminado ? ' 💀 (Eliminado)' : '';
        
        // Mostrar la palabra
        const palabraFinal = (j.palabraSecreta && j.rol === 'Tripulante') ? 
                             ` - Palabra Secreta: <span class="palabra-final">${sala.palabraTripulante}</span>` : 
                             (j.rol === 'Impostor' ? ` - Palabra Falsa: <span class="palabra-final">${sala.palabraImpostor}</span>` : '');

        return `
            <li class="${claseColor}">
                ${j.nombre}
                <span class="rol-final">${rolDisplay}</span>
                ${palabraFinal}
                ${eliminadoTexto}
            </li>
        `;
    }).join('');

    // Lógica de visibilidad de botones del Host en Vista Final
    const soyHost = sala.hostId === miId; 
    const accionesHostFinal = document.getElementById('acciones-finales-final-host');
    
    if (soyHost && sala.estado === 'final') {
        accionesHostFinal.style.display = 'flex';
        btnReiniciarPartidaFinal.style.display = 'block';
        btnFinalizarJuegoFinal.style.display = 'block';
    } else {
        accionesHostFinal.style.display = 'none';
    }

    cambiarVista('vista-final');
}


function configurarEscuchadorSala(codigo) {
    if (salaListener) {
        db.ref(`salas/${codigoSalaActual}`).off('value', salaListener);
    }
    codigoSalaActual = codigo;

    salaListener = db.ref(`salas/${codigo}`).on('value', (snapshot) => {
        const sala = snapshot.val();
        
        if (!sala) {
            alert('La sala fue cerrada por el Host.');
            abandonarSala();
            return;
        }

        const jugador = obtenerJugadorActual(sala);
        if (!jugador) {
             // Esto puede ocurrir si un jugador es removido de la sala
             if(sala.estado !== 'final') {
                alert('Fuiste removido de la sala.');
             }
             abandonarSala();
             return;
        }

        // Determinar la vista a mostrar
        switch (sala.estado) {
            case 'esperando':
                actualizarLobby(sala);
                break;
            case 'revelacion':
                actualizarVistaRevelacion(sala);
                break;
            case 'juego':
                actualizarVistaJuego(sala);
                break;
            case 'votacion':
                actualizarVistaVotacion(sala);
                break;
            case 'resultado':
                actualizarVistaResultado(sala);
                // Si el host finaliza el juego desde Resultado, esto llamará a actualizarVistaFinal
                if(sala.ganador) {
                   actualizarVistaFinal(sala);
                }
                break;
            case 'final':
                actualizarVistaFinal(sala);
                break;
            default:
                console.warn('Estado de sala desconocido:', sala.estado);
                break;
        }

        // Si el juego ha terminado, limpiar el temporizador de votación
        if (sala.estado === 'final' && temporizadorInterval) {
            clearInterval(temporizadorInterval);
            temporizadorInterval = null;
        }

    }, (error) => {
        console.error("Error en el listener de Firebase:", error);
    });
}


// =================================================================
// 7. MANEJADORES DE EVENTOS
// =================================================================

// Manejador para guardar el nombre y pasar a la selección de sala
formInicio.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();
    if (nombre) {
        localStorage.setItem('nombreJugador', nombre);
        nombreJugadorDisplay.textContent = nombre;
        
        // Generar un ID único (si no existe) y pasar a la vista de selección
        if (!miId) {
            miId = 'jugador_' + Date.now();
            localStorage.setItem('miId', miId);
        }

        // Si ya estaba en una sala, intentar reconectar
        if (codigoSalaActual) {
            db.ref(`salas/${codigoSalaActual}`).once('value').then(snapshot => {
                if (snapshot.exists() && snapshot.val().jugadores[miId]) {
                    configurarEscuchadorSala(codigoSalaActual);
                } else {
                    cambiarVista('vista-seleccion');
                }
            }).catch(() => {
                cambiarVista('vista-seleccion');
            });
        } else {
            cambiarVista('vista-seleccion');
        }
    }
});

// Manejador para crear sala
btnCrearSala.addEventListener('click', async () => {
    const nombreJugador = localStorage.getItem('nombreJugador');
    if (!nombreJugador) return alert('Por favor, ingresa tu nombre primero.');
    
    let codigo = generarCodigo();
    
    try {
        // Asegurar que el código sea único (simple chequeo)
        while ((await db.ref(`salas/${codigo}`).once('value')).exists()) {
            codigo = generarCodigo();
        }

        const nuevaSala = {
            hostId: miId,
            estado: 'esperando',
            tema: 'Animales 🐾', // Por defecto
            palabraTripulante: null,
            palabraImpostor: null,
            ganador: null,
            votacion: {
                activa: false,
                temporizadorFin: null,
                jugadorLlamo: null,
                resultados: null
            },
            jugadores: {
                [miId]: {
                    id: miId,
                    nombre: nombreJugador,
                    esHost: true,
                    rol: 'Tripulante',
                    eliminado: false,
                    palabraSecreta: null
                }
            }
        };

        await db.ref(`salas/${codigo}`).set(nuevaSala);
        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;

    } catch (error) {
        console.error("Error al crear la sala en Firebase:", error);
        alert(`🔴 ERROR AL CREAR SALA: Fallo de red o de permisos. Detalle: ${error.message}`);
    }
});

// Manejador para unirse a una sala existente
formUnirseSala.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = inputCodigo.value.trim().toUpperCase();
    const nombreJugador = localStorage.getItem('nombreJugador');
    if (!nombreJugador) return alert('Por favor, ingresa tu nombre primero.');
    if (codigo.length !== 4) return alert('El código debe tener 4 letras.');

    try {
        const salaRef = db.ref('salas/' + codigo);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        if (!snapshot.exists()) {
            return alert('ERROR: La sala con el código ' + codigo + ' no existe.');
        }

        if (sala.estado !== 'esperando') {
            // Permitir que el jugador se una si ya estaba en la sala y el juego inició
            const jugadorExistente = sala.jugadores && sala.jugadores[miId];
            if (!jugadorExistente) {
                return alert('ERROR: El juego ya inició o la sala está cerrada.');
            }
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
             // No enviamos hostId al jugador, ya está en la sala.
        };
        
        const jugadoresRef = db.ref('salas/' + codigo + '/jugadores/' + miId);
        await jugadoresRef.set(nuevoJugador);

        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;

    } catch (error) {
        console.error("Error al unirse a la sala en Firebase:", error);
        alert(`🔴 ERROR AL UNIRSE: ${error.message}`);
    }
});

// Manejador del botón "Abandonar Lobby"
botonAbandonarLobby.addEventListener('click', () => {
    abandonarSala();
});

// Manejador para iniciar el juego (Host)
btnIniciarJuego.addEventListener('click', async () => {
    iniciarJuego();
});

// Manejador para llamar a la votación (Host)
btnLlamarVotacion.addEventListener('click', async () => {
    manejarInicioVotacion();
});

// Manejador para continuar después de la revelación de rol
btnContinuarJuego.addEventListener('click', () => {
    cambiarVista('vista-juego'); // Pasa al estado de juego para iniciar la discusión
});

// Manejador para votar por un jugador en la fase de votación
listaJugadoresVotacion.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.jugadorId) {
        votarJugador(e.target.dataset.jugadorId);
    }
});

// Manejador para continuar después de la votación (Host)
btnContinuarDiscursion.addEventListener('click', async () => {
    // Solo el Host puede hacer esto (protegido en la UI y en la lógica)
    const salaRef = db.ref(`salas/${codigoSalaActual}`);
    // Chequear si el juego ya terminó (en caso de que la votación eliminara al último impostor/tripulante)
    const snapshot = await salaRef.once('value');
    const sala = snapshot.val();
    
    if (sala.ganador) {
        await actualizarVistaFinal(sala);
    } else {
        await salaRef.update({
            estado: 'juego', // Volver al estado de juego/discusión
            votacion: null // Limpiar los datos de votación
        });
    }
});

// Manejador para Finalizar Juego desde la vista Resultado
btnFinalizarJuegoResultado.addEventListener('click', () => finalizarJuego());


// LISTENERS PARA BOTONES DEL HOST EN VISTA FINAL
btnReiniciarPartidaFinal.addEventListener('click', () => manejarBotonReiniciar());
btnFinalizarJuegoFinal.addEventListener('click', () => finalizarJuego());

// 📌 Listener para el botón de Adivinación del Impostor
btnAdivinarPalabra.addEventListener('click', () => {
    manejarAdivinacionImpostor();
});