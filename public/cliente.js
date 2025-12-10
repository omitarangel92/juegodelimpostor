// public/cliente.js (MIGRADO A FIREBASE REALTIME DATABASE y LÓGICA DE FLUJO CORREGIDA)

// =================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// =================================================================

// NOTA DE SEGURIDAD: Esta clave está expuesta públicamente, es CRÍTICO
// que configures reglas de seguridad ESTRICTAS en Firebase.
const firebaseConfig = {
    // Reemplaza con tus CREDENCIALES
    apiKey: "AIzaSyBFWEizn6Nn1iDkvZr2FkN3Vfn7IWGIuG0", 
    authDomain: "juego-impostor-firebase.firebaseapp.com",
    databaseURL: "https://juego-impostor-firebase-default-rtdb.firebaseio.com",
    projectId: "juego-impostor-firebase",
    storageBucket: "juego-impostor-firebase.firebasestorage.app",
    messagingSenderId: "337084843090",
    appId: "1:337084843090:web:41b0ebafd8a21f1420cb8b"
};

// =================================================================
// 2. DATOS DEL JUEGO (MOVIDOS DEL SERVER.JS)
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
    
    if (numJugadores >= 3 && numJugadores <= 5) {
        numImpostores = 1;
    } else if (numJugadores >= 6 && numJugadores <= 10) {
        numImpostores = 2;
    } 
    
    // Resetear roles y eliminar flag de 'eliminado' (para el caso de re-jugar)
    jugadores.forEach(j => {
        j.rol = 'Tripulante';
        j.eliminado = false;
        j.voto = null; // Limpiar voto
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
    // ID única para este navegador (permanece igual a lo largo de la sesión)
    let miId = Date.now().toString(36) + Math.random().toString(36).substring(2); 
    
    let jugadoresActuales = []; 
    // SE ELIMINA tiempoRondaSegundos
    let configuracionActual = { tema: TEMAS_DISPONIBLES[0], incluirAgenteDoble: false }; 
    let miRolActual = ''; 
    let miPalabraSecreta = ''; 
    let miTemaActual = ''; 
    let miVotoSeleccionadoId = 'none';
    
    // SE ELIMINA temporizadorInterval
    let listenerSala = null; // Para almacenar el listener de la sala

    // =================================================================
    // 5. FUNCIONES DE UI Y LÓGICA AUXILIAR
    // =================================================================

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
        
        // Lógica específica al cambiar de vista
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
    }
    
    // SE ELIMINA limpiarTemporizador()
    
    function actualizarBotonInicioJuego() {
        const btnIniciar = document.getElementById('btn-iniciar-revelacion'); // ID actualizado
        const avisoMin = document.getElementById('aviso-min-jugadores');
        
        if (!btnIniciar || !avisoMin) return;

        const numJugadores = jugadoresActuales.length;
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        
        if (esHost) {
            if (numJugadores >= MIN_JUGADORES && numJugadores <= MAX_JUGADORES) {
                btnIniciar.disabled = false;
                avisoMin.style.display = 'none';
            } else {
                btnIniciar.disabled = true;
                avisoMin.style.display = 'block';
            }
        } else {
            btnIniciar.style.display = 'none'; // Esconder para no-Hosts
        }
    }

    // =================================================================
    // 6. LÓGICA DE FIREBASE (El reemplazo de Socket.IO)
    // =================================================================
    function configurarEscuchadorSala(codigoSala) {
        // Detener escuchador anterior si existe
        if (listenerSala) {
            db.ref('salas/' + codigoSalaActual).off('value', listenerSala);
        }
        codigoSalaActual = codigoSala; // Asegurar que el código actual esté configurado
        const salaRef = db.ref('salas/' + codigoSala);

        // Define la función de escucha (el "socket.on" que se ejecuta en todos)
        listenerSala = salaRef.on('value', (snapshot) => {
            if (!snapshot.exists()) {
                // Esto podría ocurrir si el Host borró la sala o fuiste expulsado y la sala se limpió
                alert('La sala ha sido eliminada, has sido expulsado o no existe.');
                window.location.reload();
                return;
            }
            const sala = snapshot.val(); // Reconstruir el objeto de la sala
            
            // 1. Reconstruir lista de jugadores
            const jugadores = Object.values(sala.jugadores || {});
            actualizarListaJugadores(jugadores);

            // 2. Actualizar mi información local
            const misDatos = sala.jugadores[miId];
            if (misDatos) {
                miRolActual = misDatos.rol || '';
                miPalabraSecreta = misDatos.palabraSecreta || '';
                miTemaActual = misDatos.tema || '';
            }
            
            // 3. Manejar el flujo del juego
            if (sala.estado === 'esperando') {
                cambiarVista('vista-lobby');
            } else if (sala.estado === 'revelacion') { // <--- NUEVO ESTADO DE REVELACIÓN
                manejarRevelacionRol(sala);
            } else if (sala.estado === 'enJuego') {
                manejarJuego(sala); // Flujo simplificado (Discusión / Votación)
            } else if (sala.estado === 'resultado') {
                manejarResultadoRonda(sala);
            } else if (sala.estado === 'finalizado') {
                manejarFinDeJuego(sala);
            }
        });
    }

    // ... (funciones de expulsarJugador, abandonarSala, renderConfiguracion, etc.) ...
    
    // ----------------------------------------------------
    // *** CREAR SALA CON FIREBASE (CLIENTE HOST) *** // ----------------------------------------------------
    document.getElementById('btn-crear-sala').addEventListener('click', async () => {
        // ... (código para generar código y crear jugadorHost) ...
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

        // SE ELIMINARON rondaActual, rondaEstado, y temporizadorFinTimestamp
        const nuevaSala = {
            codigo: codigo,
            hostId: miId, // El ID del Host para referencia
            jugadores: { [miId]: jugadorHost },
            estado: 'esperando', // Estado inicial
            configuracion: configuracionActual, 
            votos: {},
        };

        const salaRef = db.ref('salas/' + codigo);
        await salaRef.set(nuevaSala);

        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;
        cambiarVista('vista-lobby');
    });

    // ... (handler para unirse a sala) ...
    
    // ----------------------------------------------------
    // *** GUARDAR CONFIGURACIÓN (Host) *** // ----------------------------------------------------
    document.getElementById('form-configuracion').addEventListener('change', async () => {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !codigoSalaActual) return;

        const tema = document.getElementById('select-tema').value;
        const incluirAgenteDoble = document.getElementById('checkbox-agente-doble').checked;
        
        // SE ELIMINA tiempoRondaSegundos
        configuracionActual = { tema, incluirAgenteDoble }; 
        
        // Actualizar Firebase
        await db.ref('salas/' + codigoSalaActual + '/configuracion').update(configuracionActual);
    });


    // ----------------------------------------------------
    // *** LOBBY -> REVELACIÓN (HOST) *** // ----------------------------------------------------
    document.getElementById('btn-iniciar-revelacion').addEventListener('click', async () => {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !codigoSalaActual) return;

        if (jugadoresActuales.length < MIN_JUGADORES) {
            return alert(`Necesitas al menos ${MIN_JUGADORES} jugadores para empezar.`);
        }

        const salaRef = db.ref('salas/' + codigoSalaActual);

        // 1. Asignar roles y palabras
        const jugadoresConRoles = asignarRoles(jugadoresActuales, configuracionActual);

        // 2. Elegir palabra secreta/tema
        const temaElegido = configuracionActual.tema;
        const palabras = PALABRAS_POR_TEMA[temaElegido];
        const randomIndex1 = Math.floor(Math.random() * palabras.length);
        let randomIndex2;
        do { // Asegurar que no sea la misma palabra
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
            estado: 'revelacion', // <--- NUEVO ESTADO
            'configuracion/palabraTripulante': palabraTripulante, 
            'configuracion/palabraImpostor': palabraImpostor,
            'configuracion/temaElegido': temaElegido,
            rondaActual: 1, // Inicializar la primera 'ronda' (ciclo de juego)
            votos: {}, 
        });
    });

    // ----------------------------------------------------
    // *** MANEJAR REVELACIÓN DE ROL (TODOS LOS CLIENTES) ***
    // ----------------------------------------------------
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
        const listaJugadoresDisplay = document.getElementById('revelacion-lista-jugadores');
        const botonHost = document.getElementById('btn-iniciar-discusion');
        const avisoEspera = document.getElementById('aviso-espera-discusion');

        // 1. Mostrar Rol y Palabra
        rolDisplay.textContent = miRolActual;
        palabraDisplay.textContent = miPalabraSecreta;
        temaDisplay.textContent = 'Tema: ' + miTemaActual;

        let color = 'var(--color-primary)';
        if (miRolActual === 'Impostor') color = 'var(--color-red)';
        if (miRolActual === 'Agente Doble') color = 'var(--color-orange)';
        if (miRolActual === 'Tripulante') color = 'var(--color-green)';
        rolDisplay.style.color = color;
        
        // 2. Mostrar botón solo al Host
        if (misDatos.esHost) {
            botonHost.style.display = 'block';
            avisoEspera.style.display = 'none';
        } else {
            botonHost.style.display = 'none';
            avisoEspera.style.display = 'block';
        }
    }
    
    // ----------------------------------------------------
    // *** REVELACIÓN -> DISCUSIÓN (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-iniciar-discusion').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        // El host actualiza el estado a 'enJuego' y rondaEstado a 'discutiendo'
        await db.ref('salas/' + codigoSalaActual).update({ 
            estado: 'enJuego',
            rondaEstado: 'discutiendo',
            votos: {} // Limpiar votos de rondas anteriores si existieran
        });
    });


    // ----------------------------------------------------
    // *** MANEJAR EL JUEGO (DISCUSIÓN Y VOTACIÓN) ***
    // (Simplifica y reemplaza manejarInicioJuego y la lógica de temporizador)
    // ----------------------------------------------------
    function manejarJuego(sala) {
        const misDatos = sala.jugadores[miId];
        const esHost = misDatos?.esHost;
        
        // 1. Actualizar UI de Roles/Palabras/Temas
        document.getElementById('mi-rol-juego').textContent = misDatos.rol;
        document.getElementById('mi-palabra-juego').textContent = misDatos.palabraSecreta;
        document.getElementById('mi-tema-juego').textContent = misDatos.tema;
        
        // 2. Manejar sub-estados
        if (sala.rondaEstado === 'discutiendo') {
            cambiarVista('vista-juego');
            
            // Mostrar botón de Votación solo al Host
            const btnForzarVotacion = document.getElementById('btn-forzar-votacion');
            if (btnForzarVotacion) {
                btnForzarVotacion.style.display = esHost ? 'block' : 'none';
            }
            
        } else if (sala.rondaEstado === 'votando') {
            manejarInicioVotacion(sala); // Reutilizar la función de votación existente
        }
        
        // 3. Chequear fin de juego y transferir host si es necesario
        if (chequearFinDeJuego(jugadoresActuales)) {
             db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
        }
    }

    // ----------------------------------------------------
    // *** DISCUSIÓN -> VOTACIÓN (HOST) *** // ----------------------------------------------------
    document.getElementById('btn-forzar-votacion').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return; 
        
        // El host actualiza el estado a votando
        await db.ref('salas/' + codigoSalaActual).update({ rondaEstado: 'votando' });
    });
    
    // ... (El resto de funciones se mantiene igual, ya que manejan el flujo de votación y resultado) ...
    
    // ----------------------------------------------------
    // *** INICIO DE VOTACIÓN (TODOS LOS CLIENTES) *** // ----------------------------------------------------
    function manejarInicioVotacion(sala) {
        cambiarVista('vista-votacion');
        // SE ELIMINA limpiarTemporizador();
        
        // ... (El resto de la lógica de votación se mantiene igual) ...
        const rondaVotacionDisplay = document.getElementById('ronda-votacion-display');
        if (rondaVotacionDisplay) rondaVotacionDisplay.textContent = sala.rondaActual; 
        
        const votoConfirmadoDisplay = document.getElementById('voto-confirmado-display');
        if (votoConfirmadoDisplay) votoConfirmadoDisplay.textContent = 'Esperando tu voto...';
        
        const misDatos = sala.jugadores[miId];
        
        const votantesActivos = jugadoresActuales.filter(j => !j.eliminado).length;
        const votosEmitidos = Object.keys(sala.votos || {}).length;

        document.getElementById('votos-emitidos-display').textContent = 
            `Votos recibidos: ${votosEmitidos}/${votantesActivos}`;
            
        // ... (el resto de la función votarJugador, chequearFinDeJuego, manejarResultadoRonda, etc.) ...
    }
    
    // ----------------------------------------------------
    // *** VOTAR (TODOS LOS CLIENTES) *** // ----------------------------------------------------
    window.votarJugador = async function(votadoId) {
        if (!codigoSalaActual || miVotoSeleccionadoId !== 'none') return; 

        // Actualizar el voto local para evitar doble voto en la UI
        miVotoSeleccionadoId = votadoId; 
        document.getElementById('voto-confirmado-display').textContent = 
            (votadoId === 'none') ? '⚠️ Abstención confirmada.' : '✅ Voto por ' + jugadoresActuales.find(j => j.id === votadoId).nombre + ' confirmado.';
        
        // Actualizar el voto en Firebase
        await db.ref('salas/' + codigoSalaActual + '/votos/' + miId).set(votadoId);
    };


    // ----------------------------------------------------
    // *** RESULTADO -> DISCUSIÓN / FIN (HOST) *** // ----------------------------------------------------
    document.getElementById('btn-siguiente-ronda').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;

        // Limpiar el voto local y actualizar el estado
        miVotoSeleccionadoId = 'none';
        
        const nuevaRonda = (jugadoresActuales[0].rondaActual || 1) + 1;

        await db.ref('salas/' + codigoSalaActual).update({
            estado: 'enJuego', 
            rondaEstado: 'discutiendo', // Volver a la discusión
            rondaActual: nuevaRonda, // Siguiente ronda/ciclo de juego
            votos: {} // Limpiar votos de la ronda anterior
        });
    });

    // ... (otras funciones como manejo de fin de juego y reinicio se mantienen) ...
    
    // ----------------------------------------------------
    // *** INICIO DE LA APP (EVENTOS DE PRIMERA CARGA) ***
    // ----------------------------------------------------
    // ... (el código de carga de la app se mantiene) ...
});