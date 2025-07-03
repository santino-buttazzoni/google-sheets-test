const GoogleSheetsAPI = require('./GoogleSheetsAPI');
const readline = require('readline');
const open = require('open');
console.log(typeof open);

/**
 * Clase para manejar comandos interactivos con Google Sheets
 */
class SheetsCommands {
    constructor() {
        // Inicialización diferida, porque create() es asíncrono
        this.sheetsAPI = null;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Inicializa la API autenticada antes de usar cualquier comando
     */
    async init() {
        if (!this.sheetsAPI) {
            this.sheetsAPI = await GoogleSheetsAPI.create();
        }
    }

    /**
     * Mostrar el menú principal
     */
    showMenu() {
        console.log('\n📊 === MENÚ DE COMANDOS GOOGLE SHEETS ===');
        console.log('1. 📖 Leer datos');
        console.log('2. ✍️ Escribir datos');
        console.log('3. ➕ Agregar datos');
        console.log('4. 🔍 Buscar datos');
        console.log('5. 🧹 Limpiar datos');
        console.log('6. 📋 Ver información del spreadsheet');
        console.log('7. 📄 Listar hojas');
        console.log('8. ❌ Salir');
        console.log('==========================================');
    }

    /**
     * Ejecutar comando de lectura
     */
    async readCommand() {
        await this.init();
        return new Promise((resolve) => {
            this.rl.question('📖 Ingresa el rango a leer (ej: Sheet1!A1:D10): ', async (range) => {
                try {
                    const data = await this.sheetsAPI.readData(range || 'Sheet1!A1:Z100');
                    console.log('✅ Datos leídos:');
                    console.table(data);
                } catch (error) {
                    console.error('❌ Error:', error.message);
                }
                resolve();
            });
        });
    }

    /**
     * Ejecutar comando de escritura
     */
    async writeCommand() {
        await this.init();
        return new Promise((resolve) => {
            this.rl.question('✍️ Ingresa el rango donde escribir (ej: Sheet1!A1): ', async (range) => {
                try {
                    // Ejemplo de datos para escribir
                    const sampleData = [
                        ['ID', 'Nombre', 'Email', 'Fecha'],
                        ['1', 'Usuario Test', 'test@ejemplo.com', new Date().toLocaleDateString()]
                    ];
                    
                    console.log('📊 Escribiendo datos de ejemplo:', sampleData);
                    await this.sheetsAPI.writeData(sampleData, range || 'Sheet1!A1');
                    console.log('✅ Datos escritos exitosamente');
                } catch (error) {
                    console.error('❌ Error:', error.message);
                }
                resolve();
            });
        });
    }

    /**
     * Ejecutar comando de agregar datos
     */
    async appendCommand() {
        await this.init();
        return new Promise((resolve) => {
            this.rl.question('➕ Ingresa el nombre de la hoja (ej: Sheet1): ', async (sheetName) => {
                try {
                    const newData = [
                        [Date.now().toString(), 'Nuevo Usuario', 'nuevo@ejemplo.com', new Date().toLocaleDateString()]
                    ];
                    
                    console.log('📊 Agregando datos:', newData);
                    await this.sheetsAPI.appendData(newData, sheetName || 'Sheet1');
                    console.log('✅ Datos agregados exitosamente');
                } catch (error) {
                    console.error('❌ Error:', error.message);
                }
                resolve();
            });
        });
    }

    /**
     * Ejecutar comando de búsqueda
     */
    async searchCommand() {
        await this.init();
        return new Promise((resolve) => {
            this.rl.question('🔍 Ingresa el término a buscar: ', async (searchTerm) => {
                try {
                    const results = await this.sheetsAPI.searchData(searchTerm);
                    console.log('✅ Resultados de búsqueda:');
                    console.table(results);
                } catch (error) {
                    console.error('❌ Error:', error.message);
                }
                resolve();
            });
        });
    }

    /**
     * Ejecutar comando de limpieza
     */
    async clearCommand() {
        await this.init();
        return new Promise((resolve) => {
            this.rl.question('🧹 Ingresa el rango a limpiar (ej: Sheet1!A1:Z100): ', async (range) => {
                try {
                    await this.sheetsAPI.clearData(range || 'Sheet1!A1:Z100');
                    console.log('✅ Datos limpiados exitosamente');
                } catch (error) {
                    console.error('❌ Error:', error.message);
                }
                resolve();
            });
        });
    }

    /**
     * Ejecutar comando de información
     */
    async infoCommand() {
        await this.init();
        try {
            const info = await this.sheetsAPI.getSpreadsheetInfo();
            console.log('📋 Información del Spreadsheet:');
            console.log(`Título: ${info.properties.title}`);
            console.log(`Hojas: ${info.sheets.map(s => s.properties.title).join(', ')}`);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    /**
     * Ejecutar comando de listar hojas
     */
    async sheetsCommand() {
        await this.init();
        try {
            const sheets = await this.sheetsAPI.getSheets();
            console.log('📄 Hojas disponibles:');
            console.table(sheets);
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }

    /**
     * Procesar la selección del usuario
     */
    async processSelection(choice) {
        switch (choice) {
            case '1':
                await this.readCommand();
                break;
            case '2':
                await this.writeCommand();
                break;
            case '3':
                await this.appendCommand();
                break;
            case '4':
                await this.searchCommand();
                break;
            case '5':
                await this.clearCommand();
                break;
            case '6':
                await this.infoCommand();
                break;
            case '7':
                await this.sheetsCommand();
                break;
            case '8':
                console.log('👋 ¡Hasta luego!');
                this.rl.close();
                return false;
            default:
                console.log('❌ Opción no válida. Por favor, selecciona una opción del 1 al 8.');
        }
        return true;
    }

    /**
     * Iniciar el menú interactivo
     */
    async start() {
        console.log('🚀 Iniciando comandos interactivos de Google Sheets con OAuth2...\n');
        
        let running = true;
        while (running) {
            this.showMenu();
            
            const choice = await new Promise((resolve) => {
                this.rl.question('Selecciona una opción (1-8): ', resolve);
            });
            
            running = await this.processSelection(choice);
            
            if (running) {
                console.log('\n⏳ Presiona Enter para continuar...');
                await new Promise((resolve) => {
                    this.rl.question('', resolve);
                });
            }
        }
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    const commands = new SheetsCommands();
    commands.start();
}

module.exports = SheetsCommands; 