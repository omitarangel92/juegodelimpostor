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
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana'],
    'Países 🌎': ['España', 'México', 'Colombia', 'Japón', 'Francia', 'Canadá', 'Brasil', 'Alemania'],
    'Profesiones 💼': ['Médico', 'Maestro', 'Ingeniero', 'Cocinero', 'Policía', 'Bombero', 'Abogado', 'Piloto'],
    'Objetos Cotidianos 💡': ['Teléfono', 'Taza', 'Llaves', 'Reloj', 'Libro', 'Silla', 'Mesa', 'Ventana'],
    'Videojuegos 🎮': ['Mario', 'Zelda', 'Fortnite', 'Minecraft', 'Pacman', 'Tetris', 'Ajedrez', 'Póker'],
    'Música 🎵': ['Guitarra', 'Batería', 'Piano', 'Voz', 'Pop', 'Rock', 'Jazz', 'Clásica'],
    'Deportes ⚽': ['Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Correr', 'Golf', 'Voleibol', 'Boxeo'],
    'Series/Películas 🎬': ['Drama', 'Comedia', 'Terror', 'Western', 'Ciencia Ficción', 'Documental', 'Musical', 'Anime'],
    'Transporte 🚗': ['Avión', 'Tren', 'Bicicleta', 'Barco', 'Moto', 'Bus', 'Metro', 'Patineta'],
    'Herramientas 🔧': ['Martillo', 'Destornillador', 'Sierra', 'Clavo', 'Tornillo', 'Taladro', 'Cinta', 'Lija'],
    'Frutas/Verduras 🥦': ['Banana', 'Fresa', 'Pera', 'Zanahoria', 'Brócoli', 'Lechuga', 'Cebolla', 'Tomate'],
    'Marcas Famosas 🏷️': ['Nike', 'Adidas', 'Apple', 'Samsung', 'Google', 'Coca-Cola', 'Zara', 'Toyota'],
    'Partes del Cuerpo 💪': ['Mano', 'Pie', 'Cabeza', 'Ojo', 'Nariz', 'Boca', 'Corazón', 'Pulmón'],
    'Planetas 🪐': ['Marte', 'Tierra', 'Júpiter', 'Saturno', 'Sol', 'Luna', 'Estrella', 'Cometa'],
    'Ropa 👗': ['Camiseta', 'Pantalón', 'Calcetín', 'Abrigo', 'Bufanda', 'Gorro', 'Guante', 'Zapatos'],
    'Dibujos Animados 📺': ['Pikachu', 'Homero', 'Mickey', 'Bob Esponja', 'Scooby', 'Bugs Bunny', 'Popeye', 'Doraemon'],
    'Lugares Típicos 🏛️': ['Playa', 'Montaña', 'Desierto', 'Ciudad', 'Pueblo', 'Bosque', 'Lago', 'Río'],
    'Clima ☀️': ['Lluvia', 'Nieve', 'Viento', 'Sol', 'Tormenta', 'Arcoíris', 'Nube', 'Niebla'],
    'Sentimientos 💖': ['Felicidad', 'Tristeza', 'Enojo', 'Miedo', 'Amor', 'Sorpresa', 'Calma', 'Aburrimiento'],
    'Tecnología 💻': ['Computadora', 'Mouse', 'Teclado', 'Cámara', 'Internet', 'Robot', 'Cable', 'Chip'],
    'Mitología 👹': ['Dragón', 'Sirena', 'Duende', 'Vampiro', 'Fantasma', 'Ángel', 'Ogro', 'Hada'],
    
    // Categoría explícita y malpensada:
    'Caliente +18 🔥': ['Sexo', 'Gemidos', 'Verga', 'Cuca', 'Tetas', 'Semen', 'Squirt', 'Lencería', 'Masturbación'] 
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
    // Inicializar configuracionActual con el primer tema como seleccionado por defecto
    let configuracionActual = { 
        temaSeleccionado: TEMAS_DISPONIBLES[0], 
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

            if (jugadores.find(p => p.id === miId)?.esHost && !esMiJugador && !esEliminado && jugadores.length > MIN_JUGADORES) {
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
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const configHostDiv = document.getElementById('configuracion-host');
        
        if (configHostDiv) configHostDiv.style.display = esHost ? 'block' : 'none';
        if (!esHost) return; // Solo el host renderiza y gestiona esto.
        
        if (categoriasContainer && categoriasContainer.children.length === 0) {
            
            TEMAS_DISPONIBLES.forEach(tema => {
                const radioId = `tema-${tema.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const div = document.createElement('div');
                div.classList.add('categoria-item'); 
                const esCaliente = tema.includes('Caliente +18');
                
                // *** CAMBIO CLAVE: input type="radio" con el mismo name="tema-selector" ***
                div.innerHTML = `
                    <input type="radio" id="${radioId}" value="${tema}" name="tema-selector" ${configuracionActual.temaSeleccionado === tema ? 'checked' : ''}>
                    <label for="${radioId}" ${esCaliente ? 'class="categoria-hot"' : ''}>${tema}</label>
                `;
                
                categoriasContainer.appendChild(div);
            });
            // Añadir listener al contenedor para delegar el evento
            categoriasContainer.addEventListener('change', actualizarConfiguracionHost);
            
        } else {
             // Si ya existe, solo actualiza el estado "checked"
             document.querySelectorAll('input[name="tema-selector"]').forEach(input => {
                 input.checked = configuracionActual.temaSeleccionado === input.value;
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

        if (avisoCategoria) {
            // El aviso solo se mostrará si no hay tema seleccionado
            avisoCategoria.style.display = (!configuracionActual.temaSeleccionado) ? 'block' : 'none';
        }
    }

    function actualizarBotonInicioJuego() {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const numJugadores = jugadoresActuales.length;
        const btnIniciar = document.getElementById('btn-iniciar-juego');
        const avisoMin = document.getElementById('min-jugadores-aviso');
        
        if (esHost && btnIniciar && avisoMin) {
            const temaSeleccionado = configuracionActual.temaSeleccionado;
            
            if (numJugadores >= MIN_JUGADORES && numJugadores <= MAX_JUGADORES && temaSeleccionado) {
                btnIniciar.disabled = false;
                avisoMin.style.display = 'none';
            } else {
                btnIniciar.disabled = true;
                if (numJugadores < MIN_JUGADORES) {
                    avisoMin.textContent = `Se requieren ${MIN_JUGADORES} jugadores para iniciar.`;
                    avisoMin.style.display = 'block';
                } else if (!temaSeleccionado) {
                    avisoMin.textContent = `Selecciona 1 categoría.`;
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

        // *** LECTURA DE UN SOLO VALOR 'radio' ***
        const temaSeleccionado = document.querySelector('input[name="tema-selector"]:checked')?.value || null;
        const doble = document.getElementById('checkbox-agente-doble').checked;
        
        const nuevaConfig = {
            temaSeleccionado: temaSeleccionado, // Solo un tema
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
                       conteoVotos[votadoId]++;
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
             // Si no hay sala, recargar para volver al inicio
             window.location.reload();
             return;
        }

        try {
            if (listenerSala) {
                 db.ref('salas/' + codigoSalaActual).off('value', listenerSala);
                 listenerSala = null;
            }
            
            const misDatos = jugadoresActuales.find(j => j.id === miId);

            // Eliminar mi jugador de la sala
            await db.ref(`salas/${codigoSalaActual}/jugadores/${miId}`).remove();

            if (misDatos?.esHost && jugadoresActuales.length > 1) {
                // Si el Host se va, reasignar Host al siguiente
                const jugadoresRestantes = jugadoresActuales.filter(j => j.id !== miId);
                if (jugadoresRestantes.length > 0) {
                    const nuevoHost = jugadoresRestantes[0];
                    await db.ref(`salas/${codigoSalaActual}/hostId`).set(nuevoHost.id);
                    await db.ref(`salas/${codigoSalaActual}/jugadores/${nuevoHost.id}/esHost`).set(true);
                }
            } else if (misDatos?.esHost && jugadoresActuales.length === 1) {
                 // Si el Host era el único, borrar la sala
                 await db.ref('salas/' + codigoSalaActual).remove();
            }

            // Recargar para volver a la vista inicial
            window.location.reload();

        } catch (error) {
            console.error("Error al abandonar la sala:", error);
            window.location.reload(); 
        }
    }

    function chequearFinDeJuego(jugadores) {
        const jugadoresActivos = jugadores.filter(j => !j.eliminado);
        
        const impostoresActivos = jugadoresActivos.filter(j => j.rol === 'Impostor').length;
        const tripulantesActivos = jugadoresActivos.filter(j => j.rol === 'Tripulante').length;
        const agentesDoblesActivos = jugadoresActivos.filter(j => j.rol === 'Agente Doble').length;
        
        const tripulantesYAgentesActivos = tripulantesActivos + agentesDoblesActivos;

        // Condición 1: Ganan los Impostores (igualan o superan en número a los no-impostores)
        if (impostoresActivos >= tripulantesYAgentesActivos) {
            return 'Impostores';
        }
        
        // Condición 2: Ganan Tripulantes/Agente Doble (eliminan a todos los Impostores)
        if (impostoresActivos === 0 && tripulantesYAgentesActivos > 0) {
            return 'Tripulantes'; 
        }
        
        return null; // El juego continúa
    }
    
    // Función central para la VISTA FINAL
    function manejarFinDeJuego(sala) {
           cambiarVista('vista-final');
           
           const misDatos = jugadoresActuales.find(j => j.id === miId);
           const esHost = misDatos?.esHost;
           
           // Obtener el ganador actual (si no se pasó por ultimoResultado)
           const ganador = chequearFinDeJuego(jugadoresActuales) || sala.ultimoResultado?.ganador; 

           const ganadorDisplay = document.getElementById('ganador-display');
           if(ganadorDisplay) ganadorDisplay.textContent = `🏆 ¡Ganan los ${ganador || 'Nadie'}! 🏆`;
           
           const listaRoles = document.getElementById('lista-roles-final');
           listaRoles.innerHTML = '';
           
           jugadoresActuales.forEach(j => {
               const li = document.createElement('li');
               let claseRol = '';
               if (j.rol === 'Impostor') claseRol = 'impostor';
               else if (j.rol === 'Agente Doble') claseRol = 'orange';
               else claseRol = 'tripulante';
               
               const estado = j.eliminado ? '❌ Eliminado' : '✅ Activo';
               const palabraRevelada = j.palabraSecreta === 'NINGUNA' ? 'N/A' : (j.palabraSecreta || 'No Asignada');

               li.innerHTML = `
                   ${j.nombre} (<span class="${j.eliminado ? 'eliminado' : 'activo'}">${estado}</span>): 
                   <span class="${claseRol}">${j.rol}</span> 
                   (Palabra: ${palabraRevelada})
               `;
               listaRoles.appendChild(li);
           });

           // Muestra botones de Reiniciar/Cerrar SOLO al Host
           const accionesFinalesFinalHost = document.getElementById('acciones-finales-final-host');
           if (accionesFinalesFinalHost) {
                 accionesFinalesFinalHost.style.display = esHost ? 'flex' : 'none';
           }
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
                // Si la sala se borra (ej: Host finalizó el juego)
                if (document.getElementById('vista-final').classList.contains('activa')) {
                    // Si ya estamos en la vista final, el usuario debe usar el botón de 'Volver al inicio'
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
            if (!misDatos && sala.estado !== 'finalizado') {
                 // Si misDatos es nulo y la sala no está finalizada, fui expulsado o borrado
                 alert('Has sido expulsado de la sala.');
                 window.location.reload();
                 return;
            }
            
            miRolActual = misDatos?.rol || 'Tripulante';
            miPalabraSecreta = misDatos?.palabraSecreta || '';
            miTemaActual = misDatos?.tema || '';
            
            // *** LECTURA DE UN SOLO TEMA ***
            configuracionActual = sala.configuracion || configuracionActual;
            configuracionActual.temaSeleccionado = sala.configuracion?.temaSeleccionado || configuracionActual.temaSeleccionado;
            configuracionActual.incluirAgenteDoble = sala.configuracion?.incluirAgenteDoble || configuracionActual.incluirAgenteDoble;

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
        
        const temaElegido = configuracionActual.temaSeleccionado; // Leemos el tema único
        
        if (!temaElegido || !PALABRAS_POR_TEMA[temaElegido]) {
            return alert('ERROR: Debes seleccionar una categoría válida.');
        }

        const jugadoresConRoles = asignarRoles(jugadoresActuales, configuracionActual);
        
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
            // Ocultar tema al impostor en vista revelación
            if (miRolActual === 'Impostor') {
                 temaDisplay.textContent = '???'; // Ocultar el tema al Impostor
            } else {
                 temaDisplay.textContent = miTemaActual; // Mostrar a Tripulantes y Agente Doble
            }

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

        // Ocultar tema al impostor en vista de juego
        const temaValorElement = document.getElementById('tema-valor');
        if (temaValorElement) {
             if (miRolActual === 'Impostor') {
                 temaValorElement.textContent = '???'; // Ocultar el tema al Impostor
             } else {
                 temaValorElement.textContent = miTemaActual; // Mostrar a Tripulantes y Agente Doble
             }
        }
        
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
        
        // La actualización de la lista de votación se maneja en actualizarListaJugadores,
        // la cual se llama al inicio del listener de sala.
    }

    // ----------------------------------------------------
    // *** MANEJAR RESULTADO DE VOTACIÓN (TODOS) ***
    // ----------------------------------------------------
    function manejarResultadoVotacion(sala) {
        cambiarVista('vista-resultado');

        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const esHost = misDatos?.esHost;
        const resultado = sala.ultimoResultado;
        
        // 1. Mostrar quién fue eliminado y su rol (o empate)
        const eliminadoDisplay = document.getElementById('jugador-eliminado-display');
        if (resultado.jugadorEliminadoId) {
             const jugador = jugadoresActuales.find(j => j.id === resultado.jugadorEliminadoId);
             eliminadoDisplay.textContent = `¡${jugador.nombre} ha sido eliminado! Su rol era: ${jugador.rol}`;
             eliminadoDisplay.style.backgroundColor = (jugador.rol === 'Impostor' ? 'var(--color-green)' : 'var(--color-red)');
             eliminadoDisplay.style.color = (jugador.rol === 'Impostor' ? 'var(--color-bg)' : 'var(--color-text)');
        } else if (resultado.ganador) {
             eliminadoDisplay.textContent = `¡FIN DE JUEGO! Ganan los ${resultado.ganador}`;
             eliminadoDisplay.style.backgroundColor = 'var(--color-secondary)';
             eliminadoDisplay.style.color = 'var(--color-bg)';
        } else {
             eliminadoDisplay.textContent = 'Nadie fue eliminado (Empate o Abstención mayoritaria).';
             eliminadoDisplay.style.backgroundColor = '#555';
             eliminadoDisplay.style.color = 'var(--color-text)';
        }

        // 2. Mostrar conteo de votos
        const conteoContainer = document.getElementById('detalles-votacion-container');
        conteoContainer.innerHTML = '<h4>Conteo de Votos:</h4>';
        
        const conteoArray = Object.keys(resultado.conteo || {}).map(id => {
            const jugador = jugadoresActuales.find(j => j.id === id);
            const nombre = id === 'none' ? '⚠️ Nadie' : (jugador ? jugador.nombre : 'Jugador Desconocido');
            return { nombre, votos: resultado.conteo[id] };
        }).sort((a, b) => b.votos - a.votos);

        conteoArray.forEach(item => {
             const p = document.createElement('p');
             p.textContent = `${item.nombre}: ${item.votos} voto(s)`;
             conteoContainer.appendChild(p);
        });
        
        // 3. Botones de Host (Continuar o Finalizar)
        const accionesHost = document.getElementById('acciones-finales-host');
        const btnReiniciar = document.getElementById('btn-reiniciar-partida-resultado');
        const btnFinalizar = document.getElementById('btn-finalizar-juego-resultado');
        
        if (accionesHost) accionesHost.style.display = esHost ? 'flex' : 'none';
        
        if (resultado.ganador) {
            // Si el juego terminó (hay ganador), el host solo puede finalizar o reiniciar todo
            if (btnReiniciar) btnReiniciar.textContent = '🔄 Reiniciar TODO (Ir a Lobby)';
            if (btnFinalizar) btnFinalizar.style.display = 'block';
            
            if (esHost) manejarFinDeJuego(sala); // Forzar la vista final para el Host
        } else {
             // Si el juego continúa
             if (btnReiniciar) {
                 btnReiniciar.textContent = '▶️ Continuar (Nueva Discusión)';
                 btnReiniciar.onclick = () => iniciarNuevaDiscusionHost();
             }
             if (btnFinalizar) btnFinalizar.style.display = 'none';
        }
    }
    
    // FUNCIONES DE CONTROL DE JUEGO (HOST)
    async function iniciarNuevaDiscusionHost() {
           const misDatos = jugadoresActuales.find(j => j.id === miId);
           if (!misDatos?.esHost || !codigoSalaActual) return;
           
           await db.ref('salas/' + codigoSalaActual).update({ 
               rondaEstado: 'discutiendo',
               ultimoResultado: null,
               votos: {}
           });
    }

    document.getElementById('btn-reiniciar-partida-final').addEventListener('click', async () => {
           const misDatos = jugadoresActuales.find(j => j.id === miId);
           if (!misDatos?.esHost || !codigoSalaActual) return;
           
           // Reiniciar el estado de la sala al lobby
           await db.ref('salas/' + codigoSalaActual).update({
               estado: 'esperando',
               rondaEstado: 'noIniciada',
               // Asegura que la configuración se mantenga (incluyendo el tema seleccionado)
               configuracion: configuracionActual, 
               votos: {},
               ultimoResultado: null
           });
           
           // Reiniciar el estado de los jugadores (roles y eliminado)
           const updates = {};
           jugadoresActuales.forEach(j => {
               updates[j.id] = { ...j, rol: 'Tripulante', eliminado: false, palabraSecreta: null, tema: null };
           });
           await db.ref('salas/' + codigoSalaActual + '/jugadores').update(updates);
    });

    document.getElementById('btn-finalizar-juego-final').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        if (confirm('¿Estás seguro de que quieres CERRAR la sala? Esto expulsará a todos los jugadores.')) {
            await db.ref('salas/' + codigoSalaActual).remove();
            window.location.reload(); 
        }
    });

    // ----------------------------------------------------
    // *** LÓGICA DE FIREBASE (CREAR Y UNIRSE A SALA) ***
    // ----------------------------------------------------

    document.getElementById('form-inicio').addEventListener('submit', (e) => {
        e.preventDefault();
        nombreJugador = document.getElementById('input-nombre').value.trim();
        if (nombreJugador) {
            document.getElementById('nombre-jugador-display').textContent = nombreJugador;
            cambiarVista('vista-seleccion');
        }
    });

    document.getElementById('btn-crear-sala').addEventListener('click', async () => {
        if (!nombreJugador) return alert('Por favor, ingresa tu nombre primero.');
        
        let codigo = generarCodigoSala();
        let salaRef = db.ref('salas/' + codigo);
        let snapshot = await salaRef.once('value');

        // Asegurar que el código no exista
        while (snapshot.exists()) {
            codigo = generarCodigoSala();
            salaRef = db.ref('salas/' + codigo);
            snapshot = await salaRef.once('value');
        }

        const nuevoJugador = { 
             id: miId, 
             nombre: nombreJugador, 
             esHost: true, // El creador es el Host
             rol: 'Tripulante', 
             eliminado: false,
             palabraSecreta: null,
             tema: null,
        };

        const nuevaSala = {
            estado: 'esperando', 
            hostId: miId,
            jugadores: {
                [miId]: nuevoJugador
            },
            configuracion: configuracionActual,
            rondaEstado: 'noIniciada',
        };

        try {
            await salaRef.set(nuevaSala);
            configurarEscuchadorSala(codigo);
            document.getElementById('codigo-lobby-display').textContent = codigo;
        } catch (error) {
            console.error("Error al crear la sala en Firebase:", error);
            alert(`🔴 ERROR AL CREAR SALA: Fallo de red o de permisos. Detalle: ${error.message}`);
        }
    });

    document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!nombreJugador) return alert('Por favor, ingresa tu nombre primero.');

        const codigo = document.getElementById('input-codigo').value.toUpperCase();
        if (codigo.length !== 4) return alert('El código de sala debe tener 4 letras.');

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
    });
});