const axios = require('axios');
const { exec } = require('child_process');

async function checkNgrokStatus() {
  try {
    const response = await axios.get('http://localhost:4040/api/tunnels');
    console.log('✅ Ngrok is running');
    console.log('Active tunnels:');
    response.data.tunnels.forEach(tunnel => {
      console.log(`- ${tunnel.public_url} -> ${tunnel.config.addr}`);
    });
  } catch (error) {
    console.log('❌ Ngrok is not running or not accessible');
  }
}

function checkBackendStatus() {
  exec('lsof -i :5000', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Backend server is not running on port 5000');
    } else {
      console.log('✅ Backend server is running on port 5000');
      console.log(stdout);
    }
  });
}

async function main() {
  console.log('🔍 Running Ngrok and Backend diagnostics...\n');
  
  await checkNgrokStatus();
  console.log('\n');
  checkBackendStatus();
}

main();