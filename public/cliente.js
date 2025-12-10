// public/cliente.js (MIGRADO A FIREBASE REALTIME DATABASE)

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
    let configuracionActual = { tema: TEMAS_DISPONIBLES[0], tiempoRondaSegundos: 60, incluirAgenteDoble: false }; 
    let miRolActual = ''; 
    let miPalabraSecreta = ''; 
    let miTemaActual = ''; 
    let miVotoSeleccionadoId = 'none';
    let temporizadorInterval = null; // Para manejar el temporizador de la ronda
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
        
        // Marcar el voto actual si ya voté
        if (miVotoSeleccionadoId !== 'none') {
             const btnVotado = listaVotos.querySelector(`[data-voto-id="${miVotoSeleccionadoId}"]`);
             if (btnVotado) {
                document.querySelectorAll('.btn-votar').forEach(btn => btn.classList.remove('votado'));
                btnVotado.classList.add('votado');
             }
        }
    }
    
    function renderConfiguracion() {
        // Llenar el selector de temas
        const selectorTema = document.getElementById('selector-tema');
        if (selectorTema && selectorTema.options.length === 0) {
            TEMAS_DISPONIBLES.forEach(tema => {
                const option = document.createElement('option');
                option.value = tema;
                option.textContent = tema;
                selectorTema.appendChild(option);
            });
        }
        
        // Poner los valores actuales
        if (selectorTema) selectorTema.value = configuracionActual.tema;
        const inputTiempo = document.getElementById('input-tiempo-ronda');
        if (inputTiempo) inputTiempo.value = configuracionActual.tiempoRondaSegundos;
        const checkboxDoble = document.getElementById('checkbox-agente-doble');
        if (checkboxDoble) checkboxDoble.checked = configuracionActual.incluirAgenteDoble;

        // Mostrar u ocultar la configuración si soy el HOST
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const configHostDiv = document.getElementById('configuracion-host');
        if (configHostDiv) configHostDiv.style.display = esHost ? 'block' : 'none';
    }

    function actualizarBotonInicioJuego() {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const numJugadores = jugadoresActuales.length;
        const btnIniciar = document.getElementById('btn-iniciar-juego');
        const avisoMin = document.getElementById('min-jugadores-aviso');
        
        if (esHost && btnIniciar && avisoMin) {
            if (numJugadores >= MIN_JUGADORES && numJugadores <= MAX_JUGADORES) {
                btnIniciar.disabled = false;
                avisoMin.style.display = 'none';
            } else {
                btnIniciar.disabled = true;
                avisoMin.style.display = 'block';
            }
        }
    }
    
    function limpiarTemporizador() {
        if (temporizadorInterval) {
            clearInterval(temporizadorInterval);
            temporizadorInterval = null;
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

            const sala = snapshot.val();
            
            // Reconstruir la lista de jugadores a partir del objeto de Firebase
            const jugadoresObj = sala.jugadores || {};
            const jugadoresArray = Object.keys(jugadoresObj).map(key => ({ ...jugadoresObj[key], id: key }));
            jugadoresActuales = jugadoresArray;
            
            // Encontrar mis datos
            const misDatos = jugadoresArray.find(j => j.id === miId);
            if (!misDatos) {
                 // Si mis datos no están, fui expulsado
                 alert('Has sido expulsado de la sala.');
                 window.location.reload();
                 return;
            }
            
            // Actualizar variables de mi rol
            miRolActual = misDatos.rol || 'Tripulante';
            miPalabraSecreta = misDatos.palabraSecreta || '';
            miTemaActual = misDatos.tema || '';

            // Lógica de Vistas basada en el estado de la sala
            
            if (sala.estado === 'esperando') {
                configuracionActual = sala.configuracion || configuracionActual;
                actualizarListaJugadores(jugadoresArray);
                cambiarVista('vista-lobby');
            
            } else if (sala.estado === 'enJuego') {
                // Sincronización de variables y UI
                actualizarListaJugadores(jugadoresArray);
                
                // Mostrar la vista de juego o votación según el estado de la ronda
                if (sala.rondaEstado === 'discutiendo') {
                    manejarInicioRonda(sala); // Mostrar vista de juego
                } else if (sala.rondaEstado === 'votando') {
                    manejarInicioVotacion(sala); // Mostrar vista de votación
                } else if (sala.rondaEstado === 'resultado') {
                    manejarResultadoVotacion(sala); // Mostrar resultados
                }

                // Sincronizar temporizador (solo para el host)
                if (misDatos.esHost && sala.temporizadorFinTimestamp && sala.rondaEstado === 'discutiendo') {
                    iniciarTemporizadorHost(sala);
                }
            
            } else if (sala.estado === 'finalizado') {
                manejarFinDeJuego(sala);
            }
        });
    }

    // =================================================================
    // 7. MANEJADORES DE EVENTOS DEL DOM
    // =================================================================

    // CORRECCIÓN CLAVE: El listener del formulario de inicio que da error
    document.getElementById('form-inicio').addEventListener('submit', (e) => {
        e.preventDefault();
        // El input-nombre debe ser accesible aquí
        nombreJugador = document.getElementById('input-nombre').value.trim();
        if (!nombreJugador) return alert('Por favor, ingresa tu nombre.');
        
        // Si el nombre es válido, mostramos la siguiente vista.
        document.getElementById('nombre-jugador-display').textContent = nombreJugador;
        cambiarVista('vista-seleccion');
    });

    // ----------------------------------------------------
    // *** CREAR SALA CON FIREBASE (CLIENTE HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-crear-sala').addEventListener('click', async () => {
        // 1. Generar código único y verificar la no existencia (CRÍTICO)
        let codigo;
        let snapshot;
        do {
            codigo = generarCodigoSala();
            snapshot = await db.ref('salas/' + codigo).once('value');
        } while (snapshot.exists());

        // 2. Crear el objeto de jugador local con flag de Host
        const jugadorHost = { 
            id: miId, 
            nombre: nombreJugador, 
            esHost: true, 
            rol: 'Tripulante', 
            eliminado: false 
        };

        // 3. Crear el objeto de sala
        const nuevaSala = {
            codigo: codigo,
            hostId: miId, // El ID del Host para referencia
            jugadores: {
                [miId]: jugadorHost
            },
            estado: 'esperando',
            rondaActual: 0,
            rondaEstado: 'esperando',
            configuracion: configuracionActual,
            votos: {}, 
            temporizadorFinTimestamp: null 
        };
        
        // 4. Escribir la sala en Firebase
        await db.ref('salas/' + codigo).set(nuevaSala);
        
        // 5. Configurar el escuchador y pasar a la vista
        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;
    });

    // ----------------------------------------------------
    // *** UNIRSE A SALA CON FIREBASE ***
    // ----------------------------------------------------
    document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = document.getElementById('input-codigo').value.trim().toUpperCase();
        if (!codigo) return;
        
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

        // 1. Crear el objeto de jugador
        const nuevoJugador = { id: miId, nombre: nombreJugador, esHost: false, rol: 'Tripulante', eliminado: false };
        
        // 2. Agregar el jugador a la sala
        const jugadoresRef = db.ref('salas/' + codigo + '/jugadores/' + miId);
        await jugadoresRef.set(nuevoJugador);

        // 3. Configurar el escuchador y pasar a la vista
        configurarEscuchadorSala(codigo);
        document.getElementById('codigo-lobby-display').textContent = codigo;
    });
    
    // ----------------------------------------------------
    // *** ABANDONAR SALA (COMÚN) ***
    // ----------------------------------------------------
    window.abandonarSala = async function() {
        if (codigoSalaActual) {
            const salaRef = db.ref('salas/' + codigoSalaActual);
            
            // Apagar el listener para evitar bucles
            if (listenerSala) {
                salaRef.off('value', listenerSala);
            }

            const jugadoresRef = db.ref('salas/' + codigoSalaActual + '/jugadores/' + miId);
            await jugadoresRef.remove();
            
            // Si era el Host y no quedan más jugadores, eliminar la sala
            const snapshot = await salaRef.once('value');
            if (snapshot.exists()) {
                 const sala = snapshot.val();
                 if (sala.hostId === miId) {
                      const jugadoresRestantes = Object.keys(sala.jugadores || {}).length;
                      // Si soy el Host y solo quedo yo (o ya me fui)
                      if (jugadoresRestantes <= 1) { 
                          await salaRef.remove();
                      } else {
                          // Si quedan jugadores, transferir el host al primero que quede
                          const primerJugadorId = Object.keys(sala.jugadores).find(id => id !== miId);
                          if (primerJugadorId) {
                              await salaRef.update({ hostId: primerJugadorId });
                              await db.ref('salas/' + codigoSalaActual + '/jugadores/' + primerJugadorId).update({ esHost: true });
                          }
                      }
                 }
            }
        }
        window.location.reload(); 
    }
    
    // ----------------------------------------------------
    // *** GUARDAR CONFIGURACIÓN (Host) ***
    // ----------------------------------------------------
    document.getElementById('form-configuracion').addEventListener('change', async () => {
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !codigoSalaActual) return;

        const tema = document.getElementById('selector-tema').value;
        const tiempo = parseInt(document.getElementById('input-tiempo-ronda').value);
        const doble = document.getElementById('checkbox-agente-doble').checked;
        
        const nuevaConfig = {
            tema: tema,
            tiempoRondaSegundos: isNaN(tiempo) ? 0 : tiempo,
            incluirAgenteDoble: doble
        };

        // Escribir la nueva configuración directamente a Firebase
        await db.ref('salas/' + codigoSalaActual + '/configuracion').update(nuevaConfig);
    });
    
    // ----------------------------------------------------
    // *** INICIAR JUEGO (Host) - LÓGICA MÁS COMPLEJA ***
    // ----------------------------------------------------
    document.getElementById('btn-iniciar-juego').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;

        if (jugadoresActuales.length < MIN_JUGADORES || jugadoresActuales.length > MAX_JUGADORES) {
             return alert(`Se necesitan al menos ${MIN_JUGADORES} y máximo ${MAX_JUGADORES} jugadores.`);
        }
        
        const salaRef = db.ref('salas/' + codigoSalaActual);
        
        // 1. Asignar Roles
        const jugadoresConRoles = asignarRoles(jugadoresActuales, configuracionActual);
        
        // 2. Seleccionar Palabra Secreta
        if (!PALABRAS_POR_TEMA[configuracionActual.tema]) {
             return alert('Tema de palabras no válido.');
        }
        const palabras = PALABRAS_POR_TEMA[configuracionActual.tema];
        const palabraElegida = palabras[Math.floor(Math.random() * palabras.length)];
        
        // 3. Preparar la estructura de jugadores para Firebase (objeto de objetos)
        const jugadoresParaFirebase = {};
        jugadoresConRoles.forEach(jugador => {
            let palabraInfo = palabraElegida;
            let temaInfo = configuracionActual.tema;
            
            // LÓGICA PARA IMPOSTOR Y AGENTE DOBLE
            if (jugador.rol === 'Impostor') {
                palabraInfo = 'NINGUNA'; 
                temaInfo = '???'; 
            } else if (jugador.rol === 'Agente Doble') {
                 palabraInfo = 'NINGUNA'; 
                 // Sí ve la categoría (temaInfo se mantiene)
            }

            jugadoresParaFirebase[jugador.id] = {
                 ...jugador,
                 rol: jugador.rol,
                 palabraSecreta: palabraInfo,
                 tema: temaInfo,
                 // Estos datos son privados para el cliente que los recibe (en el listener)
            };
        });
        
        // 4. Actualizar la sala en Firebase
        const tiempoFin = Date.now() + configuracionActual.tiempoRondaSegundos * 1000;

        await salaRef.update({
            jugadores: jugadoresParaFirebase, // Reescribir jugadores con roles
            estado: 'enJuego',
            rondaActual: 1,
            rondaEstado: 'discutiendo',
            'configuracion/palabra': palabraElegida, // Guardar la palabra elegida en la config
            votos: {},
            temporizadorFinTimestamp: tiempoFin // Iniciar temporizador
        });
    });

    // ----------------------------------------------------
    // *** CONTROL DE TEMPORIZADOR (SOLO HOST) ***
    // ----------------------------------------------------
    function iniciarTemporizadorHost(sala) {
        // Solo el Host debe correr el intervalo para actualizar a los demás
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !sala.temporizadorFinTimestamp) return;

        limpiarTemporizador(); 
        
        temporizadorInterval = setInterval(async () => {
            const tiempoRestante = Math.max(0, Math.floor((sala.temporizadorFinTimestamp - Date.now()) / 1000));
            
            // Actualizar la UI del temporizador (solo para que sea más fluido para el Host)
            const tiempoDisplay = document.getElementById('tiempo-restante');
            if (tiempoDisplay) tiempoDisplay.textContent = tiempoRestante; 
            
            if (tiempoRestante <= 0) {
                limpiarTemporizador();
                
                // NOTA: El Host actualiza el estado en Firebase, y el Listener (todos) reaccionan.
                await db.ref('salas/' + codigoSalaActual).update({
                    rondaEstado: 'votando' 
                });
            }
        }, 500); // 500ms para precisión decente
    }

    // ----------------------------------------------------
    // *** FUNCIONES DE MANEJO DE VISTAS DE JUEGO ***
    // ----------------------------------------------------

    function manejarInicioRonda(sala) {
        cambiarVista('vista-juego');
        
        // Actualizar UI con datos de mi rol
        const rolDisplay = document.getElementById('rol-display');
        if (rolDisplay) rolDisplay.textContent = `Tu Rol: ¡${miRolActual}!`;
        
        const rondaDisplay = document.getElementById('ronda-actual-display');
        if (rondaDisplay) rondaDisplay.textContent = sala.rondaActual;

        const palabraDisplay = document.getElementById('palabra-secreta-display');
        const temaDisplay = document.getElementById('tema-display');
        
        if (palabraDisplay && temaDisplay) {
            if (miRolActual === 'Impostor') {
                palabraDisplay.textContent = "Eres el IMPOSTOR. Descríbelo sin la palabra secreta.";
                temaDisplay.querySelector('span').textContent = '??? (No lo sabes)';
                palabraDisplay.style.backgroundColor = '#990000';
                palabraDisplay.style.color = '#fff';
            } else if (miRolActual === 'Agente Doble') {
                 palabraDisplay.textContent = "Eres el AGENTE DOBLE. Descríbelo sin la palabra secreta.";
                 temaDisplay.querySelector('span').textContent = miTemaActual;
                 palabraDisplay.style.backgroundColor = '#8B4513';
                 palabraDisplay.style.color = '#fff';
            } else {
                palabraDisplay.textContent = miPalabraSecreta;
                temaDisplay.querySelector('span').textContent = miTemaActual;
                palabraDisplay.style.backgroundColor = '#4CAF50';
                palabraDisplay.style.color = '#fff';
            }
        }

        // Mostrar u ocultar botón de forzar votación (Host)
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const btnForzar = document.getElementById('btn-forzar-votacion');
        if (btnForzar) btnForzar.style.display = esHost ? 'block' : 'none';
        
        // Sincronizar temporizador (solo para clientes, el host lo maneja en el listener)
        if (!esHost && sala.temporizadorFinTimestamp) {
            limpiarTemporizador(); 
            temporizadorInterval = setInterval(() => {
                const tiempoRestante = Math.max(0, Math.floor((sala.temporizadorFinTimestamp - Date.now()) / 1000));
                const tiempoDisplay = document.getElementById('tiempo-restante');
                if (tiempoDisplay) tiempoDisplay.textContent = tiempoRestante; 
            }, 500);
        }
    }
    
    // ----------------------------------------------------
    // *** PASAR A ELIMINACIÓN (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-forzar-votacion').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         // El host actualiza el estado, y todos los clientes lo reciben
         await db.ref('salas/' + codigoSalaActual).update({ rondaEstado: 'votando' });
    });
    
    // ----------------------------------------------------
    // *** INICIO DE VOTACIÓN ***
    // ----------------------------------------------------
    function manejarInicioVotacion(sala) {
        cambiarVista('vista-votacion');
        limpiarTemporizador();
        
        const rondaVotacionDisplay = document.getElementById('ronda-votacion-display');
        if (rondaVotacionDisplay) rondaVotacionDisplay.textContent = sala.rondaActual;
        
        const votoConfirmadoDisplay = document.getElementById('voto-confirmado-display');
        if (votoConfirmadoDisplay) votoConfirmadoDisplay.textContent = 'Esperando tu voto...';
        
        const estadoVotoDiv = document.getElementById('estado-voto');
        if (estadoVotoDiv) estadoVotoDiv.classList.remove('voto-emitido');
        
        const jugadoresActivos = jugadoresActuales.filter(j => !j.eliminado);
        const votosEmitidos = Object.keys(sala.votos || {}).length;
        
        const votosEmitidosDisplay = document.getElementById('votos-emitidos-display');
        if (votosEmitidosDisplay) votosEmitidosDisplay.textContent = `Votos recibidos: ${votosEmitidos}/${jugadoresActivos.length}`;
        
        // Si ya voté, mostrar confirmación
        if (sala.votos && sala.votos[miId]) {
            const votadoId = sala.votos[miId];
            const nombreVotado = (votadoId === 'none') 
                                 ? 'Abstención (Nadie)' 
                                 : jugadoresActuales.find(j => j.id === votadoId)?.nombre || 'Desconocido';
                                 
            if (votoConfirmadoDisplay) votoConfirmadoDisplay.textContent = `¡Tu voto por ${nombreVotado} ha sido emitido!`;
            if (estadoVotoDiv) estadoVotoDiv.classList.add('voto-emitido');
        }
        
        // Si todos han votado y soy el Host, procesar los votos
        if (votosEmitidos === jugadoresActivos.length && jugadoresActuales.find(j => j.id === miId)?.esHost) {
             procesarVotacionHost(sala);
        }
    }
    
    // ----------------------------------------------------
    // *** VOTAR JUGADOR (COMÚN) ***
    // ----------------------------------------------------
    window.votarJugador = async function(jugadorVotadoId) {
        if (!codigoSalaActual || jugadoresActuales.find(j => j.id === miId)?.eliminado) return;
        
        const salaRef = db.ref('salas/' + codigoSalaActual);
        const votosRef = db.ref('salas/' + codigoSalaActual + '/votos/' + miId);

        // Registrar mi voto
        await votosRef.set(jugadorVotadoId);
        miVotoSeleccionadoId = jugadorVotadoId;

        // Actualizar UI inmediatamente
        const nombreVotado = (jugadorVotadoId === 'none') 
                                 ? 'Abstención (Nadie)' 
                                 : jugadoresActuales.find(j => j.id === jugadorVotadoId)?.nombre || 'Desconocido';
                                 
        const votoConfirmadoDisplay = document.getElementById('voto-confirmado-display');
        const estadoVotoDiv = document.getElementById('estado-voto');
        
        if (votoConfirmadoDisplay) votoConfirmadoDisplay.textContent = `¡Tu voto por ${nombreVotado} ha sido emitido!`;
        if (estadoVotoDiv) estadoVotoDiv.classList.add('voto-emitido');

        // El listener se encargará de re-renderizar la vista de votación para todos.
    }
    
    // ----------------------------------------------------
    // *** PROCESAR VOTACIÓN (SOLO HOST) ***
    // ----------------------------------------------------
    async function procesarVotacionHost(sala) {
        if (!jugadoresActuales.find(j => j.id === miId)?.esHost) return; // Solo Host

        const conteoVotos = {}; 
        const jugadoresActivos = jugadoresActuales.filter(j => !j.eliminado);

        // Inicializar el conteo de votos
        jugadoresActivos.forEach(j => conteoVotos[j.id] = 0);
        conteoVotos['none'] = 0;

        // Contar los votos
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
                jugadorEliminado = jugadoresActuales.find(j => j.id === id);
                empates = [jugadorEliminado];
            } else if (id !== 'none' && conteoVotos[id] === maxVotos && maxVotos > 0) {
                empates.push(jugadoresActuales.find(j => j.id === id));
            }
        }

        if (empates.length > 1 || maxVotos === 0) {
            jugadorEliminado = null; // Nadie eliminado por empate o abstención total
        }

        // 1. Actualizar el jugador eliminado en la DB
        if (jugadorEliminado) {
            await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorEliminado.id}/eliminado`).set(true);
        }
        
        // 2. Actualizar el resultado de la ronda en la DB para que todos lo lean
        await db.ref('salas/' + codigoSalaActual).update({
            rondaEstado: 'resultado',
            ultimoResultado: {
                conteo: conteoVotos,
                jugadorEliminadoId: jugadorEliminado ? jugadorEliminado.id : null,
                rolRevelado: jugadorEliminado ? jugadorEliminado.rol : null,
            }
        });

        // El listener activará la vista de resultados
    }
    
    // ----------------------------------------------------
    // *** MANEJAR RESULTADO DE VOTACIÓN (TODOS) ***
    // ----------------------------------------------------
    function manejarResultadoVotacion(sala) {
         cambiarVista('vista-resultado');
         
         const resultado = sala.ultimoResultado;
         if (!resultado) return;

         const jugadorEliminado = resultado.jugadorEliminadoId 
                                  ? jugadoresActuales.find(j => j.id === resultado.jugadorEliminadoId) 
                                  : null;
         
         let mensaje = "";
         if (jugadorEliminado) {
             mensaje = `¡${jugadorEliminado.nombre} fue ELIMINADO! Su rol era: ${resultado.rolRevelado}.`;
         } else {
             mensaje = "Nadie fue eliminado. Hubo empate o abstención.";
         }
         
         const resultadoRondaDisplay = document.getElementById('resultado-ronda-display');
         if (resultadoRondaDisplay) resultadoRondaDisplay.textContent = `Ronda ${sala.rondaActual} finalizada.`;
         
         const jugadorEliminadoDisplay = document.getElementById('jugador-eliminado-display');
         if (jugadorEliminadoDisplay) jugadorEliminadoDisplay.textContent = mensaje;

         // Renderizar el conteo de votos (TO-DO)
         const detallesVotos = document.getElementById('detalles-votacion-container');
         if (detallesVotos) {
             detallesVotos.innerHTML = '<h4>Conteo de Votos:</h4>';
             for (const id in resultado.conteo) {
                 const nombre = id === 'none' ? 'Abstención' : jugadoresActuales.find(j => j.id === id)?.nombre || 'Desconocido';
                 detallesVotos.innerHTML += `<p>${nombre}: ${resultado.conteo[id]} votos</p>`;
             }
         }
         
         // Chequear fin de juego y mostrar botones
         const finJuego = chequearFinDeJuego(jugadoresActuales);
         
         const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
         const btnVerGanador = document.getElementById('btn-ver-ganador');
         const btnSiguienteRonda = document.getElementById('btn-siguiente-ronda');

         if (finJuego) {
             if (btnVerGanador) btnVerGanador.style.display = esHost ? 'block' : 'none';
             if (btnSiguienteRonda) btnSiguienteRonda.style.display = 'none';
             
             // Si no es Host, el botón de ver ganador no aparece, se queda esperando el cambio de estado
         } else {
             if (btnSiguienteRonda) btnSiguienteRonda.style.display = esHost ? 'block' : 'none';
             if (btnVerGanador) btnVerGanador.style.display = 'none';
         }
    }
    
    // ----------------------------------------------------
    // *** INICIAR SIGUIENTE RONDA / VER GANADOR (HOST) ***
    // ----------------------------------------------------
    document.getElementById('btn-siguiente-ronda').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         const tiempoFin = Date.now() + configuracionActual.tiempoRondaSegundos * 1000;

         await db.ref('salas/' + codigoSalaActual).update({
             rondaActual: firebase.database.ServerValue.increment(1),
             rondaEstado: 'discutiendo',
             votos: {}, // Limpiar votos para la nueva ronda
             temporizadorFinTimestamp: tiempoFin
         });
         miVotoSeleccionadoId = 'none'; // Resetear mi voto
    });

    document.getElementById('btn-ver-ganador').addEventListener('click', async () => {
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         // El host simplemente cambia el estado a 'finalizado', y todos lo reciben
         await db.ref('salas/' + codigoSalaActual).update({
             estado: 'finalizado'
         });
    });

    // ----------------------------------------------------
    // *** LÓGICA DE FIN DE JUEGO ***
    // ----------------------------------------------------
    function chequearFinDeJuego(jugadores) {
        const jugadoresActivos = jugadores.filter(j => !j.eliminado);
        const impostoresActivos = jugadoresActivos.filter(j => j.rol === 'Impostor').length;
        const tripulantesActivos = jugadoresActivos.filter(j => j.rol === 'Tripulante' || j.rol === 'Agente Doble').length;
        
        if (impostoresActivos === 0) {
            return 'Tripulantes'; 
        } else if (impostoresActivos >= tripulantesActivos) {
            return 'Impostores'; 
        }
        return null;
    }

    function manejarFinDeJuego(sala) {
         cambiarVista('vista-final');
         const ganador = chequearFinDeJuego(jugadoresActuales);
         
         const ganadorDisplay = document.getElementById('ganador-display');
         if (ganadorDisplay) ganadorDisplay.textContent = `🏆 ¡Ganan los ${ganador}! 🏆`;
         
         const listaRolesFinal = document.getElementById('lista-roles-final');
         if (listaRolesFinal) {
             listaRolesFinal.innerHTML = '';
             jugadoresActuales.forEach(j => {
                 const elemento = document.createElement('li');
                 elemento.textContent = `${j.nombre} - Rol: ${j.rol} ${j.eliminado ? '(Eliminado)' : '(Activo)'}`;
                 listaRolesFinal.appendChild(elemento);
             });
         }


         // Borrar la sala de Firebase después de un tiempo prudente (Host)
         if (jugadoresActuales.find(j => j.id === miId)?.esHost) {
              setTimeout(() => {
                   db.ref('salas/' + codigoSalaActual).remove();
              }, 120000); // 2 minutos
         }
    }
    
}); // CIERRE DEL DOMContentLoaded