// cliente.js - VERSIÓN RESTAURADA Y SINCRONIZADA
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
        const vista = document.getElementById(id);
        if (vista) vista.classList.add('activa');
    };

    // --- GENERAR CATEGORÍAS (ID: contenedor-temas) ---
    function generarCategoriasUI() {
        const contenedor = document.getElementById('contenedor-temas');
        if (!contenedor) return;
        contenedor.innerHTML = '';
        Object.keys(PALABRAS_POR_TEMA).forEach((tema, index) => {
            const div = document.createElement('div');
            div.className = 'tema-option';
            div.innerHTML = `
                <input type="radio" name="tema-selector" id="tema-${index}" value="${tema}" ${index === 0 ? 'checked' : ''}>
                <label for="tema-${index}">${tema}</label>
            `;
            contenedor.appendChild(div);
        });
    }

    function configurarEscuchadorSala(cod) {
        codigoSalaActual = cod;
        db.ref('salas/' + cod).on('value', snap => {
            if (!snap.exists()) { window.location.reload(); return; }
            const sala = snap.val();
            const lista = Object.keys(sala.jugadores || {}).map(k => ({ ...sala.jugadores[k], id: k }));
            jugadoresActuales = lista;

            const yo = lista.find(j => j.id === miId);
            if (!yo) return;

            miRolActual = yo.rol;
            miPalabraSecreta = yo.palabraSecreta;
            miTemaActual = yo.tema;

            if (sala.estado === 'esperando') {
                actualizarLobby(lista, sala.hostId === miId);
                cambiarVista('vista-lobby');
            } else if (sala.estado === 'revelacion') {
                manejarRevelacion();
            } else if (sala.estado === 'enJuego') {
                manejarInicioDiscusion();
            } else if (sala.estado === 'finalizado') {
                manejarFinDeJuego(sala);
            }
        });
    }

    function actualizarLobby(jugadores, soyHost) {
        const listaUI = document.getElementById('lista-jugadores-host');
        listaUI.innerHTML = '';
        jugadores.forEach(j => {
            const li = document.createElement('li');
            li.textContent = j.nombre + (j.esHost ? ' (HOST)' : '');
            if (soyHost && j.id !== miId) {
                const btn = document.createElement('button');
                btn.textContent = 'Expulsar';
                btn.className = 'btn-danger btn-small';
                btn.onclick = async () => {
                    if (await mostrarModal("⚠️ EXPULSAR", `¿Echar a ${j.nombre}?`, true, "#ff4560")) {
                        db.ref(`salas/${codigoSalaActual}/jugadores/${j.id}`).remove();
                    }
                };
                li.appendChild(btn);
            }
            listaUI.appendChild(li);
        });

        const configHost = document.getElementById('configuracion-host');
        const btnIniciar = document.getElementById('btn-iniciar-juego');
        
        if (soyHost) {
            configHost.style.display = 'block';
            btnIniciar.style.display = 'block';
            if (!document.querySelector('input[name="tema-selector"]')) {
                generarCategoriasUI();
            }
        } else {
            configHost.style.display = 'none';
            btnIniciar.style.display = 'none';
        }
        document.getElementById('codigo-lobby-display').textContent = codigoSalaActual;
    }

    // --- REVELACIÓN Y ROLES ---
    function manejarRevelacion() {
        cambiarVista('vista-revelacion');
        const rolDisp = document.getElementById('rol-revelacion-display');
        const palDisp = document.getElementById('palabra-revelacion-display');
        const temaDisp = document.getElementById('tema-valor-revelacion');

        rolDisp.className = 'texto-rol';
        palDisp.className = 'palabra-display';

        if (miRolActual === 'Impostor') {
            rolDisp.textContent = "¡TU ERES EL IMPOSTOR!";
            rolDisp.classList.add('rol-impostor');
            palDisp.textContent = "????";
            palDisp.classList.add('rol-impostor');
            temaDisp.textContent = "???";
        } else {
            rolDisp.textContent = "ERES TRIPULANTE";
            rolDisp.classList.add('rol-tripulante');
            palDisp.textContent = miPalabraSecreta;
            palDisp.classList.add('rol-tripulante');
            temaDisp.textContent = miTemaActual;
        }

        const soyHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        document.getElementById('btn-iniciar-discusion').style.display = soyHost ? 'block' : 'none';
    }

    function manejarInicioDiscusion() {
        cambiarVista('vista-juego');
        const palJuego = document.getElementById('palabra-secreta-display');
        const rolJuego = document.getElementById('rol-juego-display');
        
        if (miRolActual === 'Impostor') {
            rolJuego.textContent = "TU ERES EL IMPOSTOR";
            rolJuego.className = 'rol-impostor texto-rol';
            palJuego.textContent = "????";
            document.getElementById('contenedor-adivinanza-impostor').style.display = 'block';
        } else {
            rolJuego.textContent = "ERES TRIPULANTE";
            rolJuego.className = 'rol-tripulante texto-rol';
            palJuego.textContent = miPalabraSecreta;
            document.getElementById('contenedor-adivinanza-impostor').style.display = 'none';
        }
    }

    function manejarFinDeJuego(sala) {
        cambiarVista('vista-final');
        document.getElementById('ganador-display').textContent = `🏆 GANAN LOS ${sala.ultimoResultado?.ganador || '---'}`;
        const soyHost = sala.hostId === miId;
        document.getElementById('btn-reiniciar-partida-final').style.display = soyHost ? 'inline-block' : 'none';
        document.getElementById('btn-finalizar-juego-final').style.display = soyHost ? 'inline-block' : 'none';
    }

    // --- EVENTOS DE BOTONES ---
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
            estado: 'esperando',
            hostId: miId,
            configuracion: { temaSeleccionado: 'Animales 🐾' },
            jugadores: { [miId]: { id: miId, nombre: nombreJugador, esHost: true, rol: 'Tripulante' } }
        });
        configurarEscuchadorSala(cod);
    };

    document.getElementById('form-unirse-sala').onsubmit = async (e) => {
        e.preventDefault();
        const cod = document.getElementById('input-codigo').value.toUpperCase();
        if (!cod) return;
        const snap = await db.ref('salas/' + cod).once('value');
        if (!snap.exists()) return alert("Sala no encontrada");
        await db.ref(`salas/${cod}/jugadores/${miId}`).set({
            id: miId, nombre: nombreJugador, esHost: false, rol: 'Tripulante'
        });
        configurarEscuchadorSala(cod);
    };

    document.getElementById('btn-iniciar-juego').onclick = async () => {
        const temaRadio = document.querySelector('input[name="tema-selector"]:checked');
        const tema = temaRadio ? temaRadio.value : 'Animales 🐾';
        const palabra = PALABRAS_POR_TEMA[tema][Math.floor(Math.random() * PALABRAS_POR_TEMA[tema].length)];

        let clones = [...jugadoresActuales];
        const impIdx = Math.floor(Math.random() * clones.length);

        const updates = {};
        clones.forEach((j, i) => {
            const rol = i === impIdx ? 'Impostor' : 'Tripulante';
            updates[`jugadores/${j.id}/rol`] = rol;
            updates[`jugadores/${j.id}/palabraSecreta`] = rol === 'Impostor' ? '????' : palabra;
            updates[`jugadores/${j.id}/tema`] = tema;
        });
        updates.estado = 'revelacion';
        updates['configuracion/palabra'] = palabra;
        await db.ref('salas/' + codigoSalaActual).update(updates);
    };

    document.getElementById('btn-iniciar-discusion').onclick = () => {
        db.ref('salas/' + codigoSalaActual).update({ estado: 'enJuego' });
    };

    document.getElementById('btn-enviar-adivinanza').onclick = async () => {
        const intento = document.getElementById('input-adivinar-palabra').value.trim();
        if (!intento) return;
        if (await mostrarModal("🎯 ADIVINAR", `¿Es "${intento.toUpperCase()}"?`, true)) {
            const snap = await db.ref('salas/' + codigoSalaActual).once('value');
            if (normalizarPalabra(intento) === normalizarPalabra(snap.val().configuracion.palabra)) {
                await db.ref('salas/' + codigoSalaActual).update({
                    estado: 'finalizado',
                    ultimoResultado: { ganador: 'IMPOSTORES' }
                });
            } else {
                await mostrarModal("❌ INCORRECTO", "Sigue intentando", false, "#ff4560");
            }
        }
    };

    document.getElementById('btn-abandonar').onclick = async () => {
        if (await mostrarModal("🚪 ABANDONAR", "¿Salir?", true)) {
            await db.ref(`salas/${codigoSalaActual}/jugadores/${miId}`).remove();
            window.location.reload();
        }
    };

    document.getElementById('btn-reiniciar-partida-final').onclick = async () => {
        const updates = { estado: 'esperando', ultimoResultado: null };
        jugadoresActuales.forEach(j => {
            updates[`jugadores/${j.id}/rol`] = 'Tripulante';
            updates[`jugadores/${j.id}/palabraSecreta`] = null;
        });
        await db.ref('salas/' + codigoSalaActual).update(updates);
    };

    document.getElementById('btn-finalizar-juego-final').onclick = async () => {
        if (await mostrarModal("🚪 CERRAR", "¿Cerrar sala?", true, "#ff4560")) {
            await db.ref('salas/' + codigoSalaActual).remove();
        }
    };
});

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
        modal.style.display = 'flex';
        btnC.onclick = () => { modal.style.display = 'none'; resolve(true); };
        btnX.onclick = () => { modal.style.display = 'none'; resolve(false); };
    });
}

function normalizarPalabra(t) {
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/s$/, "");
}