# Google Sheets API - Guía Paso a Paso para Integración con Node.js y OAuth2

Este README es una **guía didáctica** para que aprendas a construir, entender y ejecutar una integración real con la API de Google Sheets desde cero usando Node.js y OAuth2.

---

## 📚 ¿Qué aprenderás?
- Cómo estructurar un proyecto Node.js para consumir una API.
- Cómo obtener y usar credenciales seguras de Google.
- Cómo autenticarte con OAuth2 (el estándar de Google para apps seguras).
- Cómo leer, escribir y buscar datos en Google Sheets desde código.
- Cómo depurar y solucionar problemas comunes.

---

## 🚦 PASO A PASO: INTEGRACIÓN COMPLETA

### 1. Prepara tu entorno
- Instala [Node.js](https://nodejs.org/) (recomendado v18+).
- Abre una terminal y navega a la carpeta donde quieras tu proyecto.

### 2. Clona o descarga este repositorio

```bash
git clone <url-del-repo> # o descarga el zip y descomprímelo
cd Bytespace-Sheets-Test
```

### 3. Instala las dependencias

```bash
npm install
```
Esto instalará todas las librerías necesarias para trabajar con Google y manejar variables de entorno.

### 4. Configura tus credenciales de Google

1. Ve a [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Crea un proyecto si no tienes uno.
3. Habilita la API de Google Sheets.
4. Crea un **OAuth client ID** (tipo "Desktop app").
5. Descarga el archivo y renómbralo a `credentials.json`.
6. Colócalo en la carpeta `Bytespace-Sheets-Test/`.

### 5. Configura el archivo de entorno

Crea o edita el archivo `config.env` con:
```
SPREADSHEET_ID=TU_ID_DE_HOJA
```
- El `SPREADSHEET_ID` es la parte de la URL de tu Google Sheet entre `/d/` y `/edit`.

### 6. Ejecuta el ejemplo automático

```bash
node index.js
```
- La primera vez, se abrirá el navegador para autorizar la app.
- Copia el código de la URL después de autorizar y pégalo en la terminal.
- Se guardará un archivo `token.json` para futuras sesiones.

### 7. (Opcional) Usa el menú interactivo

```bash
node commands.js
```
- Podrás elegir manualmente qué acción hacer (leer, escribir, buscar, etc.).

---

## 🧠 ¿Cómo está estructurado el código?

- **index.js**: Script principal de ejemplo. Aquí puedes ver y modificar los datos que se escriben en la hoja.
- **GoogleSheetsAPI.js**: Toda la lógica para interactuar con Google Sheets (leer, escribir, buscar, etc.).
- **auth.js**: Maneja la autenticación OAuth2 de Google.
- **commands.js**: Menú interactivo para operar desde la terminal.
- **config.env**: Variables de entorno (ID de la hoja, etc.).
- **credentials.json**: Tus credenciales de Google (¡no las compartas!).
- **token.json**: Se genera automáticamente tras autorizar la app.

---

## 📝 ¿Dónde modificar los datos que se verán reflejados en el Sheets?

- **index.js**: Cambia los arrays `newData` y `additionalData` para modificar los datos que se escriben o agregan en la hoja.
- **commands.js**: El menú interactivo permite escribir/agregar datos de ejemplo o personalizados.
- **GoogleSheetsAPI.js**: Si quieres cambiar la lógica de integración (por ejemplo, cómo se formatean los datos), aquí es donde lo haces.

---

## 💡 Consejos y buenas prácticas
- **Nunca subas tus credenciales a un repositorio público.**
- Usa variables de entorno para datos sensibles.
- Lee los comentarios en el código: cada archivo tiene explicaciones detalladas.
- Si ves errores, lee el mensaje completo: suelen indicar exactamente qué falta o está mal.

---

## 🐛 Solución de Problemas
- Si ves un error de `credentials.json`, asegúrate de que el archivo esté en la carpeta correcta y bien nombrado.
- Si ves un error de `open is not a function`, asegúrate de tener la última versión de la librería `open` y que la importación sea robusta (ver `auth.js`).
- Si ves un error de permisos, revisa que tu cuenta de Google tenga acceso a la hoja de cálculo.

---

## 📞 Soporte

Si tienes dudas, revisa los comentarios en el código o contacta al autor del repositorio.

---

¡Lee este archivo con calma y explora los comentarios en el código fuente para aprender cómo funciona una integración API real con Google! 🚀 