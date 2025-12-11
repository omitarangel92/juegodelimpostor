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
    'Series/Películas 🎬': ['Harry Potter', 'Titanic', 'Avatar', 'IT', 'StarWars', 'La vida es bella', 'High school musical', 'Game of thrones'],
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
    
    // Lógica nueva para los impostores (Categoría de términos del juego)
    'Juego Impostor 🕵️': ['Tripulante', 'Impostor', 'Doble Agente', 'Votación', 'Palabra Clave', 'Debate', 'Eliminado', 'Lobby'],
    
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

    // *** ASIGNACIÓN DE ROLES (LÓGICA CENTRAL) ***
    // La lógica de asignación de roles (Impostor, Agente Doble, Tripulante)
    // se maneja en esta función.
    function asignarRoles(jugadores, configuracion) {
        const numJugadores = jugadores.length;
        let numImpostores = 0;
        let numAgentesDobles = 0;
        
        // 1. Determinar el número de roles
        if (numJugadores >= 3 && numJugadores <= 5) {
            numImpostores = 1;
        } else if (numJugadores >= 6 && numJugadores <= 8) {
            numImpostores = 2;
        } else if (numJugadores >= 9 && numJugadores <= 10) {
            numImpostores = 2;
        }

        // El Agente Doble es opcional y solo se asigna si hay más de 5 jugadores
        // y la opción está activada. Solo puede haber 1.
        if (configuracion.incluirAgenteDoble && numJugadores >= 6) {
             numAgentesDobles = 1;
             // Si hay Agente Doble, se resta un Impostor para mantener el balance (max 3 roles especiales)
             if (numImpostores > 1) {
                numImpostores -= 1; 
             }
        }
        
        // El número de Impostores y Agentes Dobles debe ser menor al número de jugadores
        if (numImpostores + numAgentesDobles >= numJugadores) {
            // Esto no debería pasar con la lógica de arriba y MAX_JUGADORES=10, 
            // pero es una seguridad.
            console.error("No se pueden asignar roles: demasiados impostores/agentes.");
            return jugadores; 
        }

        // 2. Elegir roles aleatoriamente
        const indicesJugadores = Array.from({ length: numJugadores }, (_, i) => i);
        
        // Shuffle (Mezclar) el array de índices para asignar roles al azar
        for (let i = indicesJugadores.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indicesJugadores[i], indicesJugadores[j]] = [indicesJugadores[j], indicesJugadores[i]];
        }

        // 3. Asignar Impostores, Agentes Dobles y Tripulantes
        let jugadoresConRoles = [...jugadores];
        let indiceActual = 0;

        // Asignar Impostores
        for (let i = 0; i < numImpostores; i++) {
            const indiceOriginal = indicesJugadores[indiceActual++];
            jugadoresConRoles[indiceOriginal].rol = 'Impostor';
        }
        
        // Asignar Agentes Dobles
        for (let i = 0; i < numAgentesDobles; i++) {
            const indiceOriginal = indicesJugadores[indiceActual++];
            jugadoresConRoles[indiceOriginal].rol = 'Agente Doble';
        }
        
        // Asignar Tripulantes a los restantes (ya vienen por defecto como 'Tripulante'
        // pero se confirma para claridad y reseteo).
        for (let i = indiceActual; i < numJugadores; i++) {
            const indiceOriginal = indicesJugadores[i];
            jugadoresConRoles[indiceOriginal].rol = 'Tripulante';
        }

        return jugadoresConRoles;
    }

    // *** ELEGIR PALABRA/TEMA Y ASIGNAR A JUGADORES ***
    function elegirPalabraYTema(jugadores, tema) {
        const palabras = PALABRAS_POR_TEMA[tema];
        if (!palabras || palabras.length < 2) {
             console.error(`Tema ${tema} no tiene suficientes palabras.`);
             return { tema, jugadores };
        }

        // Elegir una palabra aleatoria para los Tripulantes y el Agente Doble
        const palabraTripulante = palabras[Math.floor(Math.random() * palabras.length)];

        // Elegir una palabra diferente (el "tema" que solo conocerá el Impostor)
        let palabraImpostor = palabraTripulante;
        while (palabraImpostor === palabraTripulante) {
            palabraImpostor = palabras[Math.floor(Math.random() * palabras.length)];
        }

        // Asignar la palabra y el tema a cada jugador
        const jugadoresConPalabra = jugadores.map(j => {
            let palabraSecreta;
            
            // Los Tripulantes y el Agente Doble reciben la palabra normal
            if (j.rol === 'Tripulante' || j.rol === 'Agente Doble') {
                palabraSecreta = palabraTripulante;
            } 
            // Los Impostores reciben la "palabra clave" (la otra palabra)
            else if (j.rol === 'Impostor') {
                palabraSecreta = palabraImpostor; 
            }
            
            return {
                ...j,
                palabraSecreta: palabraSecreta,
                tema: tema,
                // Reiniciar el estado de votación
                votoParaId: null,
                eliminado: j.eliminado === true, // Mantener estado de eliminación si ya existía
            };
        });

        return { tema, jugadores: jugadoresConPalabra };
    }

    // *** INICIO DE JUEGO (HOST) ***
    document.getElementById('btn-iniciar-juego').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        const numJugadores = jugadoresActuales.length;
        if (numJugadores < MIN_JUGADORES || numJugadores > MAX_JUGADORES) {
             alert(`🔴 Deben haber entre ${MIN_JUGADORES} y ${MAX_JUGADORES} jugadores para iniciar.`);
             return;
        }

        try {
            // 1. Asignar Roles
            let jugadoresConRoles = asignarRoles(jugadoresActuales, configuracionActual);
            
            // 2. Elegir Palabras y Tema
            const { tema, jugadores: jugadoresConPalabra } = elegirPalabraYTema(jugadoresConRoles, configuracionActual.temaSeleccionado);
            
            // 3. Crear objeto de actualizaciones para Firebase
            const updates = {};
            jugadoresConPalabra.forEach(j => {
                updates[`/salas/${codigoSalaActual}/jugadores/${j.id}`] = j;
            });

            // 4. Actualizar estado de la sala y jugadores en Firebase
            await db.ref('salas/' + codigoSalaActual).update({
                estado: 'revelacion', // Nuevo estado de revelación
                rondaEstado: 'revelando',
                temaActual: tema,
                configuracion: configuracionActual, // Guardar la configuración usada
            });
            await db.ref('salas/' + codigoSalaActual).update(updates);
            
            // La función configurarEscuchadorSala manejará el cambio de vista
            
        } catch (error) {
            console.error("Error al iniciar el juego:", error);
            alert(`🔴 ERROR AL INICIAR JUEGO: ${error.message}`);
        }
    });


    // =================================================================
    // 6. FUNCIONES DE VISTAS (UI)
    // =================================================================

    // Función principal para cambiar entre vistas
    function cambiarVista(vistaId) {
        document.querySelectorAll('.vista').forEach(vista => {
            vista.classList.remove('activa');
        });
        const vistaActiva = document.getElementById(vistaId);
        if (vistaActiva) {
            vistaActiva.classList.add('activa');
        }
    }

    // ... (El resto de funciones de UI/lógica como configurarEscuchadorSala, actualizarListaJugadores,
    // manejarRevelacion, manejarInicioDiscusion, manejarInicioVotacion, votarJugador, chequearFinDeJuego,
    // manejarResultadoVotacion, y manejarFinDeJuego deben continuar aquí). 
    // Por motivos de espacio, se omite el resto del código que ya estaba.
    
    // ... (El resto de funciones de cliente.js se mantendrían sin cambios) ...
// (Todo el código restante del archivo cliente.js debe seguir aquí)
    function actualizarListaJugadores(jugadores) {
        const lista = document.getElementById('lista-jugadores-lobby');
        lista.innerHTML = '';
        
        const listaVotacion = document.getElementById('lista-jugadores-votacion');
        if (listaVotacion) {
            listaVotacion.innerHTML = ''; // Limpiar lista de votación
        }

        jugadores.forEach(j => {
            const esHost = j.esHost;
            const esMiJugador = j.id === miId;
            const esEliminado = j.eliminado;
            
            // 1. Lista del Lobby (Host)
            const elementoLobby = document.createElement('li');
            elementoLobby.textContent = j.nombre + (esHost ? ' (HOST)' : '') + (esMiJugador ? ' (Tú)' : '');
            if (esEliminado) {
                elementoLobby.classList.add('eliminado');
                elementoLobby.textContent += ' 👻 ELIMINADO';
            }
            
            // Lógica para expulsar (Solo el Host puede ver/usar el botón)
            if (jugadores.find(p => p.id === miId)?.esHost && !esMiJugador && !esEliminado && jugadores.length > MIN_JUGADORES) {
                const btnExpulsar = document.createElement('button');
                btnExpulsar.textContent = 'Expulsar';
                btnExpulsar.classList.add('btn-danger', 'btn-expulsar');
                btnExpulsar.onclick = () => expulsarJugador(j.id);
                elementoLobby.appendChild(btnExpulsar);
            }

            lista.appendChild(elementoLobby);

            // 2. Lista de Votación (durante la ronda de votación)
            if (listaVotacion && !esMiJugador && !esEliminado) {
                const elementoVoto = document.createElement('li');
                elementoVoto.id = `voto-item-${j.id}`;
                elementoVoto.classList.add('jugador-voto-item');
                
                const nombreVoto = document.createElement('span');
                nombreVoto.textContent = j.nombre;
                elementoVoto.appendChild(nombreVoto);
                
                const btnVotar = document.createElement('button');
                btnVotar.textContent = 'VOTAR';
                btnVotar.classList.add('btn-secundario', 'btn-votar');
                btnVotar.id = `btn-votar-${j.id}`;
                btnVotar.onclick = () => window.votarJugador(j.id);
                
                elementoVoto.appendChild(btnVotar);
                listaVotacion.appendChild(elementoVoto);
            }
        });
        
        // Actualizar el número de jugadores activos en el lobby
        document.getElementById('contador-jugadores').textContent = `${jugadores.filter(j => !j.eliminado).length}/${MAX_JUGADORES} (Mín: ${MIN_JUGADORES})`;
        
        // Actualizar la lista de temas disponibles
        actualizarListaTemas(configuracionActual.temaSeleccionado);
        
        // Actualizar el botón de inicio de juego
        actualizarBotonInicioJuego();
        
        // Actualizar el checkbox del Agente Doble
        const checkboxAgenteDoble = document.getElementById('toggle-agente-doble');
        if(checkboxAgenteDoble) {
            checkboxAgenteDoble.checked = configuracionActual.incluirAgenteDoble;
        }

    }

    function actualizarListaTemas(temaSeleccionado) {
        const listaTemas = document.getElementById('lista-temas');
        if (!listaTemas) return;

        listaTemas.innerHTML = '';
        
        // Ordenar los temas (opcional: por defecto alfabético, manteniendo la categoría Hot al final)
        const temasOrdenados = TEMAS_DISPONIBLES.filter(t => t !== 'Caliente +18 🔥').sort();
        if (TEMAS_DISPONIBLES.includes('Caliente +18 🔥')) {
            temasOrdenados.push('Caliente +18 🔥');
        }

        temasOrdenados.forEach(tema => {
            const esSeleccionado = tema === temaSeleccionado;
            const item = document.createElement('div');
            item.classList.add('tema-item');
            if (esSeleccionado) {
                item.classList.add('seleccionado');
            }
            item.textContent = tema;
            item.onclick = () => seleccionarTema(tema);
            listaTemas.appendChild(item);
        });

    }

    async function seleccionarTema(tema) {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        try {
            // 1. Actualizar la variable local de configuración
            configuracionActual.temaSeleccionado = tema;
            
            // 2. Actualizar Firebase
            await db.ref('salas/' + codigoSalaActual + '/configuracion').update({
                temaSeleccionado: tema
            });
            
            // La actualización de la lista de UI se maneja en configurarEscuchadorSala
        } catch (error) {
            console.error("Error al seleccionar tema:", error);
        }
    }

    // Función auxiliar para mostrar u ocultar el botón de iniciar juego
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
                avisoMin.style.display = 'block';
                if (!temaSeleccionado) {
                    avisoMin.textContent = '🔴 ¡El HOST debe seleccionar un TEMA!';
                } else if (numJugadores < MIN_JUGADORES) {
                    avisoMin.textContent = `🔴 Mínimo ${MIN_JUGADORES} jugadores para iniciar.`;
                } else if (numJugadores > MAX_JUGADORES) {
                    avisoMin.textContent = `🔴 Máximo ${MAX_JUGADORES} jugadores.`;
                }
            }
        }
    }
    
    // Función para manejar el evento de la checkbox del Agente Doble
    document.getElementById('toggle-agente-doble')?.addEventListener('change', async function() {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        const incluir = this.checked;
        
        try {
            // 1. Actualizar la variable local de configuración
            configuracionActual.incluirAgenteDoble = incluir;
            
            // 2. Actualizar Firebase
            await db.ref('salas/' + codigoSalaActual + '/configuracion').update({
                incluirAgenteDoble: incluir
            });
            
        } catch (error) {
            console.error("Error al cambiar Agente Doble:", error);
        }
    });

    function expulsarJugador(jugadorId) {
        if (!confirm('¿Estás seguro de que quieres expulsar a este jugador de la sala?')) return;
        
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;

        // Eliminar el jugador de la base de datos
        db.ref('salas/' + codigoSalaActual + '/jugadores/' + jugadorId).remove()
            .then(() => {
                console.log(`Jugador ${jugadorId} expulsado.`);
            })
            .catch(error => {
                console.error("Error al expulsar jugador:", error);
                alert('Hubo un error al intentar expulsar al jugador.');
            });
    }

    // ----------------------------------------------------
    // *** LÓGICA DE FLUJO DE JUEGO ***
    // ----------------------------------------------------

    // Función para mostrar la revelación del rol y la palabra
    function manejarRevelacion(sala) {
        cambiarVista('vista-revelacion');
        
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const rolDisplay = document.getElementById('revelacion-titulo');
        const palabraDisplay = document.getElementById('revelacion-detalle');
        const cajaRol = document.querySelector('.caja-rol');
        const temaDisplay = document.getElementById('revelacion-tema');
        
        if (!misDatos || !rolDisplay || !palabraDisplay || !cajaRol || !temaDisplay) return;

        temaDisplay.textContent = `TEMA DE JUEGO: ${sala.temaActual}`;

        // Mostrar rol y palabra específica
        if (misDatos.rol === 'Impostor') {
            rolDisplay.textContent = 'Tu Rol: ¡IMPOSTOR!';
            palabraDisplay.textContent = `Tu palabra clave es: ${misDatos.palabraSecreta}`;
            cajaRol.style.backgroundColor = 'var(--color-impostor)'; // Rojo
            rolDisplay.style.color = 'var(--color-text)';
            palabraDisplay.style.color = 'var(--color-text)';
            temaDisplay.style.color = 'var(--color-text)';
        } else if (misDatos.rol === 'Agente Doble') {
            rolDisplay.textContent = 'Tu Rol: ¡AGENTE DOBLE!';
            palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
            cajaRol.style.backgroundColor = 'var(--color-agentedoble)'; // Naranja
            rolDisplay.style.color = 'var(--color-text)';
            palabraDisplay.style.color = 'var(--color-text)';
            temaDisplay.style.color = 'var(--color-text)';
        } else { // Tripulante
            rolDisplay.textContent = 'Tu Rol: ¡TRIPULANTE!';
            palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
            cajaRol.style.backgroundColor = 'var(--color-tripulante)'; // Verde
            rolDisplay.style.color = 'var(--color-text)';
            palabraDisplay.style.color = 'var(--color-text)';
            temaDisplay.style.color = 'var(--color-text)';
        }
    }

    // ----------------------------------------------------
    // *** INICIAR DISCUSIÓN (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-iniciar-discusion').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;

        try {
            await db.ref('salas/' + codigoSalaActual).update({
                rondaEstado: 'discutiendo', // Mover a la fase de discusión
            });
        } catch (error) {
            console.error("Error al iniciar discusión:", error);
            alert(`🔴 ERROR: ${error.message}`);
        }
    });

    // Función para manejar el inicio de la discusión
    function manejarInicioDiscusion(sala) {
        cambiarVista('vista-juego');
        document.getElementById('estado-juego-display').textContent = 'Fase de Discusión: ¡A convencer!';
        document.getElementById('acciones-host-juego').style.display = jugadoresActuales.find(j => j.id === miId)?.esHost ? 'block' : 'none';
        document.getElementById('btn-iniciar-discusion').style.display = 'none';
        document.getElementById('btn-iniciar-votacion').style.display = 'block';
        document.getElementById('area-palabra-secreta').style.display = 'block';
        document.getElementById('seleccion-voto-container').style.display = 'none';
        document.getElementById('estado-voto-local').style.display = 'none';
    }

    // ----------------------------------------------------
    // *** INICIAR VOTACIÓN (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-iniciar-votacion').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;

        try {
            // Reiniciar votos de todos los jugadores a null antes de la votación
            const updates = {};
            jugadoresActuales.forEach(j => {
                updates[`/salas/${codigoSalaActual}/jugadores/${j.id}/votoParaId`] = null;
            });

            // Cambiar a la fase de votación
            await db.ref('salas/' + codigoSalaActual).update({
                rondaEstado: 'votando', 
            });
            await db.ref('salas/' + codigoSalaActual).update(updates);
            
        } catch (error) {
            console.error("Error al iniciar votación:", error);
            alert(`🔴 ERROR: ${error.message}`);
        }
    });

    // Función para manejar el inicio de la votación
    function manejarInicioVotacion(sala) {
        cambiarVista('vista-juego');
        document.getElementById('estado-juego-display').textContent = 'Fase de Votación: ¿Quién es el impostor?';
        document.getElementById('acciones-host-juego').style.display = 'block';
        document.getElementById('btn-iniciar-votacion').style.display = 'none';

        // Mostrar elementos de votación
        document.getElementById('seleccion-voto-container').style.display = 'block';
        document.getElementById('estado-voto-local').style.display = 'block';
        document.getElementById('estado-voto-local').textContent = 'Aún no has votado.';
        
        // El host no tiene que votar, solo esperar.
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const numActivos = jugadoresActuales.filter(j => !j.eliminado).length;

        // Si es Host y todos votaron, mostrar el botón de ver resultados.
        if (misDatos?.esHost) {
            const numVotosEmitidos = jugadoresActuales.filter(j => j.votoParaId !== null && !j.eliminado).length;
            const btnVerResultados = document.getElementById('btn-ver-resultados');
            if (numVotosEmitidos === numActivos) {
                 btnVerResultados.style.display = 'block';
            } else {
                 btnVerResultados.style.display = 'none';
            }
            document.getElementById('contador-votos').textContent = `Votos: ${numVotosEmitidos}/${numActivos}`;
        }
        
    }
    
    // Función para emitir un voto (disponible globalmente para onclick)
    window.votarJugador = async function(jugadorVotadoId) {
        if (!codigoSalaActual || miVotoSeleccionadoId === jugadorVotadoId) return; // Ya votaste por este

        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos || misDatos.eliminado) return alert('No puedes votar, has sido eliminado.');
        
        // 1. Actualizar voto local (UI)
        miVotoSeleccionadoId = jugadorVotadoId;
        const jugadorVotado = jugadoresActuales.find(j => j.id === jugadorVotadoId);
        document.getElementById('estado-voto-local').textContent = `Tu voto es para: ${jugadorVotado.nombre}`;
        
        // Desactivar botones de votación
        document.querySelectorAll('.btn-votar').forEach(btn => btn.disabled = true);
        
        // 2. Actualizar el voto en Firebase
        try {
            await db.ref('salas/' + codigoSalaActual + '/jugadores/' + miId).update({
                votoParaId: jugadorVotadoId
            });
            
            // La función configurarEscuchadorSala se encargará de re-habilitar el botón de resultados para el Host
        } catch (error) {
            console.error("Error al votar:", error);
            alert(`🔴 ERROR AL VOTAR: ${error.message}`);
        }
    }


    // ----------------------------------------------------
    // *** VER RESULTADOS (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-ver-resultados').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        // Contar los votos y determinar al eliminado
        await manejarResultadoVotacion();
    });

    async function manejarResultadoVotacion() {
        // 1. Contar los votos
        const conteoVotos = {};
        let numActivos = 0;
        jugadoresActuales.forEach(j => {
            if (!j.eliminado) {
                 numActivos++;
                 if (j.votoParaId) {
                     conteoVotos[j.votoParaId] = (conteoVotos[j.votoParaId] || 0) + 1;
                 }
            }
        });

        // 2. Determinar al jugador con más votos
        let maxVotos = -1;
        let jugadorEliminado = null;
        let empate = false;

        for (const id in conteoVotos) {
            if (conteoVotos[id] > maxVotos) {
                maxVotos = conteoVotos[id];
                jugadorEliminado = jugadoresActuales.find(j => j.id === id);
                empate = false;
            } else if (conteoVotos[id] === maxVotos) {
                empate = true;
            }
        }
        
        // Si hay empate o nadie votó (maxVotos < 0), nadie es eliminado.
        if (empate || maxVotos === 0) {
            jugadorEliminado = null; 
        }

        // 3. Chequear si hay ganador después de la eliminación (necesario para la vista de resultado)
        const jugadoresPostEliminacion = jugadoresActuales.map(j => ({ ...j, eliminado: j.id === jugadorEliminado?.id ? true : j.eliminado }));
        const ganador = chequearFinDeJuego(jugadoresPostEliminacion);
        
        // 4. Actualizar el resultado de la ronda en la DB para que todos lo lean
        await db.ref('salas/' + codigoSalaActual).update({
            rondaEstado: 'resultado',
            ultimoResultado: {
                conteo: conteoVotos,
                jugadorEliminadoId: jugadorEliminado ? jugadorEliminado.id : null,
                rolRevelado: jugadorEliminado ? jugadorEliminado.rol : null,
                ganador: ganador || null,
            }
        });
        
        // 5. Si hay eliminado, actualizar su estado en la DB
        if (jugadorEliminado) {
             await db.ref('salas/' + codigoSalaActual + '/jugadores/' + jugadorEliminado.id).update({
                 eliminado: true 
             });
        }
    }


    // Función para manejar la vista de resultados
    function manejarResultado(sala) {
        cambiarVista('vista-resultado');
        const resultado = sala.ultimoResultado;
        const detallesContainer = document.getElementById('detalles-votacion-container');
        const eliminadoDisplay = document.getElementById('jugador-eliminado-display');
        const accionesHost = document.getElementById('acciones-finales-host');
        const btnContinuar = document.getElementById('btn-reiniciar-partida-resultado'); // Usado como 'Continuar'
        const btnFinalizar = document.getElementById('btn-finalizar-juego-resultado');
        
        // 1. Mostrar detalles de votación
        if (detallesContainer) {
             detallesContainer.innerHTML = '<h4>Resumen de Votos</h4>';
             
             // Crear lista de votos
             const listaVotos = document.createElement('ul');
             listaVotos.style.listStyle = 'none';
             listaVotos.style.padding = '0';
             
             const conteo = resultado.conteo || {};
             
             // Jugadores activos para asegurar que los votos se muestren correctamente
             const jugadoresActivos = jugadoresActuales.filter(j => !j.eliminado);
             
             // Obtener los IDs de los jugadores que recibieron votos
             const jugadoresVotadosIds = Object.keys(conteo);
             
             // Combinar jugadores votados y no votados (si recibieron 0 votos)
             const todosLosIDs = new Set([...jugadoresActivos.map(j => j.id), ...jugadoresVotadosIds]);

             todosLosIDs.forEach(id => {
                const jugador = jugadoresActuales.find(j => j.id === id);
                if (jugador && !jugador.eliminado) {
                    const votos = conteo[id] || 0;
                    const li = document.createElement('li');
                    li.textContent = `${jugador.nombre}: ${votos} voto(s)`;
                    li.style.fontWeight = 'bold';
                    if (id === resultado.jugadorEliminadoId) {
                         li.style.color = 'var(--color-red)';
                    } else if (votos > 0) {
                         li.style.color = 'var(--color-secondary-glow)';
                    }
                    listaVotos.appendChild(li);
                }
             });
             
             detallesContainer.appendChild(listaVotos);
        }
        
        // 2. Mostrar resultado de la eliminación
        eliminadoDisplay.style.display = 'block';
        if (resultado.jugadorEliminadoId) {
            const jugador = jugadoresActuales.find(j => j.id === resultado.jugadorEliminadoId);
            eliminadoDisplay.textContent = `¡${jugador.nombre} ha sido eliminado! Su rol era: ${resultado.rolRevelado}`;
            // Color de aviso según el rol revelado
            if (resultado.rolRevelado === 'Impostor') {
                 eliminadoDisplay.style.backgroundColor = 'var(--color-tripulante)'; // Verde: Bien por eliminar al impostor
                 eliminadoDisplay.style.color = 'var(--color-bg)';
                 eliminadoDisplay.style.border = '2px solid var(--color-tripulante)';
            } else {
                 eliminadoDisplay.style.backgroundColor = 'var(--color-impostor)'; // Rojo: Mal por eliminar a un aliado
                 eliminadoDisplay.style.color = 'var(--color-bg)';
                 eliminadoDisplay.style.border = '2px solid var(--color-impostor)';
            }
        } else if (resultado.ganador) {
            eliminadoDisplay.textContent = `¡FIN DE JUEGO! Ganan los ${resultado.ganador}`;
            eliminadoDisplay.style.backgroundColor = 'var(--color-secondary)';
            eliminadoDisplay.style.color = 'var(--color-bg)';
            eliminadoDisplay.style.border = '2px solid var(--color-secondary)';
        } else {
            eliminadoDisplay.textContent = 'Nadie ha sido eliminado. ¡Hay un empate!';
            eliminadoDisplay.style.backgroundColor = 'var(--color-card)';
            eliminadoDisplay.style.color = 'var(--color-text)';
            eliminadoDisplay.style.border = '2px solid var(--color-text)';
        }

        // 3. Mostrar botones del Host
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        accionesHost.style.display = esHost ? 'flex' : 'none';
        
        if (esHost) {
            if (resultado.ganador) {
                // Si hay ganador, la partida termina.
                btnContinuar.style.display = 'none'; 
                btnFinalizar.style.display = 'block'; // Mostrar solo finalizar (aunque el final se maneja en la otra vista)
                // Se pasará automáticamente a la vista final por el listener principal
            } else {
                // Si no hay ganador, se puede continuar a una nueva discusión/ronda.
                btnContinuar.style.display = 'block';
                btnFinalizar.style.display = 'none';
            }
        }
    }


    // ----------------------------------------------------
    // *** CHEQUEAR FIN DE JUEGO ***
    // ----------------------------------------------------
    function chequearFinDeJuego(jugadores) {
        const activos = jugadores.filter(j => !j.eliminado);
        const tripulantesYAgentesActivos = activos.filter(j => j.rol === 'Tripulante' || j.rol === 'Agente Doble').length;
        const impostoresActivos = activos.filter(j => j.rol === 'Impostor').length;

        // 1. Ganaron Impostores: Si el número de Impostores activos es igual o mayor
        // al número de Tripulantes/Agentes activos.
        if (impostoresActivos >= tripulantesYAgentesActivos) {
            return 'Impostores';
        }
        
        // 2. Ganaron Tripulantes: Si no queda ningún Impostor activo
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
        const ganador = chequearFinDeJuego(jugadoresActuales.map(j => ({ ...j, eliminado: j.eliminado === true }))) || sala.ultimoResultado?.ganador;
        
        const ganadorDisplay = document.getElementById('ganador-display');
        if(ganadorDisplay) ganadorDisplay.textContent = `🏆 ¡Ganan los ${ganador || 'Nadie'}! 🏆`;
        
        const listaRoles = document.getElementById('lista-roles-final');
        if (listaRoles) {
            listaRoles.innerHTML = '<li>El Rol de cada Jugador Era:</li>';
            jugadoresActuales.forEach(j => {
                const li = document.createElement('li');
                li.textContent = `${j.nombre} ${j.eliminado ? '👻' : '👤'} - ${j.rol} (${j.palabraSecreta})`;
                
                let rolClass = '';
                if (j.rol === 'Impostor') rolClass = 'impostor';
                else if (j.rol === 'Agente Doble') rolClass = 'orange';
                else rolClass = 'tripulante';
                
                li.classList.add(rolClass);
                listaRoles.appendChild(li);
            });
        }
        
        // Mostrar acciones de Host
        document.getElementById('acciones-finales-final-host').style.display = esHost ? 'flex' : 'none';
    }

    // ----------------------------------------------------
    // *** REINICIAR Y FINALIZAR JUEGO (HOST) ***
    // ----------------------------------------------------
    
    // Al hacer clic en "Continuar (Nueva Discusión)" en la vista de resultados
    document.getElementById('btn-reiniciar-partida-resultado').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        try {
            // Reiniciar votos, pero mantener la configuración y el estado de eliminación.
            const updates = {};
            jugadoresActuales.forEach(j => {
                updates[`/salas/${codigoSalaActual}/jugadores/${j.id}/votoParaId`] = null;
            });
            
            // Re-asignar palabras y tema (o usar la función para re-asignar solo las palabras si se desea)
            // Para simplificar, simplemente volvemos al estado de discusión, manteniendo las palabras y roles
            // si el juego no terminó. Si terminó (tiene ganador), la lógica del listener debería llevar a vista-final.
            
            await db.ref('salas/' + codigoSalaActual).update({
                rondaEstado: 'discutiendo',
                ultimoResultado: null, // Limpiar el resultado anterior
            });
            await db.ref('salas/' + codigoSalaActual).update(updates);

        } catch (error) {
            console.error("Error al continuar partida:", error);
            alert(`🔴 ERROR: ${error.message}`);
        }
    });

    // Al hacer clic en "Reiniciar Partida (Ir a Lobby)" en la vista final
    document.getElementById('btn-reiniciar-partida-final').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        // Reestablecer el estado de la sala y los jugadores (excepto host/id/nombre)
        const updates = {
            estado: 'esperando',
            rondaEstado: null,
            temaActual: null,
            ultimoResultado: null,
        };
        
        // Reiniciar datos de cada jugador
        const jugadorUpdates = {};
        jugadoresActuales.forEach(j => {
            jugadorUpdates[`/salas/${codigoSalaActual}/jugadores/${j.id}`] = { 
                id: j.id, 
                nombre: j.nombre, 
                esHost: j.esHost, 
                eliminado: false,
                rol: 'Tripulante', // Rol por defecto antes de iniciar
                palabraSecreta: null,
                tema: null,
                votoParaId: null,
                hostId: j.hostId 
            };
        });

        try {
            await db.ref('salas/' + codigoSalaActual).update(updates);
            await db.ref('salas/' + codigoSalaActual + '/jugadores').set(jugadorUpdates);

        } catch (error) {
            console.error("Error al reiniciar partida:", error);
            alert(`🔴 ERROR: ${error.message}`);
        }
    });


    // Función general para que el host finalice el juego y cierre la sala
    const finalizarJuego = async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;

        if (confirm('¿Estás seguro de que quieres FINALIZAR EL JUEGO y cerrar la sala? ¡Todos serán desconectados!')) {
            try {
                // Eliminar toda la sala de la base de datos
                await db.ref('salas/' + codigoSalaActual).remove();
                alert('La sala ha sido cerrada. Volviendo a la pantalla de inicio.');
                window.location.reload(); 
            } catch (error) {
                console.error("Error al finalizar el juego:", error);
                alert(`🔴 ERROR AL CERRAR SALA: ${error.message}`);
            }
        }
    };
    
    // Botones de finalizar juego
    document.getElementById('btn-finalizar-juego-resultado')?.addEventListener('click', finalizarJuego);
    document.getElementById('btn-finalizar-juego-final')?.addEventListener('click', finalizarJuego);


    // ----------------------------------------------------
    // *** CREAR SALA (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-crear-sala').addEventListener('click', async () => {
        
        if (!nombreJugador) {
            return alert('🔴 Por favor, ingresa tu nombre primero.');
        }

        try {
            // 1. Generar código único (se intenta 5 veces)
            let codigo = '';
            let salaExiste = true;
            for (let i = 0; i < 5 && salaExiste; i++) {
                codigo = generarCodigoSala();
                const snapshot = await db.ref('salas/' + codigo).once('value');
                salaExiste = snapshot.exists();
            }

            if (salaExiste) {
                return alert('🔴 Error al crear sala: No se pudo generar un código único.');
            }

            // 2. Datos del jugador Host
            const jugadorHost = {
                 id: miId, 
                 nombre: nombreJugador, 
                 esHost: true, 
                 rol: 'Tripulante', 
                 eliminado: false,
                 palabraSecreta: null,
                 tema: null,
                 votoParaId: null,
                 hostId: miId // El host es su propio hostId
            };

            // 3. Crear la sala en Firebase
            await db.ref('salas/' + codigo).set({
                estado: 'esperando',
                hostId: miId,
                temaActual: null,
                rondaEstado: null,
                ultimoResultado: null,
                configuracion: configuracionActual,
                jugadores: {
                    [miId]: jugadorHost
                }
            });

            // 4. Configurar el escuchador y actualizar UI
            configurarEscuchadorSala(codigo);
            document.getElementById('codigo-lobby-display').textContent = codigo;
            cambiarVista('vista-lobby');

        } catch (error) {
            console.error("Error al crear la sala en Firebase:", error);
            alert(`🔴 ERROR AL CREAR SALA: Fallo de red o de permisos. Detalle: ${error.message}`);
        }
    });

    // ----------------------------------------------------
    // *** UNIRSE A SALA ***
    // ----------------------------------------------------
    document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!nombreJugador) {
             return alert('🔴 Por favor, ingresa tu nombre primero.');
        }

        const inputCodigo = document.getElementById('input-codigo');
        const codigo = inputCodigo.value.toUpperCase();
        
        if (codigo.length !== 4) {
             return alert('🔴 El código de sala debe tener 4 letras.');
        }
        
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
                 votoParaId: null,
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
    
    // ----------------------------------------------------
    // *** ESCUCHADOR CENTRAL DE LA SALA ***
    // ----------------------------------------------------

    function configurarEscuchadorSala(codigo) {
        if (listenerSala) {
            listenerSala.off(); // Desuscribirse del listener anterior si existe
        }
        codigoSalaActual = codigo;
        
        const salaRef = db.ref('salas/' + codigo);
        
        // Listener principal para todos los cambios en la sala
        listenerSala = salaRef.on('value', (snapshot) => {
            const sala = snapshot.val();

            if (!sala) {
                // Si la sala se elimina (ej. el host la cierra)
                if (codigoSalaActual === codigo) {
                    alert('La sala ha sido cerrada por el Host. Volviendo a la pantalla de inicio.');
                    window.location.reload(); 
                }
                return;
            }

            // Convertir objeto de jugadores a array para facilitar el manejo
            const jugadoresObj = sala.jugadores || {};
            const jugadoresArray = Object.keys(jugadoresObj).map(key => jugadoresObj[key]);
            
            jugadoresActuales = jugadoresArray;

            // Actualizar variables de configuración local para todos
            configuracionActual.temaSeleccionado = sala.configuracion?.temaSeleccionado || configuracionActual.temaSeleccionado;
            configuracionActual.incluirAgenteDoble = sala.configuracion?.incluirAgenteDoble || configuracionActual.incluirAgenteDoble;

            // Lógica de Vistas basada en el estado de la sala
            if (sala.estado === 'esperando') {
                actualizarListaJugadores(jugadoresArray);
                cambiarVista('vista-lobby');
            } else if (sala.estado === 'revelacion') {
                manejarRevelacion(sala);
            } else if (sala.estado === 'enJuego') {
                actualizarListaJugadores(jugadoresArray); // Necesario para la lista de votación/host
                
                // Mostrar palabra y tema
                const misDatos = jugadoresArray.find(j => j.id === miId);
                miRolActual = misDatos?.rol || '';
                miPalabraSecreta = misDatos?.palabraSecreta || '';
                miTemaActual = misDatos?.temaActual || sala.temaActual || '';
                
                document.getElementById('rol-display').textContent = miRolActual;
                document.getElementById('palabra-secreta-display').textContent = miPalabraSecreta;
                document.getElementById('tema-actual-display').textContent = `Tema: ${miTemaActual}`;
                
                if (sala.rondaEstado === 'discutiendo') {
                    manejarInicioDiscusion(sala);
                } else if (sala.rondaEstado === 'votando') {
                    manejarInicioVotacion(sala);
                } else if (sala.rondaEstado === 'resultado') {
                    // Si hay un ganador final, saltar a la vista final
                    if (sala.ultimoResultado?.ganador) {
                        manejarFinDeJuego(sala);
                    } else {
                        manejarResultado(sala);
                    }
                }
            } else if (sala.estado === 'finalizado') {
                manejarFinDeJuego(sala);
            }
        });
    }
    
    // Función para abandonar la sala (disponible globalmente para onclick)
    window.abandonarSala = async function() {
        if (!codigoSalaActual) return window.location.reload();

        if (confirm('¿Estás seguro de que quieres abandonar la sala?')) {
             try {
                 const misDatos = jugadoresActuales.find(j => j.id === miId);

                 // 1. Eliminar al jugador de la sala
                 await db.ref('salas/' + codigoSalaActual + '/jugadores/' + miId).remove();
                 
                 // 2. Si el jugador era el Host, transferir la propiedad o cerrar la sala
                 if (misDatos?.esHost) {
                      const jugadoresRestantes = jugadoresActuales.filter(j => j.id !== miId);
                      if (jugadoresRestantes.length > 0) {
                          // Asignar el nuevo Host al primer jugador restante
                          const nuevoHost = jugadoresRestantes[0];
                          await db.ref('salas/' + codigoSalaActual + '/jugadores/' + nuevoHost.id).update({
                              esHost: true
                          });
                          await db.ref('salas/' + codigoSalaActual).update({
                              hostId: nuevoHost.id
                          });
                          alert(`Has dejado la sala. ${nuevoHost.nombre} es el nuevo Host.`);
                      } else {
                          // Si no quedan jugadores, eliminar la sala
                           await db.ref('salas/' + codigoSalaActual).remove();
                           alert('Sala cerrada.');
                      }
                 }

                 // 3. Limpiar el listener y recargar
                 if (listenerSala) listenerSala.off();
                 window.location.reload();

             } catch (error) {
                 console.error("Error al abandonar la sala:", error);
                 alert(`🔴 ERROR AL ABANDONAR: ${error.message}`);
             }
        }
    }


    // ----------------------------------------------------
    // *** LÓGICA DE LA VISTA DE INICIO/SELECCIÓN ***
    // ----------------------------------------------------
    
    // Manejar el formulario de inicio de sesión
    document.getElementById('form-inicio').addEventListener('submit', (e) => {
        e.preventDefault();
        const inputNombre = document.getElementById('input-nombre');
        const nombre = inputNombre.value.trim();
        
        if (nombre) {
            nombreJugador = nombre;
            document.getElementById('nombre-jugador-display').textContent = nombre;
            cambiarVista('vista-seleccion');
        } else {
            alert('Por favor, ingresa un nombre.');
        }
    });

    // Función para volver a la pantalla de selección (disponible globalmente para onclick)
    window.volverASeleccion = function() {
        if (listenerSala) {
            listenerSala.off();
            listenerSala = null;
        }
        codigoSalaActual = '';
        jugadoresActuales = [];
        miVotoSeleccionadoId = 'none';
        cambiarVista('vista-seleccion');
    }
    
    // El botón de "Continuar (Nueva Discusión)" en vista-resultado
    document.getElementById('btn-reiniciar-partida-resultado')?.addEventListener('click', async () => {
         const ganador = jugadoresActuales.find(j => j.id === miId)?.esHost ? chequearFinDeJuego(jugadoresActuales) : null;
         if (ganador) {
             // Si el host intenta continuar cuando el juego ya terminó (aunque el listener lo gestiona)
             manejarFinDeJuego({ ultimoResultado: { ganador: ganador } });
             return;
         }
         
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         try {
             // 1. Re-elegir palabras y tema (Nueva ronda, pero mismos roles)
             const { tema, jugadores: jugadoresConPalabra } = elegirPalabraYTema(jugadoresActuales, configuracionActual.temaSeleccionado);
             
             // 2. Crear objeto de actualizaciones para Firebase
             const updates = {};
             jugadoresConPalabra.forEach(j => {
                 // Reiniciar solo el voto, manteniendo el estado de eliminado
                 updates[`/salas/${codigoSalaActual}/jugadores/${j.id}/votoParaId`] = null;
                 updates[`/salas/${codigoSalaActual}/jugadores/${j.id}/palabraSecreta`] = j.palabraSecreta;
                 updates[`/salas/${codigoSalaActual}/jugadores/${j.id}/tema`] = j.tema;
             });

             // 3. Actualizar estado de la sala
             await db.ref('salas/' + codigoSalaActual).update({
                 estado: 'revelacion', // Volver a revelación con nuevas palabras
                 rondaEstado: 'revelando',
                 temaActual: tema,
                 ultimoResultado: null, // Limpiar el resultado anterior
             });
             
             // 4. Actualizar las palabras de los jugadores
             await db.ref('salas/' + codigoSalaActual).update(updates);
             
         } catch (error) {
             console.error("Error al continuar partida (nueva ronda):", error);
             alert(`🔴 ERROR: ${error.message}`);
         }
    });

}); // Fin de DOMContentLoaded