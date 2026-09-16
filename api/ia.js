// api/ia.js
export default async function handler(req, res) {
    // Solo permitimos peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const url = "https://api.groq.com/openai/v1/chat/completions";
        
        // Hacemos la petición a Groq usando la variable de entorno secreta
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            // Reenviamos el error REAL de Groq (ej. modelo descontinuado, key inválida, rate limit)
            // en vez de esconderlo. Así en la consola del navegador se ve la causa exacta.
            console.error(`Error de Groq (${response.status}):`, JSON.stringify(data));
            return res.status(response.status).json({ error: data.error?.message || `Error de Groq: ${response.status}`, groqError: data });
        }

        // Devolvemos la respuesta al frontend
        res.status(200).json(data);
        
    } catch (error) {
        console.error("Fallo en el puente API:", error);
        res.status(500).json({ error: 'Fallo al conectar con la IA', detalle: error.message });
    }
}