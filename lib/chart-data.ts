import type { Threat, ProtectionMeasure, TacticalTask } from './types';

/**
 * Подготовка данных для графика распределения угроз по CIA триаде
 */
export function getCIADistributionData(threats: Threat[]) {
  const confidentiality = threats.filter(t => t.confidentiality).length;
  const integrity = threats.filter(t => t.integrity).length;
  const availability = threats.filter(t => t.availability).length;

  return [
    { name: 'Конфиденциальность', value: confidentiality, fill: 'confidentiality' },
    { name: 'Целостность', value: integrity, fill: 'integrity' },
    { name: 'Доступность', value: availability, fill: 'availability' },
  ];
}

/**
 * Подготовка данных для графика комбинаций CIA
 */
export function getCIACombinationsData(threats: Threat[]) {
  const combinations = {
    'Только Конфиденциальность': 0,
    'Только Целостность': 0,
    'Только Доступность': 0,
    'Конфиденциальность + Целостность': 0,
    'Конфиденциальность + Доступность': 0,
    'Целостность + Доступность': 0,
    'Все три (CIA)': 0,
  };

  threats.forEach(threat => {
    const c = threat.confidentiality;
    const i = threat.integrity;
    const a = threat.availability;

    if (c && !i && !a) {
      combinations['Только Конфиденциальность']++;
    } else if (!c && i && !a) {
      combinations['Только Целостность']++;
    } else if (!c && !i && a) {
      combinations['Только Доступность']++;
    } else if (c && i && !a) {
      combinations['Конфиденциальность + Целостность']++;
    } else if (c && !i && a) {
      combinations['Конфиденциальность + Доступность']++;
    } else if (!c && i && a) {
      combinations['Целостность + Доступность']++;
    } else if (c && i && a) {
      combinations['Все три (CIA)']++;
    }
  });

  const entries = Object.entries(combinations).filter(([_, count]) => count > 0);
  return entries.map(([name, value], index) => ({
    name,
    value,
    fill: `color${(index % 5) + 1}`,
  }));
}

/**
 * Подготовка данных для графика топ-10 нарушителей
 */
export function getTopViolatorsData(threats: Threat[], limit: number = 10) {
  const violatorCounts: Record<string, number> = {};

  threats.forEach(threat => {
    threat.violator.forEach(violator => {
      violatorCounts[violator] = (violatorCounts[violator] || 0) + 1;
    });
  });

  return Object.entries(violatorCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .reverse(); // Для горизонтальной диаграммы нужен обратный порядок
}

/**
 * Подготовка данных для графика топ-15 объектов воздействия
 */
export function getTopObjectsData(threats: Threat[], limit: number = 15) {
  const objectCounts: Record<string, number> = {};

  threats.forEach(threat => {
    threat.object.forEach(obj => {
      objectCounts[obj] = (objectCounts[obj] || 0) + 1;
    });
  });

  return Object.entries(objectCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .reverse(); // Для горизонтальной диаграммы нужен обратный порядок
}

/**
 * Подготовка данных для графика распределения по тактическим задачам MITRE ATT&CK
 */
export function getTacticalTasksDistributionData(threats: Threat[]) {
  const taskCounts: Record<string, number> = {};

  threats.forEach(threat => {
    threat.tacticalTasks.forEach(task => {
      // Разделяем задачи, если они объединены через запятую
      const tasks = task.split(',').map(t => t.trim());
      tasks.forEach(t => {
        if (t) {
          taskCounts[t] = (taskCounts[t] || 0) + 1;
        }
      });
    });
  });

  return Object.entries(taskCounts)
    .map(([name, value], index) => ({
      name,
      value,
      fill: `color${(index % 5) + 1}`,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Подготовка данных для графика статистики по мерам защиты
 */
export function getProtectionMeasuresStatsData(threats: Threat[]) {
  const withMeasures = threats.filter(
    threat => 
      threat.protectionMeasures.length > 0 && 
      !threat.protectionMeasures.every(m => m === 'Б/Н' || m.trim() === '')
  ).length;
  
  const withoutMeasures = threats.length - withMeasures;

  return [
    { name: 'С мерами защиты', value: withMeasures, fill: 'color1' },
    { name: 'Без мер защиты', value: withoutMeasures, fill: 'color2' },
  ];
}

