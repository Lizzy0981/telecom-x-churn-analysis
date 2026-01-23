/**
 * FILE PARSER - Sistema de parseo de archivos
 * Soporta: CSV, XLSX, XLS, JSON, PDF, TSV, TXT, XML
 * 
 * Librerías requeridas:
 * - Papa Parse (CSV/TSV)
 * - SheetJS (Excel)
 * - pdf.js (PDF)
 */

class FileParser {
    constructor() {
        this.supportedFormats = ['csv', 'xlsx', 'xls', 'json', 'pdf', 'tsv', 'txt', 'xml'];
    }

    /**
     * Parsea un archivo y retorna los datos
     * @param {File} file - Archivo a parsear
     * @returns {Promise<Array>} - Array de objetos con los datos
     */
    async parseFile(file) {
        try {
            const extension = this.getFileExtension(file.name);
            
            if (!this.supportedFormats.includes(extension)) {
                throw new Error(`Formato no soportado: ${extension}`);
            }

            console.log(`📄 Parsing ${file.name} (${extension.toUpperCase()})...`);

            switch(extension) {
                case 'csv':
                    return await this.parseCSV(file);
                case 'tsv':
                    return await this.parseTSV(file);
                case 'xlsx':
                case 'xls':
                    return await this.parseExcel(file);
                case 'json':
                    return await this.parseJSON(file);
                case 'pdf':
                    return await this.parsePDF(file);
                case 'txt':
                    return await this.parseTXT(file);
                case 'xml':
                    return await this.parseXML(file);
                default:
                    throw new Error(`Handler no implementado para: ${extension}`);
            }
        } catch (error) {
            console.error('❌ Error parsing file:', error);
            throw error;
        }
    }

    /**
     * Parsea múltiples archivos
     * @param {FileList|Array<File>} files - Lista de archivos
     * @returns {Promise<Array>} - Array con resultados de cada archivo
     */
    async parseMultipleFiles(files) {
        const results = [];
        
        for (const file of files) {
            try {
                const data = await this.parseFile(file);
                results.push({
                    filename: file.name,
                    data: data,
                    success: true,
                    rowCount: data.length
                });
            } catch (error) {
                results.push({
                    filename: file.name,
                    data: null,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * CSV Parser usando Papa Parse
     */
    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            if (typeof Papa === 'undefined') {
                reject(new Error('Papa Parse library not loaded'));
                return;
            }

            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim(),
                complete: (results) => {
                    console.log('✅ CSV parsed:', results.data.length, 'rows');
                    resolve(results.data);
                },
                error: (error) => {
                    reject(new Error(`CSV parse error: ${error.message}`));
                }
            });
        });
    }

    /**
     * TSV Parser (Tab-separated values)
     */
    async parseTSV(file) {
        return new Promise((resolve, reject) => {
            if (typeof Papa === 'undefined') {
                reject(new Error('Papa Parse library not loaded'));
                return;
            }

            Papa.parse(file, {
                header: true,
                delimiter: '\t',
                dynamicTyping: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim(),
                complete: (results) => {
                    console.log('✅ TSV parsed:', results.data.length, 'rows');
                    resolve(results.data);
                },
                error: (error) => {
                    reject(new Error(`TSV parse error: ${error.message}`));
                }
            });
        });
    }

    /**
     * Excel Parser usando SheetJS
     */
    async parseExcel(file) {
        try {
            if (typeof XLSX === 'undefined') {
                throw new Error('SheetJS library not loaded');
            }

            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // Leer la primera hoja
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convertir a JSON
            const data = XLSX.utils.sheet_to_json(worksheet, {
                raw: false,
                defval: null
            });

            console.log('✅ Excel parsed:', data.length, 'rows');
            return data;
        } catch (error) {
            throw new Error(`Excel parse error: ${error.message}`);
        }
    }

    /**
     * JSON Parser
     */
    async parseJSON(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Si es un objeto, convertir a array
            const arrayData = Array.isArray(data) ? data : [data];
            
            console.log('✅ JSON parsed:', arrayData.length, 'records');
            return arrayData;
        } catch (error) {
            throw new Error(`JSON parse error: ${error.message}`);
        }
    }

    /**
     * PDF Parser usando pdf.js
     * Extrae tablas de texto del PDF
     */
    async parsePDF(file) {
        try {
            if (typeof pdfjsLib === 'undefined') {
                throw new Error('pdf.js library not loaded');
            }

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            let allText = '';
            
            // Extraer texto de todas las páginas
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                allText += pageText + '\n';
            }

            // Intentar detectar tablas en el texto
            const data = this.extractTablesFromText(allText);
            
            console.log('✅ PDF parsed:', data.length, 'records extracted');
            return data;
        } catch (error) {
            throw new Error(`PDF parse error: ${error.message}`);
        }
    }

    /**
     * TXT Parser (detecta automáticamente el delimitador)
     */
    async parseTXT(file) {
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
                throw new Error('Empty file');
            }

            // Detectar delimitador
            const delimiter = this.detectDelimiter(lines[0]);
            
            return new Promise((resolve, reject) => {
                if (typeof Papa === 'undefined') {
                    reject(new Error('Papa Parse library not loaded'));
                    return;
                }

                Papa.parse(text, {
                    header: true,
                    delimiter: delimiter,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        console.log('✅ TXT parsed:', results.data.length, 'rows');
                        resolve(results.data);
                    },
                    error: (error) => {
                        reject(new Error(`TXT parse error: ${error.message}`));
                    }
                });
            });
        } catch (error) {
            throw new Error(`TXT parse error: ${error.message}`);
        }
    }

    /**
     * XML Parser
     */
    async parseXML(file) {
        try {
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            // Buscar errores de parseo
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('Invalid XML format');
            }

            // Convertir XML a JSON
            const data = this.xmlToJson(xmlDoc);
            
            console.log('✅ XML parsed');
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            throw new Error(`XML parse error: ${error.message}`);
        }
    }

    /**
     * Extrae tablas de texto plano (para PDF)
     */
    extractTablesFromText(text) {
        const lines = text.split('\n').filter(line => line.trim());
        
        // Estrategia simple: buscar líneas con múltiples valores separados
        const data = [];
        let headers = null;

        for (const line of lines) {
            const cells = line.split(/\s{2,}|\t/).filter(c => c.trim());
            
            if (cells.length > 1) {
                if (!headers) {
                    headers = cells;
                } else {
                    const row = {};
                    cells.forEach((cell, i) => {
                        const header = headers[i] || `column_${i}`;
                        row[header] = cell;
                    });
                    data.push(row);
                }
            }
        }

        return data;
    }

    /**
     * Detecta el delimitador en un archivo de texto
     */
    detectDelimiter(line) {
        const delimiters = [',', '\t', ';', '|'];
        let maxCount = 0;
        let detectedDelimiter = ',';

        for (const delimiter of delimiters) {
            const count = (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                detectedDelimiter = delimiter;
            }
        }

        return detectedDelimiter;
    }

    /**
     * Convierte XML a JSON
     */
    xmlToJson(xml) {
        const obj = {};

        if (xml.nodeType === 1) { // Element
            if (xml.attributes.length > 0) {
                obj['@attributes'] = {};
                for (let j = 0; j < xml.attributes.length; j++) {
                    const attribute = xml.attributes.item(j);
                    obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType === 3) { // Text
            obj = xml.nodeValue;
        }

        if (xml.hasChildNodes()) {
            for (let i = 0; i < xml.childNodes.length; i++) {
                const item = xml.childNodes.item(i);
                const nodeName = item.nodeName;
                
                if (typeof obj[nodeName] === 'undefined') {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof obj[nodeName].push === 'undefined') {
                        const old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }

        return obj;
    }

    /**
     * Obtiene la extensión del archivo
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    /**
     * Valida si un formato es soportado
     */
    isSupported(filename) {
        const extension = this.getFileExtension(filename);
        return this.supportedFormats.includes(extension);
    }

    /**
     * Obtiene información del archivo
     */
    getFileInfo(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            extension: this.getFileExtension(file.name),
            sizeFormatted: this.formatFileSize(file.size),
            isSupported: this.isSupported(file.name)
        };
    }

    /**
     * Formatea el tamaño del archivo
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.FileParser = FileParser;
    window.fileParser = new FileParser();
    console.log('✅ FileParser loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileParser;
}
