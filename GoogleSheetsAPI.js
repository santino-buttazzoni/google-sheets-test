const { google } = require('googleapis');
require('dotenv').config({ path: './config.env' });

// Importamos el cliente autenticado de OAuth2
const { getAuthClient } = require('./auth');

/**
 * Clase para interactuar con Google Sheets API usando OAuth2
 * Proporciona métodos para leer, escribir y manipular datos en hojas de cálculo
 */
class GoogleSheetsAPI {
    /**
     * El constructor ahora es asíncrono porque debe esperar la autenticación OAuth2
     */
    constructor() {
        throw new Error('Usa GoogleSheetsAPI.create() para instanciar esta clase.');
    }

    /**
     * Método de fábrica asíncrono para crear una instancia autenticada
     */
    static async create() {
        // Espera a que el usuario autorice la app si es la primera vez
        const auth = await getAuthClient();
        const instance = new GoogleSheetsAPI.__Internal(auth);
        return instance;
    }
}

// Implementación interna real de la clase
GoogleSheetsAPI.__Internal = class {
    constructor(auth) {
        // Inicializa la API de Google Sheets con el cliente OAuth2
        this.sheets = google.sheets({
            version: 'v4',
            auth
        });
        this.spreadsheetId = process.env.SPREADSHEET_ID;
        console.log('✅ Google Sheets API inicializada con OAuth2');
        console.log(`📊 Spreadsheet ID: ${this.spreadsheetId}`);
    }

    /**
     * Obtener información básica del spreadsheet
     * @returns {Promise<Object>} Información del spreadsheet
     */
    async getSpreadsheetInfo() {
        try {
            console.log('🔍 Obteniendo información del spreadsheet...');
            
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId
            });
            
            const spreadsheet = response.data;
            console.log(`📋 Título: ${spreadsheet.properties.title}`);
            console.log(`📄 Hojas disponibles: ${spreadsheet.sheets.map(sheet => sheet.properties.title).join(', ')}`);
            
            return spreadsheet;
        } catch (error) {
            console.error('❌ Error al obtener información del spreadsheet:', error.message);
            throw error;
        }
    }

    /**
     * Leer datos de una hoja específica
     * @param {string} range - Rango a leer (ej: 'Sheet1!A1:D10')
     * @returns {Promise<Array>} Datos leídos
     */
    async readData(range = 'Sheet1!A1:Z1000') {
        try {
            console.log(`📖 Leyendo datos del rango: ${range}`);
            
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: range
            });
            
            const values = response.data.values;
            
            if (!values || values.length === 0) {
                console.log('📭 No se encontraron datos en el rango especificado');
                return [];
            }
            
            console.log(`✅ Datos leídos exitosamente. Filas encontradas: ${values.length}`);
            return values;
        } catch (error) {
            console.error('❌ Error al leer datos:', error.message);
            throw error;
        }
    }

    /**
     * Escribir datos en una hoja específica
     * @param {Array} data - Datos a escribir (array de arrays)
     * @param {string} range - Rango donde escribir (ej: 'Sheet1!A1')
     * @returns {Promise<Object>} Respuesta de la API
     */
    async writeData(data, range = 'Sheet1!A1') {
        try {
            console.log(`✍️ Escribiendo datos en el rango: ${range}`);
            console.log(`📊 Datos a escribir:`, data);
            
            const response = await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'RAW',
                resource: {
                    values: data
                }
            });
            
            console.log(`✅ Datos escritos exitosamente. Filas actualizadas: ${response.data.updatedRows}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error al escribir datos:', error.message);
            throw error;
        }
    }

    /**
     * Agregar datos al final de una hoja
     * @param {Array} data - Datos a agregar (array de arrays)
     * @param {string} range - Rango base (ej: 'Sheet1')
     * @returns {Promise<Object>} Respuesta de la API
     */
    async appendData(data, range = 'Sheet1') {
        try {
            console.log(`➕ Agregando datos al final de: ${range}`);
            console.log(`📊 Datos a agregar:`, data);
            
            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: data
                }
            });
            
            console.log(`✅ Datos agregados exitosamente. Filas agregadas: ${response.data.updates.updatedRows}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error al agregar datos:', error.message);
            throw error;
        }
    }

    /**
     * Buscar datos en una hoja
     * @param {string} searchTerm - Término a buscar
     * @param {string} range - Rango donde buscar
     * @returns {Promise<Array>} Filas que contienen el término
     */
    async searchData(searchTerm, range = 'Sheet1!A1:Z1000') {
        try {
            console.log(`🔍 Buscando: "${searchTerm}" en el rango: ${range}`);
            
            const allData = await this.readData(range);
            const results = allData.filter(row => 
                row.some(cell => 
                    cell && cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            
            console.log(`✅ Búsqueda completada. Resultados encontrados: ${results.length}`);
            return results;
        } catch (error) {
            console.error('❌ Error en la búsqueda:', error.message);
            throw error;
        }
    }

    /**
     * Limpiar datos de un rango específico
     * @param {string} range - Rango a limpiar
     * @returns {Promise<Object>} Respuesta de la API
     */
    async clearData(range = 'Sheet1!A1:Z1000') {
        try {
            console.log(`🧹 Limpiando datos del rango: ${range}`);
            
            const response = await this.sheets.spreadsheets.values.clear({
                spreadsheetId: this.spreadsheetId,
                range: range
            });
            
            console.log(`✅ Datos limpiados exitosamente. Rango: ${response.data.clearedRange}`);
            return response.data;
        } catch (error) {
            console.error('❌ Error al limpiar datos:', error.message);
            throw error;
        }
    }

    /**
     * Obtener todas las hojas del spreadsheet
     * @returns {Promise<Array>} Lista de hojas
     */
    async getSheets() {
        try {
            console.log('📋 Obteniendo lista de hojas...');
            
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId
            });
            
            const sheets = response.data.sheets.map(sheet => ({
                title: sheet.properties.title,
                sheetId: sheet.properties.sheetId,
                index: sheet.properties.index
            }));
            
            console.log(`✅ Hojas encontradas: ${sheets.length}`);
            return sheets;
        } catch (error) {
            console.error('❌ Error al obtener hojas:', error.message);
            throw error;
        }
    }
}

module.exports = GoogleSheetsAPI; 