import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const projectRoot = 'C:/Users/S1ST3M4S/XpertiFlow/projects/evaluaciones';
const sourcePath = `${projectRoot}/evaluaciones-frontend/src/assets/formato_banco_preguntas_asig_EF.xlsx`;
const outputDir = `${projectRoot}/outputs/image-base64-preview`;
const outputPath = `${outputDir}/formato_banco_preguntas_asig_EF.xlsx`;

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(sourcePath));
const sheet = workbook.worksheets.getItem('Banco');

// Las columnas M:AJ son auxiliares y contienen las validaciones ocultas de la plantilla.
// La nueva columna queda al final de la hoja visible de datos, sin alterar dichas fórmulas.
const imageColumn = sheet.getRange('AK1:AK121');
imageColumn.values = [
  ['imagen_base64'],
  ...Array.from({ length: 120 }, () => [''])
];

sheet.getRange('AK1').format = {
  fill: '#4527A0',
  font: { bold: true, color: '#FFFFFF' },
  borders: { preset: 'all', style: 'thin', color: '#808080' },
  horizontalAlignment: 'center',
  wrapText: true,
};
sheet.getRange('AK2:AK31').format = {
  fill: '#C6EFCE',
  borders: { preset: 'all', style: 'thin', color: '#808080' },
  wrapText: true,
};
sheet.getRange('AK32:AK91').format = {
  fill: '#FFEB9C',
  borders: { preset: 'all', style: 'thin', color: '#808080' },
  wrapText: true,
};
sheet.getRange('AK92:AK121').format = {
  fill: '#FFC7CE',
  borders: { preset: 'all', style: 'thin', color: '#808080' },
  wrapText: true,
};
sheet.getRange('AK:AK').format.columnWidth = 28;

await fs.mkdir(outputDir, { recursive: true });
const preview = await workbook.render({ sheetName: 'Banco', range: 'A1:AK6', scale: 1.5, format: 'png' });
await fs.writeFile(`${outputDir}/template-after.png`, new Uint8Array(await preview.arrayBuffer()));
const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(outputPath);
await exported.save(sourcePath);

const check = await workbook.inspect({
  kind: 'region',
  sheetId: 'Banco',
  range: 'A1:AK3',
  maxChars: 3000,
  tableMaxRows: 3,
  tableMaxCols: 37,
});
console.log(check.ndjson);
console.log(`saved=${outputPath}`);
