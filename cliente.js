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

document.getElementById('btn-reglas').onclick = (e) => {
    e.preventDefault();
    const reglasTexto = `
        <p>¡Bienvenido a la Nave! Aquí pondrás a prueba tu capacidad de engaño y deducción.</p>

        <h3 style="color: var(--color-secondary);">🚀 1. Antes de empezar</h3>
        <ul>
            <li><b>Tu nombre:</b> Es lo único que verán los demás jugadores de ti.</li>
            <li><b>Crear sala:</b> Genera un código de 4 letras y te convierte en el Capitán (Host).</li>
            <li><b>Unirse a sala:</b> Cualquiera con ese código entra a tu misma partida.</li>
            <li><b>Compartir código:</b> El botón 🔗 abre el menú para enviarlo por donde quieras (WhatsApp, mensajes, etc).</li>
        </ul>

        <h3 style="color: var(--color-primary);">⚙️ 2. Sala de Configuración (solo el Capitán)</h3>
        <ul>
            <li><b>Nivel de Clasificación:</b> Familiar (apto para todos desde 10 años) o Adultos +18 (humor crudo y groserías, nunca contenido sexual explícito).</li>
            <li><b>Agente Blanco:</b> Activa o desactiva un rol extra (ver sección de roles).</li>
            <li><b>Memoria IA:</b> La IA recuerda las palabras ya usadas en tu sala y nunca las repite en esa partida.</li>
            <li><b>Despegar:</b> Necesitas mínimo 3 tripulantes para iniciar.</li>
        </ul>

        <h3 style="color: var(--color-secondary);">🧠 3. La Categoría y la Palabra</h3>
        <ul>
            <li>Cada ronda, la IA inventa una <b>categoría</b> (una frase, ej: "Cosas que hay en una mochila") y elige <b>una sola palabra secreta</b> dentro de ella.</li>
            <li>La palabra es siempre simple y de una sola palabra — pensada para dar pistas fáciles, no para adivinanzas imposibles.</li>
        </ul>

        <h3 style="color: var(--color-primary);">🎭 4. Los Roles</h3>
        <ul>
            <li><b style="color: var(--color-green);">🟩 TRIPULANTE:</b> Conoce la categoría Y la palabra secreta completas. Misión: dar una pista real pero no demasiado obvia.</li>
            <li style="margin-top:10px;"><b style="color: var(--color-red);">🟥 IMPOSTOR:</b> Solo ve la categoría, NUNCA la palabra. Misión: fingir que la sabe. <b>🌟 Poder especial:</b> en cualquier momento puede tocar el Micrófono 🎤 (o escribirla) para adivinarla y ganar al instante.</li>
            <li style="margin-top:10px;"><b style="color: var(--color-orange);">⬜ AGENTE BLANCO:</b> No conoce ni la categoría ni la palabra, y tampoco es el Impostor. Misión: sobrevivir a la votación fingiendo que sabe algo, sembrando dudas sobre sí mismo.</li>
        </ul>

        <h3 style="color: var(--color-secondary);">🗣️ 5. Fases de la Partida</h3>
        <ol>
            <li><b>Revelación:</b> Cada quien ve su rol y su palabra (o falta de ella) en privado, solo en su pantalla.</li>
            <li><b>Discusión:</b> Turnos de 15 segundos. En tu turno, dices UNA pista corta relacionada a la palabra secreta, sin decirla directamente.</li>
            <li><b>Votación:</b> Toca al jugador que más sospeches que es el Impostor. Puedes cambiar tu voto hasta que el Capitán cierre la votación.</li>
            <li><b>Resultado:</b> Se revela quién era quién, y la IA redacta un veredicto distinto para cada jugador — burlándose o felicitando según cómo le fue a cada uno.</li>
        </ol>

        <h3 style="color: var(--color-primary);">🏆 6. Cómo se gana</h3>
        <ul>
            <li><b style="color: var(--color-green);">Tripulantes ganan</b> si la votación expulsa al Impostor.</li>
            <li><b style="color: var(--color-red);">Impostor gana</b> si nadie es expulsado (empate), si expulsan a un Tripulante inocente, o si adivina la palabra por el micrófono.</li>
            <li><b style="color: var(--color-orange);">Agente Blanco gana</b> si logra ser justo él quien resulte expulsado — su misión era cargar con las sospechas.</li>
        </ul>

        <h3 style="color: var(--color-secondary);">🤖 7. Humanos vs. IA — ¿quién hace qué?</h3>
        <ul>
            <li><b>Los humanos</b> deciden todo lo que pasa en la partida: dan pistas, sospechan, votan y deducen.</li>
            <li><b>La IA</b> inventa la categoría y la palabra de cada ronda (nunca repetidas), y redacta el mensaje final personalizado para cada jugador al terminar.</li>
        </ul>
    `;
    mostrarModal("📜 ARCHIVOS CLASIFICADOS", reglasTexto, false);
};

// ================= COMPARTIR CÓDIGO (WEB SHARE API) =================
document.getElementById('btn-whatsapp').onclick = async () => {
    const url = window.location.href;
    const texto = `¡Únete a mi partida de El Impostor! 🕵️\nCódigo de Sala: ${codigoSalaActual}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Juego El Impostor',
                text: texto,
                url: url
            });
        } catch (err) {
            console.log("El usuario canceló la opción de compartir.");
        }
    } else {
        navigator.clipboard.writeText(`${texto}\n${url}`);
        lanzarToast("🔗 Enlace copiado al portapapeles");
    }
};

// ================= MOTOR DE AUDIO ESPACIAL =================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let audioDesbloqueado = false;
let masterGain = null;       
let ambienceGain = null;     
let ambienceNodes = [];      
let ambienceIntervals = [];  
let audioMuted = localStorage.getItem('impostor_audio_muted') === 'true';
let ambienceIniciada = false; 
let ambienceActual = null;    

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

    if (!ambienceIniciada) {
        ambienceIniciada = true;
        playSciFiAmbience('lobby');
    }
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
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    osc.connect(gain); gain.connect(destino);
    const ahora = audioCtx.currentTime;
    gain.gain.setValueAtTime(0, ahora);
    gain.gain.linearRampToValueAtTime(0.05, ahora + 1.5);
    gain.gain.linearRampToValueAtTime(0, ahora + 4.5);
    osc.start(ahora); osc.stop(ahora + 4.6);
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

        const acorde = [73.42, 92.50, 110.00, 146.83]; 
        acorde.forEach(f => {
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

        const intervalId = setInterval(() => {
            if (Math.random() < 0.65) crearDestelloEstelar(ambienceGain);
        }, 2600 + Math.random() * 2000);
        ambienceIntervals.push(intervalId);

    } else if (tipo === 'votacion') {
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(110, audioCtx.currentTime);

        const lfo = audioCtx.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 2; 
        const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.5;

        lfo.connect(lfoGain); lfoGain.connect(ambienceGain.gain);
        lfo.start(); ambienceNodes.push(osc, lfo);

        ambienceGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc.start();
    }
}

function stopAmbience() {
    ambienceActual = null;
    ambienceIntervals.forEach(id => clearInterval(id));
    ambienceIntervals = [];

    if (ambienceGain && ambienceNodes.length > 0) {
        ambienceGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5); 
        setTimeout(() => {
            ambienceNodes.forEach(node => {
                if (typeof node.stop === 'function') { try { node.stop(); } catch (e) {} }
                node.disconnect();
            });
            ambienceNodes = [];
            if (ambienceGain) ambienceGain.disconnect();
        }, 1500);
    }
}

function playTick() {
    if(!audioDesbloqueado || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(masterGain);
    osc.type = 'square'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playImpact() {
    if(!audioDesbloqueado || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(masterGain);
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
let modoJuegoActual = 'familiar'; 

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

window.setDificultad = async function(modo) {
    if (modo === 'adultos' && modoJuegoActual !== 'adultos') {
        const confirmado = await mostrarModal(
            "🔞 Modo Adultos",
            "<p>Este modo usa humor crudo, groserías y temas de adultos (alcohol, citas, vergüenzas de la vida adulta).</p><p>No es contenido sexual explícito, pero sí es lenguaje fuerte. Confirma que todos los que van a jugar son mayores de edad.</p>",
            true
        );
        if (!confirmado) return; // se queda en el modo anterior si cancela
    }
    modoJuegoActual = modo;
    document.getElementById('card-familiar').classList.remove('activa');
    document.getElementById('card-adultos').classList.remove('activa');
    document.getElementById('card-' + modo).classList.add('activa');
}

function normalizarTexto(texto) {
    if(!texto) return "";
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

// ================= INTELIGENCIA ARTIFICIAL GROQ =================
async function generarContextoIA(dificultad) {
    const snapHistorial = await db.ref(`salas/${codigoSalaActual}/historial`).once('value');
    let historial = snapHistorial.val() || [];

    const planB = {
        familiar: [
            { categoria: "Cosas que un perro destruiría", palabra: "Zapatos" },
            { categoria: "Lo primero que empacas para la playa", palabra: "Toalla" },
            { categoria: "Cosas que se pierden en una mudanza", palabra: "Maleta" },
            { categoria: "Cosas que llevarías a una isla desierta", palabra: "Linterna" },
            { categoria: "Lo que nunca falta en una mochila escolar", palabra: "Lápiz" },
            { categoria: "Cosas que asustan en una casa embrujada", palabra: "Fantasma" },
            { categoria: "Cosas de un cumpleaños", palabra: "Globo" },
            { categoria: "Animales del zoológico", palabra: "Elefante" }
        ],
        adultos: [
            { categoria: "Cosas que dices cuando estás crudo", palabra: "Agua" },
            { categoria: "Excusas para no ir a trabajar", palabra: "Migraña" },
            { categoria: "Cosas de una cita que salió mal", palabra: "Cuenta" },
            { categoria: "Lo que nunca falta en un after office", palabra: "Cerveza" },
            { categoria: "Cosas que dice tu ex", palabra: "Bloqueado" },
            { categoria: "Señales de una crisis de los 30", palabra: "Divorcio" },
            { categoria: "Cosas de una despedida de soltero", palabra: "Tequila" },
            { categoria: "Lo primero que revisas tras una noche de fiesta", palabra: "Celular" }
        ]
    };

    try {
        let temasBase, promptEnvio, systemPrompt;
        // "llama-3.3-70b-versatile" fue descontinuado por Groq (16 ago 2026).
        // Reemplazo recomendado por Groq: openai/gpt-oss-120b (usamos el mismo para ambos modos)
        const modeloUso = "openai/gpt-oss-120b";
        
        const semilla = Date.now() + Math.random(); 
        const restriccion = historial.length > 0 ? `PROHIBIDO repetir estas palabras o conceptos: ${historial.join(', ')}.` : '';

        if (dificultad === 'adultos') {
            temasBase = ["salir de fiesta", "resacas y crudas", "citas y relaciones desastrosas", "el trabajo de oficina", "crisis de los 30", "despedidas de soltero/a", "vicios cotidianos (alcohol, cigarro, cafeína)", "humor negro sobre la adultez"];
            const temaRandom = temasBase[Math.floor(Math.random() * temasBase.length)];

            systemPrompt = "Eres diseñador de un juego de fiesta para ADULTOS (18+), estilo Cards Against Humanity: humor crudo, vulgar, negro y con referencias a alcohol, resacas, citas desastrosas y vergüenzas de la vida adulta. Puedes usar groserías. NO generes descripciones sexuales explícitas, contenido pornográfico, ni nada que sexualice a nadie: el humor es sobre situaciones incómodas y vicios cotidianos, no sobre actos sexuales explícitos. Respondes ÚNICAMENTE con JSON válido.";
            promptEnvio = `Paso 1: Inventa una categoría en forma de frase corta, cruda y con humor de adultos (ej: "Cosas que dices crudo un domingo"). Inspírate en: "${temaRandom}", pero puedes alejarte si se te ocurre algo más gracioso.

Paso 2: Elige SOLO UNA palabra secreta de esa categoría. Debe ser EXACTAMENTE UNA palabra (sin espacios, nunca una frase ni una descripción de una situación — evita algo como "silencio incómodo", en su lugar usa una palabra concreta como "vergüenza" o "cuenta"). Puede ser una grosería, una referencia a alcohol/vicios, o algo vergonzoso de la vida adulta — pero SIN describir actos sexuales ni nada explícito.

${restriccion}
Ignora tu memoria caché usando esta semilla: ${semilla}.
Devuelve ESTRICTAMENTE JSON válido sin formato markdown: {"categoria": "frase aquí", "palabra": "palabra aquí"}`;

        } else {
            temasBase = ["animales", "comida", "objetos de la casa", "el cole", "el parque", "superhéroes", "deportes", "ropa", "vehículos", "criaturas de cuentos", "el zoológico", "cumpleaños", "vacaciones"];
            const contextos = ["un desastre chistoso", "una fiesta", "un viaje", "un día en la escuela", "la vida diaria", "una aventura"];
            const temaRandom = temasBase[Math.floor(Math.random() * temasBase.length)];
            const subTema = contextos[Math.floor(Math.random() * contextos.length)];

            systemPrompt = "Respondes ÚNICAMENTE con JSON válido. Diseñas para un juego familiar +10 años: la categoría puede ser creativa, pero la palabra secreta SIEMPRE debe ser simple, cotidiana y fácil de adivinar para un niño.";
            promptEnvio = `Eres diseñador de un juego de fiesta para GRUPOS FAMILIARES, edades desde 10 años en adelante (niños y adultos jugando juntos).

Paso 1: Inventa una CATEGORÍA en forma de frase corta, divertida y original (ej: "Cosas que encuentras en una mochila escolar"). Usa como inspiración libre: "${temaRandom}" en el contexto de "${subTema}", pero puedes alejarte de esa inspiración si se te ocurre algo más gracioso.

Paso 2: Elige SOLO UNA palabra secreta que pertenezca a esa categoría:
- Debe ser EXACTAMENTE UNA palabra, sin espacios. NUNCA una frase, ni una descripción, ni una combinación de dos palabras (evita "control remoto" o "cepillo de dientes"; usa en su lugar algo como "mochila" o "cepillo").
- Debe ser una palabra que CUALQUIER niño de 10 años reconozca de inmediato.
- PROHIBIDO usar palabras técnicas, científicas, anticuadas o poco comunes en el habla diaria.

Ejemplos de palabras BUENAS: Perro, Pizza, Bicicleta, Piscina, Payaso, Zapato, Helado, Mochila, Robot, Dinosaurio.
Ejemplos de palabras MALAS (evítalas siempre): Cocotero, Alambique, Ornitorrinco, Sextante, Espectrómetro, Efímero, Escafandra.

${restriccion}
Ignora tu memoria caché usando esta semilla: ${semilla}.
Devuelve ESTRICTAMENTE JSON válido sin formato markdown: {"categoria": "frase aquí", "palabra": "palabra simple aquí"}`;
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

        if(!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Fallo del servidor puente (${response.status}): ${errorBody}`);
        }
        
        const data = await response.json();
        const jsonObj = JSON.parse(data.choices[0].message.content);

        if(!jsonObj.categoria || !jsonObj.palabra) throw new Error("Respuesta de IA incompleta: " + JSON.stringify(jsonObj));
        if(/\s/.test(jsonObj.palabra.trim())) throw new Error(`La IA devolvió una frase en vez de una palabra: "${jsonObj.palabra}"`);

        if(jsonObj.palabra) {
            historial.push(jsonObj.palabra);
            await db.ref(`salas/${codigoSalaActual}/historial`).set(historial);
        }

        return jsonObj;

    } catch (e) {
        console.error("⚠️ Fallo IA, activando Plan B:", e.message);
        const banco = planB[dificultad] || planB.familiar;
        return banco[Math.floor(Math.random() * banco.length)];
    }
}

// LÓGICA DEL JUEZ SARCÁSTICO
// JUEZ SARCÁSTICO: un mensaje DISTINTO y personalizado por cada jugador, en una sola llamada a la IA
async function generarVeredictosIA(situacion, dificultad, roster) {
    const rosterTexto = roster.map(j => `id:"${j.id}" nombre:"${j.nombre}" rol:"${j.rol}" resultado:"${j.gano ? 'GANÓ' : 'PERDIÓ'}"`).join('\n');

    const systemPrompt = dificultad === 'adultos'
        ? "Eres el anfitrión sarcástico de un juego de fiesta para ADULTOS. Te burlas de los jugadores con humor negro filoso, cruel pero gracioso, nunca aburrido ni repetitivo. Puedes usar groserías, pero JAMÁS contenido sexual explícito ni nada que sexualice a alguien. Respondes ÚNICAMENTE con JSON válido."
        : "Eres el anfitrión burlón de un juego de fiesta apto para todo público desde 10 años. Te burlas de los jugadores con humor juguetón, ingenioso y cariñoso — nunca con insultos reales. Respondes ÚNICAMENTE con JSON válido.";

    const promptEnvio = `Situación de esta ronda: "${situacion}"

Jugadores de esta partida:
${rosterTexto}

Escribe una frase de burla de MÁXIMO 20 palabras para CADA jugador de la lista:
- Si PERDIÓ: búrlate con más filo/humor de su papel en la derrota.
- Si GANÓ: felicítalo con un halago sarcástico o una pulla juguetona.
Cada frase debe ser distinta entre sí — nunca repitas la misma broma para dos jugadores, ni uses una frase genérica que sirva para cualquiera.

Devuelve ESTRICTAMENTE JSON válido sin markdown, usando EXACTAMENTE los ids de arriba como llaves (no uses los nombres como llave del JSON):
{"${roster[0]?.id || 'id1'}": "frase para ese jugador", "otro_id": "frase para otro jugador"}`;

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
            temperature: 1.1,
            reasoning_effort: "low"
        }) 
    });

    if(!response.ok) throw new Error(`Fallo del servidor puente (${response.status})`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
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
    await db.ref('salas/' + codigo).set({ estado: 'esperando', hostId: miId, historial: [], jugadores: { [miId]: { id: miId, nombre: nombreJugador, esHost: true, rol: 'Tripulante', votoId: null } } });
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
    
    const contexto = await generarContextoIA(modoJuegoActual);

    let jugArray = barajarFisherYates(jugadoresActuales);
    
    let numImpostores = 1;
    if(jugArray.length >= 6) numImpostores = 2;
    if(jugArray.length >= 11) numImpostores = 3;

    const impostoresIds = jugArray.slice(0, numImpostores).map(j => j.id);
    const dobleId = (usaDoble && jugArray.length >= 4 && !impostoresIds.includes(jugArray[numImpostores].id)) ? jugArray[numImpostores].id : null;

    let ordenObj = {}; jugArray.forEach((j, idx) => ordenObj[idx] = j.id);

    let updates = { 
        estado: 'revelacion', 
        'configuracion/palabra': contexto.palabra, 
        'configuracion/tema': contexto.categoria, 
        'configuracion/dificultad': modoJuegoActual, // Guardamos la dificultad en Firebase
        ordenTurnos: ordenObj, 
        turnoIndex: 0, 
        ganadorDirecto: null, 
        veredictosPersonales: null 
    };

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
    db.ref(`salas/${codigoSalaActual}`).update({ estado: 'esperando', ganadorDirecto: null, veredictosPersonales: null });
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

// ================= VOTACIÓN =================
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
            lanzarToast("✅ Voto emitido");
        };
        grid.appendChild(btn);
    });

    document.getElementById('btn-cerrar-votacion').style.display = esHost ? 'block' : 'none';
    document.getElementById('aviso-espera-votacion').style.display = esHost ? 'none' : 'block';
}

document.getElementById('btn-cerrar-votacion').onclick = () => db.ref(`salas/${codigoSalaActual}`).update({ estado: 'resultado' });

// ================= JUICIO FINAL CON ESCÁNER Y COLORES PERSONALIZADOS =================
async function manejarJuicioAnimado(sala, esHost) {
    if(!document.getElementById('vista-resultado').classList.contains('activa')) cambiarVista('vista-resultado');
    stopAmbience(); playImpact();
    
    const terminal = document.getElementById('escaner-terminal');
    const display = document.getElementById('jugador-eliminado-display');
    const acciones = document.getElementById('acciones-finales-host');
    
    display.style.display = 'none';
    acciones.style.display = 'none';
    terminal.innerHTML = `<span class="typing-cursor">Analizando ADN del sospechoso...</span>`;
    terminal.className = 'terminal-text';

    let situacionTexto = "";
    let finalMsg = "";
    let equipoGanador = "";

    if(sala.ganadorDirecto) {
        situacionTexto = "Los impostores ganaron saltándose las reglas y adivinando la palabra secreta de la nada.";
        finalMsg = `¡LOS IMPOSTORES GANAN! Adivinaron la palabra.`; 
        equipoGanador = "Impostor";
    } else {
        let conteo = {};
        jugadoresActuales.forEach(j => { if(j.votoId) conteo[j.votoId] = (conteo[j.votoId] || 0) + 1; });
        
        let max = 0, expId = null, empate = false;
        for (const [idVotado, cantidad] of Object.entries(conteo)) {
            if(cantidad > max) { max = cantidad; expId = idVotado; empate = false; }
            else if(cantidad === max) { empate = true; }
        }

        if(empate || max === 0) {
            situacionTexto = "La tripulación fue tan incompetente que hubo un empate en la votación. Nadie fue expulsado y los impostores ganan terreno.";
            finalMsg = `¡EMPATE! Nadie fue expulsado.`; 
            equipoGanador = "Impostor"; // Un empate siempre favorece a los impostores
        } else {
            const exp = sala.jugadores[expId];
            if(exp.rol === 'Impostor') { 
                situacionTexto = `La tripulación descubrió y expulsó a ${exp.nombre}, el sucio Impostor. ¡Triunfo de los buenos!`;
                finalMsg = `¡VICTORIA! ${exp.nombre} era Impostor.`; 
                equipoGanador = "Tripulante";
            }
            else if(exp.rol === 'Agente Blanco') { 
                situacionTexto = `Expulsaron por error a ${exp.nombre}, que solo era el Agente Blanco y logró confundir a todos.`;
                finalMsg = `¡CAOS! ${exp.nombre} era el Agente Blanco.`; 
                equipoGanador = "Agente Blanco";
            }
            else { 
                situacionTexto = `Los inocentes cometieron un error fatal y expulsaron a ${exp.nombre} que era solo un Tripulante inocente. Los impostores ganan.`;
                finalMsg = `ERROR FATAL. ${exp.nombre} era Tripulante.`; 
                equipoGanador = "Impostor";
            }
        }
    }

    // LÓGICA DE VICTORIA POR ROL (reutilizable para calcular la de cualquier jugador, no solo la mía)
    function jugadorGano(rol) {
        if (rol === 'Tripulante' && equipoGanador === 'Tripulante') return true;
        if (rol === 'Impostor' && equipoGanador === 'Impostor') return true;
        if (rol === 'Agente Blanco' && equipoGanador === 'Agente Blanco') return true;
        return false;
    }

    const miVictoria = jugadorGano(miRolActual);
    const finalColor = miVictoria ? "green" : "red";

    // Burlas de repuesto variadas, por si la IA falla (nunca el mismo mensaje para todos)
    const VEREDICTOS_FALLBACK = [
        "El universo es cruel, pero contigo hizo un esfuerzo extra.",
        "Ni la IA quiso comentar lo tuyo. Comprensible.",
        "Análisis completado: talento para el engaño, cuestionable. Ganas para intentarlo, muchas.",
        "El marcador no miente. Tú, lamentablemente, tampoco lo intentaste con muchas ganas.",
        "En la próxima ronda quizás te toque brillar. O no.",
        "Los sensores detectan una gran actuación... de las malas.",
        "El Capitán tomó nota. No fue una nota buena.",
        "La nave sobrevivió a pesar de ti. De nada."
    ];

    // SINCRONIZACIÓN DEL JUEZ SARCÁSTICO: un mensaje distinto por jugador
    let veredictosMap = sala.veredictosPersonales;

    if (esHost && !veredictosMap) {
        const snapDif = await db.ref(`salas/${codigoSalaActual}/configuracion/dificultad`).once('value');
        const difReal = snapDif.val() || 'familiar';
        const roster = jugadoresActuales.map(j => ({ id: j.id, nombre: j.nombre, rol: j.rol, gano: jugadorGano(j.rol) }));

        try {
            veredictosMap = await generarVeredictosIA(situacionTexto, difReal, roster);
        } catch (e) {
            console.error("⚠️ Falló el juez IA, usando burlas de repuesto:", e.message);
            const barajado = barajarFisherYates(VEREDICTOS_FALLBACK);
            veredictosMap = {};
            roster.forEach((j, idx) => veredictosMap[j.id] = barajado[idx % barajado.length]);
        }
        // Usamos el mapa recién generado directamente (no releemos 'sala', esa foto ya está vieja)
        db.ref(`salas/${codigoSalaActual}`).update({ veredictosPersonales: veredictosMap });
    } else if (!veredictosMap && !esHost) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const snap = await db.ref(`salas/${codigoSalaActual}/veredictosPersonales`).once('value');
        veredictosMap = snap.val() || {};
    }

    const veredictoTexto = (veredictosMap && veredictosMap[miId]) || "Análisis completado. Los resultados son evidentes.";

    // REVELACIÓN VISUAL (Colores dependientes del bando)
    setTimeout(() => {
        if (finalColor === 'red') terminal.classList.add('red');
        // Si no se le añade la clase 'red', asume el verde neón por defecto del CSS.
        
        terminal.innerHTML = `> ${veredictoTexto}`;
        display.textContent = finalMsg;
        display.style.display = 'block';
        display.style.color = `var(--color-${finalColor})`;
        display.style.borderLeftColor = `var(--color-${finalColor})`;
        if(esHost) acciones.style.display = 'flex';
    }, 2500); 
}

window.abandonarSala = () => window.location.reload();