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
// 2. DATOS DEL JUEGO (20 CATEGORÍAS SOLICITADAS)
// =================================================================
const PALABRAS_POR_TEMA = {
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana'],
    'Países 🌎': ['España', 'México', 'Colombia', 'Japón', 'Francia', 'Canadá', 'Brasil', 'Alemania'],
    'Profesiones 💼': ['Médico', 'Maestro', 'Ingeniero', 'Cocinero', 'Policía', 'Bombero', 'Abogado', 'Piloto'],
    'Objetos Cotidianos 💡': ['Teléfono', 'Taza', 'Llaves', 'Reloj', 'Libro', 'Silla', 'Mesa', 'Ventana'],
    'Deportes ⚽': ['Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Boxeo', 'Golf', 'Béisbol', 'Ciclismo'],
    'Música 🎶': ['Guitarra', 'Piano', 'Batería', 'Violín', 'Micrófono', 'Canción', 'Melodía', 'Banda'],
    'Naturaleza 🌲': ['Árbol', 'Flor', 'Río', 'Montaña', 'Nieve', 'Sol', 'Luna', 'Estrella'],
    'Hogar 🏠': ['Sofá', 'Cama', 'Nevera', 'Televisión', 'Espejo', 'Almohada', 'Lámpara', 'Cuadro'],
    'Viajes ✈️': ['Avión', 'Tren', 'Barco', 'Playa', 'Hotel', 'Maleta', 'Pasaporte', 'Mapa'],
    'Personajes 🦸': ['Héroe', 'Villano', 'Princesa', 'Mago', 'Robot', 'Alien', 'Vampiro', 'Fantasma'],
    'Tecnología 📱': ['Computadora', 'Mouse', 'Teclado', 'Internet', 'App', 'Redes', 'Batería', 'Cámara'],
    'Cuerpo Humano 💪': ['Mano', 'Pie', 'Ojo', 'Nariz', 'Boca', 'Corazón', 'Cerebro', 'Pulmón'],
    'Instrumentos 🛠️': ['Martillo', 'Destornillador', 'Sierra', 'Clavo', 'Tuerca', 'Llave', 'Pala', 'Tijeras'],
    'Colores 🎨': ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Negro', 'Blanco', 'Morado', 'Naranja'],
    'Sentimientos 😊': ['Alegría', 'Tristeza', 'Enojo', 'Miedo', 'Amor', 'Calma', 'Sorpresa', 'Aburrimiento'],
    'Lugares 📍': ['Parque', 'Escuela', 'Hospital', 'Banco', 'Tienda', 'Cine', 'Teatro', 'Museo'],
    'Ropa 👚': ['Camisa', 'Pantalón', 'Vestido', 'Chaqueta', 'Zapatos', 'Gorra', 'Calcetines', 'Bufanda'],
    'Historia 📜': ['Rey', 'Reina', 'Pirámide', 'Castillo', 'Guerrero', 'Momia', 'Época', 'Ruinas'],
    'Picante +18 🔥': ['Lencería', 'Gemidos', 'Cama', 'Beso', 'Noche', 'Latido', 'Pasión', 'Prohibido']
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
    let miId = Date.now().toString(36) + Math.random().toString(36).substring(2); 
    
    let jugadoresActuales = []; 
    // Por defecto, seleccionar 3 categorías para empezar
    let configuracionActual = { 
        temasSeleccionados: [TEMAS_DISPONIBLES[0], TEMAS_DISPONIBLES[1], TEMAS_DISPONIBLES[2]], 
        incluirAgenteDoble: false 
    }; 
    let miRolActual = ''; 
    let miPalabraSecreta = ''; 
    let miTemaActual = ''; 
    let miVotoSeleccionadoId = 'none';
    let listenerSala = null; 

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
        // ... (La lógica de asignarRoles se mantiene igual)
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
            // Cerrar cualquier modal que esté abierto
            document.getElementById('modal-categorias').style.display = 'none';
            document.getElementById('modal-confirmacion').style.display = 'none';
        }
    }
    
    function actualizarListaJugadores(jugadores) {
        // ... (La lógica de actualizarListaJugadores se mantiene igual)
        jugadoresActuales = jugadores;
        const listaHost = document.getElementById('lista-jugadores-host');
        const listaJuego = document.getElementById('lista-jugadores-juego');
        const listaVotos = document.getElementById('opciones-votacion');
        
        listaHost.innerHTML = '';
        listaJuego.innerHTML = '';
        
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
    
    // RENDERIZADO Y LECTURA DE CATEGORÍAS (Lógica de Modal)
    function renderConfiguracion() {
        
        // 1. Actualizar el display de categorías seleccionadas
        const categoriasDisplay = document.getElementById('categorias-seleccionadas-display');
        const numTemas = configuracionActual.temasSeleccionados.length;
        if (categoriasDisplay) {
             categoriasDisplay.textContent = `(${numTemas} seleccionadas)`;
        }

        const checkboxDoble = document.getElementById('checkbox-agente-doble');
        if (checkboxDoble) {
            checkboxDoble.checked = configuracionActual.incluirAgenteDoble;
            if (!checkboxDoble.hasListener) {
                 checkboxDoble.addEventListener('change', actualizarConfiguracionHost);
                 checkboxDoble.hasListener = true;
            }
        }

        // 2. Ocultar/Mostrar Configuración si es Host
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const configHostDiv = document.getElementById('configuracion-host');
        if (configHostDiv) configHostDiv.style.display = esHost ? 'block' : 'none';

        // 3. Renderizar las tarjetas dentro del MODAL (si aún no se han creado)
        const categoriasContainer = document.getElementById('categorias-container-modal');
        if (categoriasContainer && categoriasContainer.children.length === 0) {
            TEMAS_DISPONIBLES.forEach(tema => {
                const checkboxId = `tema-${tema.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const isSelected = configuracionActual.temasSeleccionados.includes(tema);
                const esPicante = tema.includes('Picante');
                
                const div = document.createElement('div');
                div.classList.add('categoria-card'); 
                div.setAttribute('data-tema', tema);
                
                if (isSelected) div.classList.add('seleccionada');
                if (esPicante) div.classList.add('picante');

                const icono = tema.split(' ')[1] || '❓';
                const nombreLimpio = tema.split(' ')[0];

                div.innerHTML = `
                    <input type="checkbox" id="${checkboxId}" value="${tema}" name="tema-selector" ${isSelected ? 'checked' : ''} style="display:none;">
                    <span class="categoria-icono">${icono}</span>
                    <span class="categoria-nombre">${nombreLimpio}</span>
                    <span class="checkbox-ui">✅</span>
                `;
                
                div.addEventListener('click', () => {
                    const checkbox = document.getElementById(checkboxId);
                    checkbox.checked = !checkbox.checked;
                    div.classList.toggle('seleccionada', checkbox.checked);
                });
                
                categoriasContainer.appendChild(div);
            });
        } else {
             // Si ya existen, solo actualizar su estado
             document.querySelectorAll('.categoria-card').forEach(card => {
                 const tema = card.getAttribute('data-tema');
                 const checkbox = card.querySelector('input[type="checkbox"]');
                 const isSelected = configuracionActual.temasSeleccionados.includes(tema);
                 
                 checkbox.checked = isSelected;
                 card.classList.toggle('seleccionada', isSelected);
             });
        }
    }
    
    // Función para abrir y cerrar el modal 
    window.manejarModalCategorias = function(abrir) {
         const modal = document.getElementById('modal-categorias');
         if (modal) {
              modal.style.display = abrir ? 'flex' : 'none';
         }
         if (abrir) {
             renderConfiguracion(); 
         } 
    }
    
    // Función para guardar y cerrar el modal
    window.guardarCategorias = function() {
        const temasSeleccionados = Array.from(document.querySelectorAll('#categorias-container-modal input[type="checkbox"]:checked')).map(input => input.value);
        
        configuracionActual.temasSeleccionados = temasSeleccionados;
        actualizarConfiguracionHost(); // Esto actualiza la DB
        manejarModalCategorias(false);
    }


    function actualizarBotonInicioJuego() {
        // ... (La lógica de actualizarBotonInicioJuego se mantiene igual)
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        const numJugadores = jugadoresActuales.length;
        const btnIniciar = document.getElementById('btn-iniciar-juego');
        const avisoMin = document.getElementById('min-jugadores-aviso');
        
        if (esHost && btnIniciar && avisoMin) {
            const numTemas = configuracionActual.temasSeleccionados.length;
            
            if (numJugadores >= MIN_JUGADORES && numJugadores <= MAX_JUGADORES && numTemas > 0) {
                btnIniciar.disabled = false;
                avisoMin.style.display = 'none';
            } else {
                btnIniciar.disabled = true;
                if (numJugadores < MIN_JUGADORES) {
                    avisoMin.textContent = `Se requieren ${MIN_JUGADORES} jugadores para iniciar.`;
                    avisoMin.style.display = 'block';
                } else if (numTemas === 0) {
                    avisoMin.textContent = `Selecciona al menos 1 categoría.`;
                    avisoMin.style.display = 'block';
                } else {
                    avisoMin.style.display = 'none';
                }
            }
        }
    }
    
    async function actualizarConfiguracionHost() {
        // ... (La lógica de actualizarConfiguracionHost se mantiene igual)
        const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
        if (!esHost || !codigoSalaActual) return;

        const doble = document.getElementById('checkbox-agente-doble').checked;
        
        const nuevaConfig = {
            temasSeleccionados: configuracionActual.temasSeleccionados, 
            incluirAgenteDoble: doble
        };

        configuracionActual = nuevaConfig; 
        
        await db.ref('salas/' + codigoSalaActual + '/configuracion').update(nuevaConfig);
        
        actualizarBotonInicioJuego();
        renderConfiguracion(); 
    }
    
    window.expulsarJugador = async function(jugadorId) {
         // ... (La lógica de expulsarJugador se mantiene igual)
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         if (window.confirm(`¿Estás seguro de que quieres expulsar a este jugador?`)) {
             await db.ref(`salas/${codigoSalaActual}/jugadores/${jugadorId}`).remove();
             alert('Jugador expulsado.');
         }
    }

    // ... (El resto de funciones auxiliares como procesarVotacionHost, votarJugador, chequearFinDeJuego, etc. se mantienen)
    
    // ----------------------------------------------------
    // *** ASIGNAR ROLES Y PALABRA (Host) - INICIO DEL JUEGO ***
    // ----------------------------------------------------
    document.getElementById('btn-iniciar-juego').addEventListener('click', async () => {
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        if (!misDatos?.esHost || !codigoSalaActual) return;
        
        const salaRef = db.ref('salas/' + codigoSalaActual);
        
        if (configuracionActual.temasSeleccionados.length === 0) {
            return alert('ERROR: Debes seleccionar al menos una categoría.');
        }

        const jugadoresConRoles = asignarRoles(jugadoresActuales, configuracionActual);
        
        const temaElegido = configuracionActual.temasSeleccionados[Math.floor(Math.random() * configuracionActual.temasSeleccionados.length)];
        const palabras = PALABRAS_POR_TEMA[temaElegido];
        const palabraElegida = palabras[Math.floor(Math.random() * palabras.length)];
        
        const jugadoresParaFirebase = {};
        jugadoresConRoles.forEach(jugador => {
            let palabraInfo = palabraElegida;
            let temaInfo = temaElegido;
            
            if (jugador.rol === 'Impostor') {
                palabraInfo = 'NINGUNA'; 
                temaInfo = null; // ✅ CORRECCIÓN: El impostor no debe tener asignado el tema.
            }

            jugadoresParaFirebase[jugador.id] = {
                 ...jugador,
                 rol: jugador.rol,
                 palabraSecreta: palabraInfo,
                 tema: temaInfo,
            };
        });
        
        await salaRef.update({
            jugadores: jugadoresParaFirebase, 
            estado: 'revelacion', 
            rondaEstado: 'rolesAsignados',
            'configuracion/palabra': palabraElegida, 
            'configuracion/temaElegido': temaElegido,
            votos: {}, 
            ultimoResultado: null,
        });
    });

    // ----------------------------------------------------
    // *** MANEJAR REVELACIÓN (Se oculta el tema para el Impostor) ***
    // ----------------------------------------------------
    function manejarRevelacion(sala) {
        cambiarVista('vista-revelacion');
        
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const esHost = misDatos?.esHost;

        const rolDisplay = document.getElementById('rol-revelacion-display');
        const palabraDisplay = document.getElementById('palabra-revelacion-display');
        const temaValorSpan = document.getElementById('tema-valor-revelacion'); 
        const temaContainerP = temaValorSpan ? temaValorSpan.closest('.tema-display') : null; // <p class="tema-display">

        const btnDiscusion = document.getElementById('btn-iniciar-discusion');
        
        if (btnDiscusion) {
             btnDiscusion.style.display = esHost ? 'block' : 'none';
        }

        if (rolDisplay && palabraDisplay && temaValorSpan) {
            
            if (miRolActual === 'Impostor') {
                 // Lógica del Impostor: Ocultar el tema
                rolDisplay.textContent = 'Tu Rol: ¡IMPOSTOR!';
                palabraDisplay.textContent = "No conoces la palabra secreta. Tu objetivo es no ser descubierto.";
                palabraDisplay.style.backgroundColor = 'var(--color-red)';
                palabraDisplay.style.color = 'var(--color-text)';
                
                if (temaContainerP) temaContainerP.style.display = 'none'; // ✅ CORRECCIÓN: Ocultar tema
                
            } else {
                 // Lógica para Tripulante / Agente Doble: Mostrar tema
                 if (temaContainerP) temaContainerP.style.display = 'block'; 
                 temaValorSpan.textContent = miTemaActual; // Mostrar el tema

                 if (miRolActual === 'Agente Doble') {
                      rolDisplay.textContent = 'Tu Rol: ¡AGENTE DOBLE!';
                      palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                      palabraDisplay.style.backgroundColor = 'var(--color-orange)';
                      palabraDisplay.style.color = 'var(--color-bg)';
                 } else {
                     rolDisplay.textContent = 'Tu Rol: ¡TRIPULANTE!';
                     palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                     palabraDisplay.style.backgroundColor = 'var(--color-green)';
                     palabraDisplay.style.color = 'var(--color-bg)';
                 }
            }
        }
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
    // *** MANEJAR INICIO DE DISCUSIÓN (Se oculta el tema para el Impostor) ***
    // ----------------------------------------------------
    function manejarInicioDiscusion(sala) {
        cambiarVista('vista-juego');
        
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        const esHost = misDatos?.esHost;

        const temaValorSpan = document.getElementById('tema-valor'); // SPAN con el valor del tema
        const temaContainerP = document.getElementById('tema-display'); // P tag contenedor del tema

        const palabraDisplay = document.getElementById('palabra-secreta-display');
        const rolDisplay = document.getElementById('rol-juego-display');
        
        if (miRolActual === 'Impostor') {
            rolDisplay.textContent = 'Tu Rol: ¡IMPOSTOR!';
            palabraDisplay.textContent = "Eres el IMPOSTOR. ¡Cuidado con tus palabras!";
            palabraDisplay.style.backgroundColor = 'var(--color-red)';
            palabraDisplay.style.color = 'var(--color-text)';
            
            if (temaContainerP) temaContainerP.style.display = 'none'; // ✅ CORRECCIÓN: Ocultar tema
        } else {
             if (temaContainerP) temaContainerP.style.display = 'block'; // Mostrar tema

             if (temaValorSpan) temaValorSpan.textContent = miTemaActual; // Establecer el tema

             if (miRolActual === 'Agente Doble') {
                 rolDisplay.textContent = 'Tu Rol: ¡AGENTE DOBLE!';
                 palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                 palabraDisplay.style.backgroundColor = 'var(--color-orange)';
                 palabraDisplay.style.color = 'var(--color-bg)';
             } else {
                rolDisplay.textContent = 'Tu Rol: ¡TRIPULANTE!';
                palabraDisplay.textContent = `La palabra secreta es: ${misDatos.palabraSecreta}`;
                palabraDisplay.style.backgroundColor = 'var(--color-green)';
                palabraDisplay.style.color = 'var(--color-bg)';
             }
        }
        
        const btnForzar = document.getElementById('btn-forzar-votacion');
        if (btnForzar) btnForzar.style.display = esHost ? 'block' : 'none';
    }

    // ... (Se mantienen las funciones manejarInicioVotacion, manejarResultadoVotacion, manejarFinDeJuego)
    // ... (Se mantiene configurarEscuchadorSala)

    // ----------------------------------------------------
    // *** 6.1: REINICIAR PARTIDA (HOST) - Usa Modal de Confirmación ***
    // ----------------------------------------------------
    // Usamos un listener para ambos botones (vista-resultado y vista-final)
    document.getElementById('btn-reiniciar-partida-resultado').addEventListener('click', () => mostrarConfirmacion('reiniciar'));
    document.getElementById('btn-reiniciar-partida-final').addEventListener('click', () => mostrarConfirmacion('reiniciar'));
    
    // Función central para el MODAL de confirmación
    function mostrarConfirmacion(accion) {
        const modal = document.getElementById('modal-confirmacion');
        const titulo = document.getElementById('confirm-titulo');
        const mensaje = document.getElementById('confirm-mensaje');
        const btnConfirmar = document.getElementById('btn-confirm-ok');
        
        if (accion === 'reiniciar') {
            titulo.textContent = '⚠️ Reiniciar Partida';
            mensaje.textContent = '¿Estás seguro de que quieres REINICIAR la partida? Esto enviará a todos al lobby y podrán elegir una nueva categoría.';
            btnConfirmar.textContent = 'Sí, Reiniciar';
            // Configurar el handler de forma dinámica 
            btnConfirmar.onclick = ejecutarReiniciarJuego;
        } else if (accion === 'finalizar') {
            titulo.textContent = '🚨 Finalizar Juego';
            mensaje.textContent = '¿Estás seguro de que quieres FINALIZAR el juego y CERRAR la sala? Esto eliminará la sala y expulsará a todos.';
            btnConfirmar.textContent = 'Sí, Cerrar Sala';
            btnConfirmar.onclick = ejecutarFinalizarJuego;
        }

        modal.style.display = 'flex';
    }

    // Función para ejecutar la acción de reiniciar
    async function ejecutarReiniciarJuego() {
         document.getElementById('modal-confirmacion').style.display = 'none';
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         // 1. Limpiar roles, estado de eliminado y palabras para los jugadores
         const updates = {};
         jugadoresActuales.forEach(jugador => {
             updates[`salas/${codigoSalaActual}/jugadores/${jugador.id}/rol`] = 'Tripulante';
             updates[`salas/${codigoSalaActual}/jugadores/${jugador.id}/eliminado`] = false;
             updates[`salas/${codigoSalaActual}/jugadores/${jugador.id}/palabraSecreta`] = null;
             updates[`salas/${codigoSalaActual}/jugadores/${jugador.id}/tema`] = null;
         });

         // 2. Resetear estado de la sala
         updates[`salas/${codigoSalaActual}/estado`] = 'esperando';
         updates[`salas/${codigoSalaActual}/rondaEstado`] = 'esperando';
         updates[`salas/${codigoSalaActual}/votos`] = {};
         updates[`salas/${codigoSalaActual}/ultimoResultado`] = null; 
         updates[`salas/${codigoSalaActual}/configuracion/palabra`] = null;
         updates[`salas/${codigoSalaActual}/configuracion/temaElegido`] = null;

         await db.ref().update(updates);
         
         miVotoSeleccionadoId = 'none'; // Resetear voto local
    };

    // ----------------------------------------------------
    // *** 6.2: FINALIZAR JUEGO (HOST) - Usa Modal de Confirmación ***
    // ----------------------------------------------------
    document.getElementById('btn-finalizar-juego-resultado').addEventListener('click', () => mostrarConfirmacion('finalizar'));
    document.getElementById('btn-finalizar-juego-final').addEventListener('click', () => mostrarConfirmacion('finalizar'));

    async function ejecutarFinalizarJuego() {
         document.getElementById('modal-confirmacion').style.display = 'none';
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         if (!misDatos?.esHost || !codigoSalaActual) return;
         
         // 1. Asegurarse de que todos pasen a la vista final antes de borrar (opcional, para estética)
         await db.ref('salas/' + codigoSalaActual).update({ estado: 'finalizado' });
         
         // 2. Esperar un momento y luego borrar la sala (el listener hará el window.location.reload)
         setTimeout(async () => {
             await db.ref('salas/' + codigoSalaActual).remove();
         }, 1000); 
    };
    
    // Función para cancelar la confirmación (en el modal)
    window.cancelarConfirmacion = function() {
        document.getElementById('modal-confirmacion').style.display = 'none';
    }


    // ----------------------------------------------------
    // *** CÓDIGO RESTANTE DE INICIO Y UNIRSE ***
    // ----------------------------------------------------
    
    // ... (El resto del código de inicio y unión a sala se mantiene)
    
    function chequearFinDeJuego(jugadores) {
        const jugadoresActivos = jugadores.filter(j => !j.eliminado);
        
        const impostoresActivos = jugadoresActivos.filter(j => j.rol === 'Impostor').length;
        const tripulantesActivos = jugadoresActivos.filter(j => j.rol === 'Tripulante').length;
        const agentesDoblesActivos = jugadoresActivos.filter(j => j.rol === 'Agente Doble').length;
        
        const tripulantesYAgentesActivos = tripulantesActivos + agentesDoblesActivos;

        if (impostoresActivos >= tripulantesYAgentesActivos) {
            return 'Impostores';
        }
        
        if (impostoresActivos === 0 && tripulantesYAgentesActivos > 0) {
            return 'Tripulantes'; 
        }
        
        return null; 
    }
    
    function manejarFinDeJuego(sala) {
         cambiarVista('vista-final');
         
         const misDatos = jugadoresActuales.find(j => j.id === miId);
         const esHost = misDatos?.esHost;
         
         const ganador = chequearFinDeJuego(jugadoresActuales) || sala.ultimoResultado?.ganador; 

         const ganadorDisplay = document.getElementById('ganador-display');
         if(ganadorDisplay) ganadorDisplay.textContent = `🏆 ¡Ganan los ${ganador || 'Nadie'}! 🏆`;
         
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

         const accionesFinalesFinalHost = document.getElementById('acciones-finales-final-host');
         if (accionesFinalesFinalHost) {
              accionesFinalesFinalHost.style.display = esHost ? 'flex' : 'none';
         }
    }

    document.getElementById('form-inicio').addEventListener('submit', (e) => {
        e.preventDefault();
        nombreJugador = document.getElementById('input-nombre').value.trim();
        if (!nombreJugador) return alert('Por favor, ingresa tu nombre.');
        
        document.getElementById('nombre-jugador-display').textContent = nombreJugador;
        cambiarVista('vista-seleccion');
    });

    document.getElementById('btn-crear-sala').addEventListener('click', async () => {
        
        let codigo = generarCodigoSala(); 

        try { 
            let snapshot = await db.ref('salas/' + codigo).once('value');
            if (snapshot.exists()) {
                codigo = generarCodigoSala(); 
                snapshot = await db.ref('salas/' + codigo).once('value');
                if (snapshot.exists()) {
                    throw new Error('No se pudo generar un código único.');
                }
            }

            const jugadorHost = { 
                id: miId, 
                nombre: nombreJugador, 
                esHost: true, 
                rol: 'Tripulante', 
                eliminado: false,
                palabraSecreta: null,
                tema: null,
                hostId: miId 
            };

            const nuevaSala = {
                codigo: codigo,
                hostId: miId, 
                jugadores: {
                    [miId]: jugadorHost
                },
                estado: 'esperando',
                rondaEstado: 'esperando',
                configuracion: configuracionActual, 
                votos: {}, 
                ultimoResultado: null,
            };
            
            await db.ref('salas/' + codigo).set(nuevaSala);
            
            document.getElementById('codigo-lobby-display').textContent = codigo;
            configurarEscuchadorSala(codigo);

        } catch (error) {
            console.error("Error al crear la sala en Firebase:", error);
            alert(`🔴 ERROR AL CREAR SALA: ${error.message}`);
        }
    });

    document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = document.getElementById('input-codigo').value.trim().toUpperCase();
        if (!codigo) return;
        
        const salaRef = db.ref('salas/' + codigo);

        try {
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


}); // CIERRE DEL DOMContentLoaded