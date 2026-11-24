
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Permite receber dados em formato JSON
app.use(express.json());

// Disponibiliza os arquivos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota inicial para verificar o servidor
app.get('/api/status', (req, res) => {
    res.json({
        mensagem: 'Servidor Mais Foco - Menos Ansiedade funcionando!'
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando em http://localhost:${PORT}`);
});
