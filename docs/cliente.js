// public/cliente.js (VERSIÓN DEFINITIVA: IA, AUDIO, MICRÓFONO Y TURNOS)

const firebaseConfig = {
    apiKey: "AIzaSyBFWEizn6Nn1iDkvZr2FkN3Vfn7IWGIuG0",
    authDomain: "juego-impostor-firebase.firebaseapp.com",
    databaseURL: "https://juego-impostor-firebase-default-rtdb.firebaseio.com",
    projectId: "juego-impostor-firebase",
    storageBucket: "juego-impostor-firebase.firebasestorage.app",
    messagingSenderId: "337084843090",
    appId: "1:337084843090:web:41b0ebafd8a21f1420cb8b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ================= EFECTOS DE AUDIO PROCEDURAL =================
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playTick() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'square'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playImpact() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start(); osc.stop(audioCtx.currentTime + 0.5);
}

// ================= VARIABLES GLOBALES =================
let nombreJugador = '';
let codigoSalaActual = '';
let miId = Date.now().toString(36) + Math.random().toString(36).substring(2);
let jugadoresActuales = [];
let miRolActual = '', miPalabraSecreta = '', miTemaActual = '';
let listenerSala = null;
const MIN_JUGADORES = 3, MAX_JUGADORES = 15;

// ================= FUNCIONES AUXILIARES =================
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

function lanzarToast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.innerText = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

document.getElementById('btn-whatsapp').onclick = () => {
    const txt = `¡Únete a mi partida de El Impostor! 🕵️\nCódigo: ${codigoSalaActual}\nEntra aquí: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(txt)}`, '_blank');
};

// ================= INTELIGENCIA ARTIFICIAL =================
async function generarContextoIA(apiKey) {
    if (!apiKey) return { categoria: "Objetos Cotidianos", palabra: "Espejo" }; // Fallback
    lanzarToast("🧠 La IA está inventando una categoría...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `Genera una categoría extraña, absurda y graciosa para un juego de mesa, y SOLO UNA palabra secreta que pertenezca a esa categoría. Devuelve ESTRICTAMENTE un JSON: {"categoria": "nombre", "palabra": "palabra"}`;
    try {
        const response = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const textoResult = data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(textoResult);
    } catch (e) {
        console.error("Error IA:", e);
        return { categoria: "Excusas malas", palabra: "Extraterrestres" }; // Fallback
    }
}

// ================= LÓGICA DE SALA =================
document.getElementById('form-inicio').addEventListener('submit', (e) => {
    e.preventDefault();
    nombreJugador = document.getElementById('input-nombre').value.trim();
    if (nombreJugador) {
        document.getElementById('nombre-jugador-display').textContent = nombreJugador;
        cambiarVista('vista-seleccion');
    }
});

document.getElementById('btn-crear-sala').addEventListener('click', async () => {
    let codigo = generarCodigoSala();
    const nuevaSala = { estado: 'esperando', hostId: miId, rondaEstado: 'noIniciada', jugadores: { [miId]: { id: miId, nombre: nombreJugador, esHost: true, rol: 'Tripulante', eliminado: false } } };
    await db.ref('salas/' + codigo).set(nuevaSala);
    configurarEscuchadorSala(codigo);
});

document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('input-codigo').value.toUpperCase();
    const snap = await db.ref('salas/' + codigo).once('value');
    if (!snap.exists() || snap.val().estado !== 'esperando') return alert('Sala no disponible o en juego.');
    
    await db.ref(`salas/${codigo}/jugadores/${miId}`).set({ id: miId, nombre: nombreJugador, esHost: false, rol: 'Tripulante', eliminado: false });
    configurarEscuchadorSala(codigo);
});

function configurarEscuchadorSala(codigo) {
    codigoSalaActual = codigo;
    document.getElementById('codigo-lobby-display').textContent = codigo;
    db.ref('salas/' + codigo).on('value', (snapshot) => {
        if (!snapshot.exists()) return window.location.reload();
        const sala = snapshot.val();
        jugadoresActuales = Object.values(sala.jugadores || {});
        const misDatos = jugadoresActuales.find(j => j.id === miId);
        
        miRolActual = misDatos?.rol || '';
        miPalabraSecreta = misDatos?.palabraSecreta || '';
        miTemaActual = misDatos?.tema || '';

        if (sala.estado === 'esperando') {
            actualizarListaLobby(misDatos?.esHost);
            cambiarVista('vista-lobby');
        } else if (sala.estado === 'revelacion') {
            manejarRevelacion(misDatos?.esHost);
        } else if (sala.estado === 'enJuego') {
            manejarTurnos(sala);
        } else if (sala.estado === 'votacion') {
            manejarVotacion(sala);
        } else if (sala.estado === 'resultado') {
            manejarJuicioAnimado(sala, misDatos?.esHost);
        }
    });
}

function actualizarListaLobby(esHost) {
    document.getElementById('configuracion-host').style.display = esHost ? 'block' : 'none';
    const lista = document.getElementById('lista-jugadores-host');
    lista.innerHTML = '';
    jugadoresActuales.forEach(j => {
        lista.innerHTML += `<li>${j.nombre} ${j.esHost ? '(HOST)' : ''}</li>`;
    });
    document.getElementById('contador-jugadores').textContent = jugadoresActuales.length;
    actualizarBotonInicioJuego();
}

function actualizarBotonInicioJuego() {
    const btn = document.getElementById('btn-iniciar-juego');
    if(jugadoresActuales.length >= MIN_JUGADORES) btn.disabled = false;
    else btn.disabled = true;
}

// ================= INICIAR PARTIDA Y ROLES =================
document.getElementById('btn-iniciar-juego').addEventListener('click', async () => {
    const apiKey = document.getElementById('input-api-key').value.trim();
    const contexto = await generarContextoIA(apiKey);
    const usaDoble = document.getElementById('checkbox-agente-doble').checked;

    let jugArray = [...jugadoresActuales].sort(() => Math.random() - 0.5);
    const impostorId = jugArray[0].id;
    const dobleId = (usaDoble && jugArray.length >= 4) ? jugArray[1].id : null;

    let updates = { estado: 'revelacion', 'configuracion/palabra': contexto.palabra, 'configuracion/tema': contexto.categoria, ordenTurnos: jugArray.map(j => j.id), turnoIndex: 0, votos: {} };

    jugArray.forEach(j => {
        let rol = "Tripulante", palabra = contexto.palabra;
        if(j.id === impostorId) { rol = "Impostor"; palabra = "????"; }
        else if(j.id === dobleId) { rol = "Agente Doble"; palabra = "----"; }
        updates[`jugadores/${j.id}/rol`] = rol;
        updates[`jugadores/${j.id}/palabraSecreta`] = palabra;
        updates[`jugadores/${j.id}/tema`] = contexto.categoria;
        updates[`jugadores/${j.id}/votos`] = 0;
    });

    db.ref(`salas/${codigoSalaActual}`).update(updates);
});

function manejarRevelacion(esHost) {
    cambiarVista('vista-revelacion');
    const card = document.getElementById('card-rol-contenedor');
    document.getElementById('rol-revelacion-display').textContent = `Tu Rol: ${miRolActual}`;
    document.getElementById('tema-valor-revelacion').textContent = miTemaActual;
    document.getElementById('palabra-revelacion-display').textContent = miPalabraSecreta;

    card.className = "caja-rol"; // Reset
    if(miRolActual === 'Impostor') card.classList.add('glitch-red');
    
    document.getElementById('btn-iniciar-discusion').style.display = esHost ? 'block' : 'none';
    document.getElementById('aviso-espera-discusion').style.display = esHost ? 'none' : 'block';
}

document.getElementById('btn-iniciar-discusion').onclick = () => {
    db.ref(`salas/${codigoSalaActual}`).update({ estado: 'enJuego', tiempoTurno: 10 });
};

// ================= SISTEMA DE TURNOS Y MICRÓFONO =================
let timerInterval;
function manejarTurnos(sala) {
    cambiarVista('vista-juego');
    document.getElementById('tema-valor').textContent = miTemaActual;
    document.getElementById('rol-juego-display').textContent = miRolActual;
    document.getElementById('palabra-secreta-display').textContent = miPalabraSecreta;
    document.getElementById('contenedor-adivinanza-impostor').style.display = (miRolActual === 'Impostor') ? 'block' : 'none';

    const esHost = jugadoresActuales.find(j => j.id === miId)?.esHost;
    document.getElementById('btn-forzar-votacion').style.display = esHost ? 'block' : 'none';

    const jugadorActivoId = sala.ordenTurnos[sala.turnoIndex];
    const jugadorActivo = sala.jugadores[jugadorActivoId];
    
    document.getElementById('banner-turnos').textContent = `🎤 Habla ahora: ${jugadorActivo.nombre}`;
    
    clearInterval(timerInterval);
    let tiempo = sala.tiempoTurno || 10;
    document.getElementById('timer-display').textContent = `${tiempo}s`;

    timerInterval = setInterval(() => {
        tiempo--;
        document.getElementById('timer-display').textContent = `${tiempo}s`;
        if(tiempo <= 3 && tiempo > 0) playTick(); // Audio
        
        if(tiempo <= 0) {
            clearInterval(timerInterval);
            if(esHost) avanzarTurno(sala);
        }
    }, 1000);
}

function avanzarTurno(sala) {
    let prox = sala.turnoIndex + 1;
    if(prox < sala.ordenTurnos.length) db.ref(`salas/${codigoSalaActual}`).update({ turnoIndex: prox, tiempoTurno: 10 });
    else db.ref(`salas/${codigoSalaActual}`).update({ estado: 'votacion' });
}

document.getElementById('btn-forzar-votacion').onclick = () => db.ref(`salas/${codigoSalaActual}`).update({ estado: 'votacion' });

// Micrófono del Impostor
const btnMicro = document.getElementById('btn-microfono-impostor');
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES';

btnMicro.onmousedown = btnMicro.ontouchstart = (e) => { e.preventDefault(); recognition.start(); lanzarToast("Escuchando..."); };
btnMicro.onmouseup = btnMicro.ontouchend = () => recognition.stop();

recognition.onresult = async (event) => {
    const dicha = event.results[0][0].transcript.toLowerCase().trim();
    const snap = await db.ref(`salas/${codigoSalaActual}/configuracion/palabra`).once('value');
    const palabraReal = snap.val().toLowerCase().trim();
    
    document.getElementById('feedback-voz').textContent = `Escuché: "${dicha}"`;

    if(dicha.includes(palabraReal) || palabraReal.includes(dicha)) {
        db.ref(`salas/${codigoSalaActual}`).update({ estado: 'resultado', ganadorDirecto: 'Impostor (Asesinato por voz)' });
    } else {
        lanzarToast("❌ Palabra incorrecta");
    }
};

// ================= VOTACIÓN Y JUICIO ANIMADO =================
function manejarVotacion(sala) {
    clearInterval(timerInterval);
    cambiarVista('vista-votacion');
    const grid = document.getElementById('opciones-votacion');
    grid.innerHTML = '';

    jugadoresActuales.forEach(j => {
        const btn = document.createElement('button');
        btn.className = 'btn-votar';
        btn.textContent = j.nombre;
        btn.onclick = () => {
            db.ref(`salas/${codigoSalaActual}/jugadores/${j.id}/votos`).transaction(v => (v || 0) + 1);
            lanzarToast("Voto registrado");
            grid.style.pointerEvents = 'none';
            // Simplificación: Si el Host vota, termina la votación
            if(jugadoresActuales.find(p => p.id === miId)?.esHost) setTimeout(() => db.ref(`salas/${codigoSalaActual}`).update({ estado: 'resultado' }), 2000);
        };
        grid.appendChild(btn);
    });
}

function manejarJuicioAnimado(sala, esHost) {
    cambiarVista('vista-resultado');
    playImpact();
    
    const anim = document.getElementById('jugador-expulsado-anim');
    const display = document.getElementById('jugador-eliminado-display');
    
    anim.classList.remove('vuela-activa'); void anim.offsetWidth; // Restart anim

    if(sala.ganadorDirecto) {
        anim.textContent = "🔪"; anim.classList.add('vuela-activa');
        display.textContent = `¡EL IMPOSTOR GANÓ! Adivinó por voz.`;
        display.style.color = "var(--color-red)";
    } else {
        let maxVotos = -1, expId = null;
        Object.values(sala.jugadores).forEach(j => { if(j.votos > maxVotos) { maxVotos = j.votos; expId = j.id; }});
        
        const expulsado = sala.jugadores[expId];
        anim.textContent = "👤"; anim.classList.add('vuela-activa');
        
        setTimeout(() => {
            if(expulsado.rol === 'Impostor') { display.textContent = `¡VICTORIA! ${expulsado.nombre} era el Impostor.`; display.style.color = "var(--color-green)"; }
            else if(expulsado.rol === 'Agente Doble') { display.textContent = `¡CAOS! ${expulsado.nombre} era el Agente Doble.`; display.style.color = "var(--color-orange)"; }
            else { display.textContent = `ERROR FATAL. ${expulsado.nombre} era Tripulante. Gana el Impostor.`; display.style.color = "var(--color-red)"; }
        }, 1500);
    }
    
    document.getElementById('acciones-finales-host').style.display = esHost ? 'flex' : 'none';
}

document.getElementById('btn-reiniciar-partida-resultado').onclick = () => {
    db.ref(`salas/${codigoSalaActual}`).update({ estado: 'esperando', votos: null });
};

window.abandonarSala = () => window.location.reload();