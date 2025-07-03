const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Importación robusta de 'open' para soportar distintas versiones
let open;
try {
  open = require('open');
  if (typeof open !== 'function' && open.default) open = open.default;
} catch (e) {
  throw new Error('No se pudo importar la librería open. Ejecuta: npm install open');
}

// Rutas de archivos
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Scopes: permisos que pedimos (acceso completo a Google Sheets)
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

/**
 * Carga las credenciales del archivo credentials.json
 */
function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('No se encontró credentials.json. Descárgalo desde Google Cloud Console.');
  }
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  return JSON.parse(content);
}

/**
 * Carga el token de acceso si existe
 */
function loadToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  const content = fs.readFileSync(TOKEN_PATH, 'utf8');
  return JSON.parse(content);
}

/**
 * Guarda el token de acceso para futuras sesiones
 */
function saveToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
  console.log('✅ Token guardado en', TOKEN_PATH);
}

/**
 * Obtiene un cliente OAuth2 autenticado
 * Si es la primera vez, lanza el navegador para autorizar
 */
async function getAuthClient() {
  const credentials = loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Intenta cargar token guardado
  const token = loadToken();
  if (token) {
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Si no hay token, inicia el flujo de autorización
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('🔗 Autoriza esta app visitando la siguiente URL:\n' + authUrl);
  await open(authUrl);

  // Pide al usuario que pegue el código de autorización
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = await new Promise((resolve) => {
    rl.question('🔑 Ingresa el código de autorización: ', (input) => {
      rl.close();
      resolve(input);
    });
  });

  // Intercambia el código por un token
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  saveToken(tokens);
  return oAuth2Client;
}

module.exports = { getAuthClient };