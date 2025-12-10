// server.js

const express = require('express');
const http = require('http');

// Inicialización de Express
const app = express();
const server = http.createServer(app);

// Configuración de Express para servir archivos estáticos.
// Esto hace que todo el contenido de la carpeta 'public' sea accesible para los clientes.
app.use(express.static('public')); 

// Define el puerto. Usa el puerto que te asigne el entorno de hosting (como Render o Heroku) 
// o el 8080 si lo ejecutas localmente.
const PORT = process.env.PORT || 8080;

// Inicio del servidor
server.listen(PORT, '0.0.0.0', () => { 
    console.log(`Servidor corriendo en el puerto ${PORT} en todas las interfaces.`);
});