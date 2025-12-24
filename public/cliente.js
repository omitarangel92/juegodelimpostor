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
    'Animales 🐾': [
        'Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín',
        'Canguro', 'Jirafa', 'Pingüino', 'Camello', 'Tiburón', 'Hipopótamo', 'Rinoceronte', 'Águila', 'Pulpo', 'Mapache'
    ],
    'Comida 🍔': [
        'Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana',
        'Lasagna', 'Paella', 'Risotto', 'Ceviche', 'Ramen', 'Burrito', 'Falafel', 'Ratatouille', 'Brownie', 'Croissant'
    ],
    'Países 🌎': [
        'España', 'México', 'Colombia', 'Japón', 'Francia', 'Canadá', 'Brasil', 'Alemania',
        'Italia', 'Argentina', 'Rusia', 'Egipto', 'China', 'India', 'Australia', 'Grecia', 'Noruega', 'Tailandia'
    ],
    'Profesiones 💼': [
        'Médico', 'Maestro', 'Ingeniero', 'Cocinero', 'Policía', 'Bombero', 'Abogado', 'Piloto',
        'Arquitecto', 'Psicólogo', 'Periodista', 'Granjero', 'Electricista', 'Veterinario', 'Diseñador', 'Banquero', 'Científico', 'Astronauta'
    ],
    'Objetos Cotidianos 💡': [
        'Teléfono', 'Taza', 'Llaves', 'Reloj', 'Libro', 'Silla', 'Mesa', 'Ventana',
        'Paraguas', 'Cepillo', 'Espejo', 'Lámpara', 'Mochila', 'Cartera', 'Escoba', 'Almohada', 'Percha', 'Toalla'
    ],
    'Videojuegos 🎮': [
        'Mario', 'Zelda', 'Fortnite', 'Minecraft', 'Pacman', 'Tetris', 'Ajedrez', 'Póker',
        'Sonic', 'Halo', 'Pokemon', 'Call of Duty', 'FIFA', 'Street Fighter', 'Resident Evil', 'Assassin Creed', 'God of War', 'Mortal Kombat'
    ],
    'Música 🎵': [
        'Guitarra', 'Batería', 'Piano', 'Voz', 'Pop', 'Rock', 'Jazz', 'Clásica',
        'Violín', 'Saxofón', 'Flauta', 'Trompeta', 'Reggaeton', 'Blues', 'Country', 'Hip Hop', 'Ópera', 'Heavy Metal'
    ],
    'Deportes ⚽': [
        'Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Correr', 'Golf', 'Voleibol', 'Boxeo',
        'Rugby', 'Béisbol', 'Ciclismo', 'Karate', 'Surf', 'Patinaje', 'Esquí', 'Remo', 'Hockey', 'Atletismo'
    ],
    'Series/Películas 🎬': [
        'Harry Potter', 'Titanic', 'Avatar', 'IT', 'StarWars', 'La vida es bella', 'High school musical', 'Game of thrones',
        'Inception', 'Toy Story', 'Friends', 'Los Simpsons', 'Breaking Bad', 'Stranger Things', 'Pulp Fiction', 'El Padrino', 'Shrek', 'Interestelar'
    ],
    'Transporte 🚗': [
        'Avión', 'Tren', 'Bicicleta', 'Barco', 'Moto', 'Bus', 'Metro', 'Patineta',
        'Helicóptero', 'Submarino', 'Camión', 'Cohete', 'Ambulancia', 'Tractor', 'Barco de vela', 'Yate', 'Furgoneta', 'Crucero'
    ],
    'Herramientas 🔧': [
        'Martillo', 'Destornillador', 'Sierra', 'Clavo', 'Tornillo', 'Taladro', 'Cinta', 'Lija',
        'Alicates', 'Nivel', 'Llave inglesa', 'Serrucho', 'Escuadra', 'Lima', 'Pincel', 'Espátula', 'Gato hidráulico', 'Tornillo de banco'
    ],
    'Frutas/Verduras 🥦': [
        'Banana', 'Fresa', 'Pera', 'Zanahoria', 'Brócoli', 'Lechuga', 'Cebolla', 'Tomate',
        'Piña', 'Mango', 'Sandía', 'Pepino', 'Berenjena', 'Calabaza', 'Espárrago', 'Kiwi', 'Aguacate', 'Papaya'
    ],
    'Marcas Famosas 🏷️': [
        'Nike', 'Adidas', 'Apple', 'Samsung', 'Google', 'Coca-Cola', 'Zara', 'Toyota',
        'Pepsi', 'Netflix', 'Microsoft', 'Amazon', 'Sony', 'Mercedes', 'Disney', 'McDonalds', 'Lego', 'Intel'
    ],
    'Partes del Cuerpo 💪': [
        'Mano', 'Pie', 'Cabeza', 'Ojo', 'Nariz', 'Boca', 'Corazón', 'Pulmón',
        'Hígado', 'Riñón', 'Cerebro', 'Hueso', 'Sangre', 'Estómago', 'Oreja', 'Lengua', 'Cuello', 'Rodilla'
    ],
    'Planetas 🪐': [
        'Marte', 'Tierra', 'Júpiter', 'Saturno', 'Sol', 'Luna', 'Estrella', 'Cometa',
        'Neptuno', 'Urano', 'Venus', 'Mercurio', 'Galaxia', 'Agujero negro', 'Asteroide', 'Vía Láctea', 'Constelación', 'Nebulosa'
    ],
    'Ropa 👗': [
        'Camiseta', 'Pantalón', 'Calcetín', 'Abrigo', 'Bufanda', 'Gorro', 'Guante', 'Zapatos',
        'Traje', 'Corbata', 'Falda', 'Chaleco', 'Pijama', 'Sudadera', 'Botas', 'Cinturón', 'Sandalias', 'Bañador'
    ],
    'Dibujos Animados 📺': [
        'Pikachu', 'Homero', 'Mickey', 'Bob Esponja', 'Scooby', 'Bugs Bunny', 'Popeye', 'Doraemon',
        'Ben 10', 'Shaggy', 'Jerry', 'Pato Donald', 'Garfield', 'Goku', 'Vegeta', 'Naruto', 'Steven Universe', 'Finn el humano'
    ],
    'Lugares Típicos 🏛️': [
        'Playa', 'Montaña', 'Desierto', 'Ciudad', 'Pueblo', 'Bosque', 'Lago', 'Río',
        'Museo', 'Biblioteca', 'Parque', 'Mercado', 'Puerto', 'Estación', 'Estadio', 'Hospital', 'Universidad', 'Castillo'
    ],
    'Clima ☀️': [
        'Lluvia', 'Nieve', 'Viento', 'Sol', 'Tormenta', 'Arcoíris', 'Nube', 'Niebla',
        'Rayo', 'Granizo', 'Calor', 'Humedad', 'Sequía', 'Huracán', 'Tornado', 'Inundación', 'Brisa', 'Escarcha'
    ],
    'Sentimientos 💖': [
        'Felicidad', 'Tristeza', 'Enojo', 'Miedo', 'Amor', 'Sorpresa', 'Calma', 'Aburrimiento',
        'Orgullo', 'Celos', 'Ansiedad', 'Empatía', 'Culpa', 'Alivio', 'Esperanza', 'Confusión', 'Envidia', 'Nostalgia'
    ],
    'Tecnología 💻': [
        'Computadora', 'Mouse', 'Teclado', 'Cámara', 'Internet', 'Robot', 'Cable', 'Chip',
        'Laptop', 'Tablet', 'Servidor', 'Software', 'Hardware', 'Base de datos', 'Algoritmo', 'Realidad virtual', 'Bluetooth', 'Wi-Fi'
    ],
    'Mitología 👹': [
        'Dragón', 'Sirena', 'Duende', 'Vampiro', 'Fantasma', 'Ángel', 'Ogro', 'Hada',
        'Zeus', 'Hércules', 'Medusa', 'Centauro', 'Minotauro', 'Thor', 'Odín', 'Fénix', 'Pegaso', 'Ciclope'
    ],
    'Caliente +18 🔥': [
        'Sexo', 'Gemidos', 'Verga', 'Cuca', 'Tetas', 'Semen', 'Squirt', 'Lencería', 'Masturbación',
        'Condón', 'Vibrador', 'Orgasmo', 'Kamasutra', 'Lubricante', 'Azote', 'Oral', 'Anal', 'Posición'
    ]
};
const TEMAS_DISPONIBLES = Object.keys(PALABRAS_POR_TEMA);
const MIN_JUGADORES = 3;
const MAX_JUGADORES = 15;

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
    // Cambia esto en la línea 144 aprox.
    let configuracionActual = {
        // Selecciona un tema al azar de la lista al cargar el juego
        temaSeleccionado: TEMAS_DISPONIBLES[Math.floor(Math.random() * TEMAS_DISPONIBLES.length)],
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
        } else if (numJugadores >= 11 && numJugadores <= 15) {
            numImpostores = 3;
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
    window.cambiarVista = function (vistaId) {
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

    window.expulsarJugador = async function (jugadorId) {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;

        if (confirm(`¿Estás seguro de que quieres expulsar al jugador con ID ${jugadorId}?`)) {
            await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorId}`).remove();
            alert('Jugador expulsado.');
        }
    }

    // Lógica para que el Impostor adivine la palabra (ACTUALIZADO CON MODAL)
    document.getElementById('btn-enviar-adivinanza').addEventListener('click', async () => {
        const inputAdivinar = document.getElementById('input-adivinar-palabra');
        const intentoRaw = inputAdivinar.value.trim();

        if (!intentoRaw || !codigoSalaActual) return;

        const confirmar = await mostrarModal("🎯 ADIVINAR PALABRA", `¿Confirmas que la palabra es "${intentoRaw.toUpperCase()}"?`, true, "#8A2BE2");
        if (!confirmar) return;

        try {
            const snapshot = await db.ref('salas/' + codigoSalaActual).once('value');
            const sala = snapshot.val();

            // NORMALIZAMOS AMBAS PALABRAS PARA COMPARAR
            const intentoLimpio = normalizarPalabra(intentoRaw);
            const palabraRealLimpia = normalizarPalabra(sala.configuracion.palabra);

            console.log("Comparando:", intentoLimpio, "vs", palabraRealLimpia);

            if (intentoLimpio === palabraRealLimpia) {
                // GANAR (Igual que antes...)
                await db.ref('salas/' + codigoSalaActual).update({
                    estado: 'finalizado',
                    ultimoResultado: {
                        ganador: 'Impostores',
                        motivo: `¡El Impostor adivinó: ${sala.configuracion.palabra.toUpperCase()}!`
                    }
                });
            } else {
                await mostrarModal("❌ INCORRECTO", "Esa no es la palabra. ¡Sigue intentando!", false, "#ff4560");
                inputAdivinar.value = '';
            }
        } catch (error) {
            console.error(error);
        }
    });

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

    window.votarJugador = async function (jugadorVotadoId) {
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

    window.abandonarSala = async function () {
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
        if (ganadorDisplay) ganadorDisplay.textContent = `🏆 ¡Ganan los ${ganador || 'Nadie'}! 🏆`;

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
        const temaElegido = configuracionActual.temaSeleccionado;

        if (!temaElegido || !PALABRAS_POR_TEMA[temaElegido]) {
            return mostrarModal("❌ ERROR", "Debes seleccionar una categoría válida.", false, "var(--color-red)");
        }

        // 1. Asignar roles (Tripulante, Impostor, Agente Doble)
        const jugadoresConRoles = asignarRoles(jugadoresActuales, configuracionActual);

        // 2. Seleccionar la palabra aleatoria del tema elegido
        const palabras = PALABRAS_POR_TEMA[temaElegido];
        const palabraElegida = palabras[Math.floor(Math.random() * palabras.length)];

        const jugadoresParaFirebase = {};

        // 3. Procesar qué información ve cada jugador según su rol
        jugadoresConRoles.forEach(jugador => {
            let palabraInfo = palabraElegida;
            let temaInfo = temaElegido;

            // LÓGICA DE VISIBILIDAD:
            // El Tripulante ve todo.
            // El Impostor NO ve tema ni palabra (o solo tema según tu preferencia, aquí pusimos tema).
            // El Agente Doble VE el tema pero NO la palabra.
            if (jugador.rol === 'Impostor' || jugador.rol === 'Agente Doble') {
                palabraInfo = '????'; // Se oculta la palabra para ambos
            }

            jugadoresParaFirebase[jugador.id] = {
                ...jugador,
                rol: jugador.rol,
                palabraSecreta: palabraInfo,
                tema: temaInfo,
            };
        });

        // 4. Actualizar la base de datos para que todos los teléfonos cambien de vista
        await salaRef.update({
            jugadores: jugadoresParaFirebase,
            estado: 'revelacion',
            rondaEstado: 'rolesAsignados',
            'configuracion/palabra': palabraElegida,
            'configuracion/temaElegido': temaElegido,
            votos: {}, // Limpiamos votos de partidas anteriores
            ultimoResultado: null,
        });
    });
    // ----------------------------------------------------
    // *** MANEJAR REVELACIÓN ***
    // ----------------------------------------------------
    function manejarRevelacion(sala) {
        cambiarVista('vista-revelacion');

        const displayRol = document.getElementById('rol-revelacion-display');
        const displayPalabra = document.getElementById('palabra-revelacion-display');
        const displayTema = document.getElementById('tema-valor-revelacion');

        // Limpiar clases previas
        displayRol.className = 'palabra-display';
        displayPalabra.className = 'palabra-display';

        if (miRolActual === 'Impostor') {
            displayRol.textContent = "¡ERES EL IMPOSTOR!";
            displayRol.classList.add('rol-impostor');

            displayPalabra.textContent = "????";
            displayPalabra.classList.add('rol-impostor');
            displayTema.textContent = "???"; // Misterio total
        }
        else if (miRolActual === 'Agente Doble') {
            displayRol.textContent = "ERES EL AGENTE DOBLE";
            displayRol.classList.add('rol-agente');

            displayPalabra.textContent = miPalabraSecreta;
            displayPalabra.classList.add('rol-tripulante'); // La palabra se ve verde/normal
            displayTema.textContent = miTemaActual;
        }
        else {
            displayRol.textContent = "ERES TRIPULANTE";
            displayRol.classList.add('rol-tripulante');

            displayPalabra.textContent = miPalabraSecreta;
            displayPalabra.classList.add('rol-tripulante');
            displayTema.textContent = miTemaActual;
        }

        // El host controla el paso a la discusión
        const soyHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        document.getElementById('btn-iniciar-discusion').style.display = soyHost ? 'block' : 'none';
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

        const yo = Object.values(sala.jugadores).find(j => j.id === miId);
        if (!yo) return;

        // Mostrar Rol y Palabra (o ???? para impostor)
        document.getElementById('rol-juego-display').textContent = yo.rol;
        document.getElementById('palabra-secreta-display').textContent =
            (yo.rol === 'Impostor') ? "????" : yo.palabraSecreta;

        // Habilitar panel de adivinanza solo si es Impostor
        const panelAdivinar = document.getElementById('contenedor-adivinanza-impostor');
        if (panelAdivinar) {
            panelAdivinar.style.display = (yo.rol === 'Impostor') ? 'block' : 'none';
        }

        // Botón de Votación solo para el Host
        const btnForzar = document.getElementById('btn-forzar-votacion');
        if (yo.esHost) {
            btnForzar.style.display = 'block';
            btnForzar.onclick = () => finalizarVotacionManual();
        } else {
            btnForzar.style.display = 'none';
        }

        // Lista de votación clicable
        const listaVoto = document.getElementById('lista-jugadores-juego');
        listaVoto.innerHTML = '';
        jugadoresActuales.forEach(j => {
            const li = document.createElement('li');
            li.textContent = j.nombre;
            li.style.cursor = 'pointer';
            li.onclick = () => {
                db.ref(`salas/${codigoSalaActual}/votos/${miId}`).set(j.id);
                mostrarModal("✅ VOTO", "Votaste por " + j.nombre, false, "var(--color-green)");
            };
            listaVoto.appendChild(li);
        });
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

// --- FUNCIONES DE UTILIDAD (AL FINAL DEL ARCHIVO) ---

function mostrarModal(titulo, mensaje, esConfirmacion = false, colorBorde = '#8A2BE2') {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-personalizado');
        const contenido = modal.querySelector('.modal-contenido');

        // Aplicar color de borde dinámico
        contenido.style.borderColor = colorBorde;

        document.getElementById('modal-titulo').textContent = titulo;
        document.getElementById('modal-mensaje').textContent = mensaje;

        const btnC = document.getElementById('modal-btn-confirmar');
        const btnX = document.getElementById('modal-btn-cancelar');

        // Configurar botones
        btnX.style.display = esConfirmacion ? 'block' : 'none';
        btnC.textContent = esConfirmacion ? 'Confirmar' : 'Entendido';

        modal.style.display = 'flex';

        btnC.onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };

        btnX.onclick = () => {
            modal.style.display = 'none';
            resolve(false);
        };
    });
}

function normalizarPalabra(texto) {
    if (!texto) return "";
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quita tildes
        .trim()
        .replace(/s$/, ""); // Quita la 's' al final
}

async function finalizarVotacionManual() {
    btn.onclick = async () => {
        const confirmar = await mostrarModal("⚠️ EXPULSAR", `¿Deseas expulsar a ${j.nombre}?`, true, "var(--color-red)");
        if (confirmar) {
            db.ref(`salas/${codigoSalaActual}/jugadores/${j.id}`).remove();
        }
    };

    const snap = await db.ref(`salas/${codigoSalaActual}`).once('value');
    const sala = snap.val();
    const votos = sala.votos || {};

    // Contar votos
    let conteo = {};
    Object.values(votos).forEach(id => conteo[id] = (conteo[id] || 0) + 1);

    let expulsadoId = null;
    let maxVotos = 0;
    for (const id in conteo) {
        if (conteo[id] > maxVotos) {
            maxVotos = conteo[id];
            expulsadoId = id;
        }
    }

    const jugExp = sala.jugadores[expulsadoId];
    const ganoPueblo = jugExp && jugExp.rol === 'Impostor';

    db.ref(`salas/${codigoSalaActual}`).update({
        estado: 'finalizado',
        ultimoResultado: {
            ganador: ganoPueblo ? 'TRIPULANTES' : 'IMPOSTORES',
            expulsado: jugExp ? jugExp.nombre : "Nadie"
        }
    });
}

document.getElementById('btn-reglas').onclick = () => {
    const reglasTexto = `
    🌟 ¡BIENVENIDO TRIPULANTE! 🌟

    1. ELIGE UN NOMBRE: Escribe tu nombre para que todos sepan quién eres.
    2. CREAR SALA: Puedes crear una sala nueva o unirte a la de un amigo con el código secreto.
    3. JUGADORES: Deben haber mínimo 3 jugadores para iniciar el juego y hasta un máximo de 15 jugadores.
    4. CATEGORÍAS: El jefe de la sala elige un tema (como Animales o Comida, videojuegos, etc).

    🕵️ LOS ROLES:
    • TRIPULANTE: Conoces la palabra secreta. ¡Debes dar pistas sin decir la palabra!
    • AGENTE DOBLE: Sabes la palabra, pero tu misión es confundir a los demás.
    • IMPOSTOR: ¡No sabes la palabra! Debes escuchar a los demás y tratar de adivinarla.

    🚀 ACCIONES ESPECIALES:
    • ADIVINAR: Si eres el Impostor, escribe la palabra en el cuadro mágico para ganar.
    • VOTACIÓN: Al final, todos eligen a quien crean que es el Impostor. ¡Cuidado con no equivocarte!

    ¿Estás listo para la aventura?
    `;

    mostrarModal("📜 REGLAS DEL JUEGO", reglasTexto, false, "var(--color-secondary)");
};