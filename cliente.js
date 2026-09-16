// public/cliente.js
// ================= OFUSCACIÓN DE FIREBASE =================
const _fbk1="QUl6YVN5QkZXRW"; const _fbk2="l6bjZObjFpRGt2"; const _fbk3="WnIyRmtOM1Zmbjd"; const _fbk4="JV0dJdUcw";
const firebaseConfig = {
    apiKey: atob(_fbk1 + _fbk2 + _fbk3 + _fbk4),
    authDomain: "juego-impostor-firebase.firebaseapp.com",
    databaseURL: "https://juego-impostor-firebase-default-rtdb.firebaseio.com",
    projectId: "juego-impostor-firebase",
    storageBucket: "juego-impostor-firebase.firebasestorage.app",
    messagingSenderId: "337084843090",
    appId: "1:337084843090:web:41b0ebafd8a21f1420cb8b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ================= MODAL Y ALERTAS =================
function lanzarToast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.innerText = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function mostrarModal(titulo, mensaje, esConfirmacion = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-personalizado');
        document.getElementById('modal-titulo').innerHTML = titulo;
        document.getElementById('modal-mensaje').innerHTML = mensaje;
        const btnC = document.getElementById('modal-btn-confirmar');
        const btnX = document.getElementById('modal-btn-cancelar');
        
        btnX.style.display = esConfirmacion ? 'inline-block' : 'none';
        btnC.textContent = esConfirmacion ? 'Confirmar' : '¡Entendido!';
        
        modal.style.display = 'flex';
        
        btnC.onclick = () => { modal.style.display = 'none'; resolve(true); };
        btnX.onclick = () => { modal.style.display = 'none'; resolve(false); };
    });
}

// ================= REGLAS DEL JUEGO =================
document.getElementById('btn-reglas').onclick = (e) => {
    e.preventDefault();
    const reglasTexto = `
        <p>¡Bienvenido a la Nave! Aquí pondrás a prueba tu capacidad de engaño y deducción.</p>
        <h3 style="color: var(--color-secondary);">🚀 1. Creación de Sala</h3>
        <ul>
            <li><b>El Capitán (Host):</b> Crea la sala. Controla el inicio del juego y el cierre de votaciones.</li>
            <li><b>La IA Inteligente:</b> Genera categorías al azar que NUNCA se repetirán.</li>
        </ul>
        <h3 style="color: var(--color-primary);">🎭 2. Los Roles de la Nave</h3>
        <ul>
            <li><b style="color: var(--color-green);">🟩 TRIPULANTE:</b> Sabe la palabra secreta. Misión: Dar una pista cierta pero no muy obvia.</li>
            <li style="margin-top:10px;"><b style="color: var(--color-red);">🟥 IMPOSTOR:</b> NO sabe la palabra. Misión: Fingir. <b>🌟 Poder Especial:</b> Toca el Micrófono 🎤 para adivinar la palabra secreta y ganar al instante.</li>
            <li style="margin-top:10px;"><b style="color: var(--color-orange);">⬜ AGENTE BLANCO:</b> NO sabe la palabra y NO ES el impostor. Misión: Sobrevivir a la votación fingiendo.</li>
        </ul>
        <h3 style="color: var(--color-primary);">🗣️ 3. Fases de la Partida</h3>
        <ol>
            <li><b>Discusión:</b> Turnos de 15s para decir UNA SOLA PALABRA relacionada a la secreta.</li>
            <li><b>Votación:</b> Toca el nombre de tu principal sospechoso. Puedes cambiar el voto hasta que el Capitán lo cierre.</li>
        </ol>
    `;
    mostrarModal("📜 ARCHIVOS CLASIFICADOS", reglasTexto, false);
};

// ================= MOTOR DE AUDIO ÉPICO (Estilo Interstellar/Halo) =================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let audioDesbloqueado = false;
let ambienceGain = null;
let ambienceNodes = []; // Para guardar múltiples osciladores

function initAudio() {
    if(!audioCtx) audioCtx = new AudioContext();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    audioDesbloqueado = true;
}
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });

function playSciFiAmbience(tipo) {
    if(!audioDesbloqueado) return;
    stopAmbience();
    
    ambienceGain = audioCtx.createGain();
    ambienceGain.connect(audioCtx.destination);
    
    if (tipo === 'lobby') {
        // Acorde masivo de nave espacial (D2 + A2 + D3 con desafinación ligera)
        const freqs = [73.42, 110.00, 146.83, 147.5]; 
        freqs.forEach(f => {
            const osc = audioCtx.createOscillator();
            osc.type = 'triangle'; // Tono rico en armónicos (estilo órgano/coro)
            osc.frequency.value = f;
            osc.connect(ambienceGain);
            osc.start();
            ambienceNodes.push(osc);
        });
        
        // Attack lento de 4 segundos
        ambienceGain.gain.setValueAtTime(0, audioCtx.currentTime);
        ambienceGain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 4);

    } else if (tipo === 'votacion') {
        // Pulso de suspenso (Latido)
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, audioCtx.currentTime);
        
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 2; // 2 latidos por seg
        const lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 0.5;
        
        lfo.connect(lfoGain); 
        lfoGain.connect(ambienceGain.gain);
        lfo.start();
        ambienceNodes.push(osc, lfo);

        ambienceGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
    }
}

function stopAmbience() {
    if (ambienceGain && ambienceNodes.length > 0) {
        ambienceGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5); // Fade out suave de 1.5s
        setTimeout(() => { 
            ambienceNodes.forEach(node => { node.stop(); node.disconnect(); });
            ambienceNodes = [];
            if(ambienceGain) ambienceGain.disconnect();
        }, 1500);
    }
}

function playTick() {
    if(!audioDesbloqueado || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'square'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playImpact() {
    if(!audioDesbloqueado || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    osc.start(); osc.stop(audioCtx.currentTime + 0.8);
}

// ================= VARIABLES GLOBALES =================
let nombreJugador = '', codigoSalaActual = '';
let miId = Date.now().toString(36) + Math.random().toString(36).substring(2);
let jugadoresActuales = [], miRolActual = '', miPalabraSecreta = '', miTemaActual = '';
const MIN_JUGADORES = 3, MAX_JUGADORES = 15;
let localTurnoIndex = -1;

function generarCodigoSala() {
    let result = ''; const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

window.cambiarVista = function (vistaId) {
    document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
    document.getElementById(vistaId).classList.add('activa');
    if (vistaId === 'vista-lobby') actualizarBotonInicioJuego();
}

function normalizarTexto(texto) {
    if(!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

// ================= LLAMADA AL BACKEND DE VERCEL =================
async function generarContextoIA() {
    // Plan B ampliado: solo se usa si la IA falla (sin internet, key inválida, etc.)
    const planB = [
        { categoria: "Cosas que un perro destruiría", palabra: "Zapatos" },
        { categoria: "Comida que es un desastre comer en la cama", palabra: "Sopa" },
        { categoria: "Lo primero que empacas para la playa", palabra: "Toalla" },
        { categoria: "Cosas que darías por perdidas en una mudanza", palabra: "Control remoto" },
        { categoria: "Objetos que todos fingen saber usar", palabra: "Extintor" },
        { categoria: "Cosas que llevarías a una isla desierta", palabra: "Encendedor" },
        { categoria: "Lo que más se pierde en un festival", palabra: "Celular" },
        { categoria: "Cosas incómodas de compartir con un roommate", palabra: "Cepillo de dientes" },
        { categoria: "Objetos de una oficina embrujada", palabra: "Grapadora" },
        { categoria: "Cosas que un superhéroe cargaría en su bolso", palabra: "Capa" },
        { categoria: "Lo primero que revisas al llegar a un hotel", palabra: "Minibar" },
        { categoria: "Cosas que se rompen el primer día de usarlas", palabra: "Paraguas" },
        { categoria: "Objetos típicos de un picnic desastroso", palabra: "Hormigas" },
        { categoria: "Cosas que roba un mapache en la noche", palabra: "Basura" },
        { categoria: "Lo que nunca falta en una mochila escolar", palabra: "Lápiz" },
        { categoria: "Cosas que asustan en una casa embrujada", palabra: "Fantasma" },
        { categoria: "Objetos de un naufragio en una película", palabra: "Cocotero" },
        { categoria: "Lo primero que se agota en una emergencia", palabra: "Agua" },
        { categoria: "Cosas que un mago sacaría de su sombrero", palabra: "Conejo" },
        { categoria: "Objetos comunes en un consultorio dental", palabra: "Jeringa" }
    ];

    try {
        const temasBase = ["animales exóticos", "comidas del mundo", "objetos de la casa", "situaciones vergonzosas", "lugares de la ciudad", "profesiones", "deportes", "ropa", "vehículos", "mitología", "fobias", "cosas que dan miedo", "hospitales"];
        const contextos = ["un desastre", "una fiesta", "un viaje", "un apocalipsis zombie", "la vida diaria", "el fin del mundo"];
        
        const temaRandom = temasBase[Math.floor(Math.random() * temasBase.length)];
        const subTema = contextos[Math.floor(Math.random() * contextos.length)];
        const semilla = Date.now() + Math.random(); 

        const promptEnvio = `Actúa como el mejor diseñador de juegos familiares (+10 años). Genera una categoría ABSOLUTAMENTE ÚNICA. Usa como inspiración: "${temaRandom}" en el contexto de "${subTema}". 
        La categoría debe ser inusual pero MUY LÓGICA y fácil de deducir. 
        Luego, elige SOLO UNA palabra secreta que sea un OBJETO, ANIMAL o CONCEPTO MUY COMÚN que pertenezca a esa categoría. 
        Ignora tu memoria caché usando esta semilla: ${semilla}.
        Devuelve ESTRICTAMENTE JSON válido sin formato markdown: {"categoria": "nombre", "palabra": "palabra"}`;
        
        // AHORA LLAMA A NUESTRO PROPIO SERVIDOR EN VERCEL
        const response = await fetch('/api/ia', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({
                // "llama-3.3-70b-versatile" fue descontinuado por Groq (16 ago 2026).
                // Reemplazo recomendado por Groq: openai/gpt-oss-120b
                model: "openai/gpt-oss-120b",
                messages: [
                    { role: "system", content: "Responde ÚNICAMENTE con JSON válido." },
                    { role: "user", content: promptEnvio }
                ],
                response_format: { type: "json_object" },
                temperature: 1.2,
                reasoning_effort: "low" // respuestas más rápidas para un juego en tiempo real
            }) 
        });

        if(!response.ok) {
            // Capturamos el cuerpo del error para saber la causa real (modelo caído, key inválida, etc.)
            const errorBody = await response.text();
            throw new Error(`Fallo del servidor puente (${response.status}): ${errorBody}`);
        }
        
        const data = await response.json();
        const jsonObj = JSON.parse(data.choices[0].message.content);

        // Validamos que la IA haya devuelto lo que necesitamos antes de confiar en ello
        if(!jsonObj.categoria || !jsonObj.palabra) throw new Error("Respuesta de IA incompleta: " + JSON.stringify(jsonObj));

        return jsonObj;

    } catch (e) {
        console.error("⚠️ Fallo backend IA, activando Plan B local. Motivo:", e.message);
        return planB[Math.floor(Math.random() * planB.length)];
    }
}

// ================= LÓGICA DE SALA =================
document.getElementById('form-inicio').addEventListener('submit', (e) => {
    e.preventDefault();
    initAudio(); 
    nombreJugador = document.getElementById('input-nombre').value.trim();
    if (nombreJugador) { 
        document.getElementById('nombre-jugador-display').textContent = nombreJugador; 
        cambiarVista('vista-seleccion'); 
    }
});

document.getElementById('btn-crear-sala').addEventListener('click', async () => {
    let codigo = generarCodigoSala();
    await db.ref('salas/' + codigo).set({ estado: 'esperando', hostId: miId, jugadores: { [miId]: { id: miId, nombre: nombreJugador, esHost: true, rol: 'Tripulante', votoId: null } } });
    configurarEscuchadorSala(codigo);
});

document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('input-codigo').value.toUpperCase();
    const snap = await db.ref('salas/' + codigo).once('value');
    if (!snap.exists() || snap.val().estado !== 'esperando') return lanzarToast('❌ Sala no disponible.');
    if (Object.keys(snap.val().jugadores).length >= MAX_JUGADORES) return lanzarToast('❌ Sala Llena.');
    
    await db.ref(`salas/${codigo}/jugadores/${miId}`).set({ id: miId, nombre: nombreJugador, esHost: false, rol: 'Tripulante', votoId: null });
    configurarEscuchadorSala(codigo);
});

function configurarEscuchadorSala(codigo) {
    codigoSalaActual = codigo; document.getElementById('codigo-lobby-display').textContent = codigo;
    
    db.ref('salas/' + codigo).on('value', (snapshot) => {
        if (!snapshot.exists()) return window.location.reload();
        const sala = snapshot.val();
        jugadoresActuales = Object.values(sala.jugadores || {});
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        
        miRolActual = misDatos?.rol || ''; miPalabraSecreta = misDatos?.palabraSecreta || ''; miTemaActual = misDatos?.tema || '';

        if(sala.estado !== 'enJuego') {
            localTurnoIndex = -1;
            clearInterval(timerInterval);
        }

        if (sala.estado === 'esperando') {
            playSciFiAmbience('lobby');
            document.getElementById('configuracion-host').style.display = misDatos?.esHost ? 'block' : 'none';
            const lista = document.getElementById('lista-jugadores-host'); lista.innerHTML = '';
            jugadoresActuales.forEach(j => lista.innerHTML += `<li>${j.nombre} <span style="color:var(--color-primary); font-size:0.8em;">${j.esHost ? '(Capitán)' : ''}</span></li>`);
            document.getElementById('contador-jugadores').textContent = jugadoresActuales.length;
            actualizarBotonInicioJuego();
            if(!document.getElementById('vista-lobby').classList.contains('activa')) cambiarVista('vista-lobby');
            
        } else if (sala.estado === 'generando_ronda') {
            stopAmbience(); cambiarVista('vista-carga');

        } else if (sala.estado === 'revelacion') {
            stopAmbience();
            const card = document.getElementById('card-rol-contenedor');
            document.getElementById('rol-revelacion-display').textContent = miRolActual;
            
            if(miRolActual === 'Impostor') { document.getElementById('rol-revelacion-display').style.color = "var(--color-red)"; card.classList.add('glitch-red'); } 
            else if(miRolActual === 'Agente Blanco') { document.getElementById('rol-revelacion-display').style.color = "var(--color-orange)"; card.classList.remove('glitch-red'); } 
            else { document.getElementById('rol-revelacion-display').style.color = "var(--color-green)"; card.classList.remove('glitch-red'); }

            document.getElementById('tema-valor-revelacion').textContent = miTemaActual;
            document.getElementById('palabra-revelacion-display').textContent = miPalabraSecreta;
            
            document.getElementById('btn-iniciar-discusion').style.display = misDatos?.esHost ? 'block' : 'none';
            document.getElementById('aviso-espera-discusion').style.display = misDatos?.esHost ? 'none' : 'block';
            if(!document.getElementById('vista-revelacion').classList.contains('activa')) cambiarVista('vista-revelacion');
            
        } else if (sala.estado === 'enJuego') {
            manejarTurnos(sala, misDatos?.esHost);
        } else if (sala.estado === 'votacion') {
            manejarVotacion(sala, misDatos?.esHost);
        } else if (sala.estado === 'resultado') {
            manejarJuicioAnimado(sala, misDatos?.esHost);
        }
    });
}

function actualizarBotonInicioJuego() {
    const btn = document.getElementById('btn-iniciar-juego');
    btn.disabled = jugadoresActuales.length < MIN_JUGADORES;
    if(btn.disabled) {
        document.getElementById('min-jugadores-aviso').textContent = `Faltan tripulantes (Mín. ${MIN_JUGADORES})`;
        document.getElementById('min-jugadores-aviso').style.display = 'block';
    } else document.getElementById('min-jugadores-aviso').style.display = 'none';
}

function barajarFisherYates(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function procesarCreacionDeRonda() {
    db.ref(`salas/${codigoSalaActual}`).update({ estado: 'generando_ronda' });
    const usaDoble = document.getElementById('checkbox-agente-doble')?.checked || false;
    const contexto = await generarContextoIA();

    let jugArray = barajarFisherYates(jugadoresActuales);
    
    let numImpostores = 1;
    if(jugArray.length >= 6) numImpostores = 2;
    if(jugArray.length >= 11) numImpostores = 3;

    const impostoresIds = jugArray.slice(0, numImpostores).map(j => j.id);
    const dobleId = (usaDoble && jugArray.length >= 4 && !impostoresIds.includes(jugArray[numImpostores].id)) ? jugArray[numImpostores].id : null;

    let ordenObj = {}; jugArray.forEach((j, idx) => ordenObj[idx] = j.id);

    let updates = { estado: 'revelacion', 'configuracion/palabra': contexto.palabra, 'configuracion/tema': contexto.categoria, ordenTurnos: ordenObj, turnoIndex: 0, ganadorDirecto: null };

    jugArray.forEach(j => {
        let rol = "Tripulante", palabra = contexto.palabra;
        if(impostoresIds.includes(j.id)) { rol = "Impostor"; palabra = "????"; }
        else if(j.id === dobleId) { rol = "Agente Blanco"; palabra = "----"; }
        updates[`jugadores/${j.id}/rol`] = rol;
        updates[`jugadores/${j.id}/palabraSecreta`] = palabra;
        updates[`jugadores/${j.id}/tema`] = contexto.categoria;
        updates[`jugadores/${j.id}/votoId`] = null; 
    });
    db.ref(`salas/${codigoSalaActual}`).update(updates);
}

document.getElementById('btn-iniciar-juego').addEventListener('click', procesarCreacionDeRonda);
document.getElementById('btn-siguiente-ronda').addEventListener('click', procesarCreacionDeRonda);

document.getElementById('btn-volver-lobby').addEventListener('click', () => {
    db.ref(`salas/${codigoSalaActual}`).update({ estado: 'esperando', ganadorDirecto: null });
});

document.getElementById('btn-iniciar-discusion').onclick = () => db.ref(`salas/${codigoSalaActual}`).update({ estado: 'enJuego', tiempoTurno: 15 });

// ================= SISTEMA DE TURNOS =================
let timerInterval;
function manejarTurnos(sala, esHost) {
    if(!document.getElementById('vista-juego').classList.contains('activa')) cambiarVista('vista-juego');
    
    document.getElementById('tema-valor').textContent = miTemaActual;
    document.getElementById('rol-juego-display').textContent = miRolActual;
    if(miRolActual === 'Impostor') document.getElementById('rol-juego-display').style.color = "var(--color-red)";
    else if(miRolActual === 'Agente Blanco') document.getElementById('rol-juego-display').style.color = "var(--color-orange)";
    else document.getElementById('rol-juego-display').style.color = "var(--color-green)";
    
    document.getElementById('palabra-secreta-display').textContent = miPalabraSecreta;
    document.getElementById('contenedor-adivinanza-impostor').style.display = (miRolActual === 'Impostor') ? 'block' : 'none';
    document.getElementById('btn-forzar-votacion').style.display = esHost ? 'block' : 'none';

    const orden = Array.isArray(sala.ordenTurnos) ? sala.ordenTurnos : Object.values(sala.ordenTurnos || {});
    const turnoActualDB = sala.turnoIndex || 0;
    const jugadorActivo = sala.jugadores[orden[turnoActualDB]];
    
    if(jugadorActivo) { 
        document.getElementById('banner-turnos').textContent = `🎤 Habla: ${jugadorActivo.nombre}`; 
    }

    if (localTurnoIndex !== turnoActualDB) {
        localTurnoIndex = turnoActualDB; 
        clearInterval(timerInterval);
        
        let tiempo = 15;
        document.getElementById('timer-display').textContent = `${tiempo}s`;

        timerInterval = setInterval(() => {
            tiempo--; 
            if(tiempo >= 0) {
                document.getElementById('timer-display').textContent = `${tiempo}s`;
                if(tiempo <= 3 && tiempo > 0) playTick();
            }
            
            if(tiempo <= 0) {
                clearInterval(timerInterval);
                if(esHost) {
                    let prox = turnoActualDB + 1;
                    if(prox < orden.length) {
                        db.ref(`salas/${codigoSalaActual}`).update({ turnoIndex: prox });
                    } else {
                        db.ref(`salas/${codigoSalaActual}`).update({ estado: 'votacion' });
                    }
                }
            }
        }, 1000);
    }
}

document.getElementById('btn-forzar-votacion').onclick = () => db.ref(`salas/${codigoSalaActual}`).update({ estado: 'votacion' });

// ================= ADIVINAR PALABRA =================
const btnMicro = document.getElementById('btn-microfono-impostor');
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES';
let escuchando = false;

btnMicro.onclick = () => {
    if(!escuchando) {
        try { recognition.start(); escuchando = true; btnMicro.classList.add('mic-active'); lanzarToast("🎙️ Habla ahora..."); } catch(e){}
    } else {
        recognition.stop(); escuchando = false; btnMicro.classList.remove('mic-active');
    }
};
recognition.onend = () => { escuchando = false; btnMicro.classList.remove('mic-active'); };

recognition.onresult = async (event) => {
    const dichaObj = event.results[0][0].transcript;
    document.getElementById('feedback-voz').textContent = `Escuchado: "${dichaObj}"`;
    validarPalabraImpostor(dichaObj);
};

document.getElementById('btn-enviar-manual').onclick = () => {
    const inputStr = document.getElementById('input-adivinanza-manual').value;
    if(inputStr) validarPalabraImpostor(inputStr);
};

async function validarPalabraImpostor(intentoTexto) {
    const intentoNorm = normalizarTexto(intentoTexto);
    const snap = await db.ref(`salas/${codigoSalaActual}/configuracion/palabra`).once('value');
    const palabraRealNorm = normalizarTexto(snap.val());
    
    if(intentoNorm.includes(palabraRealNorm) || palabraRealNorm.includes(intentoNorm)) {
        db.ref(`salas/${codigoSalaActual}`).update({ estado: 'resultado', ganadorDirecto: 'Impostores' });
    } else {
        lanzarToast("❌ No es correcta");
    }
}

// ================= VOTACIÓN Y JUICIO =================
function manejarVotacion(sala, esHost) {
    clearInterval(timerInterval); 
    if(!document.getElementById('vista-votacion').classList.contains('activa')) {
        cambiarVista('vista-votacion'); playSciFiAmbience('votacion');
    }
    
    const miVotoActual = sala.jugadores[miId]?.votoId;
    const grid = document.getElementById('opciones-votacion'); grid.innerHTML = '';
    
    jugadoresActuales.forEach(j => {
        const votosRecibidos = jugadoresActuales.filter(p => p.votoId === j.id).length;
        const btn = document.createElement('button'); 
        btn.className = `btn-votar ${miVotoActual === j.id ? 'seleccionado' : ''}`; 
        btn.innerHTML = `${j.nombre} ${votosRecibidos > 0 ? `<span class="votos-badge">${votosRecibidos}</span>` : ''}`;
        
        btn.onclick = () => {
            db.ref(`salas/${codigoSalaActual}/jugadores/${miId}/votoId`).set(j.id);
            lanzarToast("✅ Voto emitido (Puedes cambiarlo)");
        };
        grid.appendChild(btn);
    });

    document.getElementById('btn-cerrar-votacion').style.display = esHost ? 'block' : 'none';
    document.getElementById('aviso-espera-votacion').style.display = esHost ? 'none' : 'block';
}

document.getElementById('btn-cerrar-votacion').onclick = () => db.ref(`salas/${codigoSalaActual}`).update({ estado: 'resultado' });

function manejarJuicioAnimado(sala, esHost) {
    if(!document.getElementById('vista-resultado').classList.contains('activa')) cambiarVista('vista-resultado');
    stopAmbience(); playImpact();
    
    const anim = document.getElementById('jugador-expulsado-anim');
    const display = document.getElementById('jugador-eliminado-display');
    anim.classList.remove('vuela-activa'); void anim.offsetWidth; 
    
    if(sala.ganadorDirecto) {
        anim.textContent = "🔪"; anim.classList.add('vuela-activa');
        display.textContent = `¡LOS IMPOSTORES GANAN! Adivinaron la palabra.`; display.style.color = "var(--color-red)"; display.style.borderLeftColor = "var(--color-red)";
    } else {
        let conteo = {};
        jugadoresActuales.forEach(j => { if(j.votoId) conteo[j.votoId] = (conteo[j.votoId] || 0) + 1; });
        
        let max = 0, expId = null, empate = false;
        for (const [idVotado, cantidad] of Object.entries(conteo)) {
            if(cantidad > max) { max = cantidad; expId = idVotado; empate = false; }
            else if(cantidad === max) { empate = true; }
        }

        if(empate || max === 0) {
            anim.textContent = "⚖️"; anim.classList.add('vuela-activa');
            display.textContent = `¡EMPATE! Nadie fue expulsado. Los Impostores ganan terreno.`; display.style.color = "var(--color-red)"; display.style.borderLeftColor = "var(--color-red)";
        } else {
            const exp = sala.jugadores[expId];
            anim.textContent = "👤"; anim.classList.add('vuela-activa');
            setTimeout(() => {
                if(exp.rol === 'Impostor') { display.textContent = `¡VICTORIA TRIPULANTE! ${exp.nombre} era Impostor.`; display.style.color = "var(--color-green)"; display.style.borderLeftColor = "var(--color-green)"; }
                else if(exp.rol === 'Agente Blanco') { display.textContent = `¡CAOS! ${exp.nombre} era el Agente Blanco.`; display.style.color = "var(--color-orange)"; display.style.borderLeftColor = "var(--color-orange)"; }
                else { display.textContent = `ERROR FATAL. ${exp.nombre} era Tripulante.`; display.style.color = "var(--color-red)"; display.style.borderLeftColor = "var(--color-red)"; }
            }, 1500);
        }
    }
    document.getElementById('acciones-finales-host').style.display = esHost ? 'flex' : 'none';
}
window.abandonarSala = () => window.location.reload();