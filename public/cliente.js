// public/cliente.js (CÓDIGO COMPLETO Y CORREGIDO PARA EL JUEGO DEL IMPOSTOR)

// =================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// =================================================================

// ⚠️ REEMPLAZA ESTO CON TUS CREDENCIALES REALES DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBFWEizn6Nn1iDkvZr2FkN3Vfn7IWGIuG0", 
    authDomain: "juego-impostor-firebase.firebaseapp.com",
    databaseURL: "https://juego-impostor-firebase-default-rtdb.firebaseio.com",
    projectId: "juego-impostor-firebase",
    storageBucket: "juego-impostor-firebase.firebasestorage.app",
    messagingSenderId: "337084843090",
    appId: "1:337084843090:web:41b0ebafd8a21f1420cb8b"
};

// Inicialización
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const miId = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'jugador_' + Math.random().toString(36).substring(2, 9);


// =================================================================
// 2. CONSTANTES Y VARIABLES GLOBALES
// =================================================================
const MIN_JUGADORES = 3; 
const MAX_JUGADORES = 10;
let nombreJugador = '';
let codigoSalaActual = null;
let miRol = 'Tripulante'; // Variable para guardar el rol del cliente actual

const PALABRAS_POR_TEMA = {
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Café'],
    'Objetos 💡': ['Lápiz', 'Teléfono', 'Silla', 'Botella', 'Ventana', 'Libro', 'Reloj', 'Moneda'],
};


// =================================================================
// 3. UTILIDADES GENERALES (DOM y Firebase)
// =================================================================

/** Cambia la vista activa del juego. */
function cambiarVista(vistaId) {
    document.querySelectorAll('.vista').forEach(vista => {
        vista.classList.remove('activa');
    });
    document.getElementById(vistaId).classList.add('activa');
}

/** Genera un código de 4 letras aleatorias. */
function generarCodigoSala() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let codigo = '';
    for (let i = 0; i < 4; i++) {
        codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
}

/** Se ejecuta cuando un jugador abandona la sala o la sala es cerrada. */
async function abandonarSala() {
    if (!codigoSalaActual) {
        window.location.reload();
        return;
    }
    
    try {
        const salaRef = db.ref('salas/' + codigoSalaActual);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        if (sala && sala.jugadores && sala.jugadores[miId]) {
            if (sala.jugadores[miId].esHost) {
                // Si es el Host, borrar toda la sala
                await salaRef.remove();
                alert('La sala ha sido cerrada.');
            } else {
                // Si es un jugador, solo se borra de la lista
                await db.ref('salas/' + codigoSalaActual + '/jugadores/' + miId).remove();
            }
        }
    } catch (error) {
        console.error("Error al abandonar/cerrar la sala:", error);
    } finally {
        // Detener el listener de la sala
        if (codigoSalaActual) {
            db.ref('salas/' + codigoSalaActual).off();
            codigoSalaActual = null;
        }
        window.location.reload(); // Volver al inicio
    }
}


// =================================================================
// 4. LÓGICA DEL LOBBY (HOST y UNIRSE)
// =================================================================

/**
 * Genera una nueva sala, se une como Host y configura el escuchador.
 */
async function crearSala() {
    const nombreHost = nombreJugador || 'Host_' + miId.substring(8);
    let codigo = generarCodigoSala();
    const salaRef = db.ref('salas/' + codigo);
    
    // Asegurar que el código no exista
    let snapshot = await salaRef.once('value');
    while (snapshot.exists()) {
        codigo = generarCodigoSala();
        snapshot = await db.ref('salas/' + codigo).once('value');
    }

    try {
        const nuevoJugador = { 
            id: miId, 
            nombre: nombreHost, 
            esHost: true, 
            rol: 'Host', 
            eliminado: false,
            palabraSecreta: null,
            tema: null,
            voto: null
        };

        const nuevaSala = {
            codigo: codigo,
            hostId: miId,
            estado: 'esperando', // esperando, jugando, votando, resultado, final
            temaActual: null,
            palabraSecreta: null,
            palabraImpostor: null,
            jugadores: {
                [miId]: nuevoJugador
            }
        };

        await salaRef.set(nuevaSala);
        
        // Configurar la UI de Host
        document.getElementById('tema-seleccion').innerHTML = Object.keys(PALABRAS_POR_TEMA).map(tema => 
            `<option value="${tema}">${tema}</option>`
        ).join('');
        
        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;
        document.getElementById('configuracion-host').style.display = 'block';
        
    } catch (error) {
        console.error("Error al crear la sala en Firebase:", error);
        alert(`🔴 ERROR AL CREAR SALA: ${error.message}`);
    }
}

/**
 * Se une a una sala existente como jugador.
 */
async function unirseASala(codigo) {
    if (!nombreJugador) {
        return alert('Por favor, ingresa tu nombre primero.');
    }
    codigo = codigo.toUpperCase();
    
    try {
        const salaRef = db.ref('salas/' + codigo);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        if (!snapshot.exists() || !sala) {
            return alert('ERROR: La sala con el código ' + codigo + ' no existe.');
        }

        if (sala.estado !== 'esperando') {
            return alert('ERROR: El juego ya inició o la sala está cerrada.');
        }
        
        const numJugadores = Object.keys(sala.jugadores || {}).length;
        if (numJugadores >= MAX_JUGADORES) {
             return alert('ERROR: La sala está llena. ¡Máximo ' + MAX_JUGADORES + ' jugadores!');
        }

        // Crear objeto de jugador con valores por defecto
        const nuevoJugador = { 
             id: miId, 
             nombre: nombreJugador, 
             esHost: false, 
             rol: 'Tripulante', // Se actualiza al iniciar el juego
             eliminado: false,
             palabraSecreta: null,
             tema: null,
             voto: null
        };
        
        // Agregar jugador a la base de datos
        const jugadoresRef = db.ref('salas/' + codigo + '/jugadores/' + miId);
        await jugadoresRef.set(nuevoJugador);

        // Configurar la interfaz de jugador
        document.getElementById('configuracion-host').style.display = 'none';
        
        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;

    } catch (error) {
        console.error("Error al unirse a la sala en Firebase:", error);
        alert(`🔴 ERROR AL UNIRSE: ${error.message}`);
    }
}


// =================================================================
// 5. ESCUCHADOR DE SALA (El Motor del Juego)
// =================================================================

/**
 * Configura el listener de cambios en la sala de Firebase.
 * Esta función es el corazón de la sincronización.
 */
function configurarEscuchadorSala(codigo) {
    if (codigoSalaActual) {
        // Limpiar el escuchador anterior
        db.ref('salas/' + codigoSalaActual).off(); 
    }
    codigoSalaActual = codigo;
    
    // Escuchar cambios en toda la sala
    db.ref('salas/' + codigo).on('value', (snapshot) => {
        const sala = snapshot.val();
        
        if (!sala || sala.estado === 'cerrada') {
            // La sala fue eliminada o cerrada por el Host
            if (codigoSalaActual) {
                 db.ref('salas/' + codigoSalaActual).off();
                 codigoSalaActual = null;
                 alert('La sala ha sido cerrada por el Host.');
                 window.location.reload();
            }
            return;
        }
        
        // Obtener la información del jugador actual
        const miJugador = sala.jugadores ? sala.jugadores[miId] : null;

        if (!miJugador && sala.estado !== 'esperando') {
            // Si el jugador no existe y el juego inició, puede haber sido eliminado
            alert('Has sido expulsado o el juego ya inició sin ti.');
            window.location.reload();
            return;
        }

        // 1. LÓGICA DE ACTUALIZACIÓN DE LOBBY (estado: 'esperando')
        if (sala.estado === 'esperando') {
            actualizarLobby(sala);
            // Si el jugador está en el lobby pero no en la lista de jugadores (posiblemente un error de sync), lo forzamos a recargar.
            if (!miJugador) {
                 cambiarVista('vista-seleccion'); // Volver a la selección por si puede re-unirse
            }
        }
        
        // 2. LÓGICA DE INICIO DE PARTIDA (estado: 'jugando')
        if (sala.estado === 'jugando') {
            cambiarVista('vista-revelacion-rol');
            if (miJugador.rol !== 'revelado') {
                mostrarMiRol(miJugador.rol, miJugador.palabraSecreta, sala.temaActual, miJugador.esHost);
            }
            // Después de la revelación, pasa a la vista de discusión (temporizador o botón de Host)
            setTimeout(() => {
                cambiarVista('vista-juego');
                actualizarVistaJuego(sala);
            }, 7000); // 7 segundos para ver el rol
        }
        
        // 3. LÓGICA DE VOTACIÓN (estado: 'votando')
        if (sala.estado === 'votando') {
            cambiarVista('vista-votacion');
            manejarVotacion(sala);
        }
        
        // 4. LÓGICA DE RESULTADOS (estado: 'resultado')
        if (sala.estado === 'resultado') {
            cambiarVista('vista-resultado');
            manejarResultadoVotacion(sala);
        }
        
        // 5. LÓGICA DE FIN DEL JUEGO (estado: 'final')
        if (sala.estado === 'final') {
            cambiarVista('vista-final');
            manejarFinDeJuego(sala);
        }
    });
}

/**
 * Actualiza la lista de jugadores y el estado del botón de inicio.
 * 🔴 CORRECCIÓN CRÍTICA DE SINCRONIZACIÓN AQUÍ
 */
function actualizarLobby(sala) {
    const listaJugadoresElement = document.getElementById('lista-jugadores-lobby');
    
    // 🔴 CORRECCIÓN: Limpiar la lista de jugadores actual antes de rellenarla
    listaJugadoresElement.innerHTML = ''; 

    const jugadores = sala.jugadores || {};
    const nombresJugadores = []; 
    
    Object.values(jugadores).forEach(jugador => {
        if (!jugador.eliminado) { // Solo mostrar jugadores no eliminados en el lobby
            nombresJugadores.push(jugador.nombre);
            
            const li = document.createElement('li');
            
            let estadoTexto = '';
            if (jugador.esHost) {
                estadoTexto = ' (HOST)';
                li.classList.add('host');
            }
            
            li.textContent = jugador.nombre + estadoTexto;
            listaJugadoresElement.appendChild(li);
        }
    });

    // Actualizar el contador de jugadores
    document.getElementById('contador-jugadores').textContent = nombresJugadores.length;

    // Lógica para mostrar/ocultar el botón de iniciar partida del Host
    const esHost = (miId === sala.hostId);
    if (esHost) {
        const puedeIniciar = (nombresJugadores.length >= MIN_JUGADORES);
        const btnIniciar = document.getElementById('btn-iniciar-partida');
        btnIniciar.style.display = puedeIniciar ? 'block' : 'none';
        btnIniciar.disabled = !puedeIniciar;
        if (btnIniciar.disabled) {
            btnIniciar.textContent = `Necesitas al menos ${MIN_JUGADORES} jugadores`;
        } else {
             btnIniciar.textContent = '🚀 Iniciar Partida';
        }

        // Mostrar el botón de finalizar juego al Host en el lobby
        document.getElementById('btn-finalizar-juego-lobby').style.display = 'block';

    } else {
        // Ocultar botones de Host para los clientes
        document.getElementById('configuracion-host').style.display = 'none';
        document.getElementById('btn-finalizar-juego-lobby').style.display = 'none';
    }
}


// =================================================================
// 6. LÓGICA DE INICIO DE JUEGO (Host)
// =================================================================

/**
 * Reparte roles y palabras secretas y actualiza la sala en Firebase.
 */
function repartirRolesYPalabras(jugadores, tema, palabraSecreta, palabraImpostor) {
    const idsJugadores = Object.keys(jugadores).filter(id => !jugadores[id].esHost); // Excluir al Host si está en la lista pero no juega
    
    // Elegir Impostor(es)
    // Para simplificar, elegiremos 1 impostor
    const idImpostor = idsJugadores[Math.floor(Math.random() * idsJugadores.length)];

    const jugadoresActualizados = {};
    Object.values(jugadores).forEach(jugador => {
        let rolAsignado = 'Tripulante';
        let palabraAsignada = palabraSecreta;

        // Asignar rol de Impostor
        if (jugador.id === idImpostor) {
            rolAsignado = 'Impostor';
            palabraAsignada = palabraImpostor;
        }

        // Asignar rol de Doble Agente (Opcional)
        // if (jugadores.length > 7 && Math.random() < 0.1 && jugador.id !== idImpostor) {
        //     rolAsignado = 'Doble Agente';
        //     palabraAsignada = palabraSecreta;
        // }

        jugadoresActualizados[jugador.id] = {
            ...jugador,
            rol: rolAsignado,
            palabraSecreta: palabraAsignada,
            tema: tema,
            voto: null
        };
    });

    return jugadoresActualizados;
}


/**
 * Inicia la partida (solo el Host).
 */
async function iniciarPartida() {
    if (miId !== codigoSalaActual) { // Solo el Host puede hacer esto (el hostId es el mismo que el código de sala en el caso de host)
        return; 
    }
    const tema = document.getElementById('tema-seleccion').value;
    if (!tema) {
         return alert('Por favor, selecciona un tema.');
    }
    
    const palabras = PALABRAS_POR_TEMA[tema].slice();
    const palabraIndex = Math.floor(Math.random() * palabras.length);
    const palabraSecreta = palabras[palabraIndex];
    
    // Quitar la palabra secreta y elegir la del impostor
    palabras.splice(palabraIndex, 1);
    const palabraImpostor = palabras[Math.floor(Math.random() * palabras.length)];

    const salaRef = db.ref('salas/' + codigoSalaActual);
    const snapshot = await salaRef.once('value');
    const sala = snapshot.val();

    if (!sala || sala.estado !== 'esperando') {
        return alert('Error: La sala no está en estado de espera.');
    }

    // Repartir roles
    const jugadoresActualizados = repartirRolesYPalabras(sala.jugadores, tema, palabraSecreta, palabraImpostor);

    // Actualizar sala en Firebase
    await salaRef.update({
        estado: 'jugando', // Inicia la fase de revelación
        temaActual: tema,
        palabraSecreta: palabraSecreta,
        palabraImpostor: palabraImpostor,
        jugadores: jugadoresActualizados
    });
}


// =================================================================
// 7. LÓGICA DE JUEGO (Revelación de Rol y Discusión)
// =================================================================

/**
 * Muestra el rol y la palabra secreta al jugador actual.
 */
function mostrarMiRol(rol, palabra, tema, esHost) {
    const tituloElement = document.getElementById('revelacion-titulo');
    const detalleElement = document.getElementById('revelacion-detalle');
    const cajaRol = document.querySelector('#vista-revelacion-rol .caja-rol');

    cajaRol.classList.remove('impostor', 'tripulante', 'host');
    
    let colorClase = 'tripulante';
    let textoRol = rol;
    let textoPalabra = `Palabra Clave: <strong>${palabra}</strong>`;
    
    if (rol === 'Impostor') {
        colorClase = 'impostor';
        textoRol = '¡ERES EL IMPOSTOR! 😈';
        textoPalabra = `Tu Palabra Falsa es: <strong>${palabra}</strong>`;
    } else if (esHost) {
         // El Host no necesita revelar rol si es solo observador/administrador.
         colorClase = 'host';
         textoRol = 'MODERADOR (HOST)';
         textoPalabra = `Tema Secreto: <strong>${tema}</strong>. Palabra Real: <strong>${palabra}</strong>. Palabra Impostor: <strong>${db.ref('salas/' + codigoSalaActual).once('value').then(s => s.val().palabraImpostor)}</strong>.`;
    }

    cajaRol.classList.add(colorClase);
    tituloElement.textContent = textoRol;
    detalleElement.innerHTML = `
        <p>El tema de esta partida es: **${tema}**</p>
        <p>${textoPalabra}</p>
        <p class="aviso-importante" style="color: var(--color-primary-glow);">Memoriza tu rol y palabra antes de la discusión.</p>
    `;

    // Marcar como revelado para que no se repita en el listener
    db.ref('salas/' + codigoSalaActual + '/jugadores/' + miId).update({ rol: 'revelado' });
}


/**
 * Actualiza la información y el estado en la vista de juego.
 */
function actualizarVistaJuego(sala) {
    const miJugador = sala.jugadores[miId];
    
    // Actualizar info del jugador actual
    document.getElementById('info-rol-juego').textContent = miJugador.rol;
    document.getElementById('info-palabra-juego').textContent = miJugador.palabraSecreta;
    document.getElementById('info-tema-juego').textContent = sala.temaActual;
    
    // Ocultar la palabra del impostor
    if (miJugador.rol === 'Impostor') {
        document.getElementById('info-palabra-juego').textContent = miJugador.palabraSecreta + ' (Tu palabra falsa)';
    }

    // Mostrar el botón de Votación al Host
    if (miId === sala.hostId) {
        document.getElementById('btn-iniciar-votacion').style.display = 'block';
    } else {
        document.getElementById('btn-iniciar-votacion').style.display = 'none';
    }
}


// =================================================================
// 8. LÓGICA DE VOTACIÓN Y RESULTADOS
// =================================================================

/**
 * Muestra los botones de votación (solo para jugadores no eliminados).
 */
function manejarVotacion(sala) {
    const miJugador = sala.jugadores[miId];
    const listaVotacion = document.getElementById('lista-jugadores-votacion');
    listaVotacion.innerHTML = '';

    if (!miJugador || miJugador.eliminado) {
        document.getElementById('estado-voto').textContent = 'Estás eliminado y no puedes votar. Espera los resultados.';
        document.getElementById('lista-jugadores-votacion').innerHTML = '';
        return;
    }
    
    // Mostrar estado de voto
    if (miJugador.voto) {
        document.getElementById('estado-voto').textContent = `🗳️ Has votado por: ${miJugador.voto}`;
        document.getElementById('estado-voto').style.display = 'block';
        listaVotacion.innerHTML = '<h2>Esperando que todos voten...</h2>';
        return;
    } else {
         document.getElementById('estado-voto').style.display = 'none';
    }


    const jugadoresVivos = Object.values(sala.jugadores).filter(j => !j.eliminado);

    jugadoresVivos.forEach(jugador => {
        // No puede votarse a sí mismo
        if (jugador.id !== miId) { 
            const li = document.createElement('li');
            li.innerHTML = `<button class="btn-voto" data-id="${jugador.id}">${jugador.nombre}</button>`;
            listaVotacion.appendChild(li);
        }
    });

    // Añadir listener a los botones de voto
    listaVotacion.querySelectorAll('.btn-voto').forEach(button => {
        button.addEventListener('click', async (e) => {
            const idVotado = e.target.getAttribute('data-id');
            await votarJugador(idVotado);
        });
    });
}

/**
 * Registra el voto en Firebase.
 */
async function votarJugador(idVotado) {
    if (!codigoSalaActual) return;
    
    try {
        await db.ref(`salas/${codigoSalaActual}/jugadores/${miId}`).update({
            voto: idVotado 
        });
    } catch (error) {
        console.error('Error al registrar voto:', error);
        alert('Hubo un error al registrar tu voto.');
    }
}

/**
 * Inicia la fase de votación (solo Host).
 */
async function iniciarVotacion() {
    if (miId !== codigoSalaActual) return;

    try {
        // Limpiar votos anteriores y cambiar a estado 'votando'
        const salaRef = db.ref('salas/' + codigoSalaActual);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();
        
        if (sala.estado !== 'jugando' && sala.estado !== 'resultado') {
            return alert('Error: Solo puedes iniciar la votación durante la discusión o después de un resultado.');
        }

        // Limpiar votos de todos los jugadores
        const updates = { estado: 'votando' };
        Object.values(sala.jugadores).forEach(jugador => {
            updates[`jugadores/${jugador.id}/voto`] = null;
        });
        
        await salaRef.update(updates);
    } catch (error) {
        console.error('Error al iniciar votación:', error);
        alert('Hubo un error al iniciar la votación.');
    }
}

/**
 * Procesa los votos y actualiza la UI de resultado (Host y Cliente).
 */
function manejarResultadoVotacion(sala) {
    const jugadores = sala.jugadores || {};
    const conteoVotos = {};
    const jugadoresVivos = Object.values(jugadores).filter(j => !j.eliminado);
    let jugadorEliminadoId = null;
    let maxVotos = 0;
    
    // 1. Contar votos
    Object.values(jugadores).forEach(jugador => {
        if (jugador.voto) {
            conteoVotos[jugador.voto] = (conteoVotos[jugador.voto] || 0) + 1;
        }
    });

    // 2. Determinar al más votado
    Object.keys(conteoVotos).forEach(id => {
        if (conteoVotos[id] > maxVotos) {
            maxVotos = conteoVotos[id];
            jugadorEliminadoId = id;
        } else if (conteoVotos[id] === maxVotos) {
            // Empate: nadie es eliminado
            jugadorEliminadoId = 'empate';
        }
    });

    const jugadorEliminado = jugadores[jugadorEliminadoId];
    const jugadorEliminadoDisplay = document.getElementById('jugador-eliminado-display');
    const detallesVotacionContainer = document.getElementById('detalles-votacion-container');

    // 3. Mostrar conteo de votos
    detallesVotacionContainer.innerHTML = '<h4>Resumen de Votación</h4>';
    jugadoresVivos.forEach(jugador => {
        const votosRecibidos = conteoVotos[jugador.id] || 0;
        detallesVotacionContainer.innerHTML += `<p>${jugador.nombre}: <strong>${votosRecibidos} votos</strong></p>`;
    });


    // 4. Mostrar resultado
    jugadorEliminadoDisplay.classList.remove('aviso-eliminado-impostor', 'aviso-eliminado-tripulante', 'aviso-eliminado-empate');
    
    if (jugadorEliminadoId === 'empate' || !jugadorEliminadoId) {
        jugadorEliminadoDisplay.textContent = '¡Nadie fue eliminado! Hubo un EMPATE. Continúen la discusión.';
        jugadorEliminadoDisplay.classList.add('aviso-eliminado-empate');
    } else {
        const rolEliminado = jugadorEliminado.rol === 'revelado' ? 'Tripulante' : jugadorEliminado.rol; // Asumimos tripulante si el rol es 'revelado' después de asignación
        
        jugadorEliminadoDisplay.textContent = `¡${jugadorEliminado.nombre} ha sido eliminado! Su rol era: ${rolEliminado}.`;

        if (rolEliminado === 'Impostor') {
            jugadorEliminadoDisplay.classList.add('aviso-eliminado-impostor');
        } else {
            jugadorEliminadoDisplay.classList.add('aviso-eliminado-tripulante');
        }
        
        // 5. El Host debe actualizar Firebase si hubo eliminación
        if (miId === sala.hostId && jugadorEliminadoId !== 'empate') {
            db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorEliminadoId}`).update({
                eliminado: true 
            });
        }
    }
    
    // 6. Botones de acción del Host
    const accionesHost = document.getElementById('acciones-finales-host');
    if (miId === sala.hostId) {
        accionesHost.style.display = 'flex';
        // Determinar si el juego debe terminar o continuar
        const resultadoFinal = chequearFinDeJuego(sala, jugadorEliminadoId);

        if (resultadoFinal.juegoTerminado) {
             // Si el juego terminó, el host solo puede finalizar
             document.getElementById('btn-reiniciar-partida-resultado').style.display = 'none';
             document.getElementById('btn-finalizar-juego-resultado').style.display = 'block';
             
             // Actualizar el estado de la sala a 'final'
             if (sala.estado !== 'final') {
                 db.ref('salas/' + codigoSalaActual).update({
                    estado: 'final',
                    ganador: resultadoFinal.ganador
                 });
             }
        } else {
             // Si el juego continúa, el host puede volver a discusión
             document.getElementById('btn-reiniciar-partida-resultado').style.display = 'block';
             document.getElementById('btn-finalizar-juego-resultado').style.display = 'none';
        }
    } else {
         accionesHost.style.display = 'none';
    }
}


/**
 * Chequea si las condiciones de victoria se cumplen.
 */
function chequearFinDeJuego(sala, ultimoEliminadoId) {
    const jugadoresVivos = Object.values(sala.jugadores).filter(j => !j.eliminado && j.id !== ultimoEliminadoId);
    
    const impostoresVivos = jugadoresVivos.filter(j => j.rol === 'Impostor').length;
    const tripulantesVivos = jugadoresVivos.filter(j => j.rol === 'Tripulante' || j.rol === 'Doble Agente').length;
    
    const resultado = {
        juegoTerminado: false,
        ganador: null
    };

    // Condición de Victoria 1: Impostores superan o igualan a Tripulantes (incluyendo al eliminado, si no era impostor)
    if (impostoresVivos >= tripulantesVivos) {
        resultado.juegoTerminado = true;
        resultado.ganador = 'IMPOSTORES';
        return resultado;
    }

    // Condición de Victoria 2: El último eliminado era el Impostor (y no quedan más)
    const impostorEliminado = ultimoEliminadoId !== 'empate' && sala.jugadores[ultimoEliminadoId].rol === 'Impostor';
    if (impostorEliminado && impostoresVivos === 0) {
        resultado.juegoTerminado = true;
        resultado.ganador = 'TRIPULANTES';
        return resultado;
    }
    
    return resultado;
}

/**
 * Muestra el ganador y los roles finales.
 */
function manejarFinDeJuego(sala) {
    document.getElementById('ganador-display').textContent = `🏆 ¡GANAN LOS ${sala.ganador}! 🏆`;

    const listaRoles = document.getElementById('lista-roles-final');
    listaRoles.innerHTML = '';

    Object.values(sala.jugadores).forEach(jugador => {
        if (!jugador.esHost) {
            const li = document.createElement('li');
            const rolFinal = jugador.rol === 'revelado' ? 'Tripulante' : jugador.rol; // Asumir Tripulante si el rol está 'revelado'
            
            li.textContent = `${jugador.nombre}: ${rolFinal} (${jugador.palabraSecreta})`;
            li.classList.add(rolFinal.toLowerCase().replace(/\s/g, '-')); // 'Impostor' -> 'impostor', 'Tripulante' -> 'tripulante'
            
            listaRoles.appendChild(li);
        }
    });

     // Botones de acción del Host
    if (miId === sala.hostId) {
        document.getElementById('acciones-finales-final-host').style.display = 'flex';
    } else {
        document.getElementById('acciones-finales-final-host').style.display = 'none';
    }
}


/**
 * Reinicia la partida con los mismos jugadores, volviendo al lobby. (Solo Host)
 */
async function reiniciarPartida() {
    if (miId !== codigoSalaActual) return;

    const salaRef = db.ref('salas/' + codigoSalaActual);
    const snapshot = await salaRef.once('value');
    const sala = snapshot.val();

    if (!sala) return;

    // Resetear jugadores
    const jugadoresReseteados = {};
    Object.values(sala.jugadores).forEach(jugador => {
        jugadoresReseteados[jugador.id] = {
            ...jugador,
            rol: 'Tripulante', // Rol por defecto, se asigna al iniciar
            eliminado: false,
            palabraSecreta: null,
            tema: null,
            voto: null
        };
    });

    // Resetear sala
    await salaRef.update({
        estado: 'esperando',
        temaActual: null,
        palabraSecreta: null,
        palabraImpostor: null,
        jugadores: jugadoresReseteados
    });
    
    // El listener se encarga de cambiar la vista a 'vista-espera-lobby'
}

/**
 * Elimina la sala de Firebase. (Solo Host)
 */
async function finalizarJuego() {
    if (miId !== codigoSalaActual) return;
    if (confirm('¿Estás seguro de que quieres FINALIZAR y ELIMINAR la sala para todos?')) {
        await db.ref('salas/' + codigoSalaActual).remove();
        // El listener se encarga de forzar la recarga en todos los clientes
    }
}


// =================================================================
// 9. EVENT LISTENERS
// =================================================================

// 1. Manejar el envío del nombre inicial
document.getElementById('form-inicio').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputNombre = document.getElementById('input-nombre').value.trim();
    if (inputNombre) {
        nombreJugador = inputNombre;
        document.getElementById('nombre-jugador-display').textContent = nombreJugador;
        cambiarVista('vista-seleccion');
    }
});

// 2. Manejar la creación de sala (Host)
document.getElementById('btn-crear-sala').addEventListener('click', crearSala);

// 3. Manejar la acción de unirse a sala
document.getElementById('form-unirse-sala').addEventListener('submit', (e) => {
    e.preventDefault();
    const codigo = document.getElementById('input-codigo').value.trim();
    if (codigo.length === 4) {
        unirseASala(codigo);
    } else {
        alert('El código de sala debe tener 4 caracteres.');
    }
});

// 4. Botón de iniciar partida (Host)
document.getElementById('btn-iniciar-partida').addEventListener('click', iniciarPartida);

// 5. Botón de iniciar votación (Host - desde vista-juego)
document.getElementById('btn-iniciar-votacion').addEventListener('click', iniciarVotacion);

// 6. Botones de acción del Host tras el resultado
document.getElementById('btn-reiniciar-partida-resultado').addEventListener('click', async () => {
    // Tras eliminación, volvemos a la discusión (estado 'jugando')
    await db.ref('salas/' + codigoSalaActual).update({
        estado: 'jugando'
    });
    // El listener se encarga de cambiar a 'vista-juego'
});
document.getElementById('btn-finalizar-juego-resultado').addEventListener('click', finalizarJuego);

// 7. Botones de acción del Host tras el final del juego
document.getElementById('btn-reiniciar-partida-final').addEventListener('click', reiniciarPartida);
document.getElementById('btn-finalizar-juego-final').addEventListener('click', finalizarJuego);

// 8. Botón de finalizar juego en el lobby
document.getElementById('btn-finalizar-juego-lobby').addEventListener('click', finalizarJuego);

// 9. Manejar la función de votar al hacer clic en un jugador
// Nota: El listener de los botones .btn-voto se añade DENTRO de manejarVotacion()
// porque la lista cambia dinámicamente.