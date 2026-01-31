import type { DataStore, Threat, ProtectionMeasure, TacticalTask } from './types';

// Cache for each locale
const cachedData: Record<string, DataStore | null> = {};

/**
 * Нормализация идентификатора меры защиты для сравнения между локалями
 * Normalize protection measure identifier for cross-locale comparison
 */
function normalizeMeasureIdentifier(identifier: string): string {
  // "Б/Н" и "N/A" - это одно и то же
  if (identifier === 'Б/Н' || identifier === 'N/A' || identifier === 'N/A (Not Applicable)') {
    return 'N/A';
  }
  return identifier.trim();
}

/**
 * Нормализация названия тактической задачи для сравнения
 * Normalize tactical task name for comparison
 */
function normalizeTaskName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Загрузка данных из JSON файла с поддержкой локализации
 * Load data from JSON file with locale support
 */
export async function loadData(locale: string = 'ru'): Promise<DataStore> {
  if (cachedData[locale]) {
    return cachedData[locale]!;
  }

  try {
    const response = await fetch(`/data/data.${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    const data = await response.json();
    cachedData[locale] = data;
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    // Возвращаем пустые данные в случае ошибки
    return {
      threats: [],
      protectionMeasures: [],
      tacticalTasks: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        threatsCount: 0,
        measuresCount: 0,
        tasksCount: 0,
      },
    };
  }
}

/**
 * Получение угрозы по ID
 * Get threat by ID
 */
export async function getThreatById(id: number, locale: string = 'ru'): Promise<Threat | null> {
  const data = await loadData(locale);
  return data.threats.find(t => t.id === id) || null;
}

/**
 * Получение меры защиты по ID
 * Get protection measure by ID
 */
export async function getProtectionMeasureById(id: number, locale: string = 'ru'): Promise<ProtectionMeasure | null> {
  const data = await loadData(locale);
  return data.protectionMeasures.find(m => m.id === id) || null;
}

/**
 * Получение тактической задачи по ID
 * Get tactical task by ID
 */
export async function getTacticalTaskById(id: number, locale: string = 'ru'): Promise<TacticalTask | null> {
  const data = await loadData(locale);
  return data.tacticalTasks.find(t => t.id === id) || null;
}

/**
 * Получение всех угроз
 * Get all threats
 */
export async function getAllThreats(locale: string = 'ru'): Promise<Threat[]> {
  const data = await loadData(locale);
  return data.threats;
}

/**
 * Получение всех мер защиты
 * Get all protection measures
 */
export async function getAllProtectionMeasures(locale: string = 'ru'): Promise<ProtectionMeasure[]> {
  const data = await loadData(locale);
  return data.protectionMeasures;
}

/**
 * Получение всех тактических задач
 * Get all tactical tasks
 */
export async function getAllTacticalTasks(locale: string = 'ru'): Promise<TacticalTask[]> {
  const data = await loadData(locale);
  return data.tacticalTasks;
}

