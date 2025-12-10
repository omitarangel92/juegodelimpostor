// server.js (VERSION FINAL - UNIFICADO PARA RENDER/RAILWAY)

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path'); // MÓDULO NECESARIO

const app = express();
const server = http.createServer(app);

// CORS ya no es necesario si se sirve desde el mismo host, pero se incluye 
// por seguridad para conexiones externas si el cliente no usa io()
const io = socketio(server, { 
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: true
    }
}); 

// El puerto ahora es flexible, Render/Railway usarán la variable de entorno
const PORT = process.env.PORT || 8080; 
const salas = {}; 
const MIN_JUGADORES = 3; 
const MAX_JUGADORES = 10; 

// --- DATOS DEL JUEGO (Mismo contenido de palabras/temas) ---
const PALABRAS_POR_TEMA = {
    // Categorías Originales
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana'],
    'Países 🌎': ['España', 'México', 'Colombia', 'Japón', 'Francia', 'Canadá', 'Brasil', 'Alemania'],
    'Profesiones 💼': ['Médico', 'Maestro', 'Ingeniero', 'Cocinero', 'Policía', 'Bombero', 'Abogado', 'Piloto'],
    'Objetos Cotidianos 💡': ['Teléfono', 'Taza', 'Llaves', 'Reloj', 'Libro', 'Silla', 'Mesa', 'Ventana'],
    
    // Nuevas Categorías
    'Películas 🎬': ['Titanic', 'Avatar', 'Gladiador', 'Matrix', 'El Padrino', 'Toy Story', 'Parásitos', 'Origen'],
    'Partes de la Casa 🏠': ['Cocina', 'Baño', 'Dormitorio', 'Garaje', 'Ventana', 'Chimenea', 'Terraza', 'Jardín'],
    'Juguetes 🧸': ['Muñeca', 'Carro', 'Bloques', 'Cuerda', 'Pelota', 'Patineta', 'Robot', 'Lego'],
    'Licores 🍸': ['Ron', 'Vodka', 'Tequila', 'Cerveza', 'Vino', 'Whisky', 'Ginebra', 'Champán'],
    'Dulces 🍬': ['Chocolate', 'Caramelo', 'Gomita', 'Chicle', 'Galleta', 'Pastel', 'Mazapán', 'Turrón'],
    'Deportes ⚽': ['Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Golf', 'Boxeo', 'Voleibol', 'Ciclismo'],
    'Instrumentos 🎸': ['Guitarra', 'Piano', 'Batería', 'Flauta', 'Violín', 'Trompeta', 'Arpa', 'Saxofón'],
    'Marcas ™️': ['Apple', 'Nike', 'Coca-Cola', 'Adidas', 'Google', 'Amazon', 'Sony', 'Samsung'],
    'Ciudades 🏙️': ['París', 'Londres', 'Roma', 'Nueva York', 'Dubái', 'Tokio', 'Berlín', 'Sídney'],
    'Frutas 🍎': ['Banana', 'Fresa', 'Uva', 'Naranja', 'Mango', 'Pera', 'Piña', 'Melón'],
    'Cuerpo Humano 🧠': ['Corazón', 'Cerebro', 'Hueso', 'Músculo', 'Dedo', 'Ojo', 'Nariz', 'Piel'],
    'Superhéroes 🦸': ['Batman', 'Superman', 'Spiderman', 'Iron Man', 'Hulk', 'Wonder Woman', 'Thor', 'Flash'],
    'Moda 👗': ['Zapatos', 'Camisa', 'Pantalón', 'Vestido', 'Sombrero', 'Bufanda', 'Chaqueta', 'Reloj'],
    'Plantas 🌿': ['Rosa', 'Cactus', 'Helecho', 'Árbol', 'Girasol', 'Orquídea', 'Bambú', 'Margarita'],
    'Tecnología 💻': ['Laptop', 'Móvil', 'Router', 'Teclado', 'Mouse', 'Monitor', 'Cámara', 'Dron'],
    'Picante 🔥': ['Lencería', 'Gemidos', 'Cama', 'Beso', 'Noche', 'Latido', 'Pasión', 'Prohibido']
};
const TEMAS_DISPONIBLES = Object.keys(PALABRAS_POR_TEMA);

// Función auxiliar para generar un código de sala simple (ej. ABCD)
function generarCodigoSala() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return salas[result] ? generarCodigoSala() : result;
}

// Función para iniciar el temporizador de la ronda
function iniciarTemporizador(sala) {
    if (sala.temporizador) {
        clearInterval(sala.temporizador);
    }

    let tiempoRestante = sala.configuracion.tiempoRondaSegundos;
    sala.rondaEstado = 'discutiendo';

    if (tiempoRestante > 0) {
        io.to(sala.codigo).emit('actualizarTiempo', tiempoRestante);

        sala.temporizador = setInterval(() => {
            tiempoRestante--;
            
            if (tiempoRestante >= 0) {
                io.to(sala.codigo).emit('actualizarTiempo', tiempoRestante);
            }

            if (tiempoRestante <= 0) {
                clearInterval(sala.temporizador);
                sala.temporizador = null;
                sala.rondaEstado = 'eliminacion'; 
                
                io.to(sala.codigo).emit('rondaTerminada', { 
                    ronda: sala.rondaActual, 
                    mensaje: "¡Tiempo terminado! Iniciando votación..." 
                });
                
                // Forzar el inicio de la votación
                iniciarVotacionForzada(sala);
            }
        }, 1000); 
    } else {
        io.to(sala.codigo).emit('actualizarTiempo', 0);
        sala.rondaEstado = 'discutiendo'; 
    }
}

function iniciarVotacionForzada(sala) {
     sala.rondaEstado = 'votando';
     sala.votos = {}; 
     const jugadoresActivos = sala.jugadores.filter(j => !j.eliminado);
     
     io.to(sala.codigo).emit('iniciarVotacion', { 
        ronda: sala.rondaActual, 
        jugadoresActivos: jugadoresActivos.map(j => ({ id: j.id, nombre: j.nombre }))
    });
}

// --- LÓGICA DE ASIGNACIÓN DE ROLES (Idéntica a la versión final) ---
function asignarRoles(sala) {
    const jugadores = sala.jugadores;
    const numJugadores = jugadores.length;
    let numImpostores = 0;
    
    if (numJugadores >= 3 && numJugadores <= 5) {
        numImpostores = 1;
    } else if (numJugadores >= 6 && numJugadores <= 10) {
        numImpostores = 2;
    } else {
        numImpostores = 1; 
    }
    
    jugadores.forEach(j => j.rol = 'Tripulante');

    if (sala.configuracion.incluirAgenteDoble && numJugadores >= 4) {
        const tripulantesPotenciales = jugadores.filter(j => j.rol === 'Tripulante');
        if (tripulantesPotenciales.length > 0) {
            const indiceAleatorio = Math.floor(Math.random() * tripulantesPotenciales.length);
            const agenteDoble = tripulantesPotenciales[indiceAleatorio];
            
            const indexEnSala = jugadores.findIndex(j => j.id === agenteDoble.id);
            jugadores[indexEnSala].rol = 'Agente Doble';
        }
    }
    
    const candidatosAImpostor = jugadores.filter(j => j.rol === 'Tripulante');

    let impostoresAsignados = 0;
    while (impostoresAsignados < numImpostores && candidatosAImpostor.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidatosAImpostor.length);
        
        const impostorSeleccionado = candidatosAImpostor.splice(randomIndex, 1)[0]; 
        
        const indexEnSala = jugadores.findIndex(j => j.id === impostorSeleccionado.id);
        jugadores[indexEnSala].rol = 'Impostor';
        impostoresAsignados++;
    }
}

// --- LÓGICA DE VOTACIÓN Y RONDAS (Idéntica a la versión final) ---
function procesarVotacion(sala) {
    const conteoVotos = {}; 
    const jugadoresActivos = sala.jugadores.filter(j => !j.eliminado);

    jugadoresActivos.forEach(j => conteoVotos[j.id] = 0);
    conteoVotos['none'] = 0;

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
            jugadorEliminado = sala.jugadores.find(j => j.id === id);
            empates = [jugadorEliminado];
        } else if (id !== 'none' && conteoVotos[id] === maxVotos && maxVotos > 0) {
            empates.push(sala.jugadores.find(j => j.id === id));
        }
    }

    if (empates.length > 1 || maxVotos === 0) {
        jugadorEliminado = null;
    }
    
    io.to(sala.codigo).emit('resultadoVotacion', { 
        conteo: conteoVotos, 
        jugadorEliminado: jugadorEliminado ? jugadorEliminado.nombre : null 
    });

    if (jugadorEliminado) {
        const indexEnSala = sala.jugadores.findIndex(j => j.id === jugadorEliminado.id);
        sala.jugadores[indexEnSala].eliminado = true;

        io.to(sala.codigo).emit('jugadorEliminado', {
            jugadorEliminado: jugadorEliminado.nombre,
            rolRevelado: jugadorEliminado.rol,
            jugadores: sala.jugadores,
            ronda: sala.rondaActual 
        });
    }

    iniciarSiguienteRonda(sala, jugadorEliminado);
}


function iniciarSiguienteRonda(sala, jugadorEliminado) {
    if (chequearFinDeJuego(sala)) {
        // El juego terminó.
    } else {
        sala.rondaActual++;
        const jugadorEliminadoNombre = jugadorEliminado ? jugadorEliminado.nombre : null;
        io.to(sala.codigo).emit('iniciarNuevaRonda', { 
            ronda: sala.rondaActual,
            mensajeEliminacion: jugadorEliminadoNombre ? `¡${jugadorEliminadoNombre} fue eliminado!` : "Nadie fue eliminado (empate o abstención)."
        });
        iniciarTemporizador(sala);
    }
}


function chequearFinDeJuego(sala) {
    const jugadoresActivos = sala.jugadores.filter(j => !j.eliminado);
    const impostoresActivos = jugadoresActivos.filter(j => j.rol === 'Impostor').length;
    const tripulantesActivos = jugadoresActivos.filter(j => j.rol === 'Tripulante' || j.rol === 'Agente Doble').length;
    
    let ganador = null;

    if (impostoresActivos === 0) {
        ganador = 'Tripulantes'; 
    } else if (impostoresActivos >= tripulantesActivos) {
        ganador = 'Impostores'; 
    }

    if (ganador) {
        sala.estado = 'finalizado';
        io.to(sala.codigo).emit('juegoFinalizado', { ganador, jugadores: sala.jugadores });
        return true;
    }
    return false;
}


// --- LÓGICA PRINCIPAL DE SOCKET.IO (Idéntica a la versión final) ---
io.on('connection', (socket) => {

    // ... (El resto de la lógica de conexión, crearSala, unirseSala, etc., es idéntica a la versión anterior)

    socket.on('crearSala', (nombreJugador) => {
        const codigoSala = generarCodigoSala();
        // ... (Creación de sala)
    });
    
    socket.on('unirseSala', ({ codigoSala, nombreJugador }) => {
        // ... (Lógica de unirse a sala)
    });
    
    socket.on('guardarConfiguracion', ({ codigoSala, nuevaConfig }) => {
        // ... (Lógica de configuración)
    });

    socket.on('iniciarJuego', (codigoSala) => {
        // ... (Lógica de inicio de juego y asignación de roles/palabra)
    });
    
    socket.on('pasarAEliminacion', (codigoSala) => {
        // ... (Lógica para forzar votación)
    });
    
    socket.on('votarJugador', ({ codigoSala, jugadorVotadoId }) => {
        // ... (Lógica de votación)
    });

    socket.on('expulsarJugador', ({ codigoSala, idJugador }) => {
        // ... (Lógica de expulsión)
    });

    socket.on('disconnect', () => {
        // Lógica de desconexión simple
    });
});


// --- CONFIGURACIÓN DE EXPRESS para servir archivos ---
// 1. Hacemos que Express sirva los archivos estáticos de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public'))); 

// 2. Define la ruta principal (/) para enviar el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
}); 


// Inicio del servidor
// Utilizamos '0.0.0.0' para escuchar todas las interfaces, necesario en entornos de hosting
server.listen(PORT, '0.0.0.0', () => { 
    console.log(`Servidor corriendo en el puerto ${PORT} en todas las interfaces.`);
});