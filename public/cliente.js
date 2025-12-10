// public/cliente.js (MIGRADO A FIREBASE REALTIME DATABASE y LÓGICA DE FLUJO CORREGIDA)

// =================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// =================================================================
const firebaseConfig = {
    // TUS CREDENCIALES
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
    // Agrega más categorías aquí
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
    let miId = Date.now().toString(36) + Math.random().toString(36).substring(2); 
    
    let jugadoresActuales = []; 
    // MODIFICACIÓN: configuracionActual sin tiempo
    let configuracionActual = { 
        temasSeleccionados: [TEMAS_DISPONIBLES[0]], // Array de temas (Punto 1)
        incluirAgenteDoble: false 
    }; 
    let miRolActual = ''; 
    let miPalabraSecreta = ''; 
    let miTemaActual = ''; 
    let miVotoSeleccionadoId = 'none';
    let listenerSala = null; 

    // =================================================================
    // 5. FUNCIONES DE UI Y LÓGICA AUXILIAR
    // =================================================================

    // Función para generar un código de sala de 4 letras
    function generarCodigoSala() {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 4; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // Lógica de Asignación de Roles (Ahora en el cliente Host)
    function asignarRoles(jugadores, configuracion) {
        // ... (La lógica de asignación de roles se mantiene igual) ...
        const numJugadores = jugadores.length;
        let numImpostores = 0;
        
        if (numJugadores >= 3 && numJugadores <= 5) {
            numImpostores = 1;
        } else if (numJugadores >= 6 && numJugadores <= 10) {
            numImpostores = 2;
        } 
        
        // Resetear roles y eliminar flag de 'eliminado' (para el caso de re-jugar)
        jugadores.forEach(j => {
            j.rol = 'Tripulante';
            j.eliminado = false;
        });

        let agentesAsignados = 0;
        
        // Asignar Agente Doble
        if (configuracion.incluirAgenteDoble && numJugadores >= 4) {
            const tripulantesPotenciales = jugadores.filter(j => j.rol === 'Tripulante');
            if (tripulantesPotenciales.length > 0) {
                const indiceAleatorio = Math.floor(Math.random() * tripulantesPotenciales.length);
                const agenteDoble = tripulantesPotenciales[indiceAleatorio];
                
                const indexEnSala = jugadores.findIndex(j => j.id === agenteDoble.id);
                jugadores[indexEnSala].rol = 'Agente Doble';
                agentesAsignados = 1;
            }
        }
        
        // Asignar Impostores
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
    
    // FUNCIÓN DE NAVEGACIÓN (Necesaria para los onclick del HTML)
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
        // ... (La lógica de actualización se mantiene igual) ...
        jugadoresActuales = jugadores;
        const listaHost = document.getElementById('lista-jugadores-host');
        const listaJuego = document.getElementById('lista-jugadores-juego');
        const listaVotos = document.getElementById('opciones-votacion');
        
        listaHost.innerHTML = '';
        listaJuego.innerHTML = '';
        
        // Preparar lista de votos (opción de "nadie" primero)
        listaVotos.innerHTML = `
            <button class="btn-votar" data-voto-id="none" style="background-color: #888;">
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

            // Si soy el Host y no es mi jugador, agrego botón de expulsar
            if (jugadores.find(p => p.id === miId)?.esHost && !esMiJugador && !esEliminado) {
                const btnExpulsar = document.createElement('button');
                btnExpulsar.textContent = 'Expulsar';
                btnExpulsar.classList.add('btn-danger', 'btn-small');
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
        if (miVotoSeleccionadoId !== 'none') {
             const btnVotado = listaVotos.querySelector(`[data-voto-id="${miVotoSeleccionadoId}"]`);
             if (btnVotado) {
                document.querySelectorAll('.btn-votar').forEach(btn => btn.classList.remove('votado'));
                btnVotado.classList.add('votado');
             }
        }
    }
    
    // RENDERIZADO Y LECTURA DE CATEGORÍAS (Punto 1)
    function renderConfiguracion() {
        // Renderizado de las categorías (Punto 1)
        const categoriasContainer = document.getElementById('categorias-container');
        const avisoCategoria = document.getElementById('aviso-categoria');
        if (categoriasContainer && categoriasContainer.children.length === 0) {
            TEMAS_DISPONIBLES.forEach(tema => {
                const checkboxId = `tema-${tema.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const div = document.createElement('div');
                div.classList.add('categoria-item'); 
                div.innerHTML = `
                    <input type="checkbox" id="${checkboxId}" value="${tema}" name="tema-selector" ${configuracionActual.temasSeleccionados.includes(tema) ? 'checked' : ''}>
                    <label for="${checkboxId}">${tema}</label>
                `;
                categoriasContainer.appendChild(div);
            });
            // Añadir listener a los checkboxes
            document.querySelectorAll('input[name="tema-selector"]').forEach(input => {
                input.addEventListener('change', actualizarConfiguracionHost);
            });
        }
        
        // Sincronizar UI de configuración
        const checkboxDoble = document.getElementById('checkbox-agente-doble');
        if (checkboxDoble) {
            checkboxDoble.checked = configuracionActual.incluirAgenteDoble;
            checkboxDoble.addEventListener('change', actualizarConfiguracionHost);
        }

        // Mostrar u ocultar la configuración si soy el HOST
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const configHostDiv = document.getElementById('configuracion-host');
        if (configHostDiv) configHostDiv.style.display = esHost ? 'block' : 'none';

        // Actualizar aviso de categorías (Punto 1)
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
                avisoMin.style.display = (numJugadores < MIN_JUGADORES) ? 'block' : 'none';
            }
        }
    }
    
    // Función para Host: Guardar la configuración en Firebase
    async function actualizarConfiguracionHost() {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !codigoSalaActual) return;

        // Leer temas seleccionados (Punto 1)
        const temas = Array.from(document.querySelectorAll('input[name="tema-selector"]:checked')).map(input => input.value);
        const doble = document.getElementById('checkbox-agente-doble').checked;
        
        const nuevaConfig = {
            temasSeleccionados: temas,
            incluirAgenteDoble: doble
        };

        // Escribir la nueva configuración directamente a Firebase
        await db.ref('salas/' + codigoSalaActual + '/configuracion').update(nuevaConfig);
        
        // Esto activará el listener y actualizará la UI (incluido el botón de inicio)
    }

    // =================================================================
    // 6. LÓGICA DE FIREBASE (El reemplazo de Socket.IO)
    // =================================================================
    
    function configurarEscuchadorSala(codigoSala) {
        // ... (El inicio del listener se mantiene igual) ...
        if (listenerSala) {
            db.ref('salas/' + codigoSalaActual).off('value', listenerSala);
        }
        
        codigoSalaActual = codigoSala; // Asegurar que el código actual esté configurado
        const salaRef = db.ref('salas/' + codigoSala);

        listenerSala = salaRef.on('value', (snapshot) => {
            
            if (!snapshot.exists()) {
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
            
            // Actualizar variables de mi rol
            miRolActual = misDatos.rol || 'Tripulante';
            miPalabraSecreta = misDatos.palabraSecreta || '';
            miTemaActual = misDatos.tema || '';

            // Lógica de Vistas basada en el estado de la sala (Punto 3: Nuevos estados)
            
            if (sala.estado === 'esperando') {
                configuracionActual = sala.configuracion || configuracionActual;
                actualizarListaJugadores(jugadoresArray);
                cambiarVista('vista-lobby');
            
            } else if (sala.estado === 'revelacion') { // NUEVO ESTADO: REVELACIÓN
                manejarRevelacion(sala);
            
            } else if (sala.estado === 'enJuego') {
                actualizarListaJugadores(jugadoresArray);
                
                // SIN RONDAS NI TIEMPO: solo manejamos discutido, votando, resultado
                if (sala.rondaEstado === 'discutiendo') {
                    manejarInicioDiscusion(sala); 
                } else if (sala.rondaEstado === 'votando') {
                    manejarInicioVotacion(sala); 
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

        // 1. Asignar Roles
        const jugadoresConRoles = asignarRoles(jugadoresActuales, configuracionActual);
        
        // 2. Seleccionar Palabra Secreta y Tema
        const temaElegido = configuracionActual.temasSeleccionados[Math.floor(Math.random() * configuracionActual.temasSeleccionados.length)];
        const palabras = PALABRAS_POR_TEMA[temaElegido];
        const palabraElegida = palabras[Math.floor(Math.random() * palabras.length)];
        
        // 3. Preparar la estructura de jugadores para Firebase (objeto de objetos)
        const jugadoresParaFirebase = {};
        jugadoresConRoles.forEach(jugador => {
            let palabraInfo = palabraElegida;
            let temaInfo = temaElegido;
            
            // LÓGICA PARA IMPOSTOR Y AGENTE DOBLE (Punto 3)
            if (jugador.rol === 'Impostor') {
                palabraInfo = 'NINGUNA'; 
                temaInfo = '???'; 
            } else if (jugador.rol === 'Agente Doble') {
                 palabraInfo = 'NINGUNA'; 
                 // Sí ve la categoría
            }

            jugadoresParaFirebase[jugador.id] = {
                 ...jugador,
                 rol: jugador.rol,
                 palabraSecreta: palabraInfo,
                 tema: temaInfo,
            };
        });
        
        // 4. Actualizar la sala en Firebase
        await salaRef.update({
            jugadores: jugadoresParaFirebase, 
            estado: 'revelacion', // NUEVO ESTADO
            rondaActual: 1, // Mantenemos 1 por si se reinicia
            rondaEstado: 'rolesAsignados',
            'configuracion/palabra': palabraElegida, 
            'configuracion/temaElegido': temaElegido,
            votos: {}, 
        });
    });

    // ----------------------------------------------------
    // *** MANEJAR REVELACIÓN (Punto 3) ***
    // ----------------------------------------------------
    function manejarRevelacion(sala) {
        cambiarVista('vista-revelacion');
        
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const esHost = misDatos?.esHost;

        const rolDisplay = document.getElementById('rol-revelacion-display');
        const palabraDisplay = document.getElementById('palabra-revelacion-display');
        const temaDisplay = document.getElementById('tema-valor-revelacion');
        const btnDiscusion = document.getElementById('btn-iniciar-discusion');
        
        // Mostrar botón de iniciar discusión al Host (Punto 4)
        if (btnDiscusion) {
             btnDiscusion.style.display = esHost ? 'block' : 'none';
        }

        if (rolDisplay && palabraDisplay && temaDisplay) {
            rolDisplay.textContent = `Tu Rol: ¡${miRolActual}!`;
            temaDisplay.textContent = miTemaActual;

            if (miRolActual === 'Impostor') {
                palabraDisplay.textContent = "¡ERES EL IMPOSTOR! No conoces la palabra secreta. Tu objetivo es no ser descubierto.";
                palabraDisplay.style.backgroundColor = '#990000';
                palabraDisplay.style.color = '#fff';
            } else if (miRolActual === 'Agente Doble') {
                 palabraDisplay.textContent = "Eres el AGENTE DOBLE. Tu objetivo es que el impostor NO gane, pero tú sí conoces la categoría.";
                 palabraDisplay.style.backgroundColor = '#8B4513';
                 palabraDisplay.style.color = '#fff';
            } else {
                palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                palabraDisplay.style.backgroundColor = '#4CAF50';
                palabraDisplay.style.color = '#fff';
            }
        }
    }
    
    // ----------------------------------------------------
    // *** INICIAR DISCUSIÓN (HOST) - Transición de Revelación a Juego (Punto 4) ***
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

        // Renderizar el rol y la palabra (similar a revelación, pero en vista juego)
        document.getElementById('rol-juego-display').textContent = `Tu Rol: ¡${miRolActual}!`;
        document.getElementById('tema-valor').textContent = miTemaActual;
        
        const palabraDisplay = document.getElementById('palabra-secreta-display');
        if (palabraDisplay) {
             if (miRolActual === 'Impostor') {
                palabraDisplay.textContent = "Eres el IMPOSTOR. ¡Cuidado con tus palabras!";
                palabraDisplay.style.backgroundColor = '#990000';
             } else if (miRolActual === 'Agente Doble') {
                 palabraDisplay.textContent = "Eres el AGENTE DOBLE. ¡Cuidado con tus palabras!";
                 palabraDisplay.style.backgroundColor = '#8B4513';
             } else {
                palabraDisplay.textContent = misDatos.palabraSecreta;
                palabraDisplay.style.backgroundColor = '#4CAF50';
             }
        }
        
        // Mostrar botón de forzar votación al Host (Punto 5)
        const btnForzar = document.getElementById('btn-forzar-votacion');
        if (btnForzar) btnForzar.style.display = esHost ? 'block' : 'none';
    }
    
    // ----------------------------------------------------
    // *** PASAR A ELIMINACIÓN (HOST) - Punto 5 ***
    // ----------------------------------------------------
    document.getElementById('btn-forzar-votacion').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         await db.ref('salas/' + codigoSalaActual).update({ rondaEstado: 'votando' });
    });
    
    // ----------------------------------------------------
    // *** PROCESAR VOTACIÓN (SOLO HOST) ***
    // ----------------------------------------------------
    async function procesarVotacionHost(sala) {
         // ... (La lógica de conteo se mantiene igual) ...
         if (!jugadoresActuales.find(j => j.id === miId)?.esHost) return; 

         const conteoVotos = {}; 
         const jugadoresActivos = jugadoresActuales.filter(j => !j.eliminado);

         // Inicializar el conteo de votos
         jugadoresActivos.forEach(j => conteoVotos[j.id] = 0);
         conteoVotos['none'] = 0;

         // Contar los votos
         for (const votanteId in sala.votos) {
             const votadoId = sala.votos[votanteId];
             if (conteoVotos.hasOwnProperty(votadoId)) {
                 conteoVotos[votadoId]++;
             } else if (votadoId === 'none') {
                 conteoVotos['none']++;
             }
         }

         let jugadorEliminado = null;
         let maxVotos = 0;
         let empates = [];

         for (const id in conteoVotos) {
             if (id !== 'none' && conteoVotos[id] > maxVotos) {
                 maxVotos = conteoVotos[id];
                 jugadorEliminado = jugadoresActuales.find(j => j.id === id);
                 empates = [jugadorEliminado];
             } else if (id !== 'none' && conteoVotos[id] === maxVotos && maxVotos > 0) {
                 empates.push(jugadoresActuales.find(j => j.id === id));
             }
         }

         if (empates.length > 1 || maxVotos === 0) {
             jugadorEliminado = null; // Nadie eliminado por empate o abstención total
         }

         // 1. Actualizar el jugador eliminado en la DB
         if (jugadorEliminado) {
             await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorEliminado.id}/eliminado`).set(true);
         }
         
         // 2. Actualizar el resultado de la ronda en la DB para que todos lo lean
         await db.ref('salas/' + codigoSalaActual).update({
             rondaEstado: 'resultado',
             ultimoResultado: {
                 conteo: conteoVotos,
                 jugadorEliminadoId: jugadorEliminado ? jugadorEliminado.id : null,
                 rolRevelado: jugadorEliminado ? jugadorEliminado.rol : null,
             }
         });
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

         // Renderizar el conteo de votos
         const detallesVotos = document.getElementById('detalles-votacion-container');
         if (detallesVotos) {
             detallesVotos.innerHTML = '<h4>Conteo de Votos:</h4>';
             for (const id in resultado.conteo) {
                 const nombre = id === 'none' ? 'Abstención' : jugadoresActuales.find(j => j.id === id)?.nombre || 'Desconocido';
                 detallesVotos.innerHTML += `<p>${nombre}: ${resultado.conteo[id]} votos</p>`;
             }
         }
         
         // Mostrar botones de Host (Punto 6)
         const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
         const accionesFinalesHost = document.getElementById('acciones-finales-host');
         if (accionesFinalesHost) accionesFinalesHost.style.display = esHost ? 'flex' : 'none';
         
         // Borrar la sala si el juego ya terminó (ganador determinado)
         const ganador = chequearFinDeJuego(jugadoresActuales);
         if (ganador) {
             // Si hay ganador, se procede a la vista final, pero mantenemos los botones por ahora
             document.getElementById('jugador-eliminado-display').textContent += `\n ¡El juego terminó! Ganan los ${ganador}.`;
             
             // Opcional: Host puede forzar la transición a la vista final para mostrar todos los roles
             if (esHost) {
                  setTimeout(async () => {
                     if (sala.estado !== 'finalizado') {
                        await db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
                     }
                  }, 5000); 
             }
         }
    }
    
    // ----------------------------------------------------
    // *** 6.1: REINICIAR PARTIDA (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-reiniciar-partida').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         // Resetear la sala a estado 'esperando', manteniendo a los jugadores y la configuración básica
         await db.ref('salas/' + codigoSalaActual).update({
             estado: 'esperando',
             rondaActual: 0,
             rondaEstado: 'esperando',
             votos: {}, 
             'configuracion/palabra': null,
             'configuracion/temaElegido': null
         });

         // Resetear roles y estado de eliminado para todos los jugadores
         jugadoresActuales.forEach(async (jugador) => {
             await db.ref(`salas/${codigoSalaActual}/jugadores/${jugador.id}`).update({
                 rol: 'Tripulante',
                 eliminado: false,
                 palabraSecreta: null,
                 tema: null
             });
         });
         
         miVotoSeleccionadoId = 'none'; // Resetear voto local
    });

    // ----------------------------------------------------
    // *** 6.2: FINALIZAR JUEGO (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-finalizar-juego').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         await db.ref('salas/' + codigoSalaActual).update({
             estado: 'finalizado' // Esto activa la vista final para todos
         });

         // Borrar la sala de Firebase inmediatamente después de mostrar la vista final
         setTimeout(() => {
             db.ref('salas/' + codigoSalaActual).remove();
         }, 3000); // 3 segundos para que los demás la lean
    });

    // ----------------------------------------------------
    // *** CÓDIGO RESTANTE ***
    // ----------------------------------------------------
    
    // ... (El resto de funciones como Unirse, Abandonar, Votar, ChequearFinDeJuego y ManejarFinDeJuego se mantienen iguales o con pequeños ajustes para la limpieza de tiempo/rondas) ...
    
    // Listener del formulario de inicio
    document.getElementById('form-inicio').addEventListener('submit', (e) => {
        e.preventDefault();
        nombreJugador = document.getElementById('input-nombre').value.trim();
        if (!nombreJugador) return alert('Por favor, ingresa tu nombre.');
        
        document.getElementById('nombre-jugador-display').textContent = nombreJugador;
        cambiarVista('vista-seleccion');
    });

    // ----------------------------------------------------
    // *** CREAR SALA CON FIREBASE (CLIENTE HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-crear-sala').addEventListener('click', async () => {
        
        let codigo = generarCodigoSala(); 

        try { 
            let snapshot = await db.ref('salas/' + codigo).once('value');
            if (snapshot.exists()) {
                codigo = generarCodigoSala();
                snapshot = await db.ref('salas/' + codigo).once('value');
                if (snapshot.exists()) {
                    throw new Error('No se pudo generar un código único después de dos intentos.');
                }
            }

            const jugadorHost = { 
                id: miId, 
                nombre: nombreJugador, 
                esHost: true, 
                rol: 'Tripulante', 
                eliminado: false,
                palabraSecreta: null,
                tema: null
            };

            const nuevaSala = {
                codigo: codigo,
                hostId: miId, 
                jugadores: {
                    [miId]: jugadorHost
                },
                estado: 'esperando',
                rondaActual: 0,
                rondaEstado: 'esperando',
                configuracion: configuracionActual, // Usa la configuración local inicial
                votos: {}, 
            };
            
            await db.ref('salas/' + codigo).set(nuevaSala);
            
            document.getElementById('codigo-lobby-display').textContent = codigo;
            configurarEscuchadorSala(codigo);

        } catch (error) {
            console.error("Error al crear la sala en Firebase:", error);
            alert(`🔴 ERROR AL CREAR SALA: Fallo al escribir en DB. Esto es probablemente un error de REGLAS DE SEGURIDAD. Verifica tus reglas de Firebase. Detalle: ${error.message}`);
        }
    });

    // ----------------------------------------------------
    // *** UNIRSE A SALA CON FIREBASE ***
    // ----------------------------------------------------
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
                 tema: null 
            };
            
            const jugadoresRef = db.ref('salas/' + codigo + '/jugadores/' + miId);
            await jugadoresRef.set(nuevoJugador);

            configurarEscuchadorSala(codigo);
            document.getElementById('codigo-lobby-display').textContent = codigo;

        } catch (error) {
            console.error("Error al unirse a la sala en Firebase:", error);
            alert(`🔴 ERROR AL UNIRSE: Fallo de red o de permisos. Detalle: ${error.message}`);
        }
    });

    // El resto de funciones (manejarInicioVotacion, votarJugador, chequearFinDeJuego, manejarFinDeJuego, etc.) se mantienen sin cambios mayores, ya que no dependen del tiempo o las rondas.

}); // CIERRE DEL DOMContentLoaded