// server.js (Versión para Firebase/Express en Render)

const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Configuración de Express para servir archivos de la carpeta 'public'
// Nota: Asume que index.html, cliente.js, style.css están en una carpeta llamada 'public'
// Si no tienes una carpeta 'public', deberás ajustar esta línea.
app.use(express.static('public')); 

const PORT = process.env.PORT || 8080;

// Inicio del servidor
server.listen(PORT, '0.0.0.0', () => { 
    console.log(`Servidor corriendo en el puerto ${PORT} en todas las interfaces.`);
});