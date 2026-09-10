import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const templatePath = 'C:/Users/S1ST3M4S/XpertiFlow/projects/evaluaciones/bases/formato_banco_preguntas_asig_EF.xlsx';
const input = await FileBlob.load(templatePath);
const wb = await SpreadsheetFile.importXlsx(input);
console.log((await wb.inspect({ kind: 'workbook,sheet,table,region', maxChars: 20000, tableMaxRows: 8, tableMaxCols: 15, tableMaxCellChars: 100 })).ndjson);
console.log((await wb.inspect({ kind: 'computedStyle', sheetId: 'Banco', range: 'A1:L8', maxChars: 10000 })).ndjson);
console.log((await wb.inspect({ kind: 'formula', sheetId: 'Banco', range: 'A1:L20', maxChars: 12000, options: { maxResults: 100 } })).ndjson);
const preview = await wb.render({ sheetName: 'Banco', range: 'A1:L25', scale: 1, format: 'png' });
await fs.writeFile('C:/Users/S1ST3M4S/XpertiFlow/projects/evaluaciones/tmp_excel_task/template_preview.png', new Uint8Array(await preview.arrayBuffer()));
