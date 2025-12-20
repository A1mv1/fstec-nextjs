import type { DataStore, Threat, ProtectionMeasure, TacticalTask } from './types';

let cachedData: DataStore | null = null;

/**
 * Загрузка данных из JSON файла
 */
export async function loadData(): Promise<DataStore> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('/data/data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    const data = await response.json();
    cachedData = data;
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
 */
export async function getThreatById(id: number): Promise<Threat | null> {
  const data = await loadData();
  return data.threats.find(t => t.id === id) || null;
}

/**
 * Получение меры защиты по ID
 */
export async function getProtectionMeasureById(id: number): Promise<ProtectionMeasure | null> {
  const data = await loadData();
  return data.protectionMeasures.find(m => m.id === id) || null;
}

/**
 * Получение тактической задачи по ID
 */
export async function getTacticalTaskById(id: number): Promise<TacticalTask | null> {
  const data = await loadData();
  return data.tacticalTasks.find(t => t.id === id) || null;
}

/**
 * Получение всех угроз
 */
export async function getAllThreats(): Promise<Threat[]> {
  const data = await loadData();
  return data.threats;
}

/**
 * Получение всех мер защиты
 */
export async function getAllProtectionMeasures(): Promise<ProtectionMeasure[]> {
  const data = await loadData();
  return data.protectionMeasures;
}

/**
 * Получение всех тактических задач
 */
export async function getAllTacticalTasks(): Promise<TacticalTask[]> {
  const data = await loadData();
  return data.tacticalTasks;
}

