// server.js (SIMPLIFICADO PARA FIREBASE - Solo sirve archivos estáticos)

const express = require('express');
const http = require('http');

// NOTA: Ya NO necesitamos socket.io

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

// Configuración de Express para servir archivos de la carpeta 'public'
app.use(express.static('public'));

// Inicio del servidor
server.listen(PORT, '0.0.0.0', () => { 
    console.log(`Servidor de archivos estáticos corriendo en el puerto ${PORT}`);
});