// scripts/setupNgrok.js
const axios = require('axios');
require('dotenv').config();
const logger = require('../config/logger');

const NGROK_STATIC_URL = 'https://valued-shiner-driven.ngrok-free.app';

async function updateConfig() {
  try {
    console.log('\n✅ URL Estática do Ngrok configurada:');
    console.log(`Frontend/Backend: ${NGROK_STATIC_URL}`);

    console.log('\nAdicione esta URL ao seu .env:');
    console.log(`REACT_APP_API_URL=${NGROK_STATIC_URL}/api`);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

updateConfig();
