import type { Threat, ProtectionMeasure, TacticalTask } from './types';

// Translation function type
type TranslationFunction = (key: string) => string;

/**
 * Подготовка данных для графика распределения угроз по CIA триаде
 */
export function getCIADistributionData(threats: Threat[], t: TranslationFunction) {
  const confidentiality = threats.filter(t => t.confidentiality).length;
  const integrity = threats.filter(t => t.integrity).length;
  const availability = threats.filter(t => t.availability).length;

  return [
    { name: t('confidentiality'), value: confidentiality, fill: 'confidentiality' },
    { name: t('integrity'), value: integrity, fill: 'integrity' },
    { name: t('availability'), value: availability, fill: 'availability' },
  ];
}

/**
 * Подготовка данных для графика комбинаций CIA
 */
export function getCIACombinationsData(threats: Threat[], t: TranslationFunction) {
  const combinations = {
    [t('onlyConfidentiality')]: 0,
    [t('onlyIntegrity')]: 0,
    [t('onlyAvailability')]: 0,
    [t('confidentialityIntegrity')]: 0,
    [t('confidentialityAvailability')]: 0,
    [t('integrityAvailability')]: 0,
    [t('allThreeCIA')]: 0,
  };

  threats.forEach(threat => {
    const c = threat.confidentiality;
    const i = threat.integrity;
    const a = threat.availability;

    if (c && !i && !a) {
      combinations[t('onlyConfidentiality')]++;
    } else if (!c && i && !a) {
      combinations[t('onlyIntegrity')]++;
    } else if (!c && !i && a) {
      combinations[t('onlyAvailability')]++;
    } else if (c && i && !a) {
      combinations[t('confidentialityIntegrity')]++;
    } else if (c && !i && a) {
      combinations[t('confidentialityAvailability')]++;
    } else if (!c && i && a) {
      combinations[t('integrityAvailability')]++;
    } else if (c && i && a) {
      combinations[t('allThreeCIA')]++;
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
export function getProtectionMeasuresStatsData(threats: Threat[], t: TranslationFunction) {
  const withMeasures = threats.filter(
    threat => 
      threat.protectionMeasures.length > 0 && 
      !threat.protectionMeasures.every(m => m === 'Б/Н' || m.trim() === '')
  ).length;
  
  const withoutMeasures = threats.length - withMeasures;

  return [
    { name: t('withMeasures'), value: withMeasures, fill: 'color1' },
    { name: t('withoutMeasures'), value: withoutMeasures, fill: 'color2' },
  ];
}

