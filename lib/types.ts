// Типы данных для системы анализа угроз

export interface Threat {
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

export interface ProtectionMeasure {
  id: number;
  name: string;
  identifier: string;
  regulatoryDocument: string;
}

export interface TacticalTask {
  id: number;
  name: string;
  description: string;
  relatedThreats: string[];
  threatCount: number;
}

export interface DataStore {
  threats: Threat[];
  protectionMeasures: ProtectionMeasure[];
  tacticalTasks: TacticalTask[];
  metadata: {
    generatedAt: string;
    threatsCount: number;
    measuresCount: number;
    tasksCount: number;
  };
}

// Типы для фильтрации
export type FilterOperator = 'AND' | 'OR';

export interface FilterCondition {
  field: keyof Threat;
  operator: 'equals' | 'contains' | 'includes' | 'in';
  value: any;
}

export interface FilterGroup {
  operator: FilterOperator;
  conditions: (FilterCondition | FilterGroup)[];
}

export interface ThreatFilters {
  search?: string;
  tacticalTasks?: string[];
  violators?: string[];
  objects?: string[];
  confidentiality?: boolean;
  integrity?: boolean;
  availability?: boolean;
  protectionMeasures?: string[];
  fstecIds?: number[];
}

