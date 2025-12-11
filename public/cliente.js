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

// =================================================================
// 2. DATOS DEL JUEGO
// =================================================================
const PALABRAS_POR_TEMA = {
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín', 'Conejo', 'Toro'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana', 'Sopa', 'Brócoli'],
    'Países 🌍': ['España', 'México', 'Canadá', 'Japón', 'Chile', 'Francia', 'India', 'Italia', 'Perú', 'Alemania'],
    'Oficios 🧑‍🔧': ['Doctor', 'Profesor', 'Ingeniero', 'Chef', 'Piloto', 'Bombero', 'Policía', 'Artista', 'Abogado', 'Cartero']
};
const MAX_JUGADORES = 10;
const MIN_JUGADORES = 4;

// =================================================================
// 3. VARIABLES GLOBALES / INICIALIZACIÓN DE FIREBASE
// =================================================================
let db;
let salaListener;
let miId = Date.now().toString(36) + Math.random().toString(36).substr(2); // ID único para el jugador
let nombreJugador = '';
let codigoSalaActual = ''; 
let jugadoresActuales = []; // Cache local de los jugadores
let configuracionActual = {
    tema: Object.keys(PALABRAS_POR_TEMA)[0],
    numImpostores: 1,
    numAgentes: 0,
    incluirAgenteDoble: false
};

// =================================================================
// 4. FUNCIONES DE UTILIDAD
// =================================================================

function generarCodigoSala() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function cambiarVista(vistaId) {
    document.querySelectorAll('.vista').forEach(vista => {
        vista.classList.remove('activa');
    });
    document.getElementById(vistaId).classList.add('activa');
    // Reinicia el scroll al cambiar de vista
    window.scrollTo(0, 0); 
}

function obtenerNumRoles(jugadores) {
    const numTripulantes = jugadores.filter(j => j.rol === 'Tripulante' && !j.eliminado).length;
    const numImpostores = jugadores.filter(j => j.rol === 'Impostor' && !j.eliminado).length;
    const numAgentes = jugadores.filter(j => j.rol === 'Agente' && !j.eliminado).length;
    const numAgentesDoble = jugadores.filter(j => j.rol === 'Agente Doble' && !j.eliminado).length;
    
    return {
        tripulantes: numTripulantes,
        impostores: numImpostores,
        agentes: numAgentes,
        agentesDoble: numAgentesDoble,
        tripulantesYAgentesActivos: numTripulantes + numAgentes + numAgentesDoble
    };
}

function chequearFinDeJuego(jugadores) {
    const { impostores, tripulantesYAgentesActivos } = obtenerNumRoles(jugadores);

    let ganador = null;
    let estadoFin = 'en_juego';

    if (impostores === 0 && tripulantesYAgentesActivos > 0) {
        ganador = 'Tripulantes';
        estadoFin = 'terminado';
    } else if (impostores > tripulantesYAgentesActivos) {
        ganador = 'Impostores';
        estadoFin = 'terminado';
    } else if (impostores > 0 && tripulantesYAgentesActivos === 0) {
        // En caso de que se eliminen todos los tripulantes/agentes a la vez que el último impostor
        ganador = 'Impostores'; 
        estadoFin = 'terminado';
    }
    
    return {
        estado: estadoFin,
        ganador: ganador
    };
}


// =================================================================
// 5. FUNCIONES DE LÓGICA DE SALA
// =================================================================

async function crearSala() {
    const codigo = generarCodigoSala();
    const jugadoresRef = db.ref('salas/' + codigo);
    
    try {
        const nuevoJugador = { 
            id: miId, 
            nombre: nombreJugador, 
            esHost: true, 
            rol: 'Tripulante', 
            eliminado: false,
            palabraSecreta: null,
            tema: null,
            hostId: miId
        };

        await jugadoresRef.set({
            codigo: codigo,
            estado: 'esperando', // 'esperando', 'revelacion', 'jugando', 'votacion', 'resultado', 'terminado'
            hostId: miId,
            configuracion: configuracionActual,
            jugadores: {
                [miId]: nuevoJugador
            },
            votos: null,
            eliminadoVotacion: null,
            ganador: null
        });

        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;
        // La actualización de la vista y la interfaz de host se hará en actualizarLobby

    } catch (error) {
        console.error("Error al crear la sala en Firebase:", error);
        alert(`🔴 ERROR AL CREAR SALA: ${error.message}`);
    }
}

async function unirseASala(codigo) {
    codigo = codigo.toUpperCase();
    const salaRef = db.ref('salas/' + codigo);
    
    try {
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
             hostId: sala.hostId // Guardamos el hostId para mostrar los botones de host
        };
        
        const jugadoresRef = db.ref('salas/' + codigo + '/jugadores/' + miId);
        await jugadoresRef.set(nuevoJugador);

        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;
        // La actualización de la vista se hará en actualizarLobby

    } catch (error) {
        console.error("Error al unirse a la sala en Firebase:", error);
        alert(`🔴 ERROR AL UNIRSE: ${error.message}`);
    }
}

async function abandonarSala() {
    if (!codigoSalaActual || !miId) {
        return cambiarVista('vista-inicio');
    }

    try {
        const jugadorRef = db.ref(`salas/${codigoSalaActual}/jugadores/${miId}`);
        await jugadorRef.remove();
        
        // Si era host, la sala se borra o se le asigna a otro jugador (opcional, por ahora solo borramos)
        const salaRef = db.ref('salas/' + codigoSalaActual);
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        if (sala && sala.hostId === miId) {
            // El host abandona: eliminar la sala
            await salaRef.remove();
        }

    } catch (error) {
        console.error("Error al abandonar sala:", error);
        // Continuar de todas formas
    } finally {
        if (salaListener) {
            db.ref('salas/' + codigoSalaActual).off('value', salaListener);
            salaListener = null;
        }
        codigoSalaActual = '';
        jugadoresActuales = [];
        cambiarVista('vista-inicio');
        window.location.reload(); // Recargar para limpiar todo el estado
    }
}

// =================================================================
// 6. FUNCIONES DE ACTUALIZACIÓN DE VISTA (RENDER)
// =================================================================

function actualizarLobby(sala) {
    jugadoresActuales = Object.values(sala.jugadores || {});
    const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost || false;
    const numJugadores = jugadoresActuales.length;
    const isJuegoIniciado = sala.estado !== 'esperando';
    const isReadyToStart = numJugadores >= MIN_JUGADORES;

    document.getElementById('info-host-display').style.display = esHost ? 'block' : 'none';
    document.getElementById('config-host-container').style.display = esHost ? 'flex' : 'none';
    document.getElementById('btn-iniciar-juego').style.display = esHost && isReadyToStart && !isJuegoIniciado ? 'block' : 'none';
    document.getElementById('max-jugadores-display').textContent = MAX_JUGADORES;

    // Actualizar configuración del Host (si es Host)
    if (esHost && sala.configuracion) {
        const config = sala.configuracion;
        document.getElementById('select-tema').value = config.tema;
        document.getElementById('input-impostores').value = config.numImpostores;
        document.getElementById('input-agentes').value = config.numAgentes;
        document.getElementById('checkbox-doble-agente').checked = config.incluirAgenteDoble;

        // Limitar los máximos de impostores y agentes según el número de jugadores
        const maxImpostores = Math.max(1, Math.floor(numJugadores / 3));
        const maxAgentes = Math.floor(numJugadores / 2) - 1; // Máximo agentes que caben
        document.getElementById('input-impostores').max = maxImpostores;
        document.getElementById('input-impostores').min = 1;
        document.getElementById('input-agentes').max = maxAgentes;
        document.getElementById('input-agentes').min = 0;
    }

    // Actualizar lista de jugadores
    const listaJugadoresLobby = document.getElementById('lista-jugadores-lobby');
    listaJugadoresLobby.innerHTML = '';
    jugadoresActuales.sort((a, b) => (a.esHost === b.esHost) ? 0 : a.esHost ? -1 : 1)
                     .forEach(j => {
        const esMiJugador = j.id === miId;
        const hostTag = j.esHost ? '<span class="tag tag-host">HOST</span>' : '';
        const yoTag = esMiJugador ? '<span class="tag tag-yo">TÚ</span>' : '';
        const li = document.createElement('li');
        li.innerHTML = `${j.nombre} ${hostTag} ${yoTag}`;
        listaJugadoresLobby.appendChild(li);
    });

    document.getElementById('contador-jugadores-lobby').textContent = numJugadores;
    
    if (sala.estado === 'esperando') {
        cambiarVista('vista-lobby');
    }
}

function actualizarRevelacionRol(jugador) {
    const rolDisplay = document.getElementById('revelacion-titulo');
    const palabraDisplay = document.getElementById('palabra-secreta-display');
    const detalleDisplay = document.getElementById('revelacion-detalle');
    const cajaRol = document.querySelector('.caja-rol');

    cajaRol.classList.remove('impostor-bg', 'agente-bg', 'agente-doble-bg');
    palabraDisplay.style.display = 'block';

    if (jugador.rol === 'Impostor') {
        rolDisplay.textContent = 'Tu Rol: ¡IMPOSTOR!';
        palabraDisplay.textContent = `La palabra a ADIVINAR es: ${jugador.palabraSecreta}`;
        detalleDisplay.textContent = 'Tu misión es descubrir la palabra secreta de los demás sin ser detectado. ¡Sé sutil!';
        cajaRol.classList.add('impostor-bg');
    } else if (jugador.rol === 'Agente') {
        rolDisplay.textContent = 'Tu Rol: AGENTE';
        palabraDisplay.textContent = `La palabra secreta es: ${jugador.palabraSecreta}`;
        detalleDisplay.textContent = 'Tienes la palabra secreta. Tu misión es ayudar al Tripulante a identificar al Impostor.';
        cajaRol.classList.add('agente-bg');
    } else if (jugador.rol === 'Agente Doble') {
        rolDisplay.textContent = 'Tu Rol: ¡AGENTE DOBLE!';
        palabraDisplay.textContent = `La palabra secreta es: ${jugador.palabraSecreta}`;
        detalleDisplay.textContent = 'Tienes la palabra, pero si eres el último en pie con el Impostor, ¡ganan los Impostores!';
        cajaRol.classList.add('agente-doble-bg');
    } else { // Tripulante
        rolDisplay.textContent = 'Tu Rol: TRIPULANTE';
        palabraDisplay.textContent = `La palabra secreta es: ${jugador.palabraSecreta}`;
        detalleDisplay.textContent = 'Tienes la palabra secreta. Tu misión es identificar al Impostor.';
    }

    cambiarVista('vista-revelacion-rol');
}

function actualizarVistaJuego(sala) {
    jugadoresActuales = Object.values(sala.jugadores || {});
    const miJugador = jugadoresActuales.find(j => j.id === miId);
    const esHost = miJugador?.esHost || false;
    const isVotacion = sala.estado === 'votacion';
    const numJugadoresActivos = jugadoresActuales.filter(j => !j.eliminado).length;

    // 1. Actualizar info personal
    const rolTag = document.getElementById('rol-juego-display');
    const palabraTag = document.getElementById('palabra-juego-display');

    rolTag.textContent = miJugador ? `ROL: ${miJugador.rol.toUpperCase()}` : '';
    palabraTag.textContent = miJugador?.palabraSecreta ? `PALABRA: ${miJugador.palabraSecreta}` : '';

    rolTag.className = 'rol-juego-tag';
    if (miJugador?.rol === 'Impostor') rolTag.classList.add('tag-impostor');
    else if (miJugador?.rol === 'Agente') rolTag.classList.add('tag-agente');
    else if (miJugador?.rol === 'Agente Doble') rolTag.classList.add('tag-agente-doble');
    else rolTag.classList.add('tag-tripulante');


    // 2. Actualizar lista de jugadores y botones de voto
    const listaJugadoresJuego = document.getElementById('lista-jugadores-juego');
    listaJugadoresJuego.innerHTML = '';
    
    jugadoresActuales
        .sort((a, b) => (a.nombre > b.nombre) ? 1 : -1)
        .forEach(j => {
        if (j.id !== miId) { // No listar al propio jugador
            const li = document.createElement('li');
            li.id = `jugador-juego-${j.id}`;
            li.innerHTML = `${j.nombre}`;

            if (j.eliminado) {
                li.classList.add('eliminado');
                li.innerHTML += '<span class="tag tag-eliminado">ELIMINADO</span>';
            } else if (isVotacion && !miJugador.eliminado && !sala.votos?.[miId]) {
                // Si estamos en votación, el jugador no está eliminado y no ha votado, mostrar botón
                const btnVoto = document.createElement('button');
                btnVoto.className = 'btn-votar';
                btnVoto.textContent = `Votar por ${j.nombre}`;
                btnVoto.onclick = () => votarJugador(j.id);
                li.appendChild(btnVoto);
            }
            listaJugadoresJuego.appendChild(li);
        }
    });

    document.getElementById('contador-jugadores-juego').textContent = numJugadoresActivos;

    // 3. Control de la interfaz de votación/discusión
    document.getElementById('panel-votacion').style.display = miJugador?.eliminado ? 'none' : 'block';
    document.getElementById('contenedor-mensaje-host').style.display = sala.estado === 'jugando' && !miJugador?.eliminado ? 'block' : 'none';

    document.getElementById('btn-iniciar-votacion').style.display = 
        esHost && sala.estado === 'jugando' && numJugadoresActivos > 2 ? 'block' : 'none';
        
    document.getElementById('aviso-votacion-host-display').style.display = 
        isVotacion && esHost && !miJugador?.eliminado ? 'block' : 'none';

    document.getElementById('aviso-voto-realizado').style.display = 
        isVotacion && miJugador?.id && sala.votos?.[miJugador.id] ? 'block' : 'none';

    // 4. Cambiar vista (solo si no estamos en votación o revelación)
    if (sala.estado === 'jugando' || sala.estado === 'votacion') {
        cambiarVista('vista-juego');
    }
}

function actualizarResultados(sala) {
    const eliminadoDisplay = document.getElementById('jugador-eliminado-display');
    const detallesContainer = document.getElementById('detalles-votacion-container');
    const miJugador = jugadoresActuales.find(j => j.id === miId);
    const esHost = miJugador?.esHost || false;
    
    // Limpiar y mostrar detalles de la votación
    detallesContainer.innerHTML = '<h4>Conteo de Votos:</h4>';
    if (sala.votos) {
        const conteoVotos = {};
        Object.values(sala.votos).forEach(votoId => {
            conteoVotos[votoId] = (conteoVotos[votoId] || 0) + 1;
        });

        const votosOrdenados = Object.entries(conteoVotos)
            .sort(([, a], [, b]) => b - a);

        votosOrdenados.forEach(([jugadorId, votos]) => {
            const jugadorVotado = jugadoresActuales.find(j => j.id === jugadorId);
            if (jugadorVotado) {
                const p = document.createElement('p');
                p.textContent = `🗳️ ${jugadorVotado.nombre}: ${votos} voto(s)`;
                detallesContainer.appendChild(p);
            }
        });
    }

    // Mostrar el resultado de la eliminación
    const jugadorEliminado = jugadoresActuales.find(j => j.id === sala.eliminadoVotacion);
    if (jugadorEliminado) {
        eliminadoDisplay.textContent = `¡${jugadorEliminado.nombre} ha sido eliminado! Su rol era: ${jugadorEliminado.rol.toUpperCase()}`;
        eliminadoDisplay.style.color = jugadorEliminado.rol === 'Impostor' ? 'var(--color-impostor-neon)' : 'var(--color-tripulante-neon)';
        eliminadoDisplay.style.borderColor = jugadorEliminado.rol === 'Impostor' ? 'var(--color-impostor-neon)' : 'var(--color-tripulante-neon)';
        eliminadoDisplay.style.boxShadow = `0 0 10px ${jugadorEliminado.rol === 'Impostor' ? 'var(--color-impostor-glow)' : 'var(--color-tripulante-glow)'}`;
    } else {
        eliminadoDisplay.textContent = '¡Nadie ha sido eliminado en esta votación!';
        eliminadoDisplay.style.color = 'var(--color-secondary-neon)';
        eliminadoDisplay.style.borderColor = 'var(--color-secondary-neon)';
        eliminadoDisplay.style.boxShadow = `0 0 10px var(--color-secondary-glow)`;
    }

    // Control de botones de Host
    const finJuego = chequearFinDeJuego(jugadoresActuales);
    const btnContinuar = document.getElementById('btn-reiniciar-partida-resultado');
    const btnFinalizar = document.getElementById('btn-finalizar-juego-resultado');

    btnContinuar.style.display = esHost && finJuego.estado === 'en_juego' ? 'block' : 'none';
    btnFinalizar.style.display = esHost && finJuego.estado !== 'en_juego' ? 'block' : 'none';

    cambiarVista('vista-resultado');
}

function actualizarVistaFinal(sala) {
    const ganadorDisplay = document.getElementById('ganador-display');
    const listaRolesFinal = document.getElementById('lista-roles-final');
    const miJugador = jugadoresActuales.find(j => j.id === miId);
    const esHost = miJugador?.esHost || false;

    ganadorDisplay.textContent = `🏆 ¡GANARON LOS ${sala.ganador.toUpperCase()}! 🏆`;
    
    document.getElementById('acciones-finales-final-host').style.display = esHost ? 'flex' : 'none';

    listaRolesFinal.innerHTML = '';
    jugadoresActuales.forEach(j => {
        const li = document.createElement('li');
        li.textContent = `${j.nombre} - ${j.rol.toUpperCase()}`;
        
        li.classList.remove('impostor', 'agente', 'agente-doble', 'tripulante'); // Limpiar antes
        if (j.rol === 'Impostor') li.classList.add('impostor');
        else if (j.rol === 'Agente') li.classList.add('agente');
        else if (j.rol === 'Agente Doble') li.classList.add('agente-doble');
        else li.classList.add('tripulante');

        if (j.eliminado) {
             li.innerHTML += ' <span class="tag tag-eliminado">(ELIMINADO)</span>';
        }
        listaRolesFinal.appendChild(li);
    });
    
    cambiarVista('vista-final');
}


// =================================================================
// 7. LISTENERS DE FIREBASE
// =================================================================

function configurarEscuchadorSala(codigo) {
    if (salaListener) {
        db.ref('salas/' + codigoSalaActual).off('value', salaListener); // Desconectar listener anterior
    }

    codigoSalaActual = codigo;
    const salaRef = db.ref('salas/' + codigo);
    
    // Listener principal
    salaListener = salaRef.on('value', (snapshot) => {
        const sala = snapshot.val();
        if (!sala) {
            // Si la sala fue eliminada (ej: host abandonó)
            alert('La sala ha sido cerrada por el Host o ya no existe.');
            abandonarSala();
            return;
        }

        const miJugador = Object.values(sala.jugadores || {}).find(j => j.id === miId);
        if (!miJugador) {
            // Fui eliminado de la lista de jugadores (ej: kick o desconexión del host)
            alert('Has sido retirado de la sala.');
            abandonarSala();
            return;
        }
        
        jugadoresActuales = Object.values(sala.jugadores || {});

        // Manejo del estado del juego
        switch (sala.estado) {
            case 'esperando':
                actualizarLobby(sala);
                break;
            case 'revelacion':
                actualizarRevelacionRol(miJugador);
                break;
            case 'jugando':
            case 'votacion':
                actualizarVistaJuego(sala);
                break;
            case 'resultado':
                actualizarResultados(sala);
                break;
            case 'terminado':
                actualizarVistaFinal(sala);
                break;
        }
    }, (error) => {
        console.error("Error en listener de sala:", error);
        alert('🔴 Error de conexión con la sala. Reconectando...');
    });
}


// =================================================================
// 8. FUNCIONES DE LÓGICA DE JUEGO (HOST)
// =================================================================

async function iniciarJuego() {
    if (jugadoresActuales.length < MIN_JUGADORES) {
        return alert(`Se necesitan al menos ${MIN_JUGADORES} jugadores para iniciar.`);
    }

    const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
    if (!esHost) return alert('Solo el Host puede iniciar el juego.');

    try {
        const salaRef = db.ref('salas/' + codigoSalaActual);
        const { tema, numImpostores, numAgentes, incluirAgenteDoble } = configuracionActual;
        
        const palabraTripulantes = PALABRAS_POR_TEMA[tema][Math.floor(Math.random() * PALABRAS_POR_TEMA[tema].length)];
        const palabraImpostores = palabraTripulantes; // Mismo tema, Impostor no tiene palabra secreta, solo adivina.

        let rolesAsignados = [];
        let jugadoresBarajados = [...jugadoresActuales].sort(() => Math.random() - 0.5);

        // 1. Asignar Impostores
        for (let i = 0; i < numImpostores; i++) {
            jugadoresBarajados[i].rol = 'Impostor';
            jugadoresBarajados[i].palabraSecreta = palabraImpostores;
            rolesAsignados.push(jugadoresBarajados[i]);
        }
        
        // 2. Asignar Agente Doble (máximo 1)
        let agenteDobleAsignado = false;
        if (incluirAgenteDoble) {
            const index = jugadoresBarajados.findIndex(j => j.rol === 'Tripulante' || j.rol === 'Agente');
             if (index !== -1 && index >= numImpostores) { // Asegurar que no sea impostor y haya espacio
                jugadoresBarajados[index].rol = 'Agente Doble';
                rolesAsignados.push(jugadoresBarajados[index]);
                agenteDobleAsignado = true;
             }
        }
        
        // 3. Asignar Agentes (solo si hay espacio y no se asignó un Agente Doble)
        let agentesRestantes = numAgentes;
        if (agenteDobleAsignado) {
            agentesRestantes = Math.max(0, numAgentes - 1);
        }

        for (let i = 0; i < agentesRestantes; i++) {
            const index = jugadoresBarajados.findIndex(j => j.rol === 'Tripulante'); // Buscar el siguiente tripulante
            if (index !== -1 && index >= numImpostores) { 
                jugadoresBarajados[index].rol = 'Agente';
                rolesAsignados.push(jugadoresBarajados[index]);
            }
        }

        // 4. Asignar Tripulantes al resto
        jugadoresBarajados.forEach(j => {
            if (j.rol === 'Tripulante') {
                j.palabraSecreta = palabraTripulantes;
            }
            j.tema = tema;
            j.eliminado = false; // Reset de eliminado
        });

        // 5. Actualizar Firebase
        const actualizaciones = {};
        jugadoresBarajados.forEach(j => {
            actualizaciones[`jugadores/${j.id}`] = {
                ...j,
                esHost: jugadoresActuales.find(oldJ => oldJ.id === j.id)?.esHost || false, // Mantener host
                voto: null
            };
        });

        actualizaciones['estado'] = 'revelacion';
        actualizaciones['votos'] = null;
        actualizaciones['eliminadoVotacion'] = null;
        actualizaciones['ganador'] = null;
        actualizaciones['configuracion'] = configuracionActual; // Guardar la config final

        await salaRef.update(actualizaciones);

    } catch (error) {
        console.error("Error al iniciar juego:", error);
        alert(`🔴 ERROR AL INICIAR JUEGO: ${error.message}`);
    }
}

async function hostPasarADiscusion() {
    const salaRef = db.ref('salas/' + codigoSalaActual);
    await salaRef.update({ estado: 'jugando' });
}

async function hostIniciarVotacion() {
    const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
    if (!esHost) return alert('Solo el Host puede iniciar la votación.');

    const salaRef = db.ref('salas/' + codigoSalaActual);
    await salaRef.update({ 
        estado: 'votacion',
        votos: null // Limpiar votos de la ronda anterior
    });
}

async function votarJugador(jugadorVotadoId) {
    if (!codigoSalaActual || !miId) return;

    const miJugador = jugadoresActuales.find(j => j.id === miId);
    if (!miJugador || miJugador.eliminado) return alert('No puedes votar si estás eliminado.');

    try {
        const votoRef = db.ref(`salas/${codigoSalaActual}/votos/${miId}`);
        await votoRef.set(jugadorVotadoId);
        // El listener de la sala manejará el cambio de vista/estado cuando todos hayan votado
    } catch (error) {
        console.error("Error al votar:", error);
        alert(`🔴 ERROR AL VOTAR: ${error.message}`);
    }
}

// Esta función es llamada internamente en el listener después de un voto si todos votaron
async function manejarFinDeVotacion(sala) {
    if (sala.estado !== 'votacion') return;

    const jugadoresActivos = jugadoresActuales.filter(j => !j.eliminado);
    const numVotantes = jugadoresActivos.length;
    const numVotos = Object.keys(sala.votos || {}).length;

    if (numVotos < numVotantes) {
        return; // Aún faltan votos
    }

    const conteoVotos = {};
    Object.values(sala.votos).forEach(votoId => {
        conteoVotos[votoId] = (conteoVotos[votoId] || 0) + 1;
    });

    let maxVotos = 0;
    let candidatosAEliminar = [];

    // Encontrar el jugador o jugadores con más votos
    for (const jugadorId in conteoVotos) {
        const votos = conteoVotos[jugadorId];
        if (votos > maxVotos) {
            maxVotos = votos;
            candidatosAEliminar = [jugadorId];
        } else if (votos === maxVotos) {
            candidatosAEliminar.push(jugadorId);
        }
    }

    let eliminadoId = null;
    let actualizaciones = { estado: 'resultado' };

    if (candidatosAEliminar.length === 1) {
        // Hay un único más votado, eliminarlo
        eliminadoId = candidatosAEliminar[0];
        actualizaciones[`jugadores/${eliminadoId}/eliminado`] = true;
        actualizaciones['eliminadoVotacion'] = eliminadoId;
        
        // Chequear si el juego terminó después de la eliminación
        const jugadoresPostEliminacion = jugadoresActuales.map(j => 
            j.id === eliminadoId ? { ...j, eliminado: true } : j
        );
        const finJuego = chequearFinDeJuego(jugadoresPostEliminacion);
        if (finJuego.estado === 'terminado') {
            actualizaciones['estado'] = 'terminado';
            actualizaciones['ganador'] = finJuego.ganador;
        }

    } else {
        // Empate o nadie votó (nadie eliminado)
        actualizaciones['eliminadoVotacion'] = null;
    }

    const salaRef = db.ref('salas/' + codigoSalaActual);
    await salaRef.update(actualizaciones);
}

// HOST: Continuar el juego después de la vista de resultados (el Host presiona "Continuar")
async function hostContinuarDiscusión() {
    const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
    if (!esHost) return alert('Solo el Host puede continuar.');

    const salaRef = db.ref('salas/' + codigoSalaActual);
    await salaRef.update({ 
        estado: 'jugando', // Volver al estado de discusión
        votos: null, 
        eliminadoVotacion: null 
    });
}

// HOST: Reiniciar la partida (volver al Lobby con los mismos jugadores)
async function hostReiniciarPartida() {
    const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
    if (!esHost) return alert('Solo el Host puede reiniciar la partida.');

    const salaRef = db.ref('salas/' + codigoSalaActual);
    const jugadoresLimpios = {};
    jugadoresActuales.forEach(j => {
        jugadoresLimpios[j.id] = {
            id: j.id, 
            nombre: j.nombre, 
            esHost: j.esHost, 
            rol: 'Tripulante', // Rol temporal/default
            eliminado: false,
            palabraSecreta: null,
            tema: null,
            hostId: miId
        };
    });

    await salaRef.update({ 
        estado: 'esperando', 
        votos: null, 
        eliminadoVotacion: null,
        ganador: null,
        jugadores: jugadoresLimpios // Mantener jugadores
    });
}

// HOST: Finalizar el juego (cerrar y borrar la sala)
async function hostFinalizarJuego() {
    if (confirm("¿Estás seguro de que quieres FINALIZAR EL JUEGO y cerrar la sala permanentemente?")) {
        const salaRef = db.ref('salas/' + codigoSalaActual);
        await salaRef.remove(); // El listener de sala se encargará de llevar a todos a vista-inicio
    }
}


// =================================================================
// 9. LISTENERS AUXILIARES (Para detectar el fin de la votación)
// =================================================================

function configurarListenerVotos(codigo) {
    const votosRef = db.ref(`salas/${codigo}/votos`);
    votosRef.on('value', async (snapshot) => {
        const salaSnapshot = await db.ref(`salas/${codigo}`).once('value');
        const sala = salaSnapshot.val();

        if (sala?.estado === 'votacion') {
             // Esta función solo se llama si la sala está en votación y hay un cambio en los votos
             // Necesitamos el chequeo del número de votos aquí, ya que el listener de sala podría no ser suficiente
            const jugadoresActivos = Object.values(sala.jugadores || {}).filter(j => !j.eliminado);
            const numVotantes = jugadoresActivos.length;
            const numVotos = Object.keys(sala.votos || {}).length;
            
            if (numVotos === numVotantes) {
                 manejarFinDeVotacion(sala);
            }
        }
    });
}

// =================================================================
// 10. MANEJO DE VISTAS Y EVENT LISTENERS
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZAR FIREBASE
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    window.db = db; // Hacer la base de datos global (para simplificar)

    // Llenar el select de temas
    const selectTema = document.getElementById('select-tema');
    Object.keys(PALABRAS_POR_TEMA).forEach(tema => {
        const option = document.createElement('option');
        option.value = tema;
        option.textContent = tema;
        selectTema.appendChild(option);
    });

    // 2. Manejar Formulario de Inicio (Nombre)
    document.getElementById('form-inicio').addEventListener('submit', (e) => {
        e.preventDefault();

        const inputNombre = document.getElementById('input-nombre');
        const nombreTemp = inputNombre.value.trim();

        if (nombreTemp.length < 2) {
            alert('Por favor, ingresa un nombre válido (mínimo 2 caracteres).');
            return;
        }

        nombreJugador = nombreTemp;
        document.getElementById('nombre-jugador-display').textContent = nombreJugador;
        cambiarVista('vista-seleccion'); // Pasa a la vista de selección de sala
    });

    // 3. Botón Crear Sala
    document.getElementById('btn-crear-sala').addEventListener('click', crearSala);

    // 4. Manejar Formulario Unirse a Sala
    document.getElementById('form-unirse-sala').addEventListener('submit', (e) => {
        e.preventDefault();
        const codigo = document.getElementById('input-codigo').value.trim();
        if (codigo.length !== 4) {
            alert('El código de sala debe tener 4 caracteres.');
            return;
        }
        unirseASala(codigo);
    });

    // 5. Host: Actualizar Configuración
    const configElements = ['select-tema', 'input-impostores', 'input-agentes', 'checkbox-doble-agente'];
    configElements.forEach(id => {
        document.getElementById(id).addEventListener('change', async (e) => {
            if (!codigoSalaActual) return;
            const miJugador = jugadoresActuales.find(j => j.id === miId);
            if (!miJugador || !miJugador.esHost) return;

            const tema = document.getElementById('select-tema').value;
            const numImpostores = parseInt(document.getElementById('input-impostores').value, 10);
            const numAgentes = parseInt(document.getElementById('input-agentes').value, 10);
            const incluirAgenteDoble = document.getElementById('checkbox-doble-agente').checked;

            // Simple validación
            if (numImpostores < 1) return alert('Debe haber al menos 1 Impostor.');

            // Actualizar objeto local
            configuracionActual = { tema, numImpostores, numAgentes, incluirAgenteDoble };

            // Persistir en Firebase
            const salaRef = db.ref(`salas/${codigoSalaActual}`);
            await salaRef.update({ configuracion: configuracionActual });
        });
    });

    // 6. Host: Iniciar Juego
    document.getElementById('btn-iniciar-juego').addEventListener('click', iniciarJuego);

    // 7. Entendido Rol
    document.getElementById('btn-entendido-rol').addEventListener('click', hostPasarADiscusion);

    // 8. Host: Iniciar Votación
    document.getElementById('btn-iniciar-votacion').addEventListener('click', hostIniciarVotacion);

    // 9. Host: Botones de Resultado/Final
    document.getElementById('btn-reiniciar-partida-resultado').addEventListener('click', hostContinuarDiscusión);
    document.getElementById('btn-finalizar-juego-resultado').addEventListener('click', hostFinalizarJuego);
    document.getElementById('btn-reiniciar-partida-final').addEventListener('click', hostReiniciarPartida);
    document.getElementById('btn-finalizar-juego-final').addEventListener('click', hostFinalizarJuego);
    
    // **Importante:** Configurar el listener de votos en el inicio (para que se dispare en todos los clientes)
    // El listener de votos es global para el manejo del fin de votación
    db.ref('salas').on('child_added', (snapshot) => {
        const codigo = snapshot.key;
        configurarListenerVotos(codigo);
    });
    
});

// Hacer funciones importantes globales para que puedan ser llamadas desde onclick en index.html
window.cambiarVista = cambiarVista;
window.abandonarSala = abandonarSala;