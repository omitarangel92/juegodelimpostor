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
    'Caliente +18 🔥': ['Culiar', 'Gemidos', 'Verga', 'Cuca', 'semen', 'kamasutra', 'Lencería', 'tetas', 'squirt'] 
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
        if (!misDatos?.esHost || !codigoSalaActual || jugadorId === miId) return;
        
        if (confirm('¿Estás seguro de que quieres expulsar a este jugador de la sala?')) {
             // 1. Marcarlo como eliminado inmediatamente para que se actualice la lista.
             await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorId}`).update({ 
                 eliminado: true,
                 rol: 'EXPULSADO',
                 palabraSecreta: null,
                 tema: null 
             });
             // 2. Sacarlo de la lista (esto activará el listener de Firebase y actualizará todo)
             await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorId}`).remove();
        }
    }
    
    // ----------------------------------------------------
    // *** MANEJAR REVELACIÓN DE ROL ***
    // ----------------------------------------------------
    function manejarRevelacion(sala) {
        cambiarVista('vista-revelacion');
        const misDatos = sala.jugadores[miId];
        miRolActual = misDatos.rol;
        miPalabraSecreta = misDatos.palabraSecreta;
        miTemaActual = misDatos.tema;
        
        // Asignar Palabra Secreta y Tema al Jugador
        document.getElementById('tema-revelacion-display').textContent = miTemaActual || '???';

        const rolDisplay = document.getElementById('revelacion-titulo');
        const palabraDisplay = document.getElementById('revelacion-detalle');

        // Resetear estilos antes de aplicar el nuevo
        if (rolDisplay) {
            rolDisplay.style.color = '';
            rolDisplay.style.textShadow = '';
        }
        if (palabraDisplay) {
            palabraDisplay.style.backgroundColor = '';
            palabraDisplay.style.color = '';
        }
        
        // Lo más importante: Ocultar si el jugador ya está eliminado
        if (misDatos.eliminado) {
            rolDisplay.textContent = '❌ ELIMINADO';
            palabraDisplay.textContent = 'No puedes participar en esta ronda.';
            // Estilos de eliminado por defecto
            rolDisplay.style.color = 'var(--color-text)'; 
            palabraDisplay.style.backgroundColor = '#444';
            palabraDisplay.style.color = 'var(--color-text)';
        } else {
            // *** LÓGICA DE CAMBIO DE COLOR SOLICITADA ***
            if (miRolActual === 'Impostor') {
                rolDisplay.textContent = 'Tu Rol: ¡IMPOSTOR!';
                palabraDisplay.textContent = '¡Tu misión es encontrar la palabra secreta sin que te descubran!';
                
                // Aplicar color de Impostor (Rojo)
                rolDisplay.style.color = 'var(--color-impostor)';
                rolDisplay.style.textShadow = '0 0 10px var(--color-impostor)'; // Efecto Neón
                
                palabraDisplay.style.backgroundColor = 'var(--color-impostor)';
                palabraDisplay.style.color = 'var(--color-card)'; // Texto oscuro sobre fondo de color
                
            } else if (miRolActual === 'Agente Doble') {
                rolDisplay.textContent = 'Tu Rol: ¡AGENTE DOBLE!';
                palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                
                // Aplicar color de Agente Doble (Naranja)
                rolDisplay.style.color = 'var(--color-agentedoble)';
                rolDisplay.style.textShadow = '0 0 10px var(--color-agentedoble)'; // Efecto Neón
                
                palabraDisplay.style.backgroundColor = 'var(--color-agentedoble)';
                palabraDisplay.style.color = 'var(--color-card)'; // Texto oscuro sobre fondo de color

            } else {
                rolDisplay.textContent = 'Tu Rol: ¡TRIPULANTE!';
                palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                
                // Aplicar color de Tripulante (Verde)
                rolDisplay.style.color = 'var(--color-tripulante)';
                rolDisplay.style.textShadow = '0 0 10px var(--color-tripulante)'; // Efecto Neón
                
                palabraDisplay.style.backgroundColor = 'var(--color-tripulante)';
                palabraDisplay.style.color = 'var(--color-card)'; // Texto oscuro sobre fondo de color
            }
        }
    }
    
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
            // *** LÓGICA DE CAMBIO DE COLOR SOLICITADA (VISTA DE JUEGO) ***
            if (miRolActual === 'Impostor') {
                rolDisplay.textContent = 'Tu Rol: ¡IMPOSTOR!';
                palabraDisplay.textContent = '???';
                
                // Aplicar color de Impostor (Rojo)
                rolDisplay.style.backgroundColor = 'var(--color-impostor)';
                rolDisplay.style.color = 'var(--color-card)';

            } else if (miRolActual === 'Agente Doble') {
                rolDisplay.textContent = 'Tu Rol: ¡AGENTE DOBLE!';
                palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                
                // Aplicar color de Agente Doble (Naranja)
                rolDisplay.style.backgroundColor = 'var(--color-agentedoble)';
                rolDisplay.style.color = 'var(--color-card)';

            } else {
                rolDisplay.textContent = 'Tu Rol: ¡TRIPULANTE!';
                palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                
                // Aplicar color de Tripulante (Verde)
                rolDisplay.style.backgroundColor = 'var(--color-tripulante)';
                rolDisplay.style.color = 'var(--color-card)';
            }
        }
        
        // Mostrar u ocultar el botón de forzar votación al Host
        const btnForzarVotacion = document.getElementById('btn-forzar-votacion');
        if (btnForzarVotacion) {
            btnForzarVotacion.style.display = esHost ? 'inline-block' : 'none';
        }
    }

    // ----------------------------------------------------
    // *** MANEJAR RESULTADO DE VOTACIÓN (VISTA RESULTADO) ***
    // ----------------------------------------------------
    function manejarResultadoVotacion(sala) {
        cambiarVista('vista-resultado');
        const resultado = sala.ultimoResultado;
        const eliminadoDisplay = document.getElementById('jugador-eliminado-display');
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const esHost = misDatos?.esHost;
        
        eliminadoDisplay.style.backgroundColor = '';
        eliminadoDisplay.style.color = '';
        eliminadoDisplay.style.border = '';
        
        if (resultado.jugadorEliminadoId) {
            const jugador = jugadoresActuales.find(j => j.id === resultado.jugadorEliminadoId);
            eliminadoDisplay.textContent = `¡${jugador.nombre} ha sido eliminado! Su rol era: ${resultado.rolRevelado}`;
            
            // Colorear según el rol revelado
            if (resultado.rolRevelado === 'Impostor') {
                // Impostor revelado (Ganan tripulantes a corto plazo)
                eliminadoDisplay.style.backgroundColor = 'var(--color-tripulante)';
                eliminadoDisplay.style.color = 'var(--color-card)';
                eliminadoDisplay.style.border = '2px solid var(--color-tripulante)';
            } else {
                // Tripulante o Agente Doble eliminado (Pierden los tripulantes)
                eliminadoDisplay.style.backgroundColor = 'var(--color-impostor)';
                eliminadoDisplay.style.color = 'var(--color-card)';
                eliminadoDisplay.style.border = '2px solid var(--color-impostor)';
            }
        } else if (resultado.ganador) {
            eliminadoDisplay.textContent = `¡FIN DE JUEGO! Ganan los ${resultado.ganador}`;
            eliminadoDisplay.style.backgroundColor = 'var(--color-secondary-neon)';
            eliminadoDisplay.style.color = 'var(--color-card)';
            eliminadoDisplay.style.border = '2px solid var(--color-secondary-neon)';
        } else {
            eliminadoDisplay.textContent = 'Nadie fue eliminado (Empate o Abstención mayoritaria).';
            eliminadoDisplay.style.backgroundColor = '#555';
            eliminadoDisplay.style.color = 'var(--color-text)';
            eliminadoDisplay.style.border = 'none';
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
        const btnContinuar = document.getElementById('btn-continuar-discusion');
        const btnFinalizarResultado = document.getElementById('btn-finalizar-juego-resultado');
        
        if (accionesHost) accionesHost.style.display = esHost ? 'flex' : 'none';
        
        if (btnContinuar) btnContinuar.style.display = resultado.ganador ? 'none' : 'inline-block';
        if (btnFinalizarResultado) btnFinalizarResultado.style.display = resultado.ganador ? 'inline-block' : 'none';
        
    }

    // ----------------------------------------------------
    // *** PROCESAR VOTACIÓN (SOLO HOST) ***
    // ----------------------------------------------------
    async function procesarVotacionHost(sala) {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        const votos = sala.votos || {};
        const jugadoresActivos = jugadoresActuales.filter(j => !j.eliminado);
        
        // 1. Contar votos
        const conteoVotos = {};
        Object.values(votos).forEach(jugadorVotadoId => {
            conteoVotos[jugadorVotadoId] = (conteoVotos[jugadorVotadoId] || 0) + 1;
        });

        // 2. Determinar el más votado (excluyendo "nadie" para la eliminación)
        let maxVotos = 0;
        let jugadorEliminadoId = null;
        
        // Convertir conteo en array, excluyendo 'none'
        const conteoArray = Object.keys(conteoVotos)
            .filter(id => id !== 'none' && jugadoresActivos.some(j => j.id === id)) // Solo jugadores activos y no 'none'
            .map(id => ({ id, votos: conteoVotos[id] }));
            
        conteoArray.sort((a, b) => b.votos - a.votos);
        
        if (conteoArray.length > 0) {
             maxVotos = conteoArray[0].votos;
             // Chequear si hay empate en el más votado
             const empatados = conteoArray.filter(item => item.votos === maxVotos);
             if (empatados.length === 1) {
                 // Si el más votado tiene más votos que la opción 'none' O si 'none' no existe o tiene menos.
                 const votosNadie = conteoVotos['none'] || 0;
                 if (maxVotos > votosNadie) {
                     jugadorEliminadoId = empatados[0].id;
                 }
             }
        }
        
        const jugadorEliminado = jugadoresActuales.find(j => j.id === jugadorEliminadoId);
        
        // Actualizar el estado del jugador en la sala (si hay eliminación)
        if (jugadorEliminado) {
             await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorEliminadoId}`).update({
                 eliminado: true
             });
        }
        
        // Preparar la lista de jugadores actualizada (para la vista de resultado)
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

    // ----------------------------------------------------
    // *** FUNCIÓN DE VOTACIÓN (CLIENTE) ***
    // ----------------------------------------------------
    window.votarJugador = async function(jugadorVotadoId) {
        if (!codigoSalaActual || !jugadoresActuales.find(j => j.id === miId) || jugadoresActuales.find(j => j.id === miId)?.eliminado) return;

        // Si el estado de la sala no es 'votando', no se permite el voto (medida de seguridad)
        const salaSnapshot = await db.ref('salas/' + codigoSalaActual).once('value');
        if (salaSnapshot.val()?.rondaEstado !== 'votando') return;
        
        miVotoSeleccionadoId = jugadorVotadoId;
        await db.ref(`salas/${codigoSalaActual}/votos/${miId}`).set(jugadorVotadoId);
        
        // Actualizar UI localmente
        const listaVotos = document.getElementById('opciones-votacion');
        if (listaVotos) {
            document.querySelectorAll('.btn-votar').forEach(btn => btn.classList.remove('votado'));
            const btnVotado = listaVotos.querySelector(`[data-voto-id="${jugadorVotadoId}"]`);
            if (btnVotado) {
                btnVotado.classList.add('votado');
            }
        }
    }
    
    // ----------------------------------------------------
    // *** ACCIONES DE HOST ***
    // ----------------------------------------------------
    document.getElementById('btn-iniciar-discusion').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        await db.ref('salas/' + codigoSalaActual).update({ estado: 'enJuego', rondaEstado: 'discutiendo' });
    });
    
    document.getElementById('btn-forzar-votacion').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        // Reiniciar votos antes de pasar a 'votando' para evitar residuos
        await db.ref('salas/' + codigoSalaActual).update({ rondaEstado: 'votando', votos: {} });
        miVotoSeleccionadoId = 'none'; // Resetear el voto local
    });
    
    document.getElementById('btn-continuar-discusion').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        // Volver al estado de discusión para la siguiente ronda
        await db.ref('salas/' + codigoSalaActual).update({ estado: 'enJuego', rondaEstado: 'discutiendo' });
    });

    document.getElementById('btn-finalizar-juego').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        // Finalizar forzosamente el juego
        await db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
    });

    document.getElementById('btn-finalizar-juego-resultado').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        // Finalizar forzosamente el juego
        await db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
    });
    
    document.getElementById('btn-reiniciar-partida').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        // Limpiar el estado de juego y devolver al lobby
        await db.ref('salas/' + codigoSalaActual).update({ 
            estado: 'esperando', 
            rondaEstado: 'lobby',
            ultimoResultado: null,
            votos: null 
        });
        // Reiniciar los roles de los jugadores
        const jugadoresRef = db.ref('salas/' + codigoSalaActual + '/jugadores');
        jugadoresActuales.forEach(j => {
            jugadoresRef.child(j.id).update({
                rol: 'Tripulante',
                eliminado: false,
                palabraSecreta: null,
                tema: null
            });
        });
        miVotoSeleccionadoId = 'none'; // Resetear el voto local
    });


    // ----------------------------------------------------
    // *** LÓGICA DE FIN DE JUEGO Y CHEQUEO DE ESTADO ***
    // ----------------------------------------------------

    function chequearFinDeJuego(jugadores) {
        const jugadoresActivos = jugadores.filter(j => !j.eliminado);
        const impostoresActivos = jugadoresActivos.filter(j => j.rol === 'Impostor');
        const agentesDoblesActivos = jugadoresActivos.filter(j => j.rol === 'Agente Doble');
        const tripulantesActivos = jugadoresActivos.filter(j => j.rol === 'Tripulante' || j.rol === 'Agente Doble');
        
        const numImpostores = jugadores.filter(j => j.rol === 'Impostor').length;

        // 1. Ganan Impostores: Si el número de Impostores y Agentes Dobles activos es igual o mayor al número de Tripulantes puros activos.
        // O si solo queda 1 Impostor y 1 Agente Doble, es decir, el Impostor gana si tiene al Agente Doble a su lado.
        if (jugadoresActivos.length > 0 && impostoresActivos.length >= tripulantesActivos.length) {
            return 'Impostores';
        }
        
        // 2. Ganan Tripulantes: Si todos los Impostores puros han sido eliminados.
        if (impostoresActivos.length === 0) {
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
            let colorRol = ''; // Para el color de texto del rol
            
            // Asignar clase de estilo y color
            if (j.rol === 'Impostor') {
                claseRol = 'impostor'; 
                colorRol = 'var(--color-impostor)';
            }
            else if (j.rol === 'Agente Doble') {
                claseRol = 'agentedoble';
                colorRol = 'var(--color-agentedoble)';
            }
            else {
                claseRol = 'tripulante';
                colorRol = 'var(--color-tripulante)';
            }

            const estado = j.eliminado ? '❌ Eliminado' : '✅ Activo';
            const palabraRevelada = j.palabraSecreta === 'NINGUNA' ? 'N/A' : (j.palabraSecreta || 'No Asignada');

            // Insertar el color del rol en el LI para el color de fondo
            li.style.borderColor = colorRol; 
            
            li.innerHTML = `
                ${j.nombre} (<span class="${j.eliminado ? 'eliminado' : 'activo'}">${estado}</span>): 
                <span class="${claseRol}" style="color: ${colorRol}; font-weight: bold;">${j.rol}</span> 
                <br>(Palabra: ${palabraRevelada})
            `;
            listaRoles.appendChild(li);
        });

        // Muestra botones de Reiniciar/Cerrar SOLO al Host
        const accionesFinalesFinalHost = document.getElementById('acciones-finales-final-host');
        if (accionesFinalesFinalHost) {
            accionesFinalesFinalHost.style.display = esHost ? 'flex' : 'none';
        }
        
        // Configurar botones de Host al final
        document.getElementById('btn-reiniciar-partida-final').addEventListener('click', async () => {
             await db.ref('salas/' + codigoSalaActual).update({ 
                estado: 'esperando', 
                rondaEstado: 'lobby',
                ultimoResultado: null,
                votos: null 
            });
            const jugadoresRef = db.ref('salas/' + codigoSalaActual + '/jugadores');
            jugadoresActuales.forEach(j => {
                jugadoresRef.child(j.id).update({
                    rol: 'Tripulante',
                    eliminado: false,
                    palabraSecreta: null,
                    tema: null
                });
            });
            miVotoSeleccionadoId = 'none';
        });

        document.getElementById('btn-finalizar-juego-final').addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que quieres CERRAR la sala? Esto expulsará a todos los jugadores.')) {
                await db.ref('salas/' + codigoSalaActual).remove();
                window.location.reload();
            }
        });
    }

    // =================================================================
    // 6. LÓGICA DE FIREBASE (El reemplazo de Socket.IO)
    // =================================================================
    
    // ----------------------------------------------------
    // *** ESCUCHADOR CENTRAL DE LA SALA ***
    // ----------------------------------------------------
    function configurarEscuchadorSala(codigo) {
        codigoSalaActual = codigo;
        const salaRef = db.ref('salas/' + codigo);
        
        // Si ya hay un listener, desuscribirse
        if (listenerSala) {
            salaRef.off('value', listenerSala);
        }
        
        listenerSala = salaRef.on('value', (snapshot) => {
            const sala = snapshot.val();
            
            // Si la sala fue eliminada (ej: por el Host), salir
            if (!sala) {
                alert('🔴 La sala ha sido cerrada por el Host.');
                window.location.reload();
                return;
            }
            
            const jugadores = sala.jugadores || {};
            const jugadoresArray = Object.keys(jugadores).map(key => ({ ...jugadores[key], hostId: sala.hostId }));
            jugadoresActuales = jugadoresArray;

            // Si el jugador actual no está en la lista (fue expulsado o se salió), salir
            if (!jugadoresArray.find(j => j.id === miId)) {
                if (codigoSalaActual !== '') { // Evitar el primer chequeo al iniciar
                     alert('¡Fuiste expulsado de la sala o la sala fue eliminada!');
                     window.location.reload();
                }
                return;
            }
            
            const misDatos = jugadoresActuales.find(j => j.id === miId);
            miRolActual = misDatos?.rol || miRolActual;
            miPalabraSecreta = misDatos?.palabraSecreta || miPalabraSecreta;
            miTemaActual = misDatos?.tema || miTemaActual;

            // Actualizar configuracion actual si es el Host o si ya se asignó
            if (sala.configuracion) {
                 configuracionActual = sala.configuracion;
            }

            // Vistas basada en el estado de la sala
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
                    
                    // Lógica para que el host detecte el final de la votación
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
                palabraInfo = 'NINGUNA'; // El impostor no tiene la palabra
                temaInfo = temaElegido; // El impostor conoce el tema
            }
            
            jugadoresParaFirebase[jugador.id] = {
                 ...jugador,
                 palabraSecreta: palabraInfo,
                 tema: temaInfo,
                 hostId: misDatos.id // Para asegurar que el hostId se mantenga en los jugadores
            };
        });
        
        // Reiniciar variables de estado y lanzar la revelación
        await salaRef.update({
            estado: 'revelacion', // Nuevo estado de revelación de rol
            rondaEstado: 'revelacion', // Para ser más explícitos
            jugadores: jugadoresParaFirebase,
            ultimoResultado: null, // Limpiar resultados anteriores
            votos: null // Limpiar votos anteriores
        });
    });

    // ----------------------------------------------------
    // *** MANEJAR INICIO DE VOTACIÓN (VISTA VOTACIÓN) ***
    // ----------------------------------------------------
    function manejarInicioVotacion(sala) {
        cambiarVista('vista-votacion');
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const esHost = misDatos?.esHost;

        // Ocultar botón de Host si no es Host
        const btnForzarHost = document.getElementById('btn-forzar-votacion-terminar');
        if (btnForzarHost) {
             btnForzarHost.style.display = esHost ? 'inline-block' : 'none';
        }
        
        // Bloquear votación si ya votó o está eliminado
        const yaVote = sala.votos && sala.votos[miId];
        const estoyEliminado = misDatos?.eliminado;
        const mensajeVotacion = document.getElementById('mensaje-votacion-estado');
        const opcionesVotacion = document.getElementById('opciones-votacion');

        if (mensajeVotacion) {
            if (estoyEliminado) {
                mensajeVotacion.textContent = '❌ Estás eliminado y no puedes votar.';
                opcionesVotacion.style.pointerEvents = 'none';
                opcionesVotacion.style.opacity = '0.5';
            } else if (yaVote) {
                mensajeVotacion.textContent = '✅ ¡Tu voto ha sido registrado!';
                opcionesVotacion.style.pointerEvents = 'none';
                opcionesVotacion.style.opacity = '0.5';
            } else {
                mensajeVotacion.textContent = '¡Es momento de votar por el Impostor!';
                opcionesVotacion.style.pointerEvents = 'auto';
                opcionesVotacion.style.opacity = '1';
            }
        }
        
        // Si el host detecta que todos votaron, el listener llama a procesarVotacionHost.
    }

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
        try {
            const codigo = generarCodigoSala();
            const salaRef = db.ref('salas/' + codigo);
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
            
            // Inicializar la sala
            await salaRef.set({
                hostId: miId,
                estado: 'esperando',
                rondaEstado: 'lobby',
                configuracion: configuracionActual,
                jugadores: {
                    [miId]: nuevoJugador
                }
            });

            configurarEscuchadorSala(codigo);
            document.getElementById('codigo-lobby-display').textContent = codigo;
            
        } catch (error) {
            console.error("Error al crear la sala en Firebase:", error);
            alert(`🔴 ERROR AL CREAR SALA: Fallo de red o de permisos. Detalle: ${error.message}`);
        }
    });

    document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = document.getElementById('input-codigo').value.trim().toUpperCase();
        if (!codigo) return;
        
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
                 hostId: sala.hostId // Guardamos el ID del Host para referencia
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

    window.abandonarSala = async function() {
        if (!codigoSalaActual || !miId) return;

        try {
            const misDatos = jugadoresActuales.find(j => j.id === miId);
            const salaRef = db.ref('salas/' + codigoSalaActual);

            // 1. Quitar al jugador de la sala
            await db.ref(`salas/${codigoSalaActual}/jugadores/${miId}`).remove();

            // 2. Si el que abandona es el Host, transferir la hostía o cerrar la sala
            if (misDatos?.esHost) {
                const jugadoresRestantes = jugadoresActuales.filter(j => j.id !== miId);
                if (jugadoresRestantes.length > 0) {
                    // Transferir hostía al primer jugador restante
                    const nuevoHostId = jugadoresRestantes[0].id;
                    await salaRef.update({ hostId: nuevoHostId });
                    await db.ref(`salas/${codigoSalaActual}/jugadores/${nuevoHostId}`).update({ esHost: true, hostId: nuevoHostId });
                    alert('Has abandonado la sala. La hostía ha sido transferida a ' + jugadoresRestantes[0].nombre);
                } else {
                    // Si no quedan jugadores, eliminar la sala
                    await salaRef.remove();
                    alert('Has cerrado la sala.');
                }
            } else {
                alert('Has abandonado la sala.');
            }

        } catch (error) {
            console.error("Error al abandonar la sala:", error);
            alert(`🔴 ERROR AL ABANDONAR: ${error.message}`);
        }
        
        window.location.reload();
    }
    
    // Configuración para el botón de terminar votación (Solo Host)
    document.getElementById('btn-forzar-votacion-terminar').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        const salaRef = db.ref('salas/' + codigoSalaActual);
        const salaSnapshot = await salaRef.once('value');
        const sala = salaSnapshot.val();

        if (sala?.rondaEstado === 'votando') {
             // Procesar la votación con los votos que haya
             procesarVotacionHost(sala);
        }
    });

}); // Fin de DOMContentLoaded