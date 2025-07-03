const GoogleSheetsAPI = require('./GoogleSheetsAPI');

/**
 * Función principal que demuestra el uso de la API de Google Sheets
 * Ahora usa OAuth2 y el método asíncrono GoogleSheetsAPI.create()
 */
async function main() {
    try {
        console.log('🚀 Iniciando aplicación de Google Sheets API con OAuth2...\n');
        
        // Crear instancia autenticada de la API
        const sheetsAPI = await GoogleSheetsAPI.create();
        
        // Ejemplo 1: Obtener información del spreadsheet
        console.log('=== EJEMPLO 1: Información del Spreadsheet ===');
        const spreadsheetInfo = await sheetsAPI.getSpreadsheetInfo();
        console.log('Información obtenida:', {
            title: spreadsheetInfo.properties.title,
            sheets: spreadsheetInfo.sheets.map(s => s.properties.title)
        });
        console.log('');
        
        // Ejemplo 2: Leer datos existentes
        console.log('=== EJEMPLO 2: Leyendo Datos Existentes ===');
        const existingData = await sheetsAPI.readData('Sheet1!A1:Z100');
        console.log('Datos leídos:', existingData);
        console.log('');
        
        // Ejemplo 3: Escribir nuevos datos
        console.log('=== EJEMPLO 3: Escribiendo Nuevos Datos ===');
        const newData = [
            ['ID', 'Nombre', 'Email', 'Fecha'],
            ['1', 'Juan Pérez', 'juan@ejemplo.com', new Date().toLocaleDateString()],
            ['2', 'María García', 'maria@ejemplo.com', new Date().toLocaleDateString()],
            ['3', 'Carlos López', 'carlos@ejemplo.com', new Date().toLocaleDateString()],
            ['4', 'Agustina Bernaola', 'agustina@ejemplo.com', new Date().toLocaleDateString()],
            ['5', 'Santino Buttazzoni', 'santino@ejemplo.com', new Date().toLocaleDateString()],
            ['6', 'Pascual Buttazzoni', 'pascual@ejemplo.com', new Date().toLocaleDateString()]
        ];
        
        await sheetsAPI.writeData(newData, 'Sheet1!A1');
        console.log('');
        
        // Ejemplo 4: Agregar datos al final
        console.log('=== EJEMPLO 4: Agregando Datos al Final ===');
        const additionalData = [
            ['7', 'Ana Rodríguez', 'ana@ejemplo.com', new Date().toLocaleDateString()],
            ['8', 'Luis Martínez', 'luis@ejemplo.com', new Date().toLocaleDateString()]
        ];
        
        await sheetsAPI.appendData(additionalData, 'Sheet1');
        console.log('');
        
        // Ejemplo 5: Buscar datos
        console.log('=== EJEMPLO 5: Buscando Datos ===');
        const searchResults = await sheetsAPI.searchData('Juan');
        console.log('Resultados de búsqueda para "Juan":', searchResults);
        console.log('');
        
        // Ejemplo 6: Obtener lista de hojas
        console.log('=== EJEMPLO 6: Lista de Hojas ===');
        const sheets = await sheetsAPI.getSheets();
        console.log('Hojas disponibles:', sheets);
        console.log('');
        
        console.log('✅ Todos los ejemplos ejecutados exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en la aplicación:', error.message);
        console.error('Detalles del error:', error);
    }
}

// Ejecutar la función principal
if (require.main === module) {
    main();
}

module.exports = { main }; 