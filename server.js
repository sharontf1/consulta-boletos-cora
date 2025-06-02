require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // Servir index.html

const TOKEN = process.env.CORA_API_TOKEN;

// Simulação de base de dados local
const clientes = {
  'joao': 'cliente_id_joao',
  'maria': 'cliente_id_maria'
};

app.post('/buscar-boletos', async (req, res) => {
  const { nome } = req.body;
  const clienteId = clientes[nome.toLowerCase()];

  if (!clienteId) {
    return res.json({ boletosAtrasados: [] });
  }

  try {
    const resposta = await axios.get('https://api.cora.com.br/charges', {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    const boletos = resposta.data.data || [];

    const boletosAtrasados = boletos.filter(boleto => {
      const vencido = new Date(boleto.due_date) < new Date();
      const naoPago = boleto.status !== 'paid';
      return vencido && naoPago && boleto.customer_id === clienteId;
    });

    res.json({ boletosAtrasados });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ erro: 'Erro ao buscar boletos.' });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
