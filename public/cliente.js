// public/cliente.js (CÓDIGO COMPLETO Y CORREGIDO - FIREBASE REALTIME DATABASE)

document.addEventListener('DOMContentLoaded', (event) => {

    // =================================================================
    // 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
    // =================================================================
    const firebaseConfig = {
        // TUS CREDENCIALES (Asegúrate que sean las correctas)
        apiKey: "AIzaSyBFWEizn6Nn1iDkvZr2FkN3Vfn7IWGIuG0", 
        authDomain: "juego-impostor-firebase.firebaseapp.com",
        databaseURL: "https://juego-impostor-firebase-default-rtdb.firebaseio.com",
        projectId: "juego-impostor-firebase",
        storageBucket: "juego-impostor-firebase.firebasestorage.app",
        messagingSenderId: "337084843090",
        appId: "1:337084843090:web:41b0ebafd8a21f1420cb8b"
    };

    // Inicializar Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();
    
    // Generar un ID único para este cliente (simula el socket.id)
    const miId = firebase.database().ref().push().key;

    // =================================================================
    // 2. DATOS DEL JUEGO Y VARIABLES GLOBALES
    // =================================================================
    const PALABRAS_POR_TEMA = {
        'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín'],
        'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana'],
        'Países 🌎': ['España', 'México', 'Colombia', 'Japón', 'Francia', 'Canadá', 'Brasil', 'Alemania'],
        'Profesiones 💼': ['Médico', 'Maestro', 'Ingeniero', 'Cocinero', 'Policía', 'Bombero', 'Abogado', 'Piloto'],
        'Objetos Cotidianos 💡': ['Teléfono', 'Taza', 'Llaves', 'Reloj', 'Libro', 'Silla', 'Mesa', 'Ventana'],
        'Picante 🔥': ['Lencería', 'Gemidos', 'Cama', 'Beso', 'Noche', 'Latido', 'Pasión', 'Prohibido']
    };
    const TEMAS_DISPONIBLES = Object.keys(PALABRAS_POR_TEMA);
    const MIN_JUGADORES = 3; 
    const MAX_JUGADORES = 10;

    let nombreJugador = ''; 
    let codigoSalaActual = '';
    let jugadoresActuales = {}; // Objeto de jugadores {id: jugador_obj}
    let miRolActual = ''; 
    let miPalabraSecreta = ''; 
    let miTemaActual = ''; 
    let miVotoSeleccionadoId = 'none';
    
    // Configuración Inicial por defecto (usada al crear sala)
    let configuracionActual = { 
        temasSeleccionados: [TEMAS_DISPONIBLES[0]],
        incluirAgenteDoble: false 
    }; 
    
    // Referencia activa a la sala para el listener
    let salaRef = null; 

    // =================================================================
    // 3. FUNCIONES AUXILIARES DE FIREBASE
    // =================================================================
    
    function generarCodigoSala() {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 4; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // =================================================================
    // 4. FUNCIONES DE UI Y LÓGICA AUXILIAR
    // =================================================================

    // Función para navegación de vistas
    window.cambiarVista = function(vistaId) {
        document.querySelectorAll('.vista').forEach(vista => {
            vista.classList.remove('activa');
        });
        const nuevaVista = document.getElementById(vistaId);
        if (nuevaVista) {
            nuevaVista.classList.add('activa');
        } 
        
        if (vistaId === 'vista-lobby') {
            renderConfiguracion(); 
            actualizarBotonInicioJuego();
        }
    }
    
    // Función para actualizar la lista de jugadores en el lobby/juego
    function actualizarListaJugadores(jugadores) {
        jugadoresActuales = jugadores || {};
        const listaHost = document.getElementById('lista-jugadores-host');
        const listaJuego = document.getElementById('lista-jugadores-juego');
        const opcionesVotacion = document.getElementById('opciones-votacion');
        
        if (listaHost) listaHost.innerHTML = '';
        if (listaJuego) listaJuego.innerHTML = '';
        
        // Reiniciar opciones de votación
        if (opcionesVotacion) {
            opcionesVotacion.innerHTML = `
                <div class="card-jugador-voto" data-voto-id="none">
                    <span class="nombre-jugador-voto">⚠️ Nadie</span>
                </div>
            `;
        }

        const jugadoresArray = Object.values(jugadoresActuales);
        const miJugador = jugadoresArray.find(j => j.id === miId);
        const esHost = miJugador?.esHost;
        const jugadoresActivos = jugadoresArray.filter(j => !j.eliminado);

        document.getElementById('contador-jugadores').textContent = `${jugadoresArray.length}/${MAX_JUGADORES}`;

        jugadoresArray.forEach(j => {
            const esHostJugador = j.esHost; 
            const esMiJugador = j.id === miId;
            const esEliminado = j.eliminado;
            
            // 1. Lista del Lobby
            if (listaHost) {
                const elementoLobby = document.createElement('li');
                elementoLobby.textContent = j.nombre + (esHostJugador ? ' (HOST)' : '') + (esMiJugador ? ' (Tú)' : '');

                if (esHost && !esMiJugador && !esEliminado) {
                    const btnExpulsar = document.createElement('button');
                    btnExpulsar.textContent = 'Expulsar';
                    btnExpulsar.classList.add('btn-expulsar');
                    btnExpulsar.onclick = () => expulsarJugador(j.id);
                    elementoLobby.appendChild(btnExpulsar);
                }
                listaHost.appendChild(elementoLobby);
            }

            // 2. Lista de Juego (Solo activos)
            if (!esEliminado && listaJuego) {
                const elementoJuego = document.createElement('li');
                elementoJuego.textContent = j.nombre + (esMiJugador ? ' (Tú)' : '');
                listaJuego.appendChild(elementoJuego);
                
                // 3. Opciones de Votación (Solo activos, excluyéndome a mí mismo)
                if (!esMiJugador && opcionesVotacion) {
                    const cardVoto = document.createElement('div');
                    cardVoto.classList.add('card-jugador-voto');
                    cardVoto.setAttribute('data-voto-id', j.id);
                    cardVoto.innerHTML = `<span class="nombre-jugador-voto">${j.nombre}</span>`;
                    cardVoto.onclick = () => votarJugador(j.id);
                    opcionesVotacion.appendChild(cardVoto);
                }
            }
        });

        actualizarBotonInicioJuego();
        
        // Marcar el voto actual si ya voté
        if (opcionesVotacion) {
            document.querySelectorAll('.card-jugador-voto').forEach(card => card.classList.remove('votado-seleccionado'));
            const cardVotado = opcionesVotacion.querySelector(`[data-voto-id="${miVotoSeleccionadoId}"]`);
            if (cardVotado) {
               cardVotado.classList.add('votado-seleccionado');
            }
        }
    }
    
    // Renderizado y Lectura de Categorías
    function renderConfiguracion() {
        const categoriasContainer = document.getElementById('categorias-container');
        if (!categoriasContainer) return;
        
        // Si ya hay contenido y se renderizó una vez, no lo hacemos de nuevo
        if (categoriasContainer.children.length > 0) return;

        TEMAS_DISPONIBLES.forEach(tema => {
            const checkboxId = `tema-${tema.replace(/[^a-zA-Z0-9]/g, '-')}`;
            const div = document.createElement('div');
            div.classList.add('card-categoria'); 
            div.setAttribute('data-tema', tema);
            
            // Determinar si es un tema "picante" para la etiqueta HOT
            const isHot = tema.includes('Picante');
            const hotTag = isHot ? '<span class="tag-hot">HOT</span>' : '';
            
            div.innerHTML = `
                ${hotTag}
                <span class="emoji">${tema.split(' ')[1] || '?' }</span>
                <h4>${tema.split(' ')[0]}</h4>
                <input type="checkbox" id="${checkboxId}" value="${tema}" name="tema-selector" style="display:none;">
            `;
            
            // Lógica de selección/deselección
            div.onclick = function() {
                const isSelected = div.classList.toggle('seleccionada');
                const checkbox = document.getElementById(checkboxId);
                checkbox.checked = isSelected;
                
                actualizarConfiguracionLocal();
                actualizarBotonInicioJuego();
            };
            
            // Inicializar estado visual
            if (configuracionActual.temasSeleccionados.includes(tema)) {
                div.classList.add('seleccionada');
                // No necesitamos el checkbox real si usamos la clase seleccionada para la lógica, pero lo mantenemos
                document.getElementById(checkboxId).checked = true;
            }

            categoriasContainer.appendChild(div);
        });
        
        // Sincronizar UI de Agente Doble
        const checkboxDoble = document.getElementById('checkbox-agente-doble');
        if (checkboxDoble) {
            checkboxDoble.checked = configuracionActual.incluirAgenteDoble;
            checkboxDoble.addEventListener('change', () => {
                actualizarConfiguracionLocal();
                actualizarBotonInicioJuego();
            });
        }
    }
    
    // Función para actualizar la configuración local y emitir a Firebase (Host)
    function actualizarConfiguracionLocal() {
        const temas = Array.from(document.querySelectorAll('.card-categoria.seleccionada'))
                           .map(div => div.getAttribute('data-tema'));
                           
        const doble = document.getElementById('checkbox-agente-doble')?.checked || false;
        
        configuracionActual = {
            temasSeleccionados: temas,
            incluirAgenteDoble: doble
        };

        const jugadoresArray = Object.values(jugadoresActuales);
        const esHost = jugadoresArray.find(j => j.id === miId)?.esHost;
        
        if (esHost && codigoSalaActual) {
            // Actualizar solo la configuración en Firebase
            db.ref('salas/' + codigoSalaActual + '/configuracion').set(configuracionActual)
                .catch(error => console.error("Error al actualizar config en Firebase:", error));
        }
    }

    // Habilitar/deshabilitar el botón de iniciar juego
    function actualizarBotonInicioJuego() {
        const jugadoresArray = Object.values(jugadoresActuales);
        const esHost = jugadoresArray.find(j => j.id === miId)?.esHost;
        const numJugadores = jugadoresArray.length;
        const btnIniciar = document.getElementById('btn-iniciar-juego');
        const avisoMin = document.getElementById('min-jugadores-aviso');
        const avisoCategoria = document.getElementById('aviso-categoria');
        
        // Asegurar que solo el host vea la configuración
        const configHostDiv = document.getElementById('configuracion-host');
        if (configHostDiv) configHostDiv.style.display = esHost ? 'block' : 'none';

        if (esHost && btnIniciar) {
            const numTemas = configuracionActual.temasSeleccionados?.length || 0;
            
            const puedeIniciar = (numJugadores >= MIN_JUGADORES && numTemas > 0);

            btnIniciar.disabled = !puedeIniciar;
            
            // Mostrar avisos
            if (avisoMin) avisoMin.style.display = (numJugadores < MIN_JUGADORES) ? 'block' : 'none';
            if (avisoCategoria) avisoCategoria.style.display = (numTemas === 0) ? 'block' : 'none';
        }
    }
    
    // Función para actualizar la información de mi rol en la vista de juego/revelación
    function actualizarMiInfo(jugadores) {
        const misDatos = Object.values(jugadores).find(j => j.id === miId);
        if (misDatos) {
            miRolActual = misDatos.rol;
            miPalabraSecreta = misDatos.palabraSecreta;
            miTemaActual = misDatos.tema;
        }
    }
    
    // =================================================================
    // 5. LÓGICA DE FIREBASE (LISTENER)
    // =================================================================

    // Detiene el listener activo de Firebase
    function detenerEscuchadorSala() {
        if (salaRef) {
            salaRef.off(); 
            salaRef = null;
        }
    }

    // Configura el listener principal de la sala
    function configurarEscuchadorSala(codigo) {
        // Asegurarse de que solo haya un listener activo
        detenerEscuchadorSala();
        
        codigoSalaActual = codigo;
        salaRef = db.ref('salas/' + codigo);
        
        salaRef.on('value', (snapshot) => {
            const sala = snapshot.val();
            
            if (!sala) {
                // Si la sala desaparece, es porque el Host cerró/abandonó
                alert("⛔ El Host cerró la sala o la sala ya no existe.");
                detenerEscuchadorSala();
                abandonarSalaLocal();
                return;
            }

            // 1. Actualizar jugadores y configuración localmente
            const jugadores = sala.jugadores || {};
            const jugadoresArray = Object.values(jugadores);
            const miJugador = jugadoresArray.find(j => j.id === miId);

            if (!miJugador) {
                // Me expulsaron
                alert("🚪 Has sido expulsado de la sala por el Host.");
                detenerEscuchadorSala();
                abandonarSalaLocal();
                return;
            }
            
            jugadoresActuales = jugadores;
            configuracionActual = sala.configuracion || configuracionActual; 

            // 2. Determinar la vista a mostrar
            const estado = sala.estado || 'esperando';
            const rondaEstado = sala.rondaEstado || 'esperando';

            if (estado === 'esperando') {
                document.getElementById('codigo-lobby-display').textContent = codigo;
                actualizarListaJugadores(jugadores);
                cambiarVista('vista-lobby');
            } else if (estado === 'revelacion') {
                actualizarMiInfo(jugadores);
                actualizarListaJugadores(jugadores); 
                manejarRevelacion(miJugador.esHost);
            } else if (estado === 'enJuego') {
                actualizarMiInfo(jugadores);
                actualizarListaJugadores(jugadores); 
                if (rondaEstado === 'discutiendo') {
                    manejarInicioDiscusion(miJugador.esHost);
                } else if (rondaEstado === 'votando') {
                    manejarInicioVotacion();
                } else if (rondaEstado === 'resultado') {
                    manejarResultadoVotacion(sala.ultimoResultado, miJugador.esHost);
                }
            } else if (estado === 'finalizado') {
                manejarFinDeJuego(sala.ultimoResultado.ganador, jugadoresArray, miJugador.esHost);
            }
        });
    }

    // =================================================================
    // 6. MANEJADORES DE EVENTOS DEL DOM Y FIREBASE ACTIONS
    // =================================================================
    
    // INICIO: Registrar nombre
    document.getElementById('form-inicio').addEventListener('submit', (e) => {
        e.preventDefault();
        nombreJugador = document.getElementById('input-nombre').value.trim();
        if (!nombreJugador) return alert('Por favor, ingresa tu nombre.');
        
        document.getElementById('nombre-jugador-display').textContent = nombreJugador;
        cambiarVista('vista-seleccion');
    });

    // SELECCIÓN: Crear Sala (HOST)
    document.getElementById('btn-crear-sala').addEventListener('click', async () => {
        try {
            let codigo = generarCodigoSala();
            let salaExists = (await db.ref('salas/' + codigo).once('value')).exists();

            // Generar código único
            while (salaExists) {
                codigo = generarCodigoSala();
                salaExists = (await db.ref('salas/' + codigo).once('value')).exists();
            }

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
                estado: 'esperando',
                rondaEstado: 'esperando',
                configuracion: configuracionActual,
                votos: {}, 
                ultimoResultado: null,
                palabraElegida: null, 
                temaElegido: null
            };
            
            // 1. Crear la sala y el jugador host en una sola actualización (mejor)
            await db.ref('salas/' + codigo).set(nuevaSala);
            await db.ref('salas/' + codigo + '/jugadores/' + miId).set(jugadorHost); 

            // 2. Configurar el listener e ir al lobby
            configurarEscuchadorSala(codigo);
            codigoSalaActual = codigo;
            document.getElementById('codigo-lobby-display').textContent = codigo;
            cambiarVista('vista-lobby'); // <--- CORRECCIÓN: CAMBIO EXPLÍCITO DE VISTA
            
            console.log(`Sala ${codigo} creada por ${nombreJugador}.`);

        } catch (error) {
            console.error("Error al crear la sala en Firebase:", error);
            alert(`🔴 ERROR AL CREAR SALA: ${error.message}`);
        }
    });

    // SELECCIÓN: Unirse a Sala (Jugador)
    document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = document.getElementById('input-codigo').value.trim().toUpperCase();
        if (codigo.length !== 4) return alert('El código de sala debe ser de 4 letras.');
        
        try {
            const snapshot = await db.ref('salas/' + codigo).once('value');
            const sala = snapshot.val();

            if (!sala) {
                return alert('ERROR: La sala con el código ' + codigo + ' no existe.');
            }

            if (sala.estado !== 'esperando') {
                return alert('ERROR: El juego ya inició o la sala está cerrada.');
            }
            
            const numJugadores = Object.keys(sala.jugadores || {}).length;
            if (numJugadores >= MAX_JUGADORES) {
                 return alert('ERROR: La sala está llena. ¡Máximo ' + MAX_JUGADORES + ' jugadores!');
            }
            
            const nombresExistentes = Object.values(sala.jugadores || {}).map(j => j.nombre.toLowerCase());
            if (nombresExistentes.includes(nombreJugador.toLowerCase())) {
                 return alert('ERROR: Ese nombre ya está en uso en esta sala.');
            }

            const nuevoJugador = { 
                 id: miId, 
                 nombre: nombreJugador, 
                 esHost: false, 
                 rol: 'Tripulante', 
                 eliminado: false
            };
            
            const jugadoresRef = db.ref('salas/' + codigo + '/jugadores/' + miId);
            await jugadoresRef.set(nuevoJugador);

            configurarEscuchadorSala(codigo);
            // El listener se encarga del cambio de vista, pero establecemos el código inmediatamente
            document.getElementById('codigo-lobby-display').textContent = codigo;
            console.log(`${nombreJugador} unido a la sala ${codigo}.`);


        } catch (error) {
            console.error("Error al unirse a la sala en Firebase:", error);
            alert(`🔴 ERROR AL UNIRSE: Fallo de red o de permisos. Detalle: ${error.message}`);
        }
    });

    // LOBBY: Iniciar Juego (Host)
    document.getElementById('btn-iniciar-juego').addEventListener('click', async () => {
        const jugadoresArray = Object.values(jugadoresActuales);
        if (jugadoresArray.length < MIN_JUGADORES) {
             return alert(`Se requieren al menos ${MIN_JUGADORES} jugadores para iniciar.`);
        }
        if ((configuracionActual.temasSeleccionados?.length || 0) === 0) {
             return alert('Debes seleccionar al menos una categoría.');
        }
        
        try {
            // Esta acción será procesada por server.js
            await db.ref('salas/' + codigoSalaActual + '/acciones/iniciarJuego').set({ hostId: miId, timestamp: firebase.database.ServerValue.TIMESTAMP });
        } catch (error) {
            alert('Error al iniciar el juego: ' + error.message);
        }
    });
    
    // REVELACIÓN: Iniciar Discusión (Host)
    document.getElementById('btn-iniciar-discusion').addEventListener('click', async () => {
        try {
             // Esta acción será procesada por server.js
            await db.ref('salas/' + codigoSalaActual + '/acciones/iniciarDiscusion').set({ hostId: miId, timestamp: firebase.database.ServerValue.TIMESTAMP });
        } catch (error) {
            alert('Error al iniciar la discusión: ' + error.message);
        }
    });
    
    // JUEGO: Forzar Votación (Host)
    document.getElementById('btn-forzar-votacion').addEventListener('click', async () => {
        try {
            // Esta acción será procesada por server.js
            await db.ref('salas/' + codigoSalaActual + '/acciones/forzarVotacion').set({ hostId: miId, timestamp: firebase.database.ServerValue.TIMESTAMP });
        } catch (error) {
            alert('Error al forzar votación: ' + error.message);
        }
    });
    
    // FIN DE JUEGO: Reiniciar Partida (Host)
    document.getElementById('btn-reiniciar-partida').addEventListener('click', async () => {
        try {
            if (confirm('¿Estás seguro de que quieres reiniciar la partida? Los jugadores se mantendrán.')) {
                 // Esta acción será procesada por server.js
                 await db.ref('salas/' + codigoSalaActual + '/acciones/reiniciarPartida').set({ hostId: miId, timestamp: firebase.database.ServerValue.TIMESTAMP });
            }
        } catch (error) {
            alert('Error al reiniciar: ' + error.message);
        }
    });
    
    // FIN DE JUEGO: Finalizar Juego y Cerrar Sala (Host)
    document.getElementById('btn-finalizar-juego').addEventListener('click', async () => {
        try {
            if (confirm('¿Estás seguro de que quieres FINALIZAR el juego y CERRAR la sala?')) {
                // El cliente Host puede eliminar directamente la sala en Firebase
                await db.ref('salas/' + codigoSalaActual).remove();
                abandonarSalaLocal();
            }
        } catch (error) {
            alert('Error al finalizar: ' + error.message);
        }
    });
    
    // LOBBY/JUEGO: Abandonar Sala
    window.abandonarSala = function() {
        if (confirm('¿Estás seguro de que quieres abandonar la sala?')) {
            // El jugador se elimina de la lista. Si era el Host, el listener manejará el cierre total de la sala.
            db.ref('salas/' + codigoSalaActual + '/jugadores/' + miId).remove()
                .then(() => {
                    abandonarSalaLocal();
                })
                .catch(error => {
                    alert('Error al intentar salir: ' + error.message);
                });
        }
    };
    
    // Función de limpieza local
    function abandonarSalaLocal() {
        detenerEscuchadorSala();
        codigoSalaActual = '';
        jugadoresActuales = {};
        miVotoSeleccionadoId = 'none';
        cambiarVista('vista-seleccion');
    }
    
    // LOBBY: Expulsar Jugador (Host)
    window.expulsarJugador = function(idJugador) {
        if (confirm('¿Estás seguro de que quieres expulsar a este jugador?')) {
            db.ref('salas/' + codigoSalaActual + '/jugadores/' + idJugador).remove()
                .catch(error => alert('Error al expulsar: ' + error.message));
        }
    };
    
    // VOTACIÓN: Votar Jugador
    window.votarJugador = async function(votoId) {
        if (miVotoSeleccionadoId === votoId) return; // Ya votó por este
        
        try {
            // Registrar el voto en el nodo 'votos'
            await db.ref('salas/' + codigoSalaActual + '/votos/' + miId).set(votoId);
            
            miVotoSeleccionadoId = votoId;
            const jugadoresArray = Object.values(jugadoresActuales);
            const nombreVotado = (votoId === 'none') 
                             ? 'Abstención' 
                             : jugadoresArray.find(j => j.id === votoId)?.nombre || 'Jugador Desconocido';
                             
            document.getElementById('voto-confirmado-display').textContent = `Votaste por: ${nombreVotado}`;
            
            // Actualizar UI del voto
            document.querySelectorAll('.card-jugador-voto').forEach(card => card.classList.remove('votado-seleccionado'));
            const cardVotado = document.querySelector(`[data-voto-id="${votoId}"]`);
            if (cardVotado) {
               cardVotado.classList.add('votado-seleccionado');
            }
            
            // Si todos votaron, el backend (server.js) lo detecta y cambia el estado.
            
        } catch (error) {
            alert('Error al registrar el voto: ' + error.message);
        }
    };

    // =================================================================
    // 7. MANEJADORES DE VISTAS DETALLADOS (RENDERIZADO)
    // =================================================================
    
    // Vista: Revelación de Roles (Punto 3)
    function manejarRevelacion(esHost) {
        cambiarVista('vista-revelacion-rol');
        
        const titulo = document.getElementById('revelacion-titulo');
        const detalle = document.getElementById('revelacion-detalle');
        const btnDiscusion = document.getElementById('btn-iniciar-discusion');
        
        if (btnDiscusion) {
             btnDiscusion.style.display = esHost ? 'block' : 'none';
        }

        if (miRolActual === 'Impostor') {
            titulo.textContent = '¡IMPOSTOR!';
            titulo.style.color = 'var(--color-red)';
            detalle.innerHTML = `<h3>Tu Misión</h3><p>No conoces la palabra. Debes disimular y convencer a los demás de que eres un tripulante para no ser votado. **Tema (Pista):** ${miTemaActual}</p>`;
        } else if (miRolActual === 'Agente Doble') {
             titulo.textContent = 'Agente Doble';
             titulo.style.color = 'var(--color-orange)';
             detalle.innerHTML = `<h3>Tu Misión</h3><p>La palabra secreta es: <span style="font-weight: bold; color: var(--color-orange);">${miPalabraSecreta}</span>. Eres un tripulante que juega solo. Ganas si el impostor es eliminado y tú sobrevives. **Tema:** ${miTemaActual}</p>`;
        } else {
            titulo.textContent = 'Tripulante';
            titulo.style.color = 'var(--color-green)';
            detalle.innerHTML = `<h3>Tu Palabra Secreta</h3><p style="font-size: 1.5em; font-weight: bold; color: var(--color-green);">${miPalabraSecreta}</p><p>Usa la palabra sin revelarla directamente. **Tema:** ${miTemaActual}</p>`;
        }
    }
    
    // Vista: Inicio de Discusión (Estado: 'enJuego', rondaEstado: 'discutiendo')
    function manejarInicioDiscusion(esHost) {
        cambiarVista('vista-juego');
        
        const palabraDisplay = document.getElementById('palabra-secreta-juego');
        const rolDisplay = document.getElementById('rol-juego-display');
        const temaDisplay = document.getElementById('tema-valor-juego');
        
        if (rolDisplay) rolDisplay.textContent = `Rol: ${miRolActual}`;
        if (temaDisplay) temaDisplay.textContent = miTemaActual;

        if (palabraDisplay) {
             if (miRolActual === 'Impostor') {
                palabraDisplay.textContent = "IMPOSTOR: ¡A disimular!";
                palabraDisplay.style.color = 'var(--color-red)';
             } else if (miRolActual === 'Agente Doble') {
                 palabraDisplay.textContent = miPalabraSecreta;
                 palabraDisplay.style.color = 'var(--color-orange)';
             } else {
                palabraDisplay.textContent = miPalabraSecreta;
                palabraDisplay.style.color = 'var(--color-green)';
             }
        }
        
        // Mostrar botón de forzar votación al Host
        const btnForzar = document.getElementById('btn-forzar-votacion');
        if (btnForzar) btnForzar.style.display = esHost ? 'block' : 'none';
        
        // Ocultar acciones finales
        document.getElementById('acciones-finales-host').style.display = 'none';
    }
    
    // Vista: Inicio de Votación (Estado: 'enJuego', rondaEstado: 'votando')
    function manejarInicioVotacion() {
        cambiarVista('vista-votacion');
        miVotoSeleccionadoId = 'none'; // Resetear voto local al iniciar la fase
        
        const jugadoresActivos = Object.values(jugadoresActuales).filter(j => !j.eliminado);
        
        document.getElementById('voto-confirmado-display').textContent = "Esperando tu voto...";
        // Mostrar 0/Total_Activos (el backend lo actualiza con votos ya emitidos)
        document.getElementById('votos-emitidos-display').textContent = `Votos recibidos: 0/${jugadoresActivos.length}`; 
    }

    // Vista: Resultado de Votación (Estado: 'enJuego' o 'finalizado', rondaEstado: 'resultado')
    function manejarResultadoVotacion(resultado, esHost) {
        cambiarVista('vista-resultado');
        
        const detallesContainer = document.getElementById('detalles-votacion-container');
        const eliminadoDisplay = document.getElementById('jugador-eliminado-display');
        
        if (detallesContainer) detallesContainer.innerHTML = '<h4>Conteo de Votos:</h4>';
        const jugadoresArray = Object.values(jugadoresActuales);
        
        let jugadorEliminadoNombre = 'Nadie (Empate o Abstención)';
        
        // Renderizar conteo de votos
        const conteoList = document.createElement('ul');
        conteoList.classList.add('lista-jugadores');
        
        for (const id in resultado.conteo) {
            const votoCount = resultado.conteo[id];
            let nombre = 'Abstención';
            
            if (id !== 'none') {
                const jugador = jugadoresArray.find(j => j.id === id);
                nombre = jugador ? jugador.nombre : 'Jugador Desconocido';
            }
            
            const li = document.createElement('li');
            li.textContent = `${nombre}: ${votoCount} voto(s)`;
            conteoList.appendChild(li);
        }
        if (detallesContainer) detallesContainer.appendChild(conteoList);

        // Renderizar Eliminación
        if (eliminadoDisplay) {
            if (resultado.jugadorEliminadoId) {
                const jugador = jugadoresArray.find(j => j.id === resultado.jugadorEliminadoId);
                if (jugador) {
                    jugadorEliminadoNombre = jugador.nombre;
                    eliminadoDisplay.textContent = `¡${jugadorEliminadoNombre} ha sido eliminado!\nRol revelado: ${resultado.rolRevelado}`;
                    eliminadoDisplay.style.color = 'var(--color-red)';
                    eliminadoDisplay.style.borderColor = 'var(--color-red)';
                }
            } else {
                eliminadoDisplay.textContent = jugadorEliminadoNombre;
                eliminadoDisplay.style.color = 'var(--color-secondary)';
                eliminadoDisplay.style.borderColor = 'var(--color-secondary)';
            }
        }

        // Mostrar/Ocultar acciones finales
        const accionesHost = document.getElementById('acciones-finales-host');
        if (accionesHost) accionesHost.style.display = esHost ? 'flex' : 'none';
    }
    
    // Vista: Fin de Juego (Estado: 'finalizado')
    function manejarFinDeJuego(ganador, jugadoresArray, esHost) {
        cambiarVista('vista-final');
        
        const ganadorDisplay = document.getElementById('ganador-display');
        const listaRolesFinal = document.getElementById('lista-roles-final');
        if (listaRolesFinal) listaRolesFinal.innerHTML = '';
        
        if (ganadorDisplay) ganadorDisplay.textContent = `🏆 ¡Ganan los ${ganador}! 🏆`;

        jugadoresArray.forEach(j => {
            const li = document.createElement('li');
            li.textContent = `${j.nombre} fue ${j.rol}`;
            if (j.rol === 'Impostor') {
                li.classList.add('impostor');
            } else if (j.rol === 'Agente Doble') {
                li.classList.add('orange');
            } else {
                li.classList.add('tripulante');
            }
            li.style.textDecoration = j.eliminado ? 'line-through' : 'none';
            if (listaRolesFinal) listaRolesFinal.appendChild(li);
        });
        
        // El Host tiene las opciones de Reiniciar/Cerrar
        const accionesFinalesHost = document.getElementById('acciones-finales-host');
        if (accionesFinalesHost) {
            accionesFinalesHost.style.display = esHost ? 'flex' : 'none';
            // Clonar o mostrar si ya existe
            const vistaFinal = document.getElementById('vista-final');
            if (vistaFinal && !vistaFinal.querySelector('#acciones-finales-host-cloned')) {
                 const clonedActions = accionesFinalesHost.cloneNode(true);
                 clonedActions.id = 'acciones-finales-host-cloned';
                 clonedActions.style.display = esHost ? 'flex' : 'none';
                 // Remover listeners anteriores si es necesario o manejar con el nuevo ID
                 vistaFinal.insertBefore(clonedActions, vistaFinal.querySelector('.btn-principal'));
            }
        }
    }
});