// server.js (CÓDIGO COMPLETO Y FUNCIONAL - FIREBASE ADMIN SDK)

const express = require('express');
const http = require('http');
const firebase = require('firebase-admin');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
const MIN_JUGADORES = 3; 

// --- Configuración de Firebase Admin (REEMPLAZAR CON TUS CREDENCIALES) ---
// La forma más segura es usar el JSON de la cuenta de servicio.

const serviceAccount = require("./serviceAccountKey.json"); // REEMPLAZA ESTO
// NOTA: Si usas Render, considera usar variables de entorno para la clave JSON,
// en lugar de depender de un archivo.

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://juego-impostor-firebase-default-rtdb.firebaseio.com" // REEMPLAZA ESTO
});

const db = firebase.database();
const salasRef = db.ref('salas');

// --- DATOS DEL JUEGO ---
const PALABRAS_POR_TEMA = {
    'Animales 🐾': ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Cebra', 'Oso', 'Delfín'],
    'Comida 🍔': ['Pizza', 'Taco', 'Hamburguesa', 'Ensalada', 'Sushi', 'Pasta', 'Helado', 'Manzana'],
    'Países 🌎': ['España', 'México', 'Colombia', 'Japón', 'Francia', 'Canadá', 'Brasil', 'Alemania'],
    'Profesiones 💼': ['Médico', 'Maestro', 'Ingeniero', 'Cocinero', 'Policía', 'Bombero', 'Abogado', 'Piloto'],
    'Objetos Cotidianos 💡': ['Teléfono', 'Taza', 'Llaves', 'Reloj', 'Libro', 'Silla', 'Mesa', 'Ventana'],
    'Picante 🔥': ['Lencería', 'Gemidos', 'Cama', 'Beso', 'Noche', 'Latido', 'Pasión', 'Prohibido']
};


// =================================================================
// LÓGICA DE JUEGO (Server Side)
// =================================================================

function asignarRoles(jugadores, configuracion) {
    const jugadoresArray = Object.values(jugadores);
    const numJugadores = jugadoresArray.length;
    let numImpostores = 0;
    
    if (numJugadores >= 3 && numJugadores <= 5) {
        numImpostores = 1;
    } else if (numJugadores >= 6) {
        numImpostores = 2;
    } 
    
    // Resetear roles y eliminar flag de 'eliminado'
    jugadoresArray.forEach(j => {
        j.rol = 'Tripulante';
        j.eliminado = false;
        j.palabraSecreta = null;
        j.tema = null;
        j.votoEmitido = null;
    });

    // Función para sacar un elemento del array y devolverlo
    function popRandom(arr) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr.splice(randomIndex, 1)[0];
    }

    let candidatos = [...jugadoresArray]; // Copia de los jugadores

    // 1. Asignar Agente Doble
    if (configuracion.incluirAgenteDoble && numJugadores >= 4) {
        // Encontrar posibles candidatos a Doble que aún sean Tripulantes
        const tripulantesPotenciales = candidatos.filter(j => j.rol === 'Tripulante');
        if (tripulantesPotenciales.length > 0) {
            const agenteDoble = popRandom(tripulantesPotenciales);
            const indexEnCandidatos = candidatos.findIndex(j => j.id === agenteDoble.id);
            if (indexEnCandidatos !== -1) {
                // Actualizar el rol en la lista de candidatos
                candidatos[indexEnCandidatos].rol = 'Agente Doble';
            }
            // Eliminar al agente doble de la lista de candidatos a impostor (si estaba allí)
            candidatos = candidatos.filter(j => j.id !== agenteDoble.id);
        }
    }
    
    // 2. Asignar Impostores
    let impostoresAsignados = 0;
    
    while (impostoresAsignados < numImpostores && candidatos.length > 0) {
        const impostorSeleccionado = popRandom(candidatos);
        
        // Asignar rol si aún es Tripulante
        if (impostorSeleccionado.rol === 'Tripulante') {
            impostorSeleccionado.rol = 'Impostor';
            impostoresAsignados++;
        }
        
        // Recalcular candidatos (los que quedan son tripulantes)
        candidatos = candidatos.filter(j => j.id !== impostorSeleccionado.id);
    }
    
    // Reconvertir a objeto {id: jugador_obj}
    const jugadoresObj = {};
    jugadoresArray.forEach(j => {
        jugadoresObj[j.id] = j;
    });
    
    return jugadoresObj;
}

function chequearFinDeJuego(jugadores) {
    const jugadoresArray = Object.values(jugadores);
    const activos = jugadoresArray.filter(j => !j.eliminado);
    const impostoresActivos = activos.filter(j => j.rol === 'Impostor').length;
    const tripulantesYDoblesActivos = activos.filter(j => j.rol !== 'Impostor').length;
    const dobleActivo = activos.find(j => j.rol === 'Agente Doble' && !j.eliminado);
    
    // Condición 1: Impostores ganan (si hay tantos o más impostores que tripulantes/dobles)
    if (impostoresActivos > 0 && impostoresActivos >= tripulantesYDoblesActivos) {
        return 'Impostores';
    }
    
    // Condición 2: Tripulantes y Dobles ganan (si no queda ningún impostor activo)
    if (impostoresActivos === 0) {
        // Si no hay impostores y hay Agente Doble:
        if (dobleActivo) {
            // El Agente Doble gana solo si él es el único no-impostor restante.
            if (tripulantesYDoblesActivos === 1) {
                return 'Agente Doble';
            }
        }
        // Si no hay impostores y hay 2 o más no-impostores, ganan los Tripulantes.
        if (tripulantesYDoblesActivos >= 1) {
             return 'Tripulantes';
        }
    }

    return null; // El juego continúa
}

function procesarVotacion(sala) {
    const conteoVotos = {}; 
    const jugadoresArray = Object.values(sala.jugadores);
    const jugadoresActivos = jugadoresArray.filter(j => !j.eliminado);

    // Inicializar el conteo de votos
    jugadoresActivos.forEach(j => conteoVotos[j.id] = 0);
    conteoVotos['none'] = 0; // Abstención

    // Contar los votos
    for (const votanteId in sala.votos) {
        const votadoId = sala.votos[votanteId];
        // Solo cuenta si el votante está activo y el voto es a alguien válido/none
        if (jugadoresActivos.some(j => j.id === votanteId)) {
            if (conteoVotos.hasOwnProperty(votadoId)) {
                conteoVotos[votadoId]++;
            } else if (votadoId === 'none') {
                conteoVotos['none']++;
            }
        }
    }

    let jugadorEliminado = null;
    let maxVotos = 0;
    let empates = [];

    for (const id in conteoVotos) {
        if (id !== 'none' && conteoVotos[id] > maxVotos) {
            maxVotos = conteoVotos[id];
            jugadorEliminado = sala.jugadores[id];
            empates = [jugadorEliminado];
        } else if (id !== 'none' && conteoVotos[id] === maxVotos && maxVotos > 0) {
            empates.push(sala.jugadores[id]);
        }
    }
    
    // No hay eliminación en caso de empate
    if (empates.length > 1 || maxVotos === 0) {
        jugadorEliminado = null; 
    } else if (empates.length === 1) {
        jugadorEliminado = empates[0];
    }

    // 1. Crear el objeto de actualización de la sala
    const updates = {};
    
    // 2. Actualizar estado de eliminación
    if (jugadorEliminado) {
        updates[`jugadores/${jugadorEliminado.id}/eliminado`] = true;
    }
    
    // 3. Determinar si hay ganador (usando el estado actualizado si hubo eliminación)
    const jugadoresPostVoto = JSON.parse(JSON.stringify(sala.jugadores)); // Deep copy
    if (jugadorEliminado) {
        jugadoresPostVoto[jugadorEliminado.id].eliminado = true;
    }
    const ganador = chequearFinDeJuego(jugadoresPostVoto);

    // 4. Actualizar el estado de la sala
    updates['rondaEstado'] = 'resultado';
    updates['ultimoResultado'] = {
        conteo: conteoVotos,
        jugadorEliminadoId: jugadorEliminado ? jugadorEliminado.id : null,
        rolRevelado: jugadorEliminado ? jugadorEliminado.rol : null,
        ganador: ganador
    };
    
    // Si hay ganador, cambia el estado principal a 'finalizado'
    if (ganador) {
        updates['estado'] = 'finalizado';
    }
    
    // Limpiar el nodo de votos después del conteo
    updates['votos'] = null; 
    
    return updates;
}


// =================================================================
// MAIN LISTENER DE FIREBASE (Servidor)
// =================================================================

// Escucha en el nodo 'salas' por nuevas salas y por acciones de los hosts
salasRef.on('child_added', (snapshot) => {
    const codigoSala = snapshot.key;
    console.log(`[FIREBASE] Sala ${codigoSala} detectada. Escuchando acciones.`);
    
    // Iniciar escucha de acciones para esta sala
    const accionesRef = db.ref(`salas/${codigoSala}/acciones`);
    // Usamos once() en lugar de on() para evitar que se dispare por datos preexistentes
    // Y luego on() para nuevos datos. O mejor:
    accionesRef.on('child_added', (accionSnapshot) => manejarAccionHost(codigoSala, accionSnapshot));
});

// Escucha si una sala es eliminada (por el Host o por abandono del Host)
salasRef.on('child_removed', (snapshot) => {
    const codigoSala = snapshot.key;
    const accionesRef = db.ref(`salas/${codigoSala}/acciones`);
    // Detener la escucha de acciones cuando la sala se elimina
    accionesRef.off('child_added'); 
    console.log(`[FIREBASE] Sala ${codigoSala} eliminada. Escucha de acciones detenida.`);
});


// Escucha los votos para determinar si termina la votación
salasRef.on('child_changed', (snapshot) => {
    const sala = snapshot.val();
    const codigoSala = snapshot.key;
    
    // Lógica para procesar la votación: se activa si el estado es 'votando' y hay un cambio en la sala
    if (sala.rondaEstado === 'votando' && sala.jugadores) {
        const jugadoresActivos = Object.values(sala.jugadores).filter(j => !j.eliminado);
        const totalVotosRecibidos = Object.keys(sala.votos || {}).length; // Usar || {} por seguridad
        
        if (totalVotosRecibidos === jugadoresActivos.length) {
            console.log(`[FIREBASE] Todos votaron en ${codigoSala}. Procesando...`);
            const updates = procesarVotacion(sala);
            db.ref(`salas/${codigoSala}`).update(updates)
                .then(() => console.log(`Resultado de votación publicado en ${codigoSala}`))
                .catch(error => console.error(`ERROR al publicar resultado en ${codigoSala}:`, error));
        }
    }
});


// =================================================================
// MANEJADOR CENTRAL DE ACCIONES DEL HOST
// =================================================================

async function manejarAccionHost(codigoSala, accionSnapshot) {
    const accionTipo = accionSnapshot.key; // 'iniciarJuego', 'forzarVotacion', etc.
    const accionValor = accionSnapshot.val();
    const salaRef = db.ref(`salas/${codigoSala}`);

    try {
        const snapshot = await salaRef.once('value');
        const sala = snapshot.val();

        if (!sala || sala.hostId !== accionValor.hostId) return; // Solo el host puede ejecutar acciones

        const updates = {};
        let borrarAccion = true; // Por defecto, borramos la acción después de procesarla

        switch (accionTipo) {
            case 'iniciarJuego':
                if (sala.estado === 'esperando') {
                    const jugadoresArray = Object.values(sala.jugadores);
                    if (jugadoresArray.length < MIN_JUGADORES || sala.configuracion.temasSeleccionados.length === 0) {
                        console.warn(`Intento de inicio fallido en ${codigoSala}: No hay suficientes jugadores o temas.`);
                        borrarAccion = true; 
                        break;
                    }

                    // 1. Asignar Roles
                    updates.jugadores = asignarRoles(sala.jugadores, sala.configuracion);

                    // 2. Seleccionar Palabra Secreta y Tema
                    const temasElegidos = sala.configuracion.temasSeleccionados;
                    const temaElegido = temasElegidos[Math.floor(Math.random() * temasElegidos.length)];
                    const palabras = PALABRAS_POR_TEMA[temaElegido];
                    const palabraElegida = palabras[Math.floor(Math.random() * palabras.length)];

                    updates.estado = 'revelacion'; 
                    updates.rondaEstado = 'rolesAsignados';
                    updates.palabraElegida = palabraElegida;
                    updates.temaElegido = temaElegido;
                    
                    // Asegurarse de que cada jugador en la base de datos tenga su info de palabra/tema
                    Object.values(updates.jugadores).forEach(j => {
                        let palabraInfo = palabraElegida;
                        let temaInfo = temaElegido;
                        
                        if (j.rol === 'Impostor') {
                            palabraInfo = 'NINGUNA'; 
                        } else if (j.rol === 'Agente Doble') {
                             palabraInfo = palabraElegida; 
                        }
                        
                        updates.jugadores[j.id].palabraSecreta = palabraInfo;
                        updates.jugadores[j.id].tema = temaInfo;
                    });
                }
                break;

            case 'iniciarDiscusion':
                if (sala.estado === 'revelacion' && sala.rondaEstado === 'rolesAsignados') {
                    updates.estado = 'enJuego';
                    updates.rondaEstado = 'discutiendo';
                }
                break;

            case 'forzarVotacion':
                if (sala.estado === 'enJuego' && sala.rondaEstado === 'discutiendo') {
                    updates.rondaEstado = 'votando';
                    updates.votos = {}; // Limpiar votos
                }
                break;
                
            case 'reiniciarPartida':
                if (sala.estado === 'finalizado' || sala.estado === 'enJuego') {
                    // Resetear estado del juego, manteniendo jugadores y configuración
                    updates.estado = 'esperando';
                    updates.rondaEstado = 'esperando';
                    updates.votos = {};
                    updates.ultimoResultado = null;
                    updates.palabraElegida = null;
                    updates.temaElegido = null;
                    
                    // Resetear estado individual de los jugadores
                    const jugadoresReset = {};
                    Object.values(sala.jugadores).forEach(j => {
                        jugadoresReset[j.id] = {
                            ...j,
                            rol: 'Tripulante',
                            eliminado: false,
                            palabraSecreta: null,
                            tema: null,
                            votoEmitido: null
                        };
                    });
                    updates.jugadores = jugadoresReset;
                }
                break;

            default:
                borrarAccion = true;
                break;
        }

        // Aplicar las actualizaciones
        if (Object.keys(updates).length > 0) {
             await salaRef.update(updates);
        }

    } catch (error) {
        console.error(`ERROR al procesar acción ${accionTipo} en ${codigoSala}:`, error);
    } finally {
        // CRÍTICO: Borrar la acción para evitar bucles o reintentos
        if (borrarAccion) {
            await db.ref(`salas/${codigoSala}/acciones/${accionTipo}`).remove();
        }
    }
}


// --- CONFIGURACIÓN DE EXPRESS ---
app.use(express.static('public')); 

server.listen(PORT, '0.0.0.0', () => { 
    console.log(`Servidor corriendo en el puerto ${PORT}.`);
    console.log(`Servidor de lógica de juego (Firebase Admin) inicializado.`);
});