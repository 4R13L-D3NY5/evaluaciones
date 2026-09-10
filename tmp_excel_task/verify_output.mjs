import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const path = 'C:/Users/S1ST3M4S/XpertiFlow/projects/evaluaciones/outputs/examen-10-por-tipo-20260909-1p/examen-10-preguntas-por-tipo.xlsx';
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const sheet = wb.worksheets.getItem('Banco');
const values = sheet.getRange('A1:L63').values;
const headers = values[0];
const data = values.slice(1).filter((row) => row[0]);
const counts = {};
const difficultyCounts = {};
for (const row of data) {
  counts[row[0]] = (counts[row[0]] ?? 0) + 1;
  if (row[9] !== null && row[9] !== '') difficultyCounts[row[9]] = (difficultyCounts[row[9]] ?? 0) + 1;
}
const observations = data.map((row) => row[11]);
const invalidObservations = observations.filter((value) => value !== 'OK');
const formulas = await wb.inspect({ kind: 'formula', sheetId: 'Banco', range: 'A1:AJ140', maxChars: 1000, options: { maxResults: 5 } });
const errors = await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 300 }, summary: 'saved workbook formula error scan' });
console.log(JSON.stringify({
  headers,
  populatedRows: data.length,
  counts,
  difficultyCounts,
  invalidObservations,
  formulasPreview: formulas.ndjson,
  formulaErrors: errors.ndjson,
}));
