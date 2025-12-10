// public/cliente.js (MIGRADO A FIREBASE REALTIME DATABASE y LÓGICA DE FLUJO FINAL)

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
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana'],
    'Países 🌎': ['España', 'México', 'Colombia', 'Japón', 'Francia', 'Canadá', 'Brasil', 'Alemania'],
    'Profesiones 💼': ['Médico', 'Maestro', 'Ingeniero', 'Cocinero', 'Policía', 'Bombero', 'Abogado', 'Piloto'],
    'Objetos Cotidianos 💡': ['Teléfono', 'Taza', 'Llaves', 'Reloj', 'Libro', 'Silla', 'Mesa', 'Ventana'],
    'Picante 🔥': ['Lencería', 'Gemidos', 'Cama', 'Beso', 'Noche', 'Latido', 'Pasión', 'Prohibido']
};
const TEMAS_DISPONIBLES = Object.keys(PALABRAS_POR_TEMA);
const MIN_JUGADORES = 3; 
const MAX_JUGADORES = 10;

// =================================================================
// 3. INICIO DE LA APLICACIÓN (DESPUÉS DEL DOM)
// =================================================================
document.addEventListener('DOMContentLoaded', (event) => {

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // 4. VARIABLES GLOBALES
    let nombreJugador = ''; 
    let codigoSalaActual = '';
    // Generar un ID único para cada cliente.
    let miId = Date.now().toString(36) + Math.random().toString(36).substring(2); 
    
    let jugadoresActuales = []; 
    let configuracionActual = { 
        temasSeleccionados: [TEMAS_DISPONIBLES[0]], // Array de temas
        incluirAgenteDoble: false 
    }; 
    let miRolActual = ''; 
    let miPalabraSecreta = ''; 
    let miTemaActual = ''; 
    let miVotoSeleccionadoId = 'none';
    let listenerSala = null; // Para desuscribirse del listener de Firebase

    // =================================================================
    // 5. FUNCIONES DE UI Y LÓGICA AUXILIAR
    // =================================================================

    function generarCodigoSala() {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 4; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    function asignarRoles(jugadores, configuracion) {
        const numJugadores = jugadores.length;
        let numImpostores = 0;
        
        if (numJugadores >= 3 && numJugadores <= 5) {
            numImpostores = 1;
        } else if (numJugadores >= 6 && numJugadores <= 10) {
            numImpostores = 2;
        } 
        
        jugadores.forEach(j => {
            j.rol = 'Tripulante';
            j.eliminado = false;
        });

        // 1. Asignar Agente Doble
        if (configuracion.incluirAgenteDoble && numJugadores >= 4) {
            const tripulantesPotenciales = jugadores.filter(j => j.rol === 'Tripulante');
            if (tripulantesPotenciales.length > 0) {
                const indiceAleatorio = Math.floor(Math.random() * tripulantesPotenciales.length);
                const agenteDoble = tripulantesPotenciales[indiceAleatorio];
                const indexEnSala = jugadores.findIndex(j => j.id === agenteDoble.id);
                jugadores[indexEnSala].rol = 'Agente Doble';
            }
        }
        
        // 2. Asignar Impostores
        const candidatosAImpostor = jugadores.filter(j => j.rol === 'Tripulante'); 

        let impostoresAsignados = 0;
        while (impostoresAsignados < numImpostores && candidatosAImpostor.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidatosAImpostor.length);
            const impostorSeleccionado = candidatosAImpostor.splice(randomIndex, 1)[0]; 
            
            const indexEnSala = jugadores.findIndex(j => j.id === impostorSeleccionado.id);
            if (jugadores[indexEnSala].rol === 'Tripulante') {
                jugadores[indexEnSala].rol = 'Impostor';
                impostoresAsignados++;
            }
        }

        return jugadores;
    }
    
    // FUNCIÓN DE NAVEGACIÓN
    window.cambiarVista = function(vistaId) {
        document.querySelectorAll('.vista').forEach(vista => {
            vista.classList.remove('activa');
        });
        const nuevaVista = document.getElementById(vistaId);
        if (nuevaVista) {
            nuevaVista.classList.add('activa');
        } else {
            console.error('Error: La vista ' + vistaId + ' no existe en el HTML.');
            return;
        }
        
        if (vistaId === 'vista-lobby') {
            actualizarBotonInicioJuego();
            renderConfiguracion(); 
        }
    }
    
    function actualizarListaJugadores(jugadores) {
        jugadoresActuales = jugadores;
        const listaHost = document.getElementById('lista-jugadores-host');
        const listaJuego = document.getElementById('lista-jugadores-juego');
        const listaVotos = document.getElementById('opciones-votacion');
        
        listaHost.innerHTML = '';
        listaJuego.innerHTML = '';
        
        // Preparar lista de votos (opción de "nadie" primero)
        listaVotos.innerHTML = `
            <button class="btn-votar" data-voto-id="none" style="background-color: #888;" onclick="votarJugador('none')">
                ⚠️ Nadie (Abstenerse)
            </button>
        `;

        let contadorActivos = 0;

        jugadores.forEach(j => {
            const esHost = j.hostId === j.id; 
            const esMiJugador = j.id === miId;
            const esEliminado = j.eliminado;

            // 1. Lista del Lobby (Host)
            const elementoLobby = document.createElement('li');
            elementoLobby.textContent = j.nombre + (esHost ? ' (HOST)' : '') + (esMiJugador ? ' (Tú)' : '');

            if (jugadores.find(p => p.id === miId)?.esHost && !esMiJugador && !esEliminado) {
                const btnExpulsar = document.createElement('button');
                btnExpulsar.textContent = 'Expulsar';
                btnExpulsar.classList.add('btn-expulsar', 'btn-small');
                btnExpulsar.onclick = () => expulsarJugador(j.id);
                elementoLobby.appendChild(btnExpulsar);
            }
            listaHost.appendChild(elementoLobby);


            // 2. Lista de Juego (Solo activos)
            if (!esEliminado) {
                contadorActivos++;
                const elementoJuego = document.createElement('li');
                elementoJuego.textContent = j.nombre + (esMiJugador ? ' (Tú)' : '');
                listaJuego.appendChild(elementoJuego);
                
                // 3. Opciones de Votación (Solo activos, excluyéndome a mí mismo)
                if (!esMiJugador) {
                    const btnVoto = document.createElement('button');
                    btnVoto.textContent = j.nombre;
                    btnVoto.classList.add('btn-votar');
                    btnVoto.setAttribute('data-voto-id', j.id);
                    btnVoto.onclick = () => votarJugador(j.id);
                    listaVotos.appendChild(btnVoto);
                }
            }
        });

        document.getElementById('contador-jugadores').textContent = jugadores.length;
        document.getElementById('jugadores-activos-contador').textContent = contadorActivos;
        actualizarBotonInicioJuego();
        
        // Marcar el voto actual si ya voté
        if (document.getElementById('vista-votacion').classList.contains('activa')) {
            document.querySelectorAll('.btn-votar').forEach(btn => btn.classList.remove('votado'));
            if (miVotoSeleccionadoId) {
                const btnVotado = listaVotos.querySelector(`[data-voto-id="${miVotoSeleccionadoId}"]`);
                if (btnVotado) {
                    btnVotado.classList.add('votado');
                }
            }
        }
    }
    
    // RENDERIZADO Y LECTURA DE CATEGORÍAS
    function renderConfiguracion() {
        const categoriasContainer = document.getElementById('categorias-container');
        const avisoCategoria = document.getElementById('aviso-categoria');
        
        if (categoriasContainer && categoriasContainer.children.length === 0) {
            TEMAS_DISPONIBLES.forEach(tema => {
                const checkboxId = `tema-${tema.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const div = document.createElement('div');
                div.classList.add('categoria-item'); 
                const esPicante = tema.includes('Picante');
                
                div.innerHTML = `
                    <input type="checkbox" id="${checkboxId}" value="${tema}" name="tema-selector" ${configuracionActual.temasSeleccionados.includes(tema) ? 'checked' : ''}>
                    <label for="${checkboxId}">${tema}</label>
                `;
                if (esPicante) {
                    div.querySelector('label').style.color = 'var(--color-red)';
                }
                
                categoriasContainer.appendChild(div);
            });
            document.querySelectorAll('input[name="tema-selector"]').forEach(input => {
                input.addEventListener('change', actualizarConfiguracionHost);
            });
        } else {
             document.querySelectorAll('input[name="tema-selector"]').forEach(input => {
                 input.checked = configuracionActual.temasSeleccionados.includes(input.value);
             });
        }
        
        const checkboxDoble = document.getElementById('checkbox-agente-doble');
        if (checkboxDoble) {
            checkboxDoble.checked = configuracionActual.incluirAgenteDoble;
            if (!checkboxDoble.hasListener) {
                 checkboxDoble.addEventListener('change', actualizarConfiguracionHost);
                 checkboxDoble.hasListener = true;
            }
        }

        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const configHostDiv = document.getElementById('configuracion-host');
        if (configHostDiv) configHostDiv.style.display = esHost ? 'block' : 'none';

        if (avisoCategoria) {
            avisoCategoria.style.display = (configuracionActual.temasSeleccionados.length === 0) ? 'block' : 'none';
        }
    }

    function actualizarBotonInicioJuego() {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const numJugadores = jugadoresActuales.length;
        const btnIniciar = document.getElementById('btn-iniciar-juego');
        const avisoMin = document.getElementById('min-jugadores-aviso');
        
        if (esHost && btnIniciar && avisoMin) {
            const numTemas = configuracionActual.temasSeleccionados.length;
            
            if (numJugadores >= MIN_JUGADORES && numJugadores <= MAX_JUGADORES && numTemas > 0) {
                btnIniciar.disabled = false;
                avisoMin.style.display = 'none';
            } else {
                btnIniciar.disabled = true;
                if (numJugadores < MIN_JUGADORES) {
                    avisoMin.textContent = `Se requieren ${MIN_JUGADORES} jugadores para iniciar.`;
                    avisoMin.style.display = 'block';
                } else if (numTemas === 0) {
                    avisoMin.textContent = `Selecciona al menos 1 categoría.`;
                    avisoMin.style.display = 'block';
                } else {
                    avisoMin.style.display = 'none';
                }
            }
        }
    }
    
    async function actualizarConfiguracionHost() {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !codigoSalaActual) return;

        const temas = Array.from(document.querySelectorAll('input[name="tema-selector"]:checked')).map(input => input.value);
        const doble = document.getElementById('checkbox-agente-doble').checked;
        
        const nuevaConfig = {
            temasSeleccionados: temas,
            incluirAgenteDoble: doble
        };

        configuracionActual = nuevaConfig; 
        
        await db.ref('salas/' + codigoSalaActual + '/configuracion').update(nuevaConfig);
        
        actualizarBotonInicioJuego();
        renderConfiguracion(); 
    }
    
    window.expulsarJugador = async function(jugadorId) {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         if (confirm(`¿Estás seguro de que quieres expulsar al jugador con ID ${jugadorId}?`)) {
             await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorId}`).remove();
             alert('Jugador expulsado.');
         }
    }

    async function procesarVotacionHost(sala) {
         if (!jugadoresActuales.find(j => j.id === miId)?.esHost) return; 

         const conteoVotos = {}; 
         const jugadoresActivos = jugadoresActuales.filter(j => !j.eliminado);

         jugadoresActivos.forEach(j => conteoVotos[j.id] = 0);
         conteoVotos['none'] = 0;

         for (const votanteId in sala.votos) {
             if (jugadoresActivos.some(j => j.id === votanteId)) {
                 const votadoId = sala.votos[votanteId];
                 if (conteoVotos.hasOwnProperty(votadoId)) {
                     conteoVotos[votadoId]++;
                 } else if (votadoId === 'none') {
                     conteoVotos['none']++;
                 }
             }
         }

         let jugadorEliminado = null;
         let maxVotos = 0;
         let empates = [];

         for (const id in conteoVotos) {
             if (id !== 'none') {
                 if (conteoVotos[id] > maxVotos) {
                     maxVotos = conteoVotos[id];
                     jugadorEliminado = jugadoresActuales.find(j => j.id === id);
                     empates = [jugadorEliminado];
                 } else if (conteoVotos[id] === maxVotos && maxVotos > 0) {
                     empates.push(jugadoresActuales.find(j => j.id === id));
                 }
             }
         }

         if (empates.length > 1 || maxVotos <= conteoVotos['none']) { 
             jugadorEliminado = null; 
         } else if (maxVotos === 0) {
             jugadorEliminado = null; 
         }
         
         // 1. Marcar como eliminado en la DB
         if (jugadorEliminado) {
             await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorEliminado.id}/eliminado`).set(true);
         }
         
         // 2. Determinar si hay ganador después de la eliminación (necesario para la vista de resultado)
         const jugadoresPostEliminacion = jugadoresActuales.map(j => ({ ...j, eliminado: j.id === jugadorEliminado?.id ? true : j.eliminado }));
         const ganador = chequearFinDeJuego(jugadoresPostEliminacion);
         
         // 3. Actualizar el resultado de la ronda en la DB para que todos lo lean
         await db.ref('salas/' + codigoSalaActual).update({
             rondaEstado: 'resultado',
             ultimoResultado: {
                 conteo: conteoVotos,
                 jugadorEliminadoId: jugadorEliminado ? jugadorEliminado.id : null,
                 rolRevelado: jugadorEliminado ? jugadorEliminado.rol : null,
                 ganador: ganador || null,
             }
         });
    }
    
    window.votarJugador = async function(jugadorVotadoId) {
        if (!codigoSalaActual || !jugadoresActuales.find(j => j.id === miId)) return;
        
        miVotoSeleccionadoId = jugadorVotadoId;

        await db.ref(`salas/${codigoSalaActual}/votos/${miId}`).set(jugadorVotadoId);
        
        const listaVotos = document.getElementById('opciones-votacion');
        if (listaVotos) {
            document.querySelectorAll('.btn-votar').forEach(btn => btn.classList.remove('votado'));
            const btnVotado = listaVotos.querySelector(`[data-voto-id="${jugadorVotadoId}"]`);
            if (btnVotado) {
                btnVotado.classList.add('votado');
            }
        }
    }
    
    document.getElementById('btn-forzar-votacion').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         await db.ref('salas/' + codigoSalaActual).update({ rondaEstado: 'votando', votos: {} });
         
         miVotoSeleccionadoId = 'none'; 
    });
    
    window.abandonarSala = async function() {
        if (!codigoSalaActual || !miId) {
             window.location.reload();
             return;
        }

        try {
            if (listenerSala) {
                 db.ref('salas/' + codigoSalaActual).off('value', listenerSala);
                 listenerSala = null;
            }
            
            const misDatos = jugadoresActuales.find(j => j.id === miId);

            await db.ref(`salas/${codigoSalaActual}/jugadores/${miId}`).remove();

            if (misDatos?.esHost && jugadoresActuales.length > 1) {
                const jugadoresRestantes = jugadoresActuales.filter(j => j.id !== miId);
                if (jugadoresRestantes.length > 0) {
                    const nuevoHost = jugadoresRestantes[0];
                    await db.ref(`salas/${codigoSalaActual}/hostId`).set(nuevoHost.id);
                    await db.ref(`salas/${codigoSalaActual}/jugadores/${nuevoHost.id}/esHost`).set(true);
                }
            } else if (misDatos?.esHost && jugadoresActuales.length === 1) {
                 await db.ref('salas/' + codigoSalaActual).remove();
            }

            window.location.reload();

        } catch (error) {
            console.error("Error al abandonar la sala:", error);
            window.location.reload(); 
        }
    }

    function chequearFinDeJuego(jugadores) {
        const jugadoresActivos = jugadores.filter(j => !j.eliminado);
        
        const tripulantesActivos = jugadoresActivos.filter(j => j.rol === 'Tripulante' || j.rol === 'Agente Doble').length;
        const impostoresActivos = jugadoresActivos.filter(j => j.rol === 'Impostor').length;
        
        // Condición 1: Ganan los Impostores
        if (impostoresActivos >= tripulantesActivos) {
            return 'Impostores';
        }
        
        // Condición 2: Ganan Tripulantes/Agente Doble
        if (impostoresActivos === 0 && tripulantesActivos > 0) {
            return 'Tripulantes'; 
        }
        
        return null; // El juego continúa
    }
    
    function manejarFinDeJuego(sala) {
         cambiarVista('vista-final');
         
         const ganador = sala.ultimoResultado?.ganador || chequearFinDeJuego(jugadoresActuales);
         document.getElementById('ganador-display').textContent = `🏆 ¡Ganan los ${ganador}! 🏆`;
         
         const listaRoles = document.getElementById('lista-roles-final');
         listaRoles.innerHTML = '';
         
         jugadoresActuales.forEach(j => {
             const li = document.createElement('li');
             let claseRol = '';
             if (j.rol === 'Impostor') claseRol = 'impostor';
             else if (j.rol === 'Agente Doble') claseRol = 'orange';
             else claseRol = 'tripulante';
             
             const palabraRevelada = j.palabraSecreta === 'NINGUNA' ? 'N/A' : j.palabraSecreta;

             li.innerHTML = `
                 ${j.nombre} ${j.eliminado ? '(❌ Eliminado)' : '(✅ Activo)'}: 
                 <span class="${claseRol}">${j.rol}</span> 
                 (Palabra: ${palabraRevelada || 'No Asignada'})
             `;
             listaRoles.appendChild(li);
         });
    }


    // =================================================================
    // 6. LÓGICA DE FIREBASE (El reemplazo de Socket.IO)
    // =================================================================
    
    function configurarEscuchadorSala(codigoSala) {
        if (listenerSala) {
            db.ref('salas/' + codigoSalaActual).off('value', listenerSala);
        }
        
        codigoSalaActual = codigoSala; 
        const salaRef = db.ref('salas/' + codigoSala);

        listenerSala = salaRef.on('value', (snapshot) => {
            
            if (!snapshot.exists()) {
                if (document.getElementById('vista-final').classList.contains('activa')) {
                    return; 
                }
                alert('La sala ha sido eliminada, has sido expulsado o no existe.');
                window.location.reload(); 
                return;
            }

            const sala = snapshot.val();
            
            const jugadoresObj = sala.jugadores || {};
            const jugadoresArray = Object.keys(jugadoresObj).map(key => ({ ...jugadoresObj[key], id: key }));
            jugadoresActuales = jugadoresArray;
            
            const misDatos = jugadoresArray.find(j => j.id === miId);
            if (!misDatos) {
                 alert('Has sido expulsado de la sala.');
                 window.location.reload();
                 return;
            }
            
            miRolActual = misDatos.rol || 'Tripulante';
            miPalabraSecreta = misDatos.palabraSecreta || '';
            miTemaActual = misDatos.tema || '';
            
            configuracionActual = sala.configuracion || configuracionActual;

            // Lógica de Vistas basada en el estado de la sala
            
            if (sala.estado === 'esperando') {
                actualizarListaJugadores(jugadoresArray);
                cambiarVista('vista-lobby');
            
            } else if (sala.estado === 'revelacion') { 
                manejarRevelacion(sala);
            
            } else if (sala.estado === 'enJuego') {
                actualizarListaJugadores(jugadoresArray);
                
                if (sala.rondaEstado === 'discutiendo') {
                    manejarInicioDiscusion(sala); 
                } else if (sala.rondaEstado === 'votando') {
                    manejarInicioVotacion(sala); 
                    
                    if (misDatos?.esHost) {
                        const numActivos = jugadoresArray.filter(j => !j.eliminado).length;
                        const numVotos = Object.keys(sala.votos || {}).length;
                        if (numVotos === numActivos) {
                            procesarVotacionHost(sala);
                        }
                    }
                } else if (sala.rondaEstado === 'resultado') {
                    manejarResultadoVotacion(sala); 
                }
            
            } else if (sala.estado === 'finalizado') {
                manejarFinDeJuego(sala);
            }
        });
    }

    // ----------------------------------------------------
    // *** ASIGNAR ROLES Y PALABRA (Host) - INICIO DEL JUEGO ***
    // ----------------------------------------------------
    document.getElementById('btn-iniciar-juego').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        const salaRef = db.ref('salas/' + codigoSalaActual);
        
        if (configuracionActual.temasSeleccionados.length === 0) {
            return alert('ERROR: Debes seleccionar al menos una categoría.');
        }

        const jugadoresConRoles = asignarRoles(jugadoresActuales, configuracionActual);
        
        const temaElegido = configuracionActual.temasSeleccionados[Math.floor(Math.random() * configuracionActual.temasSeleccionados.length)];
        const palabras = PALABRAS_POR_TEMA[temaElegido];
        const palabraElegida = palabras[Math.floor(Math.random() * palabras.length)];
        
        const jugadoresParaFirebase = {};
        jugadoresConRoles.forEach(jugador => {
            let palabraInfo = palabraElegida;
            let temaInfo = temaElegido;
            
            if (jugador.rol === 'Impostor') {
                palabraInfo = 'NINGUNA'; 
                temaInfo = temaElegido; 
            }

            jugadoresParaFirebase[jugador.id] = {
                 ...jugador,
                 rol: jugador.rol,
                 palabraSecreta: palabraInfo,
                 tema: temaInfo,
            };
        });
        
        await salaRef.update({
            jugadores: jugadoresParaFirebase, 
            estado: 'revelacion', 
            rondaEstado: 'rolesAsignados',
            'configuracion/palabra': palabraElegida, 
            'configuracion/temaElegido': temaElegido,
            votos: {}, 
            ultimoResultado: null,
        });
    });

    // ----------------------------------------------------
    // *** MANEJAR REVELACIÓN ***
    // ----------------------------------------------------
    function manejarRevelacion(sala) {
        cambiarVista('vista-revelacion');
        
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const esHost = misDatos?.esHost;

        const rolDisplay = document.getElementById('rol-revelacion-display');
        const palabraDisplay = document.getElementById('palabra-revelacion-display');
        const temaDisplay = document.getElementById('tema-valor-revelacion');
        const btnDiscusion = document.getElementById('btn-iniciar-discusion');
        
        if (btnDiscusion) {
             btnDiscusion.style.display = esHost ? 'block' : 'none';
        }

        if (rolDisplay && palabraDisplay && temaDisplay) {
            temaDisplay.textContent = miTemaActual;

            if (miRolActual === 'Impostor') {
                rolDisplay.textContent = 'Tu Rol: ¡IMPOSTOR!';
                palabraDisplay.textContent = "No conoces la palabra secreta. Tu objetivo es no ser descubierto.";
                palabraDisplay.style.backgroundColor = 'var(--color-red)';
                palabraDisplay.style.color = 'var(--color-text)';
            } else if (miRolActual === 'Agente Doble') {
                 rolDisplay.textContent = 'Tu Rol: ¡AGENTE DOBLE!';
                 palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                 palabraDisplay.style.backgroundColor = 'var(--color-orange)';
                 palabraDisplay.style.color = 'var(--color-bg)';
            } else {
                rolDisplay.textContent = 'Tu Rol: ¡TRIPULANTE!';
                palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                palabraDisplay.style.backgroundColor = 'var(--color-green)';
                palabraDisplay.style.color = 'var(--color-bg)';
            }
        }
    }
    
    // ----------------------------------------------------
    // *** INICIAR DISCUSIÓN (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-iniciar-discusion').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         await db.ref('salas/' + codigoSalaActual).update({ 
             estado: 'enJuego', 
             rondaEstado: 'discutiendo' 
         });
    });

    // ----------------------------------------------------
    // *** MANEJAR INICIO DE DISCUSIÓN (VISTA DE JUEGO) ***
    // ----------------------------------------------------
    function manejarInicioDiscusion(sala) {
        cambiarVista('vista-juego');
        
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const esHost = misDatos?.esHost;

        document.getElementById('tema-valor').textContent = miTemaActual;
        
        const palabraDisplay = document.getElementById('palabra-secreta-display');
        const rolDisplay = document.getElementById('rol-juego-display');
        
        if (palabraDisplay && rolDisplay) {
             if (miRolActual === 'Impostor') {
                rolDisplay.textContent = 'Tu Rol: ¡IMPOSTOR!';
                palabraDisplay.textContent = "Eres el IMPOSTOR. ¡Cuidado con tus palabras!";
                palabraDisplay.style.backgroundColor = 'var(--color-red)';
                palabraDisplay.style.color = 'var(--color-text)';
             } else if (miRolActual === 'Agente Doble') {
                 rolDisplay.textContent = 'Tu Rol: ¡AGENTE DOBLE!';
                 palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                 palabraDisplay.style.backgroundColor = 'var(--color-orange)';
                 palabraDisplay.style.color = 'var(--color-bg)';
             } else {
                rolDisplay.textContent = 'Tu Rol: ¡TRIPULANTE!';
                palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                palabraDisplay.style.backgroundColor = 'var(--color-green)';
                palabraDisplay.style.color = 'var(--color-bg)';
             }
        }
        
        const btnForzar = document.getElementById('btn-forzar-votacion');
        if (btnForzar) btnForzar.style.display = esHost ? 'block' : 'none';
    }
    
    // ----------------------------------------------------
    // *** MANEJAR INICIO DE VOTACIÓN (TODOS) ***
    // ----------------------------------------------------
    function manejarInicioVotacion(sala) {
        cambiarVista('vista-votacion');
        
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const jugadoresActivos = jugadoresActuales.filter(j => !j.eliminado);
        
        actualizarListaJugadores(jugadoresActuales); 
        
        const numVotos = Object.keys(sala.votos || {}).length;
        const numActivos = jugadoresActivos.length;
        
        document.getElementById('votos-emitidos-display').textContent = `Votos recibidos: ${numVotos}/${numActivos}`;
        
        const miVoto = sala.votos?.[miId];
        if (miVoto) {
            miVotoSeleccionadoId = miVoto;
             const votadoNombre = miVoto === 'none' ? 'Nadie' : jugadoresActuales.find(j => j.id === miVoto)?.nombre || 'Desconocido';
             document.getElementById('voto-confirmado-display').textContent = `✅ Has votado por: ${votadoNombre}`;
        } else {
             document.getElementById('voto-confirmado-display').textContent = 'Esperando tu voto...';
        }
        
        if (misDatos?.esHost && numVotos === numActivos) {
             document.getElementById('voto-confirmado-display').textContent = '✅ Todos han votado. Procesando...';
        } else if (numVotos === numActivos) {
             document.getElementById('voto-confirmado-display').textContent = '✅ Todos han votado. Esperando al Host para ver el resultado...';
        }
    }

    // ----------------------------------------------------
    // *** MANEJAR RESULTADO DE VOTACIÓN (TODOS) ***
    // ----------------------------------------------------
    function manejarResultadoVotacion(sala) {
         cambiarVista('vista-resultado');
         
         const resultado = sala.ultimoResultado;
         if (!resultado) return;

         const jugadorEliminado = resultado.jugadorEliminadoId 
                                  ? jugadoresActuales.find(j => j.id === resultado.jugadorEliminadoId) 
                                  : null;
         
         let mensaje = "";
         if (jugadorEliminado) {
             mensaje = `¡${jugadorEliminado.nombre} fue ELIMINADO! Su rol era: ${resultado.rolRevelado}.`;
         } else {
             mensaje = "Nadie fue eliminado. Hubo empate o abstención.";
         }
         
         const jugadorEliminadoDisplay = document.getElementById('jugador-eliminado-display');
         if (jugadorEliminadoDisplay) jugadorEliminadoDisplay.textContent = mensaje;

         const detallesVotos = document.getElementById('detalles-votacion-container');
         if (detallesVotos) {
             detallesVotos.innerHTML = '<h4>Conteo de Votos:</h4>';
             
             const conteoArray = [];
             for (const id in resultado.conteo) {
                 conteoArray.push({
                     id: id,
                     votos: resultado.conteo[id],
                     nombre: id === 'none' ? 'Abstención' : jugadoresActuales.find(j => j.id === id)?.nombre || 'Desconocido'
                 });
             }
             
             conteoArray.sort((a, b) => b.votos - a.votos);

             conteoArray.forEach(item => {
                 detallesVotos.innerHTML += `<p><strong>${item.nombre}</strong>: ${item.votos} votos</p>`;
             });
         }
         
         const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
         const accionesFinalesHost = document.getElementById('acciones-finales-host');
         
         // Verificar si el juego terminó (ganador determinado)
         const ganador = resultado.ganador;

         if (esHost) {
             accionesFinalesHost.style.display = 'flex';
             // MOSTRAR BOTONES SEGÚN EL ESTADO DE FIN DE JUEGO
             document.getElementById('btn-reiniciar-partida').style.display = ganador ? 'block' : 'none';
             document.getElementById('btn-finalizar-juego').style.display = ganador ? 'block' : 'none';
             document.getElementById('btn-continuar-discusion').style.display = ganador ? 'none' : 'block';
             
             if (ganador) {
                 // Si hay ganador, agregar mensaje de fin de juego al resultado
                 document.getElementById('jugador-eliminado-display').textContent += `\n ¡El juego terminó! Ganan los ${ganador}.`;
                 // Host puede forzar la transición a la vista final para mostrar todos los roles
                 db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
             }

         } else {
              accionesFinalesHost.style.display = 'none';
              if (!ganador) {
                   document.getElementById('jugador-eliminado-display').textContent += `\n Esperando al Host para continuar la discusión...`;
              }
         }
    }
    
    // ----------------------------------------------------
    // *** 6.1: REINICIAR PARTIDA (HOST) - Se retrocede a la Sección 3 (Lobby) ***
    // ----------------------------------------------------
    document.getElementById('btn-reiniciar-partida').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         if (confirm('⚠️ ¿Estás seguro de que quieres REINICIAR la partida? Todos los jugadores volverán al lobby para elegir una nueva categoría.')) {
            // 1. Limpiar roles, estado de eliminado y palabras para los jugadores
            const updates = {};
            jugadoresActuales.forEach(jugador => {
                updates[`salas/${codigoSalaActual}/jugadores/${jugador.id}/rol`] = 'Tripulante';
                updates[`salas/${codigoSalaActual}/jugadores/${jugador.id}/eliminado`] = false;
                updates[`salas/${codigoSalaActual}/jugadores/${jugador.id}/palabraSecreta`] = null;
                updates[`salas/${codigoSalaActual}/jugadores/${jugador.id}/tema`] = null;
            });

            // 2. Resetear estado de la sala
            updates[`salas/${codigoSalaActual}/estado`] = 'esperando';
            updates[`salas/${codigoSalaActual}/rondaEstado`] = 'esperando';
            updates[`salas/${codigoSalaActual}/votos`] = {};
            updates[`salas/${codigoSalaActual}/ultimoResultado`] = null; 
            updates[`salas/${codigoSalaActual}/configuracion/palabra`] = null;
            updates[`salas/${codigoSalaActual}/configuracion/temaElegido`] = null;

            await db.ref().update(updates);
            
            miVotoSeleccionadoId = 'none'; // Resetear voto local
         }
    });

    // ----------------------------------------------------
    // *** 6.2: FINALIZAR JUEGO (HOST) - Cierra la Sala, saca a todos ***
    // ----------------------------------------------------
    document.getElementById('btn-finalizar-juego').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         if (confirm('⚠️ ¿Estás seguro de que quieres FINALIZAR el juego y CERRAR la sala? Esto eliminará la sala de forma permanente y expulsará a todos los jugadores.')) {
             // 1. Activa la vista final para todos (para que puedan ver los roles finales antes de que la sala se borre)
             await db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
             
             // 2. Esperar un momento (simulación de tiempo para ver la vista final) y luego borrar la sala
             setTimeout(async () => {
                 await db.ref('salas/' + codigoSalaActual).remove();
             }, 1000); 
         }
    });

    // ----------------------------------------------------
    // *** 6.3: CONTINUAR DISCUSIÓN (HOST) - Vuelve a la discusión ***
    // ----------------------------------------------------
    document.getElementById('btn-continuar-discusion').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         await db.ref('salas/' + codigoSalaActual).update({
             rondaEstado: 'discutiendo',
             votos: {}, 
             ultimoResultado: null
         });
         
         miVotoSeleccionadoId = 'none'; // Resetear voto local
    });

    // ----------------------------------------------------
    // *** CÓDIGO RESTANTE DE INICIO Y UNIRSE ***
    // ----------------------------------------------------
    
    document.getElementById('form-inicio').addEventListener('submit', (e) => {
        e.preventDefault();
        nombreJugador = document.getElementById('input-nombre').value.trim();
        if (!nombreJugador) return alert('Por favor, ingresa tu nombre.');
        
        document.getElementById('nombre-jugador-display').textContent = nombreJugador;
        cambiarVista('vista-seleccion');
    });

    document.getElementById('btn-crear-sala').addEventListener('click', async () => {
        
        let codigo = generarCodigoSala(); 

        try { 
            let snapshot = await db.ref('salas/' + codigo).once('value');
            if (snapshot.exists()) {
                codigo = generarCodigoSala(); 
                snapshot = await db.ref('salas/' + codigo).once('value');
                if (snapshot.exists()) {
                    throw new Error('No se pudo generar un código único.');
                }
            }

            const jugadorHost = { 
                id: miId, 
                nombre: nombreJugador, 
                esHost: true, 
                rol: 'Tripulante', 
                eliminado: false,
                palabraSecreta: null,
                tema: null,
                hostId: miId 
            };

            const nuevaSala = {
                codigo: codigo,
                hostId: miId, 
                jugadores: {
                    [miId]: jugadorHost
                },
                estado: 'esperando',
                rondaEstado: 'esperando',
                configuracion: configuracionActual, 
                votos: {}, 
                ultimoResultado: null,
            };
            
            await db.ref('salas/' + codigo).set(nuevaSala);
            
            document.getElementById('codigo-lobby-display').textContent = codigo;
            configurarEscuchadorSala(codigo);

        } catch (error) {
            console.error("Error al crear la sala en Firebase:", error);
            alert(`🔴 ERROR AL CREAR SALA: ${error.message}`);
        }
    });

    document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = document.getElementById('input-codigo').value.trim().toUpperCase();
        if (!codigo) return;
        
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
    });


}); // CIERRE DEL DOMContentLoaded