import * as fs from 'fs';
import * as path from 'path';

// Типы данных
interface Threat {
  id: number;
  name: string;
  tacticalTasks: string[];
  description: string;
  fstecId: number;
  violator: string[];
  object: string[];
  confidentiality: boolean;
  integrity: boolean;
  availability: boolean;
  protectionMeasures: string[];
}

interface ProtectionMeasure {
  id: number;
  name: string;
  identifier: string;
  regulatoryDocument: string;
}

interface TacticalTask {
  id: number;
  name: string;
  description: string;
  relatedThreats: string[];
  threatCount: number;
}

// Улучшенный парсинг CSV с поддержкой многострочных полей
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Экранированная кавычка
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Начало/конец кавычек
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (char === ',' && !inQuotes) {
      // Конец поля
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      // Конец строки
      if (char === '\r' && nextChar === '\n') {
        i += 2; // Пропустить \r\n
      } else {
        i++; // Пропустить \n
      }
      
      // Добавить последнее поле
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        currentField = '';
      }
      
      // Добавить строку если она не пустая
      if (currentRow.length > 0 && currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      continue;
    }

    currentField += char;
    i++;
  }

  // Добавить последнее поле и строку
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
  }
  if (currentRow.length > 0 && currentRow.some(f => f.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

// Парсинг угроз
function parseThreats(csvPath: string): Threat[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);
  const headers = rows[0];
  const threats: Threat[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < headers.length) continue;

    try {
      const id = parseInt(row[0] || '0', 10);
      const name = row[1] || '';
      const tacticalTasks = (row[2] || '').split(';').map(t => t.trim()).filter(Boolean);
      const description = row[3] || '';
      const fstecId = parseInt(row[4] || '0', 10);
      const violator = (row[5] || '').split(',').map(v => v.trim()).filter(Boolean);
      const object = (row[6] || '').split(',').map(o => o.trim()).filter(Boolean);
      const confidentiality = row[7]?.toLowerCase() === 'да';
      const integrity = row[8]?.toLowerCase() === 'да';
      const availability = row[9]?.toLowerCase() === 'да';
      const protectionMeasures = (row[10] || '').split(',').map(p => p.trim()).filter(Boolean);

      if (id && name) {
        threats.push({
          id,
          name,
          tacticalTasks,
          description,
          fstecId,
          violator,
          object,
          confidentiality,
          integrity,
          availability,
          protectionMeasures,
        });
      }
    } catch (error) {
      console.error(`Error parsing row ${i}:`, error);
    }
  }

  return threats;
}

// Парсинг мер защиты
function parseProtectionMeasures(csvPath: string): ProtectionMeasure[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);
  const measures: ProtectionMeasure[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 4) continue;

    try {
      const id = parseInt(row[0] || '0', 10);
      const name = row[1] || '';
      const identifier = row[2] || '';
      const regulatoryDocument = row[3] || '';

      if (id && name) {
        measures.push({
          id,
          name,
          identifier,
          regulatoryDocument,
        });
      }
    } catch (error) {
      console.error(`Error parsing row ${i}:`, error);
    }
  }

  return measures;
}

// Парсинг тактических задач
function parseTacticalTasks(csvPath: string): TacticalTask[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);
  const tasks: TacticalTask[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 5) continue;

    try {
      const id = parseInt(row[0] || '0', 10);
      const name = row[1] || '';
      const description = row[2] || '';
      const relatedThreats = (row[3] || '').split(';').map(t => t.trim()).filter(Boolean);
      const threatCount = parseInt(row[4] || '0', 10);

      if (id && name) {
        tasks.push({
          id,
          name,
          description,
          relatedThreats,
          threatCount,
        });
      }
    } catch (error) {
      console.error(`Error parsing row ${i}:`, error);
    }
  }

  return tasks;
}

// Главная функция
function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const dataDir = path.join(projectRoot, 'data');
  
  // Создать директорию data если её нет
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log('Parsing CSV files...');

  // Парсинг угроз
  const threatsPath = path.join(projectRoot, 'fstec_threats_all_pages.csv');
  const threats = parseThreats(threatsPath);
  console.log(`Parsed ${threats.length} threats`);

  // Парсинг мер защиты
  const measuresPath = path.join(projectRoot, 'security.csv');
  const measures = parseProtectionMeasures(measuresPath);
  console.log(`Parsed ${measures.length} protection measures`);

  // Парсинг тактических задач
  const tasksPath = path.join(projectRoot, 'phase.csv');
  const tasks = parseTacticalTasks(tasksPath);
  console.log(`Parsed ${tasks.length} tactical tasks`);

  // Сохранение JSON
  const output = {
    threats,
    protectionMeasures: measures,
    tacticalTasks: tasks,
    metadata: {
      generatedAt: new Date().toISOString(),
      threatsCount: threats.length,
      measuresCount: measures.length,
      tasksCount: tasks.length,
    },
  };

  const outputPath = path.join(dataDir, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Data saved to ${outputPath}`);

  // Также копируем в public/data для использования в приложении
  const publicDataDir = path.join(projectRoot, 'public', 'data');
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }
  const publicOutputPath = path.join(publicDataDir, 'data.json');
  fs.writeFileSync(publicOutputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Data also saved to ${publicOutputPath}`);
}

main();

