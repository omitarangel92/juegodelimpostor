// cliente.js - VERSIÓN FINAL INTEGRADA Y FUNCIONAL
const firebaseConfig = {
    apiKey: "AIzaSyBFWEizn6Nn1iDkvZr2FkN3Vfn7IWGIuG0",
    authDomain: "juego-impostor-firebase.firebaseapp.com",
    databaseURL: "https://juego-impostor-firebase-default-rtdb.firebaseio.com",
    projectId: "juego-impostor-firebase",
    storageBucket: "juego-impostor-firebase.firebasestorage.app",
    messagingSenderId: "337084843090",
    appId: "1:337084843090:web:41b0ebafd8a21f1420cb8b"
};

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

document.addEventListener('DOMContentLoaded', () => {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    let nombreJugador = '';
    let codigoSalaActual = '';
    let miId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    let jugadoresActuales = [];
    let miRolActual = '';
    let miPalabraSecreta = '';
    let miTemaActual = '';

    window.cambiarVista = (id) => {
        document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
        document.getElementById(id).classList.add('activa');
    };

    function generarCategoriasUI() {
        const contenedor = document.getElementById('contenedor-temas');
        contenedor.innerHTML = '';
        Object.keys(PALABRAS_POR_TEMA).forEach((tema, idx) => {
            const div = document.createElement('div');
            div.className = 'tema-option';
            div.innerHTML = `<input type="radio" name="tema-selector" id="tema-${idx}" value="${tema}" ${idx===0?'checked':''}>
                             <label for="tema-${idx}">${tema}</label>`;
            contenedor.appendChild(div);
        });
    }

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

            if (sala.estado === 'esperando') { 
                actualizarListaLobby(jugArray, sala.hostId === miId); 
                cambiarVista('vista-lobby'); 
            }
            else if (sala.estado === 'revelacion') { manejarRevelacion(); }
            else if (sala.estado === 'enJuego') { manejarInicioDiscusion(sala); }
            else if (sala.estado === 'finalizado') { manejarFinDeJuego(sala); }
        });
    }

    function actualizarListaLobby(jugadores, soyHost) {
        const lista = document.getElementById('lista-jugadores-host');
        lista.innerHTML = '';
        jugadores.forEach(j => {
            const li = document.createElement('li');
            li.textContent = j.nombre + (j.esHost ? ' (HOST)' : '');
            if (soyHost && j.id !== miId) {
                const btn = document.createElement('button');
                btn.textContent = 'Expulsar';
                btn.className = 'btn-danger btn-small';
                btn.onclick = () => db.ref(`salas/${codigoSalaActual}/jugadores/${j.id}`).remove();
                li.appendChild(btn);
            }
            lista.appendChild(li);
        });
        document.getElementById('configuracion-host').style.display = soyHost ? 'block' : 'none';
        document.getElementById('btn-iniciar-juego').style.display = soyHost ? 'block' : 'none';
        if (soyHost && !document.querySelector('input[name="tema-selector"]')) generarCategoriasUI();
    }

    function manejarRevelacion() {
        cambiarVista('vista-revelacion');
        const rolD = document.getElementById('rol-revelacion-display');
        const palD = document.getElementById('palabra-revelacion-display');
        const temaD = document.getElementById('tema-valor-revelacion');
        
        rolD.className = 'texto-rol';
        palD.className = 'palabra-display';

        if (miRolActual === 'Impostor') {
            rolD.textContent = "¡ERES EL IMPOSTOR!";
            rolD.classList.add('rol-impostor');
            palD.textContent = "????";
            temaD.textContent = "???";
        } else {
            const esAgente = miRolActual === 'Agente Doble';
            rolD.textContent = esAgente ? "ERES EL AGENTE DOBLE" : "ERES TRIPULANTE";
            rolD.classList.add(esAgente ? 'rol-agente' : 'rol-tripulante');
            palD.textContent = miPalabraSecreta;
            temaD.textContent = miTemaActual;
        }

        const soyHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        document.getElementById('btn-iniciar-discusion').style.display = soyHost ? 'block' : 'none';
    }

    function manejarInicioDiscusion(sala) {
        cambiarVista('vista-juego');
        document.getElementById('rol-juego-display').textContent = miRolActual;
        document.getElementById('palabra-secreta-display').textContent = (miRolActual === 'Impostor') ? "????" : miPalabraSecreta;
        document.getElementById('contenedor-adivinanza-impostor').style.display = (miRolActual === 'Impostor') ? 'block' : 'none';

        // Lista para votación
        const listaVoto = document.getElementById('lista-jugadores-juego');
        listaVoto.innerHTML = '';
        jugadoresActuales.forEach(j => {
            const li = document.createElement('li');
            li.textContent = j.nombre;
            li.onclick = () => emitirVoto(j.id);
            listaVoto.appendChild(li);
        });

        const soyHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        document.getElementById('btn-forzar-votacion').style.display = soyHost ? 'block' : 'none';
    }

    function emitirVoto(idVotado) {
        db.ref(`salas/${codigoSalaActual}/votos/${miId}`).set(idVotado);
        mostrarModal("✅ VOTO", "Voto registrado correctamente", false);
    }

    async function finalizarVotacionManual() {
        const snap = await db.ref(`salas/${codigoSalaActual}`).once('value');
        const sala = snap.val();
        const votos = sala.votos || {};
        const conteo = {};
        Object.values(votos).forEach(id => conteo[id] = (conteo[id] || 0) + 1);

        let expulsadoId = null; let max = 0;
        for (const id in conteo) { if (conteo[id] > max) { max = conteo[id]; expulsadoId = id; } }

        const jugadorExpulsado = sala.jugadores[expulsadoId];
        let ganador = (jugadorExpulsado?.rol === 'Impostor') ? 'TRIPULANTES' : 'IMPOSTORES';
        
        db.ref(`salas/${codigoSalaActual}`).update({
            estado: 'finalizado',
            ultimoResultado: { ganador: ganador, expulsado: jugadorExpulsado?.nombre || 'Nadie' }
        });
    }

    function manejarFinDeJuego(sala) {
        cambiarVista('vista-final');
        document.getElementById('ganador-display').textContent = "🏆 GANAN LOS " + sala.ultimoResultado.ganador;
        const listaF = document.getElementById('lista-roles-final');
        listaF.innerHTML = '';
        Object.values(sala.jugadores).forEach(j => {
            const li = document.createElement('li');
            li.textContent = `${j.nombre}: ${j.rol}`;
            listaF.appendChild(li);
        });

        const soyHost = sala.hostId === miId;
        document.getElementById('btn-reiniciar-partida-final').style.display = soyHost ? 'block' : 'none';
        document.getElementById('btn-finalizar-juego-final').style.display = soyHost ? 'block' : 'none';
    }

    // --- EVENTOS BOTONES ---
    document.getElementById('form-inicio').onsubmit = (e) => {
        e.preventDefault();
        nombreJugador = document.getElementById('input-nombre').value.trim();
        if (nombreJugador) {
            document.getElementById('nombre-jugador-display').textContent = nombreJugador;
            cambiarVista('vista-seleccion');
        }
    };

    document.getElementById('btn-crear-sala').onclick = async () => {
        const cod = Math.random().toString(36).substring(2, 6).toUpperCase();
        await db.ref('salas/' + cod).set({
            estado: 'esperando', hostId: miId,
            jugadores: { [miId]: { id: miId, nombre: nombreJugador, esHost: true, rol: 'Tripulante' } }
        });
        configurarEscuchadorSala(cod);
    };

    document.getElementById('form-unirse-sala').onsubmit = async (e) => {
        e.preventDefault();
        const cod = document.getElementById('input-codigo').value.toUpperCase();
        const snap = await db.ref('salas/' + cod).once('value');
        if (snap.exists()) {
            await db.ref(`salas/${cod}/jugadores/${miId}`).set({ id: miId, nombre: nombreJugador, esHost: false, rol: 'Tripulante' });
            configurarEscuchadorSala(cod);
        }
    };

    document.getElementById('btn-iniciar-juego').onclick = async () => {
        const tema = document.querySelector('input[name="tema-selector"]:checked').value;
        const palabras = PALABRAS_POR_TEMA[tema];
        const palabra = palabras[Math.floor(Math.random() * palabras.length)];
        const updates = { estado: 'revelacion', votos: null, 'configuracion/palabra': palabra };
        
        const impIdx = Math.floor(Math.random() * jugadoresActuales.length);
        jugadoresActuales.forEach((j, i) => {
            const rol = (i === impIdx) ? 'Impostor' : 'Tripulante';
            updates[`jugadores/${j.id}/rol`] = rol;
            updates[`jugadores/${j.id}/palabraSecreta`] = (rol === 'Impostor') ? '????' : palabra;
            updates[`jugadores/${j.id}/tema`] = tema;
        });
        await db.ref('salas/' + codigoSalaActual).update(updates);
    };

    document.getElementById('btn-iniciar-discusion').onclick = () => db.ref('salas/' + codigoSalaActual).update({ estado: 'enJuego' });
    document.getElementById('btn-forzar-votacion').onclick = () => finalizarVotacionManual();

    document.getElementById('btn-enviar-adivinanza').onclick = async () => {
        const intento = document.getElementById('input-adivinar-palabra').value.trim();
        const snap = await db.ref(`salas/${codigoSalaActual}`).once('value');
        if (normalizarPalabra(intento) === normalizarPalabra(snap.val().configuracion.palabra)) {
            db.ref(`salas/${codigoSalaActual}`).update({ estado: 'finalizado', ultimoResultado: { ganador: 'IMPOSTORES' } });
        } else {
            mostrarModal("❌ ERROR", "Esa no es la palabra", false);
        }
    };

    document.getElementById('btn-reiniciar-partida-final').onclick = () => {
        const updates = { estado: 'esperando', ultimoResultado: null, votos: null };
        jugadoresActuales.forEach(j => { updates[`jugadores/${j.id}/rol`] = 'Tripulante'; });
        db.ref('salas/' + codigoSalaActual).update(updates);
    };

    document.getElementById('btn-finalizar-juego-final').onclick = () => db.ref('salas/' + codigoSalaActual).remove();
});

// --- UTILIDADES ---
function normalizarPalabra(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }