// public/cliente.js (VERSIÓN OPTIMIZADA 1.2.0)

// =================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// =================================================================
const firebaseConfig = {
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
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín', 'Canguro', 'Jirafa', 'Pingüino', 'Camello', 'Tiburón', 'Hipopótamo', 'Rinoceronte', 'Águila', 'Pulpo', 'Mapache'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana', 'Lasagna', 'Paella', 'Risotto', 'Ceviche', 'Ramen', 'Burrito', 'Falafel', 'Ratatouille', 'Brownie', 'Croissant'],
    'Países 🌎': ['España', 'México', 'Colombia', 'Japón', 'Francia', 'Canadá', 'Brasil', 'Alemania', 'Italia', 'Argentina', 'Rusia', 'Egipto', 'China', 'India', 'Australia', 'Grecia', 'Noruega', 'Tailandia'],
    'Profesiones 💼': ['Médico', 'Maestro', 'Ingeniero', 'Cocinero', 'Policía', 'Bombero', 'Abogado', 'Piloto', 'Arquitecto', 'Psicólogo', 'Periodista', 'Granjero', 'Electricista', 'Veterinario', 'Diseñador', 'Banquero', 'Científico', 'Astronauta'],
    'Objetos Cotidianos 💡': ['Teléfono', 'Taza', 'Llaves', 'Reloj', 'Libro', 'Silla', 'Mesa', 'Ventana', 'Paraguas', 'Cepillo', 'Espejo', 'Lámpara', 'Mochila', 'Cartera', 'Escoba', 'Almohada', 'Percha', 'Toalla'],
    'Videojuegos 🎮': ['Mario', 'Zelda', 'Fortnite', 'Minecraft', 'Pacman', 'Tetris', 'Ajedrez', 'Póker', 'Sonic', 'Halo', 'Pokemon', 'Call of Duty', 'FIFA', 'Street Fighter', 'Resident Evil', 'Assassin Creed', 'God of War', 'Mortal Kombat'],
    'Música 🎵': ['Guitarra', 'Batería', 'Piano', 'Voz', 'Pop', 'Rock', 'Jazz', 'Clásica', 'Violín', 'Saxofón', 'Flauta', 'Trompeta', 'Reggaeton', 'Blues', 'Country', 'Hip Hop', 'Ópera', 'Heavy Metal'],
    'Deportes ⚽': ['Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Correr', 'Golf', 'Voleibol', 'Boxeo', 'Rugby', 'Béisbol', 'Ciclismo', 'Karate', 'Surf', 'Patinaje', 'Esquí', 'Remo', 'Hockey', 'Atletismo'],
    'Series/Películas 🎬': ['Harry Potter', 'Titanic', 'Avatar', 'IT', 'StarWars', 'La vida es bella', 'High school musical', 'Game of thrones', 'Inception', 'Toy Story', 'Friends', 'Los Simpsons', 'Breaking Bad', 'Stranger Things', 'Pulp Fiction', 'El Padrino', 'Shrek', 'Interestelar'],
    'Transporte 🚗': ['Avión', 'Tren', 'Bicicleta', 'Barco', 'Moto', 'Bus', 'Metro', 'Patineta', 'Helicóptero', 'Submarino', 'Camión', 'Cohete', 'Ambulancia', 'Tractor', 'Barco de vela', 'Yate', 'Furgoneta', 'Crucero'],
    'Herramientas 🔧': ['Martillo', 'Destornillador', 'Sierra', 'Clavo', 'Tornillo', 'Taladro', 'Cinta', 'Lija', 'Alicates', 'Nivel', 'Llave inglesa', 'Serrucho', 'Escuadra', 'Lima', 'Pincel', 'Espátula', 'Gato hidráulico', 'Tornillo de banco'],
    'Frutas/Verduras 🥦': ['Banana', 'Fresa', 'Pera', 'Zanahoria', 'Brócoli', 'Lechuga', 'Cebolla', 'Tomate', 'Piña', 'Mango', 'Sandía', 'Pepino', 'Berenjena', 'Calabaza', 'Espárrago', 'Kiwi', 'Aguacate', 'Papaya'],
    'Marcas Famosas 🏷️': ['Nike', 'Adidas', 'Apple', 'Samsung', 'Google', 'Coca-Cola', 'Zara', 'Toyota', 'Pepsi', 'Netflix', 'Microsoft', 'Amazon', 'Sony', 'Mercedes', 'Disney', 'McDonalds', 'Lego', 'Intel'],
    'Partes del Cuerpo 💪': ['Mano', 'Pie', 'Cabeza', 'Ojo', 'Nariz', 'Boca', 'Corazón', 'Pulmón', 'Hígado', 'Riñón', 'Cerebro', 'Hueso', 'Sangre', 'Estómago', 'Oreja', 'Lengua', 'Cuello', 'Rodilla'],
    'Planetas 🪐': ['Marte', 'Tierra', 'Júpiter', 'Saturno', 'Sol', 'Luna', 'Estrella', 'Cometa', 'Neptuno', 'Urano', 'Venus', 'Mercurio', 'Galaxia', 'Agujero negro', 'Asteroide', 'Vía Láctea', 'Constelación', 'Nebulosa'],
    'Ropa 👗': ['Camiseta', 'Pantalón', 'Calcetín', 'Abrigo', 'Bufanda', 'Gorro', 'Guante', 'Zapatos', 'Traje', 'Corbata', 'Falda', 'Chaleco', 'Pijama', 'Sudadera', 'Botas', 'Cinturón', 'Sandalias', 'Bañador'],
    'Dibujos Animados 📺': ['Pikachu', 'Homero', 'Mickey', 'Bob Esponja', 'Scooby', 'Bugs Bunny', 'Popeye', 'Doraemon', 'Ben 10', 'Shaggy', 'Jerry', 'Pato Donald', 'Garfield', 'Goku', 'Vegeta', 'Naruto', 'Steven Universe', 'Finn el humano'],
    'Lugares Típicos 🏛️': ['Playa', 'Montaña', 'Desierto', 'Ciudad', 'Pueblo', 'Bosque', 'Lago', 'Río', 'Museo', 'Biblioteca', 'Parque', 'Mercado', 'Puerto', 'Estación', 'Estadio', 'Hospital', 'Universidad', 'Castillo'],
    'Clima ☀️': ['Lluvia', 'Nieve', 'Viento', 'Sol', 'Tormenta', 'Arcoíris', 'Nube', 'Niebla', 'Rayo', 'Granizo', 'Calor', 'Humedad', 'Sequía', 'Huracán', 'Tornado', 'Inundación', 'Brisa', 'Escarcha'],
    'Sentimientos 💖': ['Felicidad', 'Tristeza', 'Enojo', 'Miedo', 'Amor', 'Sorpresa', 'Calma', 'Aburrimiento', 'Orgullo', 'Celos', 'Ansiedad', 'Empatía', 'Culpa', 'Alivio', 'Esperanza', 'Confusión', 'Envidia', 'Nostalgia'],
    'Tecnología 💻': ['Computadora', 'Mouse', 'Teclado', 'Cámara', 'Internet', 'Robot', 'Cable', 'Chip', 'Laptop', 'Tablet', 'Servidor', 'Software', 'Hardware', 'Base de datos', 'Algoritmo', 'Realidad virtual', 'Bluetooth', 'Wi-Fi'],
    'Mitología 👹': ['Dragón', 'Sirena', 'Duende', 'Vampiro', 'Fantasma', 'Ángel', 'Ogro', 'Hada', 'Zeus', 'Hércules', 'Medusa', 'Centauro', 'Minotauro', 'Thor', 'Odín', 'Fénix', 'Pegaso', 'Ciclope'],
    'Caliente +18 🔥': ['Sexo', 'Gemidos', 'Verga', 'Cuca', 'Tetas', 'Semen', 'Squirt', 'Lencería', 'Masturbación', 'Condón', 'Vibrador', 'Orgasmo', 'Kamasutra', 'Lubricante', 'Azote', 'Oral', 'Anal', 'Posición']
};

const TEMAS_DISPONIBLES = Object.keys(PALABRAS_POR_TEMA);
const MIN_JUGADORES = 3;
const MAX_JUGADORES = 10;
const VERSION_JUEGO = "1.2.0";

// =================================================================
// 3. INICIALIZACIÓN
// =================================================================
document.addEventListener('DOMContentLoaded', (event) => {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    let nombreJugador = '';
    let codigoSalaActual = '';
    let miId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    let jugadoresActuales = [];
    let configuracionActual = {
        temaSeleccionado: TEMAS_DISPONIBLES[Math.floor(Math.random() * TEMAS_DISPONIBLES.length)],
        incluirAgenteDoble: false
    };
    let miRolActual = '';
    let miPalabraSecreta = '';
    let miTemaActual = '';
    let miVotoSeleccionadoId = 'none';
    let listenerSala = null;

    // =================================================================
    // 4. FUNCIONES DE LÓGICA Y UI
    // =================================================================

    function generarCodigoSala() {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 4; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
        return result;
    }

    function asignarRoles(jugadores, configuracion) {
        const numJugadores = jugadores.length;
        let numImpostores = (numJugadores <= 5) ? 1 : (numJugadores <= 10) ? 2 : 3;

        jugadores.forEach(j => { j.rol = 'Tripulante'; j.eliminado = false; });

        if (configuracion.incluirAgenteDoble && numJugadores >= 4) {
            const tripulantes = jugadores.filter(j => j.rol === 'Tripulante');
            const agente = tripulantes[Math.floor(Math.random() * tripulantes.length)];
            jugadores.find(j => j.id === agente.id).rol = 'Agente Doble';
        }

        const candidatos = jugadores.filter(j => j.rol === 'Tripulante');
        let asignados = 0;
        while (asignados < numImpostores && candidatos.length > 0) {
            const idx = Math.floor(Math.random() * candidatos.length);
            const imp = candidatos.splice(idx, 1)[0];
            jugadores.find(j => j.id === imp.id).rol = 'Impostor';
            asignados++;
        }
        return jugadores;
    }

    window.cambiarVista = function (vistaId) {
        document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
        const nueva = document.getElementById(vistaId);
        if (nueva) nueva.classList.add('activa');
        if (vistaId === 'vista-lobby') { actualizarBotonInicioJuego(); renderConfiguracion(); }
    }

    function actualizarListaJugadores(jugadores) {
        jugadoresActuales = jugadores;
        const listaHost = document.getElementById('lista-jugadores-host');
        const listaJuego = document.getElementById('lista-jugadores-juego');
        const listaVotos = document.getElementById('opciones-votacion');

        listaHost.innerHTML = '';
        listaJuego.innerHTML = '';
        listaVotos.innerHTML = `<button class="btn-votar" data-voto-id="none" style="background-color: #888;" onclick="votarJugador('none')">⚠️ Nadie (Abstenerse)</button>`;

        let contadorActivos = 0;
        const soyHost = jugadores.find(p => p.id === miId)?.esHost;

        jugadores.forEach(j => {
            const esHost = j.hostId === j.id;
            const esMiJugador = j.id === miId;
            const esEliminado = j.eliminado;

            const liLobby = document.createElement('li');
            liLobby.textContent = j.nombre + (esHost ? ' (HOST)' : '') + (esMiJugador ? ' (Tú)' : '');

            if (soyHost && !esMiJugador && !esEliminado) {
                const btnExp = document.createElement('button');
                btnExp.textContent = 'Expulsar';
                btnExp.classList.add('btn-expulsar', 'btn-small');
                btnExp.onclick = async () => {
                    const ok = await mostrarModal("⚠️ EXPULSAR", `¿Echar a ${j.nombre}?`, true, "#ff4560");
                    if (ok) db.ref(`salas/${codigoSalaActual}/jugadores/${j.id}`).remove();
                };
                liLobby.appendChild(btnExp);
            }
            listaHost.appendChild(liLobby);

            if (!esEliminado) {
                contadorActivos++;
                const liJuego = document.createElement('li');
                liJuego.textContent = j.nombre + (esMiJugador ? ' (Tú)' : '');
                listaJuego.appendChild(liJuego);

                if (!esMiJugador) {
                    const btnV = document.createElement('button');
                    btnV.textContent = j.nombre;
                    btnV.classList.add('btn-votar');
                    btnV.setAttribute('data-voto-id', j.id);
                    btnV.onclick = () => votarJugador(j.id);
                    listaVotos.appendChild(btnV);
                }
            }
        });
        document.getElementById('contador-jugadores').textContent = jugadores.length;
        document.getElementById('jugadores-activos-contador').textContent = contadorActivos;
        actualizarBotonInicioJuego();
    }

    function renderConfiguracion() {
        const container = document.getElementById('categorias-container');
        const soyHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        document.getElementById('configuracion-host').style.display = soyHost ? 'block' : 'none';

        if (!soyHost) return;

        if (container.children.length === 0) {
            TEMAS_DISPONIBLES.forEach(tema => {
                const div = document.createElement('div');
                div.classList.add('categoria-item');
                div.innerHTML = `
                    <input type="radio" id="tema-${tema}" value="${tema}" name="tema-selector" ${configuracionActual.temaSeleccionado === tema ? 'checked' : ''}>
                    <label for="tema-${tema}" ${tema.includes('Caliente') ? 'class="categoria-hot"' : ''}>${tema}</label>
                `;
                container.appendChild(div);
            });
            container.addEventListener('change', actualizarConfiguracionHost);
        }
    }

    function actualizarBotonInicioJuego() {
        const soyHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const btn = document.getElementById('btn-iniciar-juego');
        const aviso = document.getElementById('min-jugadores-aviso');
        if (soyHost && btn) {
            const listo = jugadoresActuales.length >= MIN_JUGADORES && configuracionActual.temaSeleccionado;
            btn.disabled = !listo;
            aviso.style.display = listo ? 'none' : 'block';
            if (jugadoresActuales.length < MIN_JUGADORES) aviso.textContent = `Faltan jugadores (mín. ${MIN_JUGADORES})`;
        }
    }

    async function actualizarConfiguracionHost() {
        const tema = document.querySelector('input[name="tema-selector"]:checked')?.value;
        const doble = document.getElementById('checkbox-agente-doble').checked;
        configuracionActual = { temaSeleccionado: tema, incluirAgenteDoble: doble };
        await db.ref('salas/' + codigoSalaActual + '/configuracion').update(configuracionActual);
    }

    // =================================================================
    // 5. EVENTOS PRINCIPALES
    // =================================================================

    document.getElementById('btn-crear-sala').onclick = async () => {
        if (!nombreJugador) return alert('Ingresa tu nombre');
        let cod = generarCodigoSala();
        await db.ref('salas/' + cod).set({
            estado: 'esperando',
            hostId: miId,
            jugadores: { [miId]: { id: miId, nombre: nombreJugador, esHost: true, rol: 'Tripulante', eliminado: false } },
            configuracion: configuracionActual
        });
        configurarEscuchadorSala(cod);
    };

    document.getElementById('form-unirse-sala').onsubmit = async (e) => {
        e.preventDefault();
        const cod = document.getElementById('input-codigo').value.toUpperCase();
        const snap = await db.ref('salas/' + cod).once('value');
        if (!snap.exists()) return alert('No existe');
        await db.ref(`salas/${cod}/jugadores/${miId}`).set({ id: miId, nombre: nombreJugador, esHost: false, rol: 'Tripulante', eliminado: false });
        configurarEscuchadorSala(cod);
    };

    document.getElementById('btn-iniciar-juego').onclick = async () => {
        const tema = configuracionActual.temaSeleccionado;
        const palabras = PALABRAS_POR_TEMA[tema];
        const elegida = palabras[Math.floor(Math.random() * palabras.length)];
        const roles = asignarRoles(jugadoresActuales, configuracionActual);

        const updates = {};
        roles.forEach(j => {
            updates[`jugadores/${j.id}`] = { ...j, palabraSecreta: j.rol === 'Impostor' ? 'NINGUNA' : elegida, tema: tema };
        });
        updates.estado = 'revelacion';
        updates['configuracion/palabra'] = elegida;
        await db.ref('salas/' + codigoSalaActual).update(updates);
    };

    document.getElementById('btn-enviar-adivinanza').onclick = async () => {
        const intento = document.getElementById('input-adivinar-palabra').value.trim();
        const ok = await mostrarModal("🎯 ADIVINAR", `¿Es "${intento.toUpperCase()}"?`, true);
        if (!ok) return;

        const snap = await db.ref('salas/' + codigoSalaActual).once('value');
        if (normalizarPalabra(intento) === normalizarPalabra(snap.val().configuracion.palabra)) {
            await db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado', ultimoResultado: { ganador: 'Impostores', motivo: `Adivinó: ${intento.toUpperCase()}` } });
        } else {
            await mostrarModal("❌ FALLO", "Incorrecto", false, "#ff4560");
        }
    };

    // =================================================================
    // 6. ESCUCHADOR DE FIREBASE
    // =================================================================
    function configurarEscuchadorSala(cod) {
        codigoSalaActual = cod;
        document.getElementById('codigo-lobby-display').textContent = cod;
        db.ref('salas/' + cod).on('value', snap => {
            if (!snap.exists()) return window.location.reload();
            const sala = snap.val();
            const jugArray = Object.keys(sala.jugadores || {}).map(k => ({ ...sala.jugadores[k], id: k }));
            jugadoresActuales = jugArray;

            const yo = jugArray.find(j => j.id === miId);
            if (!yo) return window.location.reload();

            miRolActual = yo.rol;
            miPalabraSecreta = yo.palabraSecreta;
            miTemaActual = yo.tema;

            if (sala.estado === 'esperando') { actualizarListaJugadores(jugArray); cambiarVista('vista-lobby'); }
            else if (sala.estado === 'revelacion') { manejarRevelacion(sala); }
            else if (sala.estado === 'enJuego') { manejarInicioDiscusion(sala); }
            else if (sala.estado === 'finalizado') { manejarFinDeJuego(sala); }
        });
    }

    // Funciones faltantes de manejo de estados (simplificadas)
    function manejarRevelacion(sala) {
        cambiarVista('vista-revelacion');
        document.getElementById('rol-revelacion-display').textContent = `Rol: ${miRolActual}`;
        document.getElementById('tema-valor-revelacion').textContent = miRolActual === 'Impostor' ? '???' : miTemaActual;
        document.getElementById('palabra-revelacion-display').textContent = miRolActual === 'Impostor' ? 'No sabes la palabra' : miPalabraSecreta;
        document.getElementById('btn-iniciar-discusion').style.display = (jugadoresActuales.find(j => j.id === miId)?.esHost) ? 'block' : 'none';
    }

    document.getElementById('btn-iniciar-discusion').onclick = () => db.ref(`salas/${codigoSalaActual}`).update({ estado: 'enJuego', rondaEstado: 'discutiendo' });

    function manejarInicioDiscusion(sala) {
        cambiarVista('vista-juego');
        document.getElementById('contenedor-adivinanza-impostor').style.display = miRolActual === 'Impostor' ? 'block' : 'none';
        document.getElementById('tema-valor').textContent = miRolActual === 'Impostor' ? '???' : miTemaActual;
        document.getElementById('palabra-secreta-display').textContent = miRolActual === 'Impostor' ? '¡Eres el Impostor!' : miPalabraSecreta;
    }

    function manejarFinDeJuego(sala) {
        cambiarVista('vista-final');
        document.getElementById('ganador-display').textContent = `🏆 Ganan los ${sala.ultimoResultado?.ganador || 'Tripulantes'} 🏆`;
    }

    document.getElementById('form-inicio').onsubmit = (e) => {
        e.preventDefault();
        nombreJugador = document.getElementById('input-nombre').value.trim();
        if (nombreJugador) {
            document.getElementById('nombre-jugador-display').textContent = nombreJugador;
            cambiarVista('vista-seleccion');
        }
    };
});

// =================================================================
// 7. FUNCIONES DE UTILIDAD (FUERA DEL DOM PARA ACCESO GLOBAL)
// =================================================================
function mostrarModal(titulo, mensaje, esConfirmacion = false, colorBorde = '#8A2BE2') {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-personalizado');
        if (!modal) return resolve(true);
        modal.querySelector('.modal-contenido').style.borderColor = colorBorde;
        document.getElementById('modal-titulo').textContent = titulo;
        document.getElementById('modal-mensaje').textContent = mensaje;
        const btnC = document.getElementById('modal-btn-confirmar');
        const btnX = document.getElementById('modal-btn-cancelar');
        btnX.style.display = esConfirmacion ? 'block' : 'none';
        btnC.textContent = esConfirmacion ? 'Confirmar' : 'Entendido';
        modal.style.display = 'flex';
        btnC.onclick = () => { modal.style.display = 'none'; resolve(true); };
        btnX.onclick = () => { modal.style.display = 'none'; resolve(false); };
    });
}

function normalizarPalabra(texto) {
    if (!texto) return "";
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/s$/, "");
}