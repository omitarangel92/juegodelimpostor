// public/cliente.js (CÓDIGO COMPLETO Y CORREGIDO)

// =================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// =================================================================

// NOTA DE SEGURIDAD: Esta clave está expuesta públicamente, es CRÍTICO
// que configures reglas de seguridad ESTRICTAS en Firebase.
const firebaseConfig = {
    // Reemplaza con tus CREDENCIALES REALES de Firebase
    apiKey: "AIzaSyBFWEizn6N1iDkvZr2FkN3Vfn7IWGIuG0", 
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
const MIN_JUGADORES = 3; 
const MAX_JUGADORES = 10;

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
    const numJugadores = jugadores.length;
    let numImpostores = 0;
    
    // Lógica para determinar el número de impostores
    if (numJugadores >= 3 && numJugadores <= 5) {
        numImpostores = 1;
    } else if (numJugadores >= 6 && numJugadores <= 10) {
        numImpostores = 2;
    } 
    
    // Resetear roles y limpiar estado de juego (para jugadores que ya estaban en la sala)
    jugadores.forEach(j => {
        j.rol = 'Tripulante';
        j.eliminado = false;
        j.voto = null; 
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

// =================================================================
// 3. INICIO DE LA APLICACIÓN (DESPUÉS DEL DOM)
// =================================================================
document.addEventListener('DOMContentLoaded', (event) => {

    // Inicialización de Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // 4. VARIABLES GLOBALES
    let nombreJugador = ''; 
    let codigoSalaActual = '';
    // Generar un ID único para este cliente
    let miId = Date.now().toString(36) + Math.random().toString(36).substring(2); 
    
    let jugadoresActuales = []; 
    // Usar la configuración por defecto
    let configuracionActual = { tema: TEMAS_DISPONIBLES[0], incluirAgenteDoble: false }; 
    let miRolActual = ''; 
    let miPalabraSecreta = ''; 
    let miTemaActual = ''; 
    let miVotoSeleccionadoId = 'none'; 
    
    let listenerSala = null; // Para almacenar el listener de la sala

    // =================================================================
    // 5. FUNCIONES DE UI Y LÓGICA AUXILIAR
    // =================================================================

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
        // Asegurarse de que jugadoresActuales se actualiza
        jugadoresActuales = jugadores.map(j => ({ ...j })); // Copia profunda
        
        const listaHost = document.getElementById('lista-jugadores-host');
        const listaJuego = document.getElementById('lista-jugadores-juego');
        const listaVotos = document.getElementById('opciones-votacion');
        
        if (listaHost) listaHost.innerHTML = '';
        if (listaJuego) listaJuego.innerHTML = '';
        
        // Preparar lista de votos (resetear)
        if (listaVotos) {
             listaVotos.innerHTML = `
                <button class="btn-votar" data-voto-id="none" style="background-color: #888;">
                    ⚠️ Nadie (Abstenerse)
                </button>
            `;
        }

        let contadorActivos = 0;

        jugadores.forEach(j => {
            const esHost = j.hostId === j.id; 
            const esMiJugador = j.id === miId;
            const esEliminado = j.eliminado;

            // 1. Lista del Lobby (Host)
            if (listaHost) {
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
            }


            // 2. Lista de Juego (Solo activos)
            if (!esEliminado) {
                contadorActivos++;
                if (listaJuego) {
                    const elementoJuego = document.createElement('li');
                    elementoJuego.textContent = j.nombre + (esMiJugador ? ' (Tú)' : '');
                    listaJuego.appendChild(elementoJuego);
                }
                
                // 3. Opciones de Votación (Solo activos, excluyéndome a mí mismo)
                if (!esMiJugador && listaVotos) {
                    const btnVoto = document.createElement('button');
                    btnVoto.textContent = j.nombre;
                    btnVoto.classList.add('btn-votar');
                    btnVoto.setAttribute('data-voto-id', j.id);
                    btnVoto.onclick = () => votarJugador(j.id);
                    listaVotos.appendChild(btnVoto);
                }
            }
        });

        const contadorDisplay = document.getElementById('contador-jugadores');
        if (contadorDisplay) contadorDisplay.textContent = jugadores.length;
        const activosDisplay = document.getElementById('jugadores-activos-contador');
        if (activosDisplay) activosDisplay.textContent = contadorActivos;
        
        actualizarBotonInicioJuego();
    }
    
    
    function actualizarBotonInicioJuego() {
        const btnIniciar = document.getElementById('btn-iniciar-revelacion'); 
        const avisoMin = document.getElementById('aviso-min-jugadores');
        
        if (!btnIniciar || !avisoMin) return;

        const numJugadores = jugadoresActuales.length;
        // La propiedad esHost ahora está en los datos del jugador
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost; 
        
        if (esHost) {
            if (numJugadores >= MIN_JUGADORES && numJugadores <= MAX_JUGADORES) {
                btnIniciar.disabled = false;
                avisoMin.style.display = 'none';
            } else {
                btnIniciar.disabled = true;
                avisoMin.style.display = 'block';
            }
            btnIniciar.style.display = 'block'; // Asegurar que sea visible para el Host
        } else {
            btnIniciar.style.display = 'none'; // Esconder para no-Hosts
            avisoMin.style.display = 'none'; // Esconder aviso también
        }
    }

    // =================================================================
    // 6. LÓGICA DE FIREBASE (Listener y Flujo)
    // =================================================================
    function configurarEscuchadorSala(codigoSala) {
        // Detener escuchador anterior si existe
        if (listenerSala) {
            db.ref('salas/' + codigoSalaActual).off('value', listenerSala);
        }
        codigoSalaActual = codigoSala; 
        const salaRef = db.ref('salas/' + codigoSala);

        // Define la función de escucha (la "suscripción" a los cambios en la sala)
        listenerSala = salaRef.on('value', (snapshot) => {
            if (!snapshot.exists()) {
                alert('La sala ha sido eliminada, has sido expulsado o no existe.');
                window.location.reload();
                return;
            }
            const sala = snapshot.val(); 
            
            // 1. Reconstruir lista de jugadores y mi info
            const jugadores = Object.values(sala.jugadores || {});
            actualizarListaJugadores(jugadores);

            const misDatos = sala.jugadores[miId];
            if (misDatos) {
                // Actualizar info local
                miRolActual = misDatos.rol || '';
                miPalabraSecreta = misDatos.palabraSecreta || '';
                miTemaActual = misDatos.tema || '';
                // Actualizar la configuración para el Host
                configuracionActual = sala.configuracion || configuracionActual; 
            } else {
                 // Si mis datos desaparecen, significa que fui expulsado o la sala se cerró
                 if (sala.estado !== 'finalizado') {
                      alert('Has sido desconectado o expulsado de la sala.');
                      window.location.reload();
                      return;
                 }
            }
            
            // 2. Manejar el flujo del juego basado en el estado
            if (sala.estado === 'esperando') {
                cambiarVista('vista-lobby');
            } else if (sala.estado === 'revelacion') { 
                manejarRevelacionRol(sala);
            } else if (sala.estado === 'enJuego') {
                manejarJuego(sala); 
            } else if (sala.estado === 'resultado') {
                manejarResultadoRonda(sala);
            } else if (sala.estado === 'finalizado') {
                manejarFinDeJuego(sala);
            }
        });
    }

    // Funciones de mantenimiento de sala (expulsar y abandonar)
    window.expulsarJugador = async function(jugadorId) {
        if (!jugadoresActuales.find(j => j.id === miId)?.esHost || !codigoSalaActual) return;
        
        if (confirm(`¿Estás seguro de que quieres expulsar a ${jugadoresActuales.find(j => j.id === jugadorId).nombre}?`)) {
            await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorId}`).remove();
        }
    }
    
    window.abandonarSala = async function() {
        if (!codigoSalaActual) return window.location.reload(); 
        
        const misDatos = jugadoresActuales.find(j => j.id === miId);

        // 1. Desactivar listener
        db.ref('salas/' + codigoSalaActual).off('value', listenerSala);

        // 2. Eliminar al jugador
        await db.ref(`salas/${codigoSalaActual}/jugadores/${miId}`).remove();
        
        // 3. Lógica de transferencia de Host si es necesario
        if (misDatos?.esHost && jugadoresActuales.length > 1) {
            // Buscar al primer jugador activo y no host
            const siguienteHost = jugadoresActuales.find(j => j.id !== miId && !j.eliminado); 
            if (siguienteHost) {
                await db.ref(`salas/${codigoSalaActual}/hostId`).set(siguienteHost.id);
                await db.ref(`salas/${codigoSalaActual}/jugadores/${siguienteHost.id}/esHost`).set(true);
            } else {
                // Si no hay más jugadores, eliminar la sala
                await db.ref('salas/' + codigoSalaActual).remove();
            }
        } else if (misDatos?.esHost && jugadoresActuales.length <= 1) {
            // Si el Host es el último, eliminar la sala
            await db.ref('salas/' + codigoSalaActual).remove();
        }

        window.location.reload();
    }
    
    function renderConfiguracion() {
        const selectTema = document.getElementById('select-tema');
        if (!selectTema) return;
        
        selectTema.innerHTML = '';
        TEMAS_DISPONIBLES.forEach(tema => {
            const option = document.createElement('option');
            option.value = tema;
            option.textContent = tema;
            selectTema.appendChild(option);
        });
        selectTema.value = configuracionActual.tema;
        
        const checkboxAgente = document.getElementById('checkbox-agente-doble');
        if (checkboxAgente) checkboxAgente.checked = configuracionActual.incluirAgenteDoble;
    }

    // =================================================================
    // 7. HANDLERS DE FORMULARIOS Y FLUJO DEL JUEGO
    // =================================================================
    
    // *** 7.1. HANDLER DE INICIO DE NOMBRE ***
    document.getElementById('form-inicio').addEventListener('submit', (e) => {
        e.preventDefault(); 
        nombreJugador = document.getElementById('input-nombre').value.trim();
        
        if (nombreJugador) {
            document.getElementById('nombre-jugador-display').textContent = nombreJugador;
            cambiarVista('vista-seleccion'); 
        }
    });
    
    // *** 7.2. CREAR SALA (HOST) ***
    document.getElementById('btn-crear-sala').addEventListener('click', async () => {
        let codigo; 
        let snapshot; 
        do { 
            codigo = generarCodigoSala(); 
            snapshot = await db.ref('salas/' + codigo).once('value'); 
        } while (snapshot.exists()); 

        const jugadorHost = { 
            id: miId, 
            nombre: nombreJugador, 
            esHost: true, 
            rol: 'Tripulante', 
            eliminado: false 
        }; 

        const nuevaSala = {
            codigo: codigo,
            hostId: miId, 
            jugadores: { [miId]: jugadorHost },
            estado: 'esperando', 
            configuracion: configuracionActual, 
            votos: {},
            rondaActual: 1
        };

        const salaRef = db.ref('salas/' + codigo);
        await salaRef.set(nuevaSala);

        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;
    });

    // *** 7.3. UNIRSE A SALA ***
    document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputCodigo = document.getElementById('input-codigo');
        const codigo = inputCodigo.value.trim().toUpperCase();

        if (!codigo || codigo.length !== 4) {
            return alert('ERROR: El código debe ser de 4 letras.');
        }

        try {
            const snapshot = await db.ref('salas/' + codigo).once('value');
            if (!snapshot.exists()) {
                inputCodigo.value = '';
                return alert('ERROR: La sala con el código ' + codigo + ' no existe.');
            }

            const sala = snapshot.val();
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
            
            // Si el jugador ya está en la sala (ej. recarga)
            if (sala.jugadores && sala.jugadores[miId]) {
                 configurarEscuchadorSala(codigo);
                 document.getElementById('codigo-lobby-display').textContent = codigo;
                 return;
            }

            const jugadoresRef = db.ref('salas/' + codigo + '/jugadores/' + miId);
            await jugadoresRef.set(nuevoJugador);

            configurarEscuchadorSala(codigo);
            document.getElementById('codigo-lobby-display').textContent = codigo;

        } catch (error) {
            console.error("Error al unirse a la sala en Firebase:", error);
            alert(`🔴 ERROR AL UNIRSE: Fallo de red o de permisos. Detalle: ${error.message}`);
        }
    });

    // *** 7.4. GUARDAR CONFIGURACIÓN (Host) ***
    document.getElementById('form-configuracion').addEventListener('change', async () => {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !codigoSalaActual) return;

        const tema = document.getElementById('select-tema').value;
        const incluirAgenteDoble = document.getElementById('checkbox-agente-doble').checked;
        
        configuracionActual = { tema, incluirAgenteDoble }; 
        
        await db.ref('salas/' + codigoSalaActual + '/configuracion').update(configuracionActual);
    });


    // *** 7.5. LOBBY -> REVELACIÓN (HOST) ***
    document.getElementById('btn-iniciar-revelacion').addEventListener('click', async () => {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !codigoSalaActual) return;

        if (jugadoresActuales.length < MIN_JUGADORES) {
            return; 
        }

        const salaRef = db.ref('salas/' + codigoSalaActual);

        // 1. Asignar roles y palabras
        const jugadoresConRoles = asignarRoles(jugadoresActuales, configuracionActual);

        // 2. Elegir palabra secreta/tema
        const temaElegido = configuracionActual.tema;
        const palabras = PALABRAS_POR_TEMA[temaElegido];
        const randomIndex1 = Math.floor(Math.random() * palabras.length);
        let randomIndex2;
        do { 
            randomIndex2 = Math.floor(Math.random() * palabras.length);
        } while (randomIndex2 === randomIndex1);

        const palabraTripulante = palabras[randomIndex1];
        const palabraImpostor = palabras[randomIndex2];

        // 3. Preparar la estructura para Firebase
        const jugadoresParaFirebase = {};
        jugadoresConRoles.forEach(jugador => {
            let palabraInfo = (jugador.rol === 'Impostor') ? palabraImpostor : palabraTripulante;
            let temaInfo = temaElegido;

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
            estado: 'revelacion', 
            'configuracion/palabraTripulante': palabraTripulante, 
            'configuracion/palabraImpostor': palabraImpostor,
            'configuracion/temaElegido': temaElegido,
            rondaActual: 1, 
            votos: {}, 
        });
    });

    // *** 7.6. MANEJAR REVELACIÓN DE ROL (TODOS LOS CLIENTES) ***
    function manejarRevelacionRol(sala) {
        cambiarVista('vista-revelacion-rol');
        
        const misDatos = sala.jugadores[miId];
        if (!misDatos) return; 

        miRolActual = misDatos.rol;
        miPalabraSecreta = misDatos.palabraSecreta;
        miTemaActual = misDatos.tema;

        const rolDisplay = document.getElementById('revelacion-titulo');
        const palabraDisplay = document.getElementById('revelacion-palabra');
        const temaDisplay = document.getElementById('revelacion-tema');
        const botonHost = document.getElementById('btn-iniciar-discusion');
        const avisoEspera = document.getElementById('aviso-espera-discusion');

        if (rolDisplay) rolDisplay.textContent = miRolActual;
        if (palabraDisplay) palabraDisplay.textContent = miPalabraSecreta;
        if (temaDisplay) temaDisplay.textContent = 'Tema: ' + miTemaActual;

        // Estilos de color
        let color = 'var(--color-primary)';
        if (miRolActual === 'Impostor') color = 'var(--color-red)';
        if (miRolActual === 'Agente Doble') color = 'var(--color-orange)';
        if (miRolActual === 'Tripulante') color = 'var(--color-green)';
        if (rolDisplay) rolDisplay.style.color = color;
        
        // Mostrar botón solo al Host
        if (misDatos.esHost) {
            if (botonHost) botonHost.style.display = 'block';
            if (avisoEspera) avisoEspera.style.display = 'none';
        } else {
            if (botonHost) botonHost.style.display = 'none';
            if (avisoEspera) avisoEspera.style.display = 'block';
        }
    }
    
    // *** 7.7. REVELACIÓN -> DISCUSIÓN (HOST) ***
    document.getElementById('btn-iniciar-discusion').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        await db.ref('salas/' + codigoSalaActual).update({ 
            estado: 'enJuego',
            rondaEstado: 'discutiendo',
            votos: {} 
        });
    });


    // *** 7.8. MANEJAR EL JUEGO (DISCUSIÓN Y VOTACIÓN) ***
    function manejarJuego(sala) {
        const misDatos = sala.jugadores[miId];
        const esHost = misDatos?.esHost;
        
        if (document.getElementById('mi-rol-juego')) document.getElementById('mi-rol-juego').textContent = misDatos.rol;
        if (document.getElementById('mi-palabra-juego')) document.getElementById('mi-palabra-juego').textContent = misDatos.palabraSecreta;
        if (document.getElementById('mi-tema-juego')) document.getElementById('mi-tema-juego').textContent = misDatos.tema;
        if (document.getElementById('ronda-actual-display')) document.getElementById('ronda-actual-display').textContent = sala.rondaActual;
        
        if (sala.rondaEstado === 'discutiendo') {
            cambiarVista('vista-juego');
            miVotoSeleccionadoId = 'none'; // Resetear el estado de voto local
            
            const btnForzarVotacion = document.getElementById('btn-forzar-votacion');
            if (btnForzarVotacion) {
                btnForzarVotacion.style.display = esHost ? 'block' : 'none';
            }
            
        } else if (sala.rondaEstado === 'votando') {
            manejarInicioVotacion(sala); 
        }
        
        if (chequearFinDeJuego(jugadoresActuales)) {
             // Si el juego terminó, forzar el estado 'finalizado'
             if (esHost) {
                db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
             }
        }
    }
    
    // *** 7.9. DISCUSIÓN -> VOTACIÓN (HOST) ***
    document.getElementById('btn-forzar-votacion').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return; 
        
        await db.ref('salas/' + codigoSalaActual).update({ rondaEstado: 'votando' });
    });
    
    // *** 7.10. INICIO DE VOTACIÓN (TODOS LOS CLIENTES) ***
    function manejarInicioVotacion(sala) {
        cambiarVista('vista-votacion');
        
        const rondaVotacionDisplay = document.getElementById('ronda-votacion-display');
        if (rondaVotacionDisplay) rondaVotacionDisplay.textContent = sala.rondaActual; 
        
        const votoConfirmadoDisplay = document.getElementById('voto-confirmado-display');
        
        // Revisa si ya voté en esta ronda (a través del estado local)
        if (miVotoSeleccionadoId !== 'none') {
            const votado = jugadoresActuales.find(j => j.id === miVotoSeleccionadoId);
            votoConfirmadoDisplay.textContent = 
                (miVotoSeleccionadoId === 'none') ? '⚠️ Abstención confirmada.' : '✅ Voto por ' + votado.nombre + ' confirmado.';
            document.querySelectorAll('.btn-votar').forEach(btn => btn.disabled = true);
        } else {
            votoConfirmadoDisplay.textContent = 'Esperando tu voto...';
            // Reactivar botones
            document.querySelectorAll('.btn-votar').forEach(btn => btn.disabled = false);
        }

        const votantesActivos = jugadoresActuales.filter(j => !j.eliminado).length;
        const votosEmitidos = Object.keys(sala.votos || {}).length;

        document.getElementById('votos-emitidos-display').textContent = 
            `Votos recibidos: ${votosEmitidos}/${votantesActivos}`;
        
        // Si todos votaron, el Host pasa al resultado
        if (votosEmitidos >= votantesActivos) {
            if (jugadoresActuales.find(j => j.id === miId)?.esHost) {
                db.ref('salas/' + codigoSalaActual).update({ estado: 'resultado' });
            }
        }
    }
    
    // *** 7.11. VOTAR (TODOS LOS CLIENTES) ***
    window.votarJugador = async function(votadoId) {
        // Permitir votar solo si el estado local es 'none'
        if (miVotoSeleccionadoId !== 'none' || !codigoSalaActual) return; 

        // 1. Mostrar confirmación en la UI
        miVotoSeleccionadoId = votadoId; 
        const votado = jugadoresActuales.find(j => j.id === votadoId);
        
        document.getElementById('voto-confirmado-display').textContent = 
            (votadoId === 'none') ? '⚠️ Abstención confirmada.' : '✅ Voto por ' + votado.nombre + ' confirmado.';
        
        // 2. Deshabilitar botones
        document.querySelectorAll('.btn-votar').forEach(btn => btn.disabled = true);
        
        // 3. Actualizar el voto en Firebase
        await db.ref('salas/' + codigoSalaActual + '/votos/' + miId).set(votadoId);
        
        // Nota: El cambio en votos activará manejarInicioVotacion, donde el Host detectará si todos votaron.
    };

    // *** 7.12. MANEJAR RESULTADO DE RONDA (TODOS LOS CLIENTES) ***
    function manejarResultadoRonda(sala) {
        cambiarVista('vista-resultado');
        
        document.getElementById('resultado-ronda-display').textContent = `Resultados de la Ronda ${sala.rondaActual}`;

        const votosRecibidos = sala.votos || {};
        const conteoVotos = {};
        let jugadoresActivos = jugadoresActuales.filter(j => !j.eliminado);
        let jugadorEliminado = null;

        jugadoresActivos.forEach(j => conteoVotos[j.id] = 0);
        conteoVotos['none'] = 0; // Contabilizar abstenciones/votos inválidos

        Object.values(votosRecibidos).forEach(votoId => {
            if (conteoVotos[votoId] !== undefined) {
                conteoVotos[votoId]++;
            } else if (votoId === 'none') {
                conteoVotos['none']++;
            }
        });

        let maxVotos = 0;
        let candidatosAEliminar = [];
        
        Object.keys(conteoVotos).forEach(id => {
            if (id !== 'none' && conteoVotos[id] > maxVotos) {
                maxVotos = conteoVotos[id];
                candidatosAEliminar = [id];
            } else if (id !== 'none' && conteoVotos[id] === maxVotos && maxVotos > 0) {
                candidatosAEliminar.push(id);
            }
        });

        const resultadoDisplay = document.getElementById('jugador-eliminado-display');
        let detallesVotacionHTML = '';
        
        // Generar lista de quién votó por quién
        jugadoresActivos.forEach(j => {
            const votoDelJugador = votosRecibidos[j.id];
            const votadoNombre = jugadoresActuales.find(p => p.id === votoDelJugador)?.nombre || 'Abstención';
            detallesVotacionHTML += `<p><strong>${j.nombre}</strong> votó por <strong>${votadoNombre}</strong></p>`;
        });
        document.getElementById('detalles-votacion-container').innerHTML = detallesVotacionHTML;


        if (candidatosAEliminar.length === 1 && maxVotos > 0) {
            jugadorEliminado = jugadoresActuales.find(j => j.id === candidatosAEliminar[0]);
            resultadoDisplay.textContent = `¡${jugadorEliminado.nombre} ha sido eliminado con ${maxVotos} votos! Era ${jugadorEliminado.rol}.`;
            // Aplicar eliminación (solo Host)
            if (jugadoresActuales.find(j => j.id === miId)?.esHost) {
                const jugadorRef = db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorEliminado.id}/eliminado`);
                jugadorRef.set(true); 
            }

        } else if (candidatosAEliminar.length > 1) {
             resultadoDisplay.textContent = `¡Hubo un empate con ${maxVotos} votos! Nadie es eliminado en esta ronda.`;
             jugadorEliminado = null;
        } else {
             resultadoDisplay.textContent = `Nadie fue eliminado en esta ronda (No hubo mayoría de votos).`;
        }
        
        // Comprobar si el juego termina después de la eliminación/empate
        const ganador = chequearFinDeJuego(jugadoresActuales);

        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const btnSiguiente = document.getElementById('btn-siguiente-ronda');
        const btnVerGanador = document.getElementById('btn-ver-ganador');
        const accionesFinalesHost = document.getElementById('acciones-finales-host');

        if (ganador) {
            // El juego terminó. Ocultar Siguiente/Ver Ganador y mostrar botones de Host
            if (esHost) accionesFinalesHost.style.display = 'block'; else accionesFinalesHost.style.display = 'none';
            if (btnVerGanador) btnVerGanador.style.display = 'block'; 
            if (btnSiguiente) btnSiguiente.style.display = 'none';
            
            // Si el juego finalizó por lógica, forzamos la vista final
            if (esHost) {
                 db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
            }

        } else {
            // El juego continúa
            if (esHost) btnSiguiente.style.display = 'block'; else btnSiguiente.style.display = 'none';
            if (btnVerGanador) btnVerGanador.style.display = 'none';
            if (accionesFinalesHost) accionesFinalesHost.style.display = 'none';
        }
    }

    // *** 7.13. CHEQUEAR FIN DE JUEGO ***
    function chequearFinDeJuego(jugadores) {
        const jugadoresActivos = jugadores.filter(j => !j.eliminado);

        const impostoresActivos = jugadoresActivos.filter(j => j.rol === 'Impostor').length;
        const tripulantesActivos = jugadoresActivos.filter(j => j.rol === 'Tripulante' || j.rol === 'Agente Doble').length;
        
        if (impostoresActivos === 0) {
            return 'Tripulantes'; // Ganan los tripulantes si eliminan a todos los impostores
        } else if (impostoresActivos >= tripulantesActivos) {
            return 'Impostores'; // Ganan los impostores si son igual o más que los tripulantes
        }
        return null; // El juego continúa
    }
    
    // *** 7.14. RESULTADO -> DISCUSIÓN / FIN (HOST) ***
    document.getElementById('btn-siguiente-ronda').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        const salaRef = db.ref('salas/' + codigoSalaActual);

        await salaRef.update({
            estado: 'enJuego', 
            rondaEstado: 'discutiendo', 
            rondaActual: firebase.database.ServerValue.increment(1), 
            votos: {} // Limpiar votos para la nueva ronda
        });
    });

    document.getElementById('btn-ver-ganador').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         await db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
    });
    
    // *** 7.15. MANEJAR FIN DE JUEGO (TODOS LOS CLIENTES) ***
    function manejarFinDeJuego(sala) {
         cambiarVista('vista-final');
         
         // Re-calcular el ganador por si la sala pasó directamente de 'enJuego' a 'finalizado'
         const ganador = chequearFinDeJuego(jugadoresActuales);
         
         const ganadorDisplay = document.getElementById('ganador-display');
         if (ganadorDisplay) ganadorDisplay.textContent = `🏆 ¡Ganan los ${ganador}! 🏆`;
         
         const listaRolesFinal = document.getElementById('lista-roles-final');
         if (listaRolesFinal) {
             listaRolesFinal.innerHTML = '';
             jugadoresActuales.forEach(j => {
                 const elemento = document.createElement('li');
                 
                 // Usar j.palabraSecreta directamente
                 const palabraMostrada = j.palabraSecreta; 
                 const estado = j.eliminado ? '(Eliminado)' : '(Activo)';
                 
                 // Colorear el texto según el rol para claridad
                 let estiloRol = '';
                 if (j.rol === 'Impostor') estiloRol = 'style="color: var(--color-red);"';
                 if (j.rol === 'Agente Doble') estiloRol = 'style="color: var(--color-orange);"';
                 if (j.rol === 'Tripulante') estiloRol = 'style="color: var(--color-green);"';

                 // Usar innerHTML para aplicar el estilo
                 elemento.innerHTML = `${j.nombre} - Rol: <strong ${estiloRol}>${j.rol}</strong> (Palabra: ${palabraMostrada}) ${estado}`;
                 listaRolesFinal.appendChild(elemento);
             });
         }
    }
    
    // *** 7.16. REINICIAR PARTIDA (VOLVER A SECCIÓN 3) ***
    document.getElementById('btn-reiniciar-partida').addEventListener('click', async () => {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !codigoSalaActual) return;
        
        if (!confirm('¿Seguro que quieres REINICIAR la partida? Todos los jugadores volverán al lobby de configuración.')) {
             return;
        }
        
        const salaRef = db.ref('salas/' + codigoSalaActual);
        
        // 1. Resetear el estado de los jugadores
        const jugadoresReseteados = {};
        jugadoresActuales.forEach(j => {
             jugadoresReseteados[j.id] = {
                 id: j.id,
                 nombre: j.nombre,
                 esHost: j.esHost,
                 rol: 'Tripulante', // Resetear rol a default
                 eliminado: false, // Resetear estado
                 palabraSecreta: null,
                 tema: null
             };
        });

        // 2. Actualizar la sala a estado 'esperando' (Lobby)
        await salaRef.update({
             estado: 'esperando',
             jugadores: jugadoresReseteados,
             rondaActual: 1,
             votos: {}
             // Mantener la configuración anterior (tema, agente doble)
        });
        
        // El listener detectará el cambio y nos llevará a 'vista-lobby'
    });
    
    // *** 7.17. FINALIZAR JUEGO (CERRAR SALA) ***
    document.getElementById('btn-finalizar-juego').addEventListener('click', async () => {
         const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
         if (!esHost || !codigoSalaActual) return;
         
         if (!confirm('¿Seguro que quieres FINALIZAR el juego y CERRAR la sala? Todos serán desconectados.')) {
              return;
         }
         
         // Eliminar la sala de Firebase
         await db.ref('salas/' + codigoSalaActual).remove()
             .then(() => {
                 // El listener en los clientes detectará que la sala no existe y recargará
                 alert('Sala cerrada exitosamente.');
                 window.location.reload(); 
             })
             .catch(error => {
                 console.error("Error al cerrar la sala:", error);
                 alert('Hubo un error al intentar cerrar la sala.');
             });
    });

    // *** INICIO DE LA APP (EVENTOS DE PRIMERA CARGA) ***
    renderConfiguracion(); 
});