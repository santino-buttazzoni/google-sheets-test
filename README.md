# 🎓 Google Sheets API - Guía Didáctica Completa

## 📚 ¿Qué aprenderás en esta guía?

Esta guía te llevará de la mano para entender **cómo funciona una integración real con APIs externas** usando Google Sheets como ejemplo. Aprenderás:

- **Arquitectura de aplicaciones Node.js** con autenticación OAuth2
- **Patrones de diseño** como Factory Pattern y Singleton
- **Manejo de promesas y async/await** en JavaScript
- **Gestión de credenciales seguras** y variables de entorno
- **Interacción con APIs REST** usando la librería oficial de Google
- **Programación interactiva** con interfaces de línea de comandos

---

## 🏗️ Arquitectura de la Aplicación

### Estructura del Proyecto

```
📁 Proyecto/
├── 📄 index.js          # Punto de entrada principal
├── 📄 GoogleSheetsAPI.js # Clase principal de la API
├── 📄 auth.js           # Manejo de autenticación OAuth2
├── 📄 commands.js       # Interfaz interactiva
├── 📄 config.env        # Variables de entorno
├── 📄 credentials.json  # Credenciales de Google (¡privado!)
├── 📄 token.json        # Token de acceso (se genera automáticamente)
└── 📄 package.json      # Dependencias del proyecto
```

### Flujo de la Aplicación

```
1. Usuario ejecuta la app
   ↓
2. Sistema carga config.env
   ↓
3. auth.js verifica credenciales
   ↓
4. Si es primera vez → OAuth2 flow
   ↓
5. GoogleSheetsAPI se inicializa
   ↓
6. Usuario interactúa con la API
```

---

## 🔧 PASO A PASO: Configuración Inicial

### Paso 1: Preparación del Entorno

**¿Por qué necesitamos Node.js?**
Node.js nos permite ejecutar JavaScript en el servidor, lo que es perfecto para crear aplicaciones que se comunican con APIs externas. Es rápido, tiene un ecosistema rico de librerías, y es ideal para operaciones I/O intensivas como llamadas a APIs.

```bash
# Verifica que tienes Node.js instalado
node --version  # Debe ser v14 o superior
npm --version   # Gestor de paquetes de Node.js
```

### Paso 2: Configuración de Google Cloud Console

**¿Por qué necesitamos Google Cloud Console?**
Google requiere que registres tu aplicación para controlar el acceso a sus APIs. Esto es una medida de seguridad que permite:
- Limitar el número de requests por día
- Monitorear el uso de la API
- Revocar acceso si es necesario
- Obtener credenciales únicas para tu aplicación

#### 2.1 Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. **¿Por qué un proyecto?** Los proyectos en Google Cloud son contenedores que agrupan recursos relacionados (APIs, credenciales, facturación, etc.)

#### 2.2 Habilitar Google Sheets API
1. Ve a "APIs & Services" > "Library"
2. Busca "Google Sheets API"
3. Haz clic en "Enable"
4. **¿Por qué habilitar la API?** Google requiere que explícitamente actives las APIs que quieres usar. Esto evita que las aplicaciones accedan accidentalmente a servicios no autorizados.

#### 2.3 Crear Credenciales OAuth2
1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth client ID"
3. Selecciona "Desktop application"
4. Descarga el archivo JSON y renómbralo a `credentials.json`
5. **¿Por qué OAuth2?** Es el estándar de autenticación más seguro. Permite que el usuario autorice tu aplicación sin compartir su contraseña.

### Paso 3: Configuración del Proyecto

```bash
# Clona o descarga el proyecto
git clone <url-del-repo>
cd nombre-del-proyecto

# Instala las dependencias
npm install
```

**¿Qué hace `npm install`?**
Lee el archivo `package.json` y descarga todas las librerías necesarias:
- `googleapis`: Librería oficial de Google para Node.js
- `dotenv`: Para cargar variables de entorno
- `open`: Para abrir el navegador automáticamente

### Paso 4: Configuración de Variables de Entorno

Crea el archivo `config.env`:
```env
SPREADSHEET_ID=tu_id_de_hoja_aqui
```

**¿Cómo obtener el SPREADSHEET_ID?**
1. Abre tu Google Sheet
2. Mira la URL: `https://docs.google.com/spreadsheets/d/1BsxVTpnvPoNFYsVY9Q2KX2Us6jFO17A9CeVqkCVhJq8/edit`
3. El ID es la parte entre `/d/` y `/edit`: `1BsxVTpnvPoNFYsVY9Q2KX2Us6jFO17A9CeVqkCVhJq8`

---

## 🧠 ANÁLISIS DEL CÓDIGO: Lógica Detrás de Cada Archivo

### 1. `auth.js` - El Corazón de la Autenticación

**¿Por qué separamos la autenticación?**
Siguiendo el principio de **Separación de Responsabilidades**, la autenticación es una preocupación específica que debe estar aislada del resto de la lógica.

```javascript
// Patrón Singleton para el cliente OAuth2
let oAuth2Client = null;

async function getAuthClient() {
    if (oAuth2Client) return oAuth2Client;
    
    // Carga credenciales
    const credentials = loadCredentials();
    
    // Crea cliente OAuth2
    oAuth2Client = new google.auth.OAuth2(
        credentials.installed.client_id,
        credentials.installed.client_secret,
        credentials.installed.redirect_uris[0]
    );
    
    // Intenta usar token guardado
    const token = loadToken();
    if (token) {
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    }
    
    // Si no hay token, inicia flujo OAuth2
    return await authorizeUser(oAuth2Client);
}
```

**Flujo OAuth2 paso a paso:**
1. **Generar URL de autorización**: Google nos da una URL donde el usuario puede autorizar nuestra app
2. **Abrir navegador**: El usuario ve la página de Google y autoriza
3. **Intercambiar código por token**: Google nos devuelve un código que intercambiamos por un token de acceso
4. **Guardar token**: Para no pedir autorización cada vez

### 2. `GoogleSheetsAPI.js` - La Capa de Abstracción

**¿Por qué usar una clase?**
Las clases nos permiten encapsular la lógica relacionada con Google Sheets y proporcionar una interfaz limpia y fácil de usar.

```javascript
class GoogleSheetsAPI {
    // Factory Pattern: Método estático para crear instancia
    static async create() {
        const auth = await getAuthClient();
        return new GoogleSheetsAPI.__Internal(auth);
    }
}

// Implementación interna (encapsulamiento)
GoogleSheetsAPI.__Internal = class {
    constructor(auth) {
        this.sheets = google.sheets({ version: 'v4', auth });
        this.spreadsheetId = process.env.SPREADSHEET_ID;
    }
    
    // Métodos para interactuar con la API
    async readData(range) { /* ... */ }
    async writeData(data, range) { /* ... */ }
    async appendData(data, range) { /* ... */ }
    async searchData(searchTerm) { /* ... */ }
}
```

**Patrones de diseño utilizados:**
- **Factory Pattern**: `GoogleSheetsAPI.create()` crea la instancia
- **Encapsulamiento**: La implementación real está en `__Internal`
- **Async/Await**: Para manejar operaciones asíncronas de manera limpia

### 3. `index.js` - El Punto de Entrada

**¿Por qué un archivo de ejemplo separado?**
Permite demostrar todas las funcionalidades de manera ordenada y sirve como documentación ejecutable.

```javascript
async function main() {
    // Crear instancia autenticada
    const sheetsAPI = await GoogleSheetsAPI.create();
    
    // Ejemplo 1: Obtener información
    const info = await sheetsAPI.getSpreadsheetInfo();
    
    // Ejemplo 2: Leer datos
    const data = await sheetsAPI.readData('Sheet1!A1:Z100');
    
    // Ejemplo 3: Escribir datos
    await sheetsAPI.writeData(newData, 'Sheet1!A1');
    
    // Y así sucesivamente...
}
```

### 4. `commands.js` - Interfaz Interactiva

**¿Por qué una interfaz interactiva?**
Permite al usuario explorar las funcionalidades de manera interactiva, ideal para testing y aprendizaje.

```javascript
class SheetsCommands {
    async start() {
        while (true) {
            this.showMenu();
            const choice = await this.getUserChoice();
            await this.processSelection(choice);
        }
    }
}
```

---

## 🚀 FUNCIONALIDADES DE LA APLICACIÓN

### 1. **Lectura de Datos** (`readData`)
```javascript
const data = await sheetsAPI.readData('Sheet1!A1:D10');
```
**¿Qué hace?**
- Lee datos de un rango específico de la hoja
- Retorna un array de arrays (filas y columnas)
- Maneja automáticamente la paginación si hay muchos datos

**Casos de uso:**
- Importar datos para análisis
- Verificar contenido de la hoja
- Obtener datos para procesamiento

### 2. **Escritura de Datos** (`writeData`)
```javascript
const newData = [
    ['ID', 'Nombre', 'Email'],
    ['1', 'Juan', 'juan@email.com']
];
await sheetsAPI.writeData(newData, 'Sheet1!A1');
```
**¿Qué hace?**
- Sobrescribe datos en un rango específico
- Útil para actualizar datos existentes
- Reemplaza completamente el contenido del rango

### 3. **Agregar Datos** (`appendData`)
```javascript
const newRow = [['9', 'Nuevo Usuario', 'nuevo@email.com']];
await sheetsAPI.appendData(newRow, 'Sheet1');
```
**¿Qué hace?**
- Agrega datos al final de la hoja
- No sobrescribe datos existentes
- Ideal para logs, registros, etc.

### 4. **Búsqueda de Datos** (`searchData`)
```javascript
const results = await sheetsAPI.searchData('Juan');
```
**¿Qué hace?**
- Busca un término en toda la hoja
- Retorna todas las filas que contienen el término
- Búsqueda case-insensitive

### 5. **Limpieza de Datos** (`clearData`)
```javascript
await sheetsAPI.clearData('Sheet1!A1:Z100');
```
**¿Qué hace?**
- Elimina todos los datos de un rango
- Útil para resetear hojas o limpiar datos temporales

### 6. **Información del Spreadsheet** (`getSpreadsheetInfo`)
```javascript
const info = await sheetsAPI.getSpreadsheetInfo();
```
**¿Qué hace?**
- Obtiene metadatos del spreadsheet
- Título, hojas disponibles, propiedades
- Útil para validación y debugging

---

## 🔍 ANÁLISIS DETALLADO DE CADA OPERACIÓN

### Operación de Lectura
```javascript
async readData(range = 'Sheet1!A1:Z1000') {
    const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range
    });
    
    return response.data.values || [];
}
```

**¿Qué pasa internamente?**
1. **Validación**: Google verifica que tenemos permisos para el spreadsheet
2. **Parsing del rango**: Google convierte `A1:B10` en coordenadas numéricas
3. **Consulta a la base de datos**: Google busca los datos en sus servidores
4. **Formateo**: Los datos se devuelven como array de arrays
5. **Caché**: Google puede cachear resultados para mejorar performance

### Operación de Escritura
```javascript
async writeData(data, range = 'Sheet1!A1') {
    const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: { values: data }
    });
    
    return response.data;
}
```

**¿Qué pasa internamente?**
1. **Validación de datos**: Google verifica el formato de los datos
2. **Bloqueo temporal**: Google bloquea la celda para evitar conflictos
3. **Escritura atómica**: Los datos se escriben de una vez
4. **Notificaciones**: Si hay colaboradores, se les notifica del cambio
5. **Historial**: Se registra en el historial de cambios

---

## 📚 DOCUMENTACIÓN DE LA API DE GOOGLE SHEETS

### Recursos Oficiales
- **[Google Sheets API v4 Reference](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets)**: Documentación completa de todos los endpoints
- **[Google Sheets API Guide](https://developers.google.com/sheets/api/guides/concepts)**: Guía conceptual y mejores prácticas
- **[Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs)**: Librería de autenticación oficial

### Endpoints Principales que Usamos

#### 1. `spreadsheets.get`
```javascript
// Obtener información del spreadsheet
GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}
```
**Respuesta:**
```json
{
  "spreadsheetId": "1BsxVTpnvPoNFYsVY9Q2KX2Us6jFO17A9CeVqkCVhJq8",
  "properties": {
    "title": "Mi Hoja de Cálculo",
    "locale": "es_ES",
    "timeZone": "America/New_York"
  },
  "sheets": [
    {
      "properties": {
        "sheetId": 0,
        "title": "Sheet1",
        "index": 0
      }
    }
  ]
}
```

#### 2. `spreadsheets.values.get`
```javascript
// Leer valores de un rango
GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}
```
**Parámetros:**
- `spreadsheetId`: ID del spreadsheet
- `range`: Rango en notación A1 (ej: "Sheet1!A1:D10")

**Respuesta:**
```json
{
  "range": "Sheet1!A1:D3",
  "majorDimension": "ROWS",
  "values": [
    ["ID", "Nombre", "Email", "Fecha"],
    ["1", "Juan", "juan@email.com", "2024-01-15"],
    ["2", "María", "maria@email.com", "2024-01-16"]
  ]
}
```

#### 3. `spreadsheets.values.update`
```javascript
// Actualizar valores en un rango
PUT https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}
```
**Body:**
```json
{
  "values": [
    ["ID", "Nombre", "Email"],
    ["1", "Nuevo Usuario", "nuevo@email.com"]
  ]
}
```

#### 4. `spreadsheets.values.append`
```javascript
// Agregar valores al final
POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:append
```
**Opciones:**
- `insertDataOption`: "INSERT_ROWS" o "OVERWRITE"
- `valueInputOption`: "RAW" o "USER_ENTERED"

#### 5. `spreadsheets.values.clear`
```javascript
// Limpiar valores de un rango
POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:clear
```

### Límites y Cuotas
- **Requests por minuto**: 300 requests por minuto por proyecto
- **Requests por día**: 300 requests por minuto por usuario
- **Tamaño de datos**: Máximo 10MB por request
- **Celdas por request**: Máximo 10 millones de celdas

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "No se encontró credentials.json"
**Causa:** No has descargado las credenciales de Google Cloud Console
**Solución:** Sigue el paso 2.3 de la configuración

### Error: "Invalid grant"
**Causa:** El token de autorización ha expirado
**Solución:** Elimina `token.json` y vuelve a autorizar

### Error: "Requested entity was not found"
**Causa:** El SPREADSHEET_ID es incorrecto o no tienes permisos
**Solución:** Verifica el ID en la URL y los permisos de la hoja

### Error: "Quota exceeded"
**Causa:** Has excedido los límites de la API
**Solución:** Espera un minuto o implementa rate limiting

---

## 🎯 PRÓXIMOS PASOS PARA APRENDER MÁS

### 1. **Implementar Rate Limiting**
```javascript
class RateLimiter {
    constructor(maxRequests = 60, timeWindow = 60000) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }
    
    async waitForSlot() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = this.requests[0];
            const waitTime = this.timeWindow - (now - oldestRequest);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.requests.push(now);
    }
}
```

### 2. **Agregar Validación de Datos**
```javascript
function validateSheetData(data) {
    if (!Array.isArray(data)) {
        throw new Error('Los datos deben ser un array');
    }
    
    if (data.length === 0) {
        throw new Error('Los datos no pueden estar vacíos');
    }
    
    // Validar que todas las filas tengan la misma longitud
    const firstRowLength = data[0].length;
    for (let i = 1; i < data.length; i++) {
        if (data[i].length !== firstRowLength) {
            throw new Error(`La fila ${i + 1} tiene ${data[i].length} columnas, se esperaban ${firstRowLength}`);
        }
    }
}
```

### 3. **Implementar Caché**
```javascript
class SheetsCache {
    constructor(ttl = 5 * 60 * 1000) { // 5 minutos
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
}
```

---

## 📖 RECURSOS ADICIONALES PARA APRENDER

### JavaScript y Node.js
- **[Eloquent JavaScript](https://eloquentjavascript.net/)**: Libro gratuito excelente para aprender JavaScript
- **[Node.js Documentation](https://nodejs.org/docs/)**: Documentación oficial de Node.js
- **[JavaScript.info](https://javascript.info/)**: Tutorial moderno de JavaScript

### APIs y HTTP
- **[HTTP Status Dogs](https://httpstatusdogs.com/)**: Explicación divertida de códigos HTTP
- **[REST API Tutorial](https://restfulapi.net/)**: Guía completa de APIs REST
- **[Postman Learning Center](https://learning.postman.com/)**: Aprende a probar APIs

### Google APIs
- **[Google APIs Explorer](https://developers.google.com/apis-explorer/)**: Prueba APIs de Google interactivamente
- **[Google Cloud Training](https://cloud.google.com/training)**: Cursos oficiales de Google Cloud
- **[Google Sheets API Samples](https://github.com/googleapis/google-api-nodejs-client/tree/main/samples)**: Ejemplos oficiales

---

## 🎉 ¡FELICITACIONES!

Has completado una integración real con una API externa. Ahora entiendes:

✅ **Cómo funciona OAuth2** y por qué es necesario  
✅ **Patrones de diseño** como Factory y Singleton  
✅ **Manejo de promesas** y async/await  
✅ **Arquitectura de aplicaciones** Node.js  
✅ **Interacción con APIs REST**  
✅ **Gestión de credenciales** seguras  

**¡Sigue explorando y construyendo!** 🚀

---

*¿Tienes preguntas? Revisa los comentarios en el código o consulta la documentación oficial de Google.* 