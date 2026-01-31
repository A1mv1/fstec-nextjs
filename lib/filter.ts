import type { Threat, ThreatFilters } from './types';

/**
 * Дебаунс функция для поиска
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Быстрая фильтрация угроз по текстовому поиску
 */
function matchesSearch(threat: Threat, search: string): boolean {
  if (!search) return true;
  
  const searchLower = search.toLowerCase();
  const searchTrimmed = search.trim();
  
  // Проверка по ID (числовой поиск)
  const searchAsNumber = Number(searchTrimmed);
  if (!isNaN(searchAsNumber) && searchAsNumber > 0) {
    if (threat.id === searchAsNumber || threat.fstecId === searchAsNumber) {
      return true;
    }
  }
  
  // Текстовый поиск
  return (
    threat.name.toLowerCase().includes(searchLower) ||
    threat.description.toLowerCase().includes(searchLower) ||
    threat.tacticalTasks.some(t => t.toLowerCase().includes(searchLower)) ||
    threat.violator.some(v => v.toLowerCase().includes(searchLower)) ||
    threat.object.some(o => o.toLowerCase().includes(searchLower))
  );
}

/**
 * Фильтрация по тактическим задачам
 */
function matchesTacticalTasks(threat: Threat, tasks: string[]): boolean {
  if (!tasks || tasks.length === 0) return true;
  return tasks.some(task => 
    threat.tacticalTasks.some(tt => {
      // Разбиваем строку по запятым на отдельные задачи
      const individualTasks = tt.split(',').map(t => t.trim()).filter(Boolean);
      // Проверяем, есть ли точное совпадение с одной из задач
      return individualTasks.some(it => it === task);
    })
  );
}

/**
 * Фильтрация по нарушителям
 */
function matchesViolators(threat: Threat, violators: string[]): boolean {
  if (!violators || violators.length === 0) return true;
  return violators.some(violator => 
    threat.violator.some(v => v.includes(violator))
  );
}

/**
 * Фильтрация по объектам
 */
function matchesObjects(threat: Threat, objects: string[]): boolean {
  if (!objects || objects.length === 0) return true;
  return objects.some(obj => 
    threat.object.some(o => o.includes(obj))
  );
}

/**
 * Фильтрация по мерам защиты
 */
function matchesProtectionMeasures(threat: Threat, measures: string[]): boolean {
  if (!measures || measures.length === 0) return true;
  return measures.some(measure => 
    threat.protectionMeasures.some(pm => pm.includes(measure))
  );
}

/**
 * Фильтрация по FSTEC ID
 */
function matchesFstecIds(threat: Threat, ids: number[]): boolean {
  if (!ids || ids.length === 0) return true;
  return ids.includes(threat.fstecId);
}

/**
 * Основная функция фильтрации угроз
 * Оптимизирована для быстрой работы с большими массивами
 */
export function filterThreats(
  threats: Threat[],
  filters: ThreatFilters
): Threat[] {
  if (!threats || threats.length === 0) return [];

  // Быстрый выход если нет фильтров
  const hasFilters = 
    filters.search ||
    (filters.tacticalTasks && filters.tacticalTasks.length > 0) ||
    (filters.violators && filters.violators.length > 0) ||
    (filters.objects && filters.objects.length > 0) ||
    (filters.protectionMeasures && filters.protectionMeasures.length > 0) ||
    (filters.fstecIds && filters.fstecIds.length > 0) ||
    filters.confidentiality !== undefined ||
    filters.integrity !== undefined ||
    filters.availability !== undefined;

  if (!hasFilters) return threats;

  return threats.filter(threat => {
    // Текстовый поиск
    if (filters.search && !matchesSearch(threat, filters.search)) {
      return false;
    }

    // Фильтр по тактическим задачам
    if (filters.tacticalTasks && !matchesTacticalTasks(threat, filters.tacticalTasks)) {
      return false;
    }

    // Фильтр по нарушителям
    if (filters.violators && !matchesViolators(threat, filters.violators)) {
      return false;
    }

    // Фильтр по объектам
    if (filters.objects && !matchesObjects(threat, filters.objects)) {
      return false;
    }

    // Фильтр по мерам защиты
    if (filters.protectionMeasures && !matchesProtectionMeasures(threat, filters.protectionMeasures)) {
      return false;
    }

    // Фильтр по FSTEC ID
    if (filters.fstecIds && !matchesFstecIds(threat, filters.fstecIds)) {
      return false;
    }

    // Фильтры по CIA (Конфиденциальность, Целостность, Доступность)
    if (filters.confidentiality !== undefined && threat.confidentiality !== filters.confidentiality) {
      return false;
    }

    if (filters.integrity !== undefined && threat.integrity !== filters.integrity) {
      return false;
    }

    if (filters.availability !== undefined && threat.availability !== filters.availability) {
      return false;
    }

    return true;
  });
}

/**
 * Получение уникальных значений для фильтров
 */
export function getUniqueValues(threats: Threat[]): {
  tacticalTasks: string[];
  violators: string[];
  objects: string[];
  protectionMeasures: string[];
} {
  const tacticalTasksSet = new Set<string>();
  const violatorsSet = new Set<string>();
  const objectsSet = new Set<string>();
  const protectionMeasuresSet = new Set<string>();

  threats.forEach(threat => {
    // Разбиваем тактические задачи по запятым на отдельные задачи
    threat.tacticalTasks.forEach(t => {
      const individualTasks = t.split(',').map(task => task.trim()).filter(Boolean);
      individualTasks.forEach(task => tacticalTasksSet.add(task));
    });
    threat.violator.forEach(v => violatorsSet.add(v));
    threat.object.forEach(o => objectsSet.add(o));
    threat.protectionMeasures.forEach(pm => protectionMeasuresSet.add(pm));
  });

  return {
    tacticalTasks: Array.from(tacticalTasksSet).sort(),
    violators: Array.from(violatorsSet).sort(),
    objects: Array.from(objectsSet).sort(),
    protectionMeasures: Array.from(protectionMeasuresSet).sort(),
  };
}

