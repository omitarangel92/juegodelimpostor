// cliente.js
// ================= FIREBASE =================
const _fbk1 = "QUl6YVN5QkZXRW"; const _fbk2 = "l6bjZObjFpRGt2";
const _fbk3 = "WnIyRmtOM1Zmbjd"; const _fbk4 = "JV0dJdUcw";
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
    const t = document.createElement('div');
    t.className = 'toast'; t.innerText = msg;
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

// ================= REGLAS =================
document.getElementById('btn-reglas').onclick = (e) => {
    e.preventDefault();
    const reglasTexto = `
        <p>¡Bienvenido a la Nave! Aquí pondrás a prueba tu capacidad de engaño y deducción.</p>

        <h3 style="color:var(--color-secondary)">🚀 1. Antes de empezar</h3>
        <ul>
            <li><b>Tu nombre:</b> Es lo único que verán los demás jugadores de ti.</li>
            <li><b>Crear sala:</b> Genera un código de 4 letras y te convierte en el Capitán (Host).</li>
            <li><b>Unirse a sala:</b> Cualquiera con ese código entra a tu misma partida.</li>
            <li><b>Compartir código:</b> El botón 🔗 abre el menú para enviarlo por WhatsApp, mensajes, etc.</li>
        </ul>

        <h3 style="color:var(--color-primary)">⚙️ 2. Sala de Configuración (solo el Capitán)</h3>
        <ul>
            <li><b>Nivel de Clasificación:</b> Familiar (desde 10 años) o Adultos +18 (humor crudo, nunca contenido sexual explícito).</li>
            <li><b>Agente Blanco:</b> Activa o desactiva un rol extra.</li>
            <li><b>Memoria IA:</b> La IA recuerda las palabras ya usadas en tu sala y no las repite.</li>
            <li><b>Despegar:</b> Necesitas mínimo 3 tripulantes para iniciar.</li>
        </ul>

        <h3 style="color:var(--color-secondary)">🧠 3. La Categoría y la Palabra</h3>
        <ul>
            <li>Cada partida, la IA inventa una <b>categoría</b> (ej: "Cosas que hay en una mochila") y elige <b>una sola palabra secreta</b> dentro de ella.</li>
            <li>La palabra siempre es simple y de una sola palabra.</li>
        </ul>

        <h3 style="color:var(--color-primary)">🎭 4. Los Roles</h3>
        <ul>
            <li><b style="color:var(--color-green)">🟩 TRIPULANTE:</b> Conoce la categoría Y la palabra secreta. Misión: dar una pista real pero no demasiado obvia.</li>
            <li style="margin-top:10px"><b style="color:var(--color-red)">🟥 IMPOSTOR:</b> Solo ve la categoría, NUNCA la palabra. Misión: fingir que la sabe. <b>Poder especial 🌟:</b> puede tocar el 🎤 en cualquier momento para adivinar la palabra y ganar al instante.</li>
            <li style="margin-top:10px"><b style="color:var(--color-orange)">⬜ AGENTE BLANCO:</b> <b>Sí conoce la categoría</b> (la ve en pantalla), pero <b>NO conoce la palabra secreta</b> y tampoco es Impostor. Misión: sobrevivir fingiendo que sabe algo, apoyándose solo en la categoría.</li>
        </ul>

        <h3 style="color:var(--color-secondary)">🗣️ 5. Fases de la Partida</h3>
        <ol>
            <li><b>Revelación:</b> Cada quien ve su rol y su palabra en privado. El Agente Blanco ve la categoría pero donde debería ir la palabra aparece "----".</li>
            <li><b>Discusión:</b> Turnos de 15 segundos. En tu turno, dices UNA pista corta sin decir la palabra directamente.</li>
            <li><b>Votación:</b> Toca al jugador que más sospeches. Puedes cambiar tu voto hasta que el Capitán la cierre.</li>
            <li><b>Veredicto de la ronda:</b> Se revela a quién expulsaron y qué rol tenía.</li>
        </ol>

        <h3 style="color:var(--color-primary)">🔁 6. Rondas múltiples</h3>
        <p>Una partida NO termina con una sola votación. Continúa hasta que un bando cumpla su objetivo:</p>
        <ul>
            <li><b>Empate en la votación:</b> nadie es expulsado. La IA se burla de la tripulación y arranca una <b>nueva ronda automática en 5 segundos</b>.</li>
            <li><b>Expulsan a un Tripulante inocente:</b> queda <b>🔒 eliminado permanentemente</b> — sigue viendo la partida pero no puede hablar ni votar. Nueva ronda en 5 segundos con los sobrevivientes.</li>
            <li><b>Expulsan al Agente Blanco:</b> el juego termina al instante (¡él gana!).</li>
            <li><b>Expulsan a un Impostor:</b> si quedan más impostores vivos, la partida sigue. Si era el último, ganan los Tripulantes.</li>
            <li><b>Dos empates seguidos:</b> los Impostores ganan por incompetencia de la tripulación.</li>
            <li><b>Superioridad numérica:</b> si los Impostores vivos igualan o superan a los Tripulantes vivos, ganan automáticamente.</li>
        </ul>

        <h3 style="color:var(--color-secondary)">🏆 7. Cómo se gana</h3>
        <ul>
            <li><b style="color:var(--color-green)">Tripulantes ganan</b> si logran expulsar a TODOS los Impostores.</li>
            <li><b style="color:var(--color-red)">Impostores ganan</b> si: (a) igualan o superan en número a los tripulantes, (b) hay dos empates seguidos, o (c) uno adivina la palabra por el micrófono.</li>
            <li><b style="color:var(--color-orange)">Agente Blanco gana</b> si logra que lo expulsen a él.</li>
        </ul>

        <h3 style="color:var(--color-primary)">🤖 8. Humanos vs. IA</h3>
        <ul>
            <li><b>Los humanos</b> deciden todo: dan pistas, sospechan, votan y deducen.</li>
            <li><b>La IA</b> inventa categoría y palabra, se burla de la tripulación entre rondas, y al final redacta un <b>mensaje personalizado y distinto para CADA jugador</b> (incluyendo el Capitán y los eliminados).</li>
        </ul>
    `;
    mostrarModal("📜 ARCHIVOS CLASIFICADOS", reglasTexto, false);
};

// ================= COMPARTIR CÓDIGO =================
document.getElementById('btn-whatsapp').onclick = async () => {
    const url = window.location.href;
    const texto = `¡Únete a mi partida de El Impostor! 🕵️\nCódigo de Sala: ${codigoSalaActual}`;
    if (navigator.share) {
        try { await navigator.share({ title: 'Juego El Impostor', text: texto, url }); }
        catch (err) { console.log("Compartir cancelado."); }
    } else {
        navigator.clipboard.writeText(`${texto}\n${url}`);
        lanzarToast("🔗 Enlace copiado al portapapeles");
    }
};

// ================= AUDIO =================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx, masterGain, ambienceGain;
let ambienceNodes = [], ambienceIntervals = [];
let audioDesbloqueado = false, ambienceIniciada = false, ambienceActual = null;
let audioMuted = localStorage.getItem('impostor_audio_muted') === 'true';

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = audioMuted ? 0 : 1;
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    audioDesbloqueado = true;
    actualizarIconoMute();
    if (!ambienceIniciada) { ambienceIniciada = true; playSciFiAmbience('lobby'); }
}
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });

function actualizarIconoMute() {
    const btn = document.getElementById('btn-mute-audio');
    if (btn) btn.textContent = audioMuted ? '🔇' : '🔊';
}
document.getElementById('btn-mute-audio')?.addEventListener('click', () => {
    initAudio();
    audioMuted = !audioMuted;
    localStorage.setItem('impostor_audio_muted', audioMuted);
    if (masterGain) masterGain.gain.linearRampToValueAtTime(audioMuted ? 0 : 1, audioCtx.currentTime + 0.3);
    actualizarIconoMute();
});
actualizarIconoMute();

const NOTAS_DESTELLO = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
function crearDestelloEstelar(destino) {
    if (!audioDesbloqueado) return;
    const freq = NOTAS_DESTELLO[Math.floor(Math.random() * NOTAS_DESTELLO.length)];
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    osc.connect(gain); gain.connect(destino);
    const t = audioCtx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 1.5);
    gain.gain.linearRampToValueAtTime(0, t + 4.5);
    osc.start(t); osc.stop(t + 4.6);
}

function playSciFiAmbience(tipo) {
    if (!audioDesbloqueado) return;
    if (ambienceActual === tipo) return;
    stopAmbience();
    ambienceGain = audioCtx.createGain();
    ambienceGain.connect(masterGain);
    ambienceActual = tipo;

    if (tipo === 'lobby') {
        [36.71, 36.94].forEach(f => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine'; osc.frequency.value = f;
            osc.connect(ambienceGain); osc.start();
            ambienceNodes.push(osc);
        });
        const padGain = audioCtx.createGain(); padGain.gain.value = 0.5;
        const filtro = audioCtx.createBiquadFilter();
        filtro.type = 'lowpass'; filtro.frequency.value = 700; filtro.Q.value = 3;
        filtro.connect(padGain); padGain.connect(ambienceGain);
        ambienceNodes.push(filtro, padGain);
        [73.42, 92.50, 110.00, 146.83].forEach(f => {
            const osc = audioCtx.createOscillator();
            osc.type = 'triangle'; osc.frequency.value = f;
            osc.connect(filtro); osc.start();
            ambienceNodes.push(osc);
        });
        const lfoFiltro = audioCtx.createOscillator();
        lfoFiltro.type = 'sine'; lfoFiltro.frequency.value = 0.045;
        const lfoFiltroGain = audioCtx.createGain(); lfoFiltroGain.gain.value = 450;
        lfoFiltro.connect(lfoFiltroGain); lfoFiltroGain.connect(filtro.frequency);
        lfoFiltro.start();
        ambienceNodes.push(lfoFiltro, lfoFiltroGain);
        ambienceGain.gain.setValueAtTime(0, audioCtx.currentTime);
        ambienceGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 5);
        ambienceIntervals.push(setInterval(() => {
            if (Math.random() < 0.65) crearDestelloEstelar(ambienceGain);
        }, 2600 + Math.random() * 2000));

    } else if (tipo === 'votacion') {
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(110, audioCtx.currentTime);
        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 2;
        const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.5;
        lfo.connect(lfoGain); lfoGain.connect(ambienceGain.gain);
        lfo.start(); osc.start();
        ambienceNodes.push(osc, lfo);
        ambienceGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    }
}

function stopAmbience() {
    ambienceActual = null;
    ambienceIntervals.forEach(id => clearInterval(id));
    ambienceIntervals = [];
    if (ambienceGain && ambienceNodes.length > 0) {
        ambienceGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
        setTimeout(() => {
            ambienceNodes.forEach(n => {
                if (typeof n.stop === 'function') { try { n.stop(); } catch (e) {} }
                n.disconnect();
            });
            ambienceNodes = [];
            if (ambienceGain) ambienceGain.disconnect();
        }, 1500);
    }
}

function playTick() {
    if (!audioDesbloqueado || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.type = 'square'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playImpact() {
    if (!audioDesbloqueado || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    osc.start(); osc.stop(audioCtx.currentTime + 0.8);
}

// ================= VARIABLES GLOBALES =================
let nombreJugador = '', codigoSalaActual = '';
let miId = Date.now().toString(36) + Math.random().toString(36).substring(2);
let jugadoresActuales = [], miRolActual = '', miPalabraSecreta = '', miTemaActual = '';
let estoyVivo = true;
const MIN_JUGADORES = 3, MAX_JUGADORES = 15;
let localTurnoIndex = -1;
let modoJuegoActual = 'familiar';
let ultimoEstadoProcesado = null;
let intermedioTimerLanzado = false;
let timerInterval;

// ================= UTILIDADES =================
function generarCodigoSala() {
    let r = ''; const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 4; i++) r += c.charAt(Math.floor(Math.random() * c.length));
    return r;
}

function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function barajarFisherYates(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function construirOrdenVivos() {
    const vivos = barajarFisherYates(jugadoresActuales.filter(j => j.vivo !== false));
    const obj = {};
    vivos.forEach((j, idx) => obj[idx] = j.id);
    return obj;
}

window.cambiarVista = function (vistaId) {
    document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
    document.getElementById(vistaId).classList.add('activa');
    if (vistaId === 'vista-lobby') actualizarBotonInicioJuego();
};

window.setDificultad = async function (modo) {
    if (modo === 'adultos' && modoJuegoActual !== 'adultos') {
        const ok = await mostrarModal(
            "🔞 Modo Adultos",
            "<p>Este modo usa humor crudo y temas de adultos.</p><p>Sin groserías ni contenido sexual explícito, pero sí situaciones incómodas y humor negro. Confirma que todos son mayores de edad.</p>",
            true
        );
        if (!ok) return;
    }
    modoJuegoActual = modo;
    document.getElementById('card-familiar').classList.remove('activa');
    document.getElementById('card-adultos').classList.remove('activa');
    document.getElementById('card-' + modo).classList.add('activa');
};

// ================= INTELIGENCIA ARTIFICIAL =================
async function generarContextoIA(dificultad) {
    const snapHistorial = await db.ref(`salas/${codigoSalaActual}/historial`).once('value');
    let historial = snapHistorial.val() || [];

    try {
        const modeloUso = "openai/gpt-oss-120b";
        const semilla = Date.now() + Math.random();
        const restriccion = historial.length > 0
            ? `PROHIBIDO repetir estas palabras o conceptos ya usados: ${historial.join(', ')}.` : '';

        let systemPrompt, promptEnvio;

        if (dificultad === 'adultos') {
            const temas = ["salir de fiesta", "resacas y crudas", "citas y relaciones desastrosas",
                "el trabajo de oficina", "crisis de los 30", "despedidas de soltero/a",
                "vicios cotidianos (alcohol, cigarro, cafeína)", "humor negro sobre la adultez"];
            const temaRandom = temas[Math.floor(Math.random() * temas.length)];
            systemPrompt = "Eres diseñador de un juego de fiesta para ADULTOS (18+): humor crudo, situaciones incómodas de la vida adulta. SIN groserías ni contenido sexual explícito. Respondes ÚNICAMENTE con JSON válido.";
            promptEnvio = `Inventa una categoría corta y con humor adulto (inspiración: "${temaRandom}") y UNA palabra secreta de esa categoría. La palabra debe ser EXACTAMENTE UNA (sin espacios). Referencia a vicios, vergüenzas adultas o situaciones incómodas, pero SIN groserías ni actos sexuales explícitos.\n${restriccion}\nSemilla: ${semilla}.\nJSON: {"categoria":"...","palabra":"..."}`;
        } else {
            const temas = ["animales", "comida", "objetos de la casa", "el cole", "el parque",
                "superhéroes", "deportes", "ropa", "vehículos", "criaturas de cuentos",
                "el zoológico", "cumpleaños", "vacaciones"];
            const contextos = ["un desastre chistoso", "una fiesta", "un viaje",
                "un día en la escuela", "la vida diaria", "una aventura"];
            const temaRandom = temas[Math.floor(Math.random() * temas.length)];
            const subTema = contextos[Math.floor(Math.random() * contextos.length)];
            systemPrompt = "Respondes ÚNICAMENTE con JSON válido. Diseñas para un juego familiar +10 años. La palabra secreta SIEMPRE debe ser simple, cotidiana y reconocible por cualquier niño.";
            promptEnvio = `Inventa una CATEGORÍA divertida (inspiración: "${temaRandom}" en contexto "${subTema}") y UNA palabra secreta de esa categoría.\nReglas: EXACTAMENTE UNA palabra, sin espacios, que cualquier niño de 10 años reconozca. PROHIBIDAS: palabras técnicas, científicas o poco comunes.\nBUENAS: Perro, Pizza, Bicicleta, Payaso, Zapato, Helado, Robot, Dinosaurio.\nMALAS: Cocotero, Alambique, Ornitorrinco, Sextante.\n${restriccion}\nSemilla: ${semilla}.\nJSON: {"categoria":"...","palabra":"..."}`;
        }

        const response = await fetch('/api/ia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modeloUso,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: promptEnvio }
                ],
                response_format: { type: "json_object" },
                temperature: dificultad === 'adultos' ? 1.0 : 0.9,
                reasoning_effort: "low"
            })
        });

        if (!response.ok) throw new Error(`Error servidor IA (${response.status})`);
        const data = await response.json();
        const jsonObj = JSON.parse(data.choices[0].message.content);
        if (!jsonObj.categoria || !jsonObj.palabra) throw new Error("Respuesta IA incompleta");
        if (/\s/.test(jsonObj.palabra.trim())) throw new Error(`IA devolvió frase: "${jsonObj.palabra}"`);

        historial.push(jsonObj.palabra);
        await db.ref(`salas/${codigoSalaActual}/historial`).set(historial);
        return jsonObj;

    } catch (e) {
        console.error("⚠️ IA falló, usando banco de emergencia:", e.message);
        const banco = (window.BANCO_PALABRAS && window.BANCO_PALABRAS[dificultad]) || window.BANCO_PALABRAS.familiar;
        const disponibles = banco.filter(item => !historial.includes(item.palabra));
        const pool = disponibles.length > 0 ? disponibles : banco;
        const elegido = pool[Math.floor(Math.random() * pool.length)];
        historial.push(elegido.palabra);
        await db.ref(`salas/${codigoSalaActual}/historial`).set(historial);
        return elegido;
    }
}

// ================= JUEZ SARCÁSTICO FINAL =================
async function generarVeredictosIA(situacion, dificultad, roster) {
    const rosterTexto = roster.map(j =>
        `id:"${j.id}" nombre:"${j.nombre}" rol:"${j.rol}" resultado:"${j.gano ? 'GANÓ' : 'PERDIÓ'}"`
    ).join('\n');

    // ---- PROMPTS DIFERENCIADOS POR DIFICULTAD ----
    const systemPrompt = dificultad === 'adultos'
        ? `Eres el juez más cruel y gracioso de un juego de fiesta para adultos. Tu especialidad es humillar a los perdedores con frases tan certeras y específicas a su rol que se van a reír mientras se sienten mal consigo mismos. A los ganadores también los tratas con sarcasmo: los felicitas pero con una pulla que les baja el ego. REGLAS ESTRICTAS: sin groserías, sin insultos personales reales, sin contenido sexual. El humor es situacional, específico al rol que jugó cada persona, y tan preciso que duele. Respondes ÚNICAMENTE con JSON válido.`
        : `Eres el juez más pícaro y gracioso de un juego familiar para todas las edades. A los perdedores les das frases que los hacen reír de vergüenza ajena — algo que los deja en ridículo de forma divertida y sin crueldad real. A los ganadores los felicitas con un halago que tiene trampa — algo bueno pero con una pulla suave al final. Todo apto para niños de 10 años en adelante. Nada ofensivo. Respondes ÚNICAMENTE con JSON válido.`;

    const instruccionesPorRol = dificultad === 'adultos' ? `
INSTRUCCIONES PARA CADA ROL (adultos):
- IMPOSTOR que PERDIÓ: humíllalo por ser tan malo mintiendo que hasta su cara lo delataba. Algo como "actuaste tan sospechoso que hasta el Wi-Fi de la sala te quería expulsar."
- IMPOSTOR que GANÓ: felicítalo con sarcasmo, algo como "ganaste, pero todos sabemos que fue de chiripa — la próxima vez no te salvas."
- TRIPULANTE que PERDIÓ: búrlate de que votó mal o no supo leer las pistas. Algo como "tenías la respuesta en la cara del impostor y aun así votaste por el inocente. Impresionante nivel de ceguera."
- TRIPULANTE que GANÓ: halago con trampa, algo como "bien jugado, aunque admitamos que dudaste tres veces antes de votar bien."
- AGENTE BLANCO que PERDIÓ: búrlate de que no logró confundir a nadie. Algo como "se supone que debías sembrar dudas, pero lo único que sembraste fue lástima."
- AGENTE BLANCO que GANÓ: sarcasmo tipo "ganaste siendo el más inútil de la sala — eso sí es un talento especial."` : `
INSTRUCCIONES PARA CADA ROL (familiar):
- IMPOSTOR que PERDIÓ: algo divertido tipo "te descubrieron tan rápido que ni el perro de la casa te hubiera creído."
- IMPOSTOR que GANÓ: halago con trampa tipo "¡ganaste! aunque todos sabemos que fue porque los demás son muy despistados."
- TRIPULANTE que PERDIÓ: algo como "tenías toda la información y aun así votaste mal — eso tiene mérito al revés."
- TRIPULANTE que GANÓ: tipo "¡bien! aunque tardaste tanto en decidir que casi se nos duerme el impostor esperando."
- AGENTE BLANCO que PERDIÓ: algo como "tu misión era confundir a todos y lo que lograste fue confundirte a ti mismo."
- AGENTE BLANCO que GANÓ: tipo "ganaste siendo el más misterioso de todos — o el más callado, que a veces es lo mismo."`;

    const promptEnvio = `Situación final de la partida: "${situacion}"

Jugadores (incluye eliminados en rondas anteriores):
${rosterTexto}

${instruccionesPorRol}

REGLAS DE FORMATO:
- Máximo 25 palabras por frase.
- Cada frase DEBE mencionar implícitamente el rol o lo que hizo ese jugador — nada genérico que sirva para cualquiera.
- Las frases de perdedores deben hacer reír AL LEERLAS, no solo ser negativas — el humor es la clave.
- Las frases de ganadores deben tener un halago real seguido de una pulla que lo relativice.
- NUNCA repitas la misma estructura de frase para dos jugadores distintos.
- Sin groserías. Sin insultos personales reales.

Devuelve JSON con los ids exactos como llaves:
{"${roster[0]?.id || 'id1'}":"frase aquí","otro_id":"frase aquí"}`;

    const response = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: promptEnvio }
            ],
            response_format: { type: "json_object" },
            temperature: 1.2,
            reasoning_effort: "low"
        })
    });
    if (!response.ok) throw new Error(`Error servidor IA (${response.status})`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

// ================= BURLA INTERMEDIA =================
async function generarBurlaIntermedia(situacion, dificultad) {
    const systemPrompt = dificultad === 'adultos'
        ? `Eres un comentarista deportivo que narra el desastre de una tripulación adulta que acaba de cagar una votación. Tu comentario es cruel, gracioso y específico a lo que pasó. Sin groserías. Máximo 30 palabras. Solo JSON.`
        : `Eres el narrador burlón de un juego familiar que acaba de ver a la tripulación votar pésimo. Tu comentario es divertido, juguetón y específico a lo que pasó. Apto para niños. Máximo 30 palabras. Solo JSON.`;

    const promptEnvio = `Lo que acaba de pasar: "${situacion}"

La partida continúa — los sobrevivientes tienen otra oportunidad. Escribe UNA sola frase que: (1) se burle específicamente de lo que pasó, (2) sea tan precisa que duela y haga reír al mismo tiempo, (3) anticipe que la próxima ronda puede ser peor aún.

JSON: {"mensaje":"..."}`;

    try {
        const response = await fetch('/api/ia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: promptEnvio }
                ],
                response_format: { type: "json_object" },
                temperature: 1.2,
                reasoning_effort: "low"
            })
        });
        if (!response.ok) throw new Error("Fallo IA intermedia");
        const data = await response.json();
        const obj = JSON.parse(data.choices[0].message.content);
        return obj.mensaje || "La tripulación sigue sin dar pie con bola. Nueva ronda...";
    } catch (e) {
        const fallback = [
            "Votaron tan mal que el impostor casi les agradece el favor. Nueva ronda.",
            "La tripulación expulsó al inocente con una convicción que da vergüenza ajena. Siguen.",
            "Nadie se puso de acuerdo. Los impostores tomaron nota y piden otra ronda de lo mismo.",
            "Ese nivel de confusión solo se logra con mucho esfuerzo. O ninguno. Nueva oportunidad.",
            "El impostor lleva dos rondas riéndose en silencio. La tripulación, sin enterarse."
        ];
        return fallback[Math.floor(Math.random() * fallback.length)];
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
    const codigo = generarCodigoSala();
    await db.ref('salas/' + codigo).set({
        estado: 'esperando', hostId: miId, historial: [], empatesConsecutivos: 0,
        jugadores: { [miId]: { id: miId, nombre: nombreJugador, esHost: true, rol: 'Tripulante', votoId: null, vivo: true } }
    });
    configurarEscuchadorSala(codigo);
});

document.getElementById('form-unirse-sala').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('input-codigo').value.toUpperCase();
    const snap = await db.ref('salas/' + codigo).once('value');
    if (!snap.exists() || snap.val().estado !== 'esperando') return lanzarToast('❌ Sala no disponible.');
    if (Object.keys(snap.val().jugadores).length >= MAX_JUGADORES) return lanzarToast('❌ Sala Llena.');
    await db.ref(`salas/${codigo}/jugadores/${miId}`).set({
        id: miId, nombre: nombreJugador, esHost: false, rol: 'Tripulante', votoId: null, vivo: true
    });
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
        estoyVivo = misDatos?.vivo !== false;

        if (sala.estado !== 'enJuego') { localTurnoIndex = -1; clearInterval(timerInterval); }

        if (ultimoEstadoProcesado !== sala.estado) {
            intermedioTimerLanzado = false;
            ultimoEstadoProcesado = sala.estado;
        }

        if (sala.estado === 'esperando') {
            playSciFiAmbience('lobby');
            document.getElementById('configuracion-host').style.display = misDatos?.esHost ? 'block' : 'none';
            const lista = document.getElementById('lista-jugadores-host');
            lista.innerHTML = '';
            jugadoresActuales.forEach(j => {
                lista.innerHTML += `<li>${j.nombre}<span style="color:var(--color-primary);font-size:0.8em">${j.esHost ? ' (Capitán)' : ''}</span></li>`;
            });
            document.getElementById('contador-jugadores').textContent = jugadoresActuales.length;
            actualizarBotonInicioJuego();
            if (!document.getElementById('vista-lobby').classList.contains('activa')) cambiarVista('vista-lobby');

        } else if (sala.estado === 'generando_ronda') {
            stopAmbience(); cambiarVista('vista-carga');

        } else if (sala.estado === 'revelacion') {
            stopAmbience();
            const card = document.getElementById('card-rol-contenedor');
            const rolDisplay = document.getElementById('rol-revelacion-display');
            rolDisplay.textContent = miRolActual;
            card.classList.remove('glitch-red');
            if (miRolActual === 'Impostor') { rolDisplay.style.color = "var(--color-red)"; card.classList.add('glitch-red'); }
            else if (miRolActual === 'Agente Blanco') rolDisplay.style.color = "var(--color-orange)";
            else rolDisplay.style.color = "var(--color-green)";

            document.getElementById('tema-valor-revelacion').textContent = miTemaActual;
            document.getElementById('palabra-revelacion-display').textContent = miPalabraSecreta;

            const avisoAB = document.getElementById('aviso-agente-blanco');
            if (avisoAB) {
                avisoAB.style.display = miRolActual === 'Agente Blanco' ? 'block' : 'none';
                avisoAB.innerHTML = "🕵️ Conoces la categoría pero <b>NO la palabra</b>. Finge saber, siembra dudas.";
            }

            document.getElementById('btn-iniciar-discusion').style.display = misDatos?.esHost ? 'block' : 'none';
            document.getElementById('aviso-espera-discusion').style.display = misDatos?.esHost ? 'none' : 'block';
            if (!document.getElementById('vista-revelacion').classList.contains('activa')) cambiarVista('vista-revelacion');

        } else if (sala.estado === 'enJuego') {
            manejarTurnos(sala, misDatos?.esHost);
        } else if (sala.estado === 'votacion') {
            manejarVotacion(sala, misDatos?.esHost);
        } else if (sala.estado === 'intermedio') {
            manejarIntermedio(sala, misDatos?.esHost);
        } else if (sala.estado === 'resultado') {
            manejarJuicioAnimado(sala, misDatos?.esHost);
        }
    });
}

function actualizarBotonInicioJuego() {
    const btn = document.getElementById('btn-iniciar-juego');
    btn.disabled = jugadoresActuales.length < MIN_JUGADORES;
    const aviso = document.getElementById('min-jugadores-aviso');
    if (btn.disabled) {
        aviso.textContent = `Faltan tripulantes (Mín. ${MIN_JUGADORES})`;
        aviso.style.display = 'block';
    } else {
        aviso.style.display = 'none';
    }
}

async function procesarCreacionDeRonda() {
    db.ref(`salas/${codigoSalaActual}`).update({ estado: 'generando_ronda' });
    const usaDoble = document.getElementById('checkbox-agente-doble')?.checked || false;
    const contexto = await generarContextoIA(modoJuegoActual);
    let jugArray = barajarFisherYates(jugadoresActuales);

    let numImpostores = 1;
    if (jugArray.length >= 6) numImpostores = 2;
    if (jugArray.length >= 11) numImpostores = 3;

    const impostoresIds = jugArray.slice(0, numImpostores).map(j => j.id);
    const dobleId = (usaDoble && jugArray.length >= 4 && jugArray[numImpostores] && !impostoresIds.includes(jugArray[numImpostores].id))
        ? jugArray[numImpostores].id : null;

    const ordenObj = {};
    jugArray.forEach((j, idx) => ordenObj[idx] = j.id);

    const updates = {
        estado: 'revelacion',
        'configuracion/palabra': contexto.palabra,
        'configuracion/tema': contexto.categoria,
        'configuracion/dificultad': modoJuegoActual,
        ordenTurnos: ordenObj,
        turnoIndex: 0,
        ganadorDirecto: null,
        veredictosPersonales: null,
        mensajeIntermedio: null,
        empatesConsecutivos: 0
    };

    jugArray.forEach(j => {
        let rol = "Tripulante", palabra = contexto.palabra;
        if (impostoresIds.includes(j.id)) { rol = "Impostor"; palabra = "????"; }
        else if (j.id === dobleId) { rol = "Agente Blanco"; palabra = "----"; }
        updates[`jugadores/${j.id}/rol`] = rol;
        updates[`jugadores/${j.id}/palabraSecreta`] = palabra;
        updates[`jugadores/${j.id}/tema`] = contexto.categoria;
        updates[`jugadores/${j.id}/votoId`] = null;
        updates[`jugadores/${j.id}/vivo`] = true;
    });

    db.ref(`salas/${codigoSalaActual}`).update(updates);
}

document.getElementById('btn-iniciar-juego').addEventListener('click', procesarCreacionDeRonda);
document.getElementById('btn-siguiente-ronda').addEventListener('click', procesarCreacionDeRonda);
document.getElementById('btn-volver-lobby').addEventListener('click', () => {
    db.ref(`salas/${codigoSalaActual}`).update({
        estado: 'esperando', ganadorDirecto: null,
        veredictosPersonales: null, mensajeIntermedio: null
    });
});
document.getElementById('btn-iniciar-discusion').onclick = () =>
    db.ref(`salas/${codigoSalaActual}`).update({ estado: 'enJuego', tiempoTurno: 15 });

// ================= TURNOS =================
function manejarTurnos(sala, esHost) {
    if (!document.getElementById('vista-juego').classList.contains('activa')) cambiarVista('vista-juego');

    document.getElementById('tema-valor').textContent = miTemaActual;
    const rolDisplay = document.getElementById('rol-juego-display');
    rolDisplay.textContent = miRolActual;
    if (miRolActual === 'Impostor') rolDisplay.style.color = "var(--color-red)";
    else if (miRolActual === 'Agente Blanco') rolDisplay.style.color = "var(--color-orange)";
    else rolDisplay.style.color = "var(--color-green)";

    document.getElementById('palabra-secreta-display').textContent = miPalabraSecreta;
    document.getElementById('contenedor-adivinanza-impostor').style.display =
        (miRolActual === 'Impostor' && estoyVivo) ? 'block' : 'none';
    document.getElementById('btn-forzar-votacion').style.display =
        (esHost && estoyVivo) ? 'block' : 'none';

    const overlay = document.getElementById('overlay-eliminado');
    if (overlay) overlay.style.display = estoyVivo ? 'none' : 'flex';

    const orden = Array.isArray(sala.ordenTurnos)
        ? sala.ordenTurnos : Object.values(sala.ordenTurnos || {});
    const turnoActualDB = sala.turnoIndex || 0;
    const jugadorActivo = sala.jugadores[orden[turnoActualDB]];
    if (jugadorActivo) document.getElementById('banner-turnos').textContent = `🎤 Habla: ${jugadorActivo.nombre}`;

    if (localTurnoIndex !== turnoActualDB) {
        localTurnoIndex = turnoActualDB;
        clearInterval(timerInterval);
        let tiempo = 15;
        document.getElementById('timer-display').textContent = `${tiempo}s`;

        timerInterval = setInterval(() => {
            tiempo--;
            if (tiempo >= 0) {
                document.getElementById('timer-display').textContent = `${tiempo}s`;
                if (tiempo <= 3 && tiempo > 0) playTick();
            }
            if (tiempo <= 0) {
                clearInterval(timerInterval);
                if (esHost) {
                    const prox = turnoActualDB + 1;
                    if (prox < orden.length) db.ref(`salas/${codigoSalaActual}`).update({ turnoIndex: prox });
                    else db.ref(`salas/${codigoSalaActual}`).update({ estado: 'votacion' });
                }
            }
        }, 1000);
    }
}

document.getElementById('btn-forzar-votacion').onclick = () =>
    db.ref(`salas/${codigoSalaActual}`).update({ estado: 'votacion' });

// ================= ADIVINAR PALABRA =================
const btnMicro = document.getElementById('btn-microfono-impostor');
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES';
let escuchando = false;

btnMicro.onclick = () => {
    if (!escuchando) {
        try { recognition.start(); escuchando = true; btnMicro.classList.add('mic-active'); lanzarToast("🎙️ Habla ahora..."); }
        catch (e) {}
    } else {
        recognition.stop(); escuchando = false; btnMicro.classList.remove('mic-active');
    }
};
recognition.onend = () => { escuchando = false; btnMicro.classList.remove('mic-active'); };
recognition.onresult = (event) => {
    const dicho = event.results[0][0].transcript;
    document.getElementById('feedback-voz').textContent = `Escuchado: "${dicho}"`;
    validarPalabraImpostor(dicho);
};

document.getElementById('btn-enviar-manual').onclick = () => {
    const v = document.getElementById('input-adivinanza-manual').value;
    if (v) validarPalabraImpostor(v);
};

async function validarPalabraImpostor(intento) {
    const intentoNorm = normalizarTexto(intento);
    const snap = await db.ref(`salas/${codigoSalaActual}/configuracion/palabra`).once('value');
    const realNorm = normalizarTexto(snap.val());
    if (intentoNorm.includes(realNorm) || realNorm.includes(intentoNorm)) {
        db.ref(`salas/${codigoSalaActual}`).update({ estado: 'resultado', ganadorDirecto: 'Impostores' });
    } else {
        lanzarToast("❌ No es correcta");
    }
}

// ================= VOTACIÓN =================
function manejarVotacion(sala, esHost) {
    clearInterval(timerInterval);
    if (!document.getElementById('vista-votacion').classList.contains('activa')) {
        cambiarVista('vista-votacion'); playSciFiAmbience('votacion');
    }

    const miVotoActual = sala.jugadores[miId]?.votoId;
    const grid = document.getElementById('opciones-votacion');
    grid.innerHTML = '';

    const vivos = jugadoresActuales.filter(j => j.vivo !== false);
    vivos.forEach(j => {
        const votosRecibidos = jugadoresActuales.filter(p => p.votoId === j.id && p.vivo !== false).length;
        const btn = document.createElement('button');
        btn.className = `btn-votar ${miVotoActual === j.id ? 'seleccionado' : ''}`;
        btn.innerHTML = `${j.nombre}${votosRecibidos > 0 ? ` <span class="votos-badge">${votosRecibidos}</span>` : ''}`;
        if (estoyVivo) {
            btn.onclick = () => {
                db.ref(`salas/${codigoSalaActual}/jugadores/${miId}/votoId`).set(j.id);
                lanzarToast("✅ Voto emitido");
            };
        } else {
            btn.disabled = true;
        }
        grid.appendChild(btn);
    });

    const avisoElim = document.getElementById('aviso-eliminado-votacion');
    if (avisoElim) avisoElim.style.display = estoyVivo ? 'none' : 'block';
    document.getElementById('btn-cerrar-votacion').style.display = esHost ? 'block' : 'none';
    document.getElementById('aviso-espera-votacion').style.display = esHost ? 'none' : 'block';
}

document.getElementById('btn-cerrar-votacion').onclick = () =>
    db.ref(`salas/${codigoSalaActual}`).update({ estado: 'resultado' });

// ================= EVALUACIÓN DE RONDA =================
function evaluarResultadoRonda(sala) {
    if (sala.ganadorDirecto === 'Impostores') {
        return {
            juegoTermina: true, equipoGanador: 'Impostor',
            situacion: "Un impostor adivinó la palabra secreta. La tripulación ni se enteró.",
            expulsado: null, empate: false
        };
    }

    const vivos = jugadoresActuales.filter(j => j.vivo !== false);
    const conteo = {};
    vivos.forEach(j => { if (j.votoId) conteo[j.votoId] = (conteo[j.votoId] || 0) + 1; });

    let max = 0, expId = null, empate = false;
    for (const [id, cant] of Object.entries(conteo)) {
        if (cant > max) { max = cant; expId = id; empate = false; }
        else if (cant === max) empate = true;
    }

    const empatesPrevios = sala.empatesConsecutivos || 0;

    if (empate || max === 0) {
        if (empatesPrevios + 1 >= 2) {
            return {
                juegoTermina: true, equipoGanador: 'Impostor',
                situacion: "Dos empates seguidos. La tripulación es tan indecisa que los impostores ganan sin despeinarse.",
                expulsado: null, empate: true
            };
        }
        return {
            juegoTermina: false, equipoGanador: null,
            situacion: "Empate en la votación. Nadie fue expulsado y los impostores ganan una ronda de ventaja.",
            expulsado: null, empate: true
        };
    }

    const expulsado = sala.jugadores[expId];

    if (expulsado.rol === 'Agente Blanco') {
        return {
            juegoTermina: true, equipoGanador: 'Agente Blanco',
            situacion: `Expulsaron a ${expulsado.nombre}, el Agente Blanco. Cargó con las sospechas y ganó.`,
            expulsado, empate: false
        };
    }

    if (expulsado.rol === 'Impostor') {
        const restantes = jugadoresActuales.filter(j => j.rol === 'Impostor' && j.vivo !== false && j.id !== expId).length;
        if (restantes === 0) {
            return {
                juegoTermina: true, equipoGanador: 'Tripulante',
                situacion: `La tripulación desenmascaró a ${expulsado.nombre}, el último Impostor. Victoria total.`,
                expulsado, empate: false
            };
        }
        return {
            juegoTermina: false, equipoGanador: null,
            situacion: `Expulsaron a ${expulsado.nombre}, un Impostor. Pero aún quedan más infiltrados. La caza continúa.`,
            expulsado, empate: false
        };
    }

    // Tripulante inocente expulsado
    const tripsVivos = jugadoresActuales.filter(j =>
        (j.rol === 'Tripulante' || j.rol === 'Agente Blanco') && j.vivo !== false && j.id !== expId
    ).length;
    const imposVivos = jugadoresActuales.filter(j => j.rol === 'Impostor' && j.vivo !== false).length;

    if (imposVivos >= tripsVivos) {
        return {
            juegoTermina: true, equipoGanador: 'Impostor',
            situacion: `Expulsaron por error a ${expulsado.nombre} (inocente). Los impostores ya son mayoría.`,
            expulsado, empate: false
        };
    }
    return {
        juegoTermina: false, equipoGanador: null,
        situacion: `Expulsaron por error a ${expulsado.nombre}, que era inocente. Los impostores se ríen a lo lejos.`,
        expulsado, empate: false
    };
}

// ================= FASE INTERMEDIA =================
async function manejarIntermedio(sala, esHost) {
    if (!document.getElementById('vista-intermedio').classList.contains('activa')) cambiarVista('vista-intermedio');
    stopAmbience();

    const displayInter = document.getElementById('mensaje-intermedio-display');
    const infoInter = document.getElementById('info-intermedio');

    if (sala.mensajeIntermedio) {
        displayInter.innerHTML = `> ${sala.mensajeIntermedio.burla}`;
        infoInter.innerHTML = sala.mensajeIntermedio.info || '';
    } else {
        displayInter.innerHTML = `<span class="typing-cursor">Analizando el desastre...</span>`;
    }

    if (esHost && sala.mensajeIntermedio && !intermedioTimerLanzado) {
        intermedioTimerLanzado = true;
        setTimeout(async () => {
            const nuevoOrden = construirOrdenVivos();
            const updates = {
                estado: 'enJuego', ordenTurnos: nuevoOrden,
                turnoIndex: 0, mensajeIntermedio: null
            };
            jugadoresActuales.forEach(j => { updates[`jugadores/${j.id}/votoId`] = null; });
            db.ref(`salas/${codigoSalaActual}`).update(updates);
        }, 5000);
    }
}

// ================= JUICIO FINAL =================
async function manejarJuicioAnimado(sala, esHost) {
    if (esHost && !sala.veredictosPersonales && !sala.mensajeIntermedio) {
        const evalRes = evaluarResultadoRonda(sala);
        const snapDif = await db.ref(`salas/${codigoSalaActual}/configuracion/dificultad`).once('value');
        const difReal = snapDif.val() || 'familiar';

        if (!evalRes.juegoTermina) {
            const updates = {
                empatesConsecutivos: evalRes.empate ? (sala.empatesConsecutivos || 0) + 1 : 0
            };
            if (evalRes.expulsado) updates[`jugadores/${evalRes.expulsado.id}/vivo`] = false;
            const burla = await generarBurlaIntermedia(evalRes.situacion, difReal);
            const infoTexto = evalRes.expulsado
                ? `<b>${evalRes.expulsado.nombre}</b> fue expulsado (era ${evalRes.expulsado.rol}) y queda 🔒 bloqueado. Nueva ronda en 5 segundos...`
                : `Nadie fue expulsado. Nueva ronda en 5 segundos con los mismos jugadores...`;
            updates.mensajeIntermedio = { burla, info: infoTexto };
            updates.estado = 'intermedio';
            db.ref(`salas/${codigoSalaActual}`).update(updates);
            return;
        }
    }

    if (!document.getElementById('vista-resultado').classList.contains('activa')) cambiarVista('vista-resultado');
    stopAmbience(); playImpact();

    const terminal = document.getElementById('escaner-terminal');
    const display = document.getElementById('jugador-eliminado-display');
    const acciones = document.getElementById('acciones-finales-host');

    display.style.display = 'none';
    acciones.style.display = 'none';
    terminal.innerHTML = `<span class="typing-cursor">Analizando ADN del sospechoso...</span>`;
    terminal.className = 'terminal-text';

    const evalRes = evaluarResultadoRonda(sala);
    const equipoGanador = evalRes.equipoGanador || 'Impostor';
    let finalMsg = "";

    if (sala.ganadorDirecto) finalMsg = "¡LOS IMPOSTORES GANAN! Adivinaron la palabra.";
    else if (equipoGanador === 'Tripulante') finalMsg = `¡VICTORIA TRIPULANTE! ${evalRes.expulsado ? evalRes.expulsado.nombre + ' era Impostor.' : ''}`;
    else if (equipoGanador === 'Agente Blanco') finalMsg = `¡CAOS! ${evalRes.expulsado.nombre} era el Agente Blanco.`;
    else if (evalRes.empate) finalMsg = "¡EMPATE FATAL! Los impostores se salieron con la suya.";
    else finalMsg = `ERROR FATAL. ${evalRes.expulsado ? evalRes.expulsado.nombre + ' era inocente.' : ''}`;

    function jugadorGano(rol) {
        if (rol === 'Tripulante' && equipoGanador === 'Tripulante') return true;
        if (rol === 'Impostor' && equipoGanador === 'Impostor') return true;
        if (rol === 'Agente Blanco' && equipoGanador === 'Agente Blanco') return true;
        return false;
    }

    const miVictoria = jugadorGano(miRolActual);
    const finalColor = miVictoria ? "green" : "red";

    // Fallback local con frases diferenciadas por rol y resultado
    const FALLBACK_VEREDICTOS = {
        'Impostor_PERDIÓ': [
            "Mentiste tan mal que hasta tu cara lo confesó antes que tú.",
            "Ser impostor requiere actuar. Tú actuaste como si no supieras que eras el impostor.",
            "Tu pista fue tan obvia que la tripulación te agradeció el favor."
        ],
        'Impostor_GANÓ': [
            "Ganaste, pero todos sabemos que fue porque los demás son muy despistados. No te emociones.",
            "Buen trabajo engañando a gente que claramente no estaba prestando atención.",
            "Victoria del impostor. Aunque con esta tripulación, cualquiera hubiera ganado."
        ],
        'Tripulante_PERDIÓ': [
            "Tenías toda la información y aun así votaste mal. Eso tiene mérito al revés.",
            "El impostor te dio pistas falsas y tú dijiste: 'qué pista tan buena'. Increíble.",
            "Votaste con tanta convicción que hasta el impostor se sorprendió."
        ],
        'Tripulante_GANÓ': [
            "Bien jugado, aunque tardaste tanto en decidir que el impostor casi se aburre.",
            "¡Victoria! Aunque admitamos que dudaste tres veces antes de acertar.",
            "Lo lograste. Ahora intenta explicar cómo tardaste tanto en algo tan obvio."
        ],
        'Agente Blanco_PERDIÓ': [
            "Tu misión era sembrar dudas. Lo único que sembraste fue lástima.",
            "Se supone que debías confundir a todos. Terminaste confundiéndote a ti mismo.",
            "Agente Blanco: el rol más difícil del juego, y se nota que no lo sabías."
        ],
        'Agente Blanco_GANÓ': [
            "Ganaste siendo el más misterioso de todos. O el más callado. A veces es lo mismo.",
            "Lograste que te expulsaran. Eso o eres muy bueno o eres muy malo — nunca sabremos.",
            "Victoria del Agente Blanco. Confundiste a todos, incluyendo a ti mismo probablemente."
        ]
    };

    let veredictosMap = sala.veredictosPersonales;

    if (esHost && !veredictosMap) {
        const snapDif = await db.ref(`salas/${codigoSalaActual}/configuracion/dificultad`).once('value');
        const difReal = snapDif.val() || 'familiar';
        const roster = jugadoresActuales.map(j => ({
            id: j.id, nombre: j.nombre, rol: j.rol, gano: jugadorGano(j.rol)
        }));

        try {
            veredictosMap = await generarVeredictosIA(evalRes.situacion, difReal, roster);
        } catch (e) {
            console.error("⚠️ Falló juez IA, usando fallback por rol:", e.message);
            veredictosMap = {};
            roster.forEach(j => {
                const clave = `${j.rol}_${j.gano ? 'GANÓ' : 'PERDIÓ'}`;
                const opciones = FALLBACK_VEREDICTOS[clave] || ["Análisis completado. Los resultados son evidentes."];
                veredictosMap[j.id] = opciones[Math.floor(Math.random() * opciones.length)];
            });
        }
        await db.ref(`salas/${codigoSalaActual}`).update({ veredictosPersonales: veredictosMap });

    } else if (!veredictosMap) {
        let intentos = 0;
        while (!veredictosMap && intentos < 15) {
            await new Promise(r => setTimeout(r, 800));
            const snap = await db.ref(`salas/${codigoSalaActual}/veredictosPersonales`).once('value');
            veredictosMap = snap.val();
            intentos++;
        }
        veredictosMap = veredictosMap || {};
    }

    const veredictoTexto = veredictosMap[miId] || "Análisis completado. Los resultados son evidentes.";

    setTimeout(() => {
        terminal.className = `terminal-text${finalColor === 'red' ? ' red' : ''}`;
        terminal.innerHTML = `> ${veredictoTexto}`;
        display.textContent = finalMsg;
        display.style.display = 'block';
        display.style.color = `var(--color-${finalColor})`;
        display.style.borderLeftColor = `var(--color-${finalColor})`;
        if (esHost) acciones.style.display = 'flex';
    }, 2500);
}

window.abandonarSala = () => window.location.reload();