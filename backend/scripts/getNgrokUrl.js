const axios = require('axios');

const DUCKDNS_DOMAIN = process.env.DUCKDNS_DOMAIN;
const DUCKDNS_TOKEN = process.env.DUCKDNS_TOKEN;

const getActiveNgrokTunnels = async () => {
    try {
        const { data } = await axios.get('http://localhost:4040/api/tunnels');
        
        const tunnels = data.tunnels.reduce((acc, tunnel) => {
            const addr = tunnel.config?.addr || '';
            if (addr.includes(':3000')) {
                acc.frontend = tunnel.public_url;
            } else if (addr.includes(':5000')) {
                acc.backend = tunnel.public_url;
            }
            return acc;
        }, { frontend: null, backend: null });

        if (!tunnels.frontend || !tunnels.backend) {
            throw new Error('Não foi possível encontrar todas as URLs necessárias');
        }

        return tunnels;
    } catch (error) {
        console.error('Erro ao obter URLs do Ngrok:', error);
        throw error;
    }
};

const updateDuckDNS = async (urls) => {
    if (!DUCKDNS_DOMAIN || !DUCKDNS_TOKEN) {
        throw new Error('Credenciais DuckDNS não configuradas');
    }

    try {
        const encodedUrls = encodeURIComponent(JSON.stringify(urls));
        const response = await axios.get(
            `https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&txt=${encodedUrls}`
        );

        if (!response.data.includes('OK')) {
            throw new Error('Falha ao atualizar DuckDNS');
        }

        return true;
    } catch (error) {
        console.error('Erro ao atualizar DuckDNS:', error);
        throw error;
    }
};

module.exports = {
    getActiveNgrokTunnels,
    updateDuckDNS
};