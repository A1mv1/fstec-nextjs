"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverPopup as PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tooltip, TooltipTrigger, TooltipPopup } from "@/components/ui/tooltip";
import { X, Filter, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAllThreats, getAllTacticalTasks, getAllProtectionMeasures } from "@/lib/data";
import { filterThreats, getUniqueValues, debounce } from "@/lib/filter";
import type { Threat, ThreatFilters, TacticalTask, ProtectionMeasure } from "@/lib/types";

export default function AnalysisPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [tacticalTasks, setTacticalTasks] = useState<TacticalTask[]>([]);
  const [protectionMeasures, setProtectionMeasures] = useState<ProtectionMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ThreatFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [uniqueValues, setUniqueValues] = useState({
    tacticalTasks: [] as string[],
    violators: [] as string[],
    objects: [] as string[],
    protectionMeasures: [] as string[],
  });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  // Состояния для поиска в фильтрах
  const [filterSearch, setFilterSearch] = useState({
    tacticalTasks: "",
    violators: "",
    objects: "",
    protectionMeasures: "",
  });

  // Загрузка данных
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [threatsData, tasksData, measuresData] = await Promise.all([
          getAllThreats(),
          getAllTacticalTasks(),
          getAllProtectionMeasures(),
        ]);
        setThreats(threatsData);
        setTacticalTasks(tasksData);
        setProtectionMeasures(measuresData);
        const unique = getUniqueValues(threatsData);
        setUniqueValues(unique);
      } catch (error) {
        console.error("Error loading threats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Debounced поиск
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setFilters((prev) => {
          const newFilters = { ...prev };
          if (query.trim()) {
            newFilters.search = query;
          } else {
            delete newFilters.search;
          }
          return newFilters;
        });
      }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Фильтрация угроз
  const filteredThreats = useMemo(() => {
    return filterThreats(threats, filters);
  }, [threats, filters]);

  // Функция для поиска тактической задачи по названию
  const findTacticalTaskByName = (taskName: string): TacticalTask | undefined => {
    // Сначала ищем точное совпадение
    let task = tacticalTasks.find((task) => task.name === taskName);
    if (task) return task;
    
    // Затем ищем, если название задачи содержит искомое имя
    task = tacticalTasks.find((task) => task.name.includes(taskName));
    if (task) return task;
    
    // И наоборот
    task = tacticalTasks.find((task) => taskName.includes(task.name));
    return task;
  };

  // Функция для поиска меры защиты по идентификатору или названию
  const findProtectionMeasureByIdentifier = (measureString: string): ProtectionMeasure | undefined => {
    // Ищем по идентификатору (точное совпадение)
    let measure = protectionMeasures.find((m) => m.identifier === measureString);
    if (measure) return measure;
    
    // Ищем, если строка содержит идентификатор
    measure = protectionMeasures.find((m) => measureString.includes(m.identifier));
    if (measure) return measure;
    
    // Ищем, если идентификатор содержится в строке
    measure = protectionMeasures.find((m) => m.identifier.includes(measureString));
    if (measure) return measure;
    
    // Ищем по названию
    measure = protectionMeasures.find((m) => m.name === measureString);
    if (measure) return measure;
    
    // Ищем, если название содержит строку
    measure = protectionMeasures.find((m) => m.name.includes(measureString));
    if (measure) return measure;
    
    return measure;
  };

  // Определение колонок таблицы
  const columns = useMemo<ColumnDef<Threat>[]>(() => [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 -ml-3 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="w-12 text-center text-xs">
          {row.original.id}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "НАИМЕНОВАНИЕ",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="min-w-[200px] max-w-[350px] text-xs">
          <Link
            href={`/threats/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "tacticalTasks",
      header: "ТАКТИЧЕСКАЯ ЗАДАЧА",
      enableSorting: false,
      cell: ({ row }) => {
        // Разбиваем строки с запятыми на отдельные задачи
        const allTasks = row.original.tacticalTasks.flatMap(taskString => 
          taskString.split(',').map(t => t.trim()).filter(Boolean)
        );
        
        return (
          <div className="min-w-[120px] max-w-[180px] text-xs flex flex-col gap-0.5">
            {allTasks.map((taskName, index) => {
              const task = findTacticalTaskByName(taskName);
              
              if (!task) {
                return (
                  <span key={`task-${row.original.id}-${index}`} className="block">
                    {taskName}
                  </span>
                );
              }
              
              return (
                <Link
                  key={`task-${row.original.id}-${index}`}
                  href={`/tactical-tasks/${task.id}`}
                  className="text-primary hover:underline block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {taskName}
                </Link>
              );
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "ОПИСАНИЕ",
      enableSorting: false,
      cell: ({ row }) => {
        const description = row.original.description;
        const truncated = description.length > 329 
          ? description.substring(0, 329) + "..." 
          : description;
        return (
          <div className="min-w-[250px] max-w-[400px] text-xs text-muted-foreground">
            {truncated}
          </div>
        );
      },
    },
    {
      accessorKey: "fstecId",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 -ml-3 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ид. ФСТЭК
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="w-16 text-center text-xs">
          {row.original.fstecId > 0 ? row.original.fstecId : "-"}
        </div>
      ),
    },
    {
      accessorKey: "violator",
      header: "НАРУШИТЕЛЬ",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="min-w-[150px] max-w-[250px] text-xs">
          {row.original.violator.map((v, index) => (
            <span key={index}>
              {v}
              {index < row.original.violator.length - 1 && ", "}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "object",
      header: "ОБЪЕКТ",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="min-w-[150px] max-w-[250px] text-xs">
          {row.original.object.map((o, index) => (
            <span key={index}>
              {o}
              {index < row.original.object.length - 1 && ", "}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "confidentiality",
      accessorFn: (row) => row.confidentiality ? 1 : 0,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 -ml-3 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            К
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="w-12 text-center">
          {row.original.confidentiality ? (
            <div className="inline-flex h-5 w-5 items-center justify-center rounded border-2 border-success bg-success/10 dark:bg-success/20">
              <div className="h-2 w-2 rounded-full bg-success" />
            </div>
          ) : (
            <div className="inline-flex h-5 w-5 items-center justify-center rounded border-2 border-muted-foreground/30 bg-transparent">
              <div className="h-2 w-2 rounded-full bg-transparent" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "integrity",
      accessorFn: (row) => row.integrity ? 1 : 0,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 -ml-3 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ц
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="w-12 text-center">
          {row.original.integrity ? (
            <div className="inline-flex h-5 w-5 items-center justify-center rounded border-2 border-success bg-success/10 dark:bg-success/20">
              <div className="h-2 w-2 rounded-full bg-success" />
            </div>
          ) : (
            <div className="inline-flex h-5 w-5 items-center justify-center rounded border-2 border-muted-foreground/30 bg-transparent">
              <div className="h-2 w-2 rounded-full bg-transparent" />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "availability",
      accessorFn: (row) => row.availability ? 1 : 0,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 -ml-3 px-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Д
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="w-12 text-center">
          {row.original.availability ? (
            <div className="inline-flex h-5 w-5 items-center justify-center rounded border-2 border-success bg-success/10 dark:bg-success/20">
              <div className="h-2 w-2 rounded-full bg-success" />
            </div>
          ) : (
            <div className="inline-flex h-5 w-5 items-center justify-center rounded border-2 border-muted-foreground/30 bg-transparent">
              <div className="h-2 w-2 rounded-full bg-transparent" />
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "protectionMeasures",
      header: "МЕРЫ ЗАЩИТЫ",
      enableSorting: false,
      cell: ({ row }) => {
        // Разбиваем строки с запятыми на отдельные меры
        const allMeasures = row.original.protectionMeasures.flatMap(measureString => 
          measureString.split(',').map(m => m.trim()).filter(Boolean)
        );
        
        return (
          <div className="min-w-[150px] max-w-[300px] text-xs flex flex-col gap-0.5">
            {allMeasures.length > 0 ? (
              allMeasures.map((measureString, index) => {
                const measure = findProtectionMeasureByIdentifier(measureString);
                
                if (measure) {
                  return (
                    <Link
                      key={`measure-${row.original.id}-${index}`}
                      href={`/protection-measures/${measure.id}`}
                      className="text-primary hover:underline block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {measureString}
                    </Link>
                  );
                }
                
                return (
                  <span key={`measure-${row.original.id}-${index}`} className="block">
                    {measureString}
                  </span>
                );
              })
            ) : (
              <span className="text-muted-foreground">Б/Н</span>
            )}
          </div>
        );
      },
    },
  ], [tacticalTasks, protectionMeasures]);

  // Инициализация таблицы
  const table = useReactTable({
    data: filteredThreats,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  // Обработчики фильтров
  const handleTacticalTaskToggle = (task: string, checked: boolean) => {
    setFilters((prev) => {
      const current = prev.tacticalTasks || [];
      const newTasks = checked
        ? [...current, task]
        : current.filter((t) => t !== task);
      const newFilters = { ...prev };
      if (newTasks.length > 0) {
        newFilters.tacticalTasks = newTasks;
      } else {
        delete newFilters.tacticalTasks;
      }
      return newFilters;
    });
  };

  const handleViolatorToggle = (violator: string, checked: boolean) => {
    setFilters((prev) => {
      const current = prev.violators || [];
      const newViolators = checked
        ? [...current, violator]
        : current.filter((v) => v !== violator);
      const newFilters = { ...prev };
      if (newViolators.length > 0) {
        newFilters.violators = newViolators;
      } else {
        delete newFilters.violators;
      }
      return newFilters;
    });
  };

  const handleObjectToggle = (obj: string, checked: boolean) => {
    setFilters((prev) => {
      const current = prev.objects || [];
      const newObjects = checked
        ? [...current, obj]
        : current.filter((o) => o !== obj);
      const newFilters = { ...prev };
      if (newObjects.length > 0) {
        newFilters.objects = newObjects;
      } else {
        delete newFilters.objects;
      }
      return newFilters;
    });
  };

  const handleProtectionMeasureToggle = (measure: string, checked: boolean) => {
    setFilters((prev) => {
      const current = prev.protectionMeasures || [];
      const newMeasures = checked
        ? [...current, measure]
        : current.filter((m) => m !== measure);
      const newFilters = { ...prev };
      if (newMeasures.length > 0) {
        newFilters.protectionMeasures = newMeasures;
      } else {
        delete newFilters.protectionMeasures;
      }
      return newFilters;
    });
  };

  const handleCIAToggle = (field: "confidentiality" | "integrity" | "availability", value: boolean | undefined) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (value === undefined) {
        delete newFilters[field];
      } else {
        newFilters[field] = value;
      }
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    // Поиск
    if (filters.search && filters.search.trim().length > 0) count++;
    // Массивы фильтров - считаем количество элементов в каждом массиве
    if (Array.isArray(filters.tacticalTasks) && filters.tacticalTasks.length > 0) {
      count += filters.tacticalTasks.length;
    }
    if (Array.isArray(filters.violators) && filters.violators.length > 0) {
      count += filters.violators.length;
    }
    if (Array.isArray(filters.objects) && filters.objects.length > 0) {
      count += filters.objects.length;
    }
    if (Array.isArray(filters.protectionMeasures) && filters.protectionMeasures.length > 0) {
      count += filters.protectionMeasures.length;
    }
    // CIA фильтры - каждый активный фильтр считается отдельно
    if (filters.confidentiality !== undefined && filters.confidentiality !== null) count++;
    if (filters.integrity !== undefined && filters.integrity !== null) count++;
    if (filters.availability !== undefined && filters.availability !== null) count++;
    return count;
  }, [filters]);

  // Функции экспорта
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Б";
    const k = 1024;
    const sizes = ["Б", "КБ", "МБ"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileSize = (format: "json" | "csv" | "tsv" | "txt"): string => {
    if (filteredThreats.length === 0) return "0 Б";
    try {
      let content = "";
      
      switch (format) {
        case "json":
          content = JSON.stringify(filteredThreats, null, 2);
          break;
        case "csv":
          const csvHeaders = ["ID", "Название", "Описание", "ФСТЭК ID", "Тактические задачи", "Нарушитель", "Объект", "Конфиденциальность", "Целостность", "Доступность", "Меры защиты"];
          const csvRows = filteredThreats.map(threat => [
            threat.id.toString(),
            `"${threat.name.replace(/"/g, '""')}"`,
            `"${threat.description.replace(/"/g, '""')}"`,
            threat.fstecId > 0 ? threat.fstecId.toString() : "",
            `"${threat.tacticalTasks.join("; ").replace(/"/g, '""')}"`,
            `"${threat.violator.join("; ").replace(/"/g, '""')}"`,
            `"${threat.object.join("; ").replace(/"/g, '""')}"`,
            threat.confidentiality ? "Да" : "Нет",
            threat.integrity ? "Да" : "Нет",
            threat.availability ? "Да" : "Нет",
            `"${threat.protectionMeasures.join("; ").replace(/"/g, '""')}"`,
          ]);
          content = "\ufeff" + [csvHeaders, ...csvRows].map(row => row.join(",")).join("\n");
          break;
        case "tsv":
          const tsvHeaders = ["ID", "Название", "Описание", "ФСТЭК ID", "Тактические задачи", "Нарушитель", "Объект", "Конфиденциальность", "Целостность", "Доступность", "Меры защиты"];
          const tsvRows = filteredThreats.map(threat => [
            threat.id.toString(),
            threat.name,
            threat.description,
            threat.fstecId > 0 ? threat.fstecId.toString() : "",
            threat.tacticalTasks.join("; "),
            threat.violator.join("; "),
            threat.object.join("; "),
            threat.confidentiality ? "Да" : "Нет",
            threat.integrity ? "Да" : "Нет",
            threat.availability ? "Да" : "Нет",
            threat.protectionMeasures.join("; "),
          ]);
          content = [tsvHeaders, ...tsvRows].map(row => row.join("\t")).join("\n");
          break;
        case "txt":
          content = filteredThreats.map((threat, index) => [
            `Угроза безопасности информации #${threat.id} (${index + 1} из ${filteredThreats.length})`,
            "=".repeat(50),
            "",
            `Название: ${threat.name}`,
            "",
            `Описание:`,
            threat.description,
            "",
            `ФСТЭК ID: ${threat.fstecId > 0 ? threat.fstecId : "Не указан"}`,
            "",
            `Тактические задачи:`,
            threat.tacticalTasks.length > 0 ? threat.tacticalTasks.map((t, i) => `  ${i + 1}. ${t}`).join("\n") : "  Не указаны",
            "",
            `Нарушитель:`,
            threat.violator.length > 0 ? threat.violator.map((v, i) => `  ${i + 1}. ${v}`).join("\n") : "  Не указан",
            "",
            `Объект:`,
            threat.object.length > 0 ? threat.object.map((o, i) => `  ${i + 1}. ${o}`).join("\n") : "  Не указан",
            "",
            `CIA:`,
            `  Конфиденциальность: ${threat.confidentiality ? "Да" : "Нет"}`,
            `  Целостность: ${threat.integrity ? "Да" : "Нет"}`,
            `  Доступность: ${threat.availability ? "Да" : "Нет"}`,
            "",
            `Меры защиты:`,
            threat.protectionMeasures.length > 0 ? threat.protectionMeasures.map((m, i) => `  ${i + 1}. ${m}`).join("\n") : "  Не указаны",
            "",
            "",
          ].join("\n")).join("\n");
          break;
      }
      
      const encoder = new TextEncoder();
      const bytes = encoder.encode(content).length;
      return formatFileSize(bytes);
    } catch (error) {
      return "—";
    }
  };

  const exportToJSON = () => {
    if (filteredThreats.length === 0) return;
    try {
      const blob = new Blob([JSON.stringify(filteredThreats, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threats-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDialogOpen(false);
      // Используем setTimeout чтобы toast показался после закрытия диалога
      setTimeout(() => {
        toastSuccess("Экспорт завершен", "Данные успешно экспортированы в JSON");
      }, 100);
    } catch (error) {
      console.error("Ошибка при экспорте в JSON:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  const exportToCSV = () => {
    if (filteredThreats.length === 0) return;
    try {
      const csvHeaders = ["ID", "Название", "Описание", "ФСТЭК ID", "Тактические задачи", "Нарушитель", "Объект", "Конфиденциальность", "Целостность", "Доступность", "Меры защиты"];
      const csvRows = filteredThreats.map(threat => [
        threat.id.toString(),
        `"${threat.name.replace(/"/g, '""')}"`,
        `"${threat.description.replace(/"/g, '""')}"`,
        threat.fstecId > 0 ? threat.fstecId.toString() : "",
        `"${threat.tacticalTasks.join("; ").replace(/"/g, '""')}"`,
        `"${threat.violator.join("; ").replace(/"/g, '""')}"`,
        `"${threat.object.join("; ").replace(/"/g, '""')}"`,
        threat.confidentiality ? "Да" : "Нет",
        threat.integrity ? "Да" : "Нет",
        threat.availability ? "Да" : "Нет",
        `"${threat.protectionMeasures.join("; ").replace(/"/g, '""')}"`,
      ]);
      const csvContent = [csvHeaders, ...csvRows].map(row => row.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threats-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDialogOpen(false);
      setTimeout(() => {
        toastSuccess("Экспорт завершен", "Данные успешно экспортированы в CSV");
      }, 100);
    } catch (error) {
      console.error("Ошибка при экспорте в CSV:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  const exportToTSV = () => {
    if (filteredThreats.length === 0) return;
    try {
      const tsvHeaders = ["ID", "Название", "Описание", "ФСТЭК ID", "Тактические задачи", "Нарушитель", "Объект", "Конфиденциальность", "Целостность", "Доступность", "Меры защиты"];
      const tsvRows = filteredThreats.map(threat => [
        threat.id.toString(),
        threat.name,
        threat.description,
        threat.fstecId > 0 ? threat.fstecId.toString() : "",
        threat.tacticalTasks.join("; "),
        threat.violator.join("; "),
        threat.object.join("; "),
        threat.confidentiality ? "Да" : "Нет",
        threat.integrity ? "Да" : "Нет",
        threat.availability ? "Да" : "Нет",
        threat.protectionMeasures.join("; "),
      ]);
      const tsvContent = [tsvHeaders, ...tsvRows].map(row => row.join("\t")).join("\n");
      const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threats-export-${new Date().toISOString().split('T')[0]}.tsv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDialogOpen(false);
      setTimeout(() => {
        toastSuccess("Экспорт завершен", "Данные успешно экспортированы в TSV");
      }, 100);
    } catch (error) {
      console.error("Ошибка при экспорте в TSV:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  const exportToTXT = () => {
    if (filteredThreats.length === 0) return;
    try {
      const txtContent = filteredThreats.map((threat, index) => [
        `Угроза безопасности информации #${threat.id} (${index + 1} из ${filteredThreats.length})`,
        "=".repeat(50),
        "",
        `Название: ${threat.name}`,
        "",
        `Описание:`,
        threat.description,
        "",
        `ФСТЭК ID: ${threat.fstecId > 0 ? threat.fstecId : "Не указан"}`,
        "",
        `Тактические задачи:`,
        threat.tacticalTasks.length > 0 ? threat.tacticalTasks.map((t, i) => `  ${i + 1}. ${t}`).join("\n") : "  Не указаны",
        "",
        `Нарушитель:`,
        threat.violator.length > 0 ? threat.violator.map((v, i) => `  ${i + 1}. ${v}`).join("\n") : "  Не указан",
        "",
        `Объект:`,
        threat.object.length > 0 ? threat.object.map((o, i) => `  ${i + 1}. ${o}`).join("\n") : "  Не указан",
        "",
        `CIA:`,
        `  Конфиденциальность: ${threat.confidentiality ? "Да" : "Нет"}`,
        `  Целостность: ${threat.integrity ? "Да" : "Нет"}`,
        `  Доступность: ${threat.availability ? "Да" : "Нет"}`,
        "",
        `Меры защиты:`,
        threat.protectionMeasures.length > 0 ? threat.protectionMeasures.map((m, i) => `  ${i + 1}. ${m}`).join("\n") : "  Не указаны",
        "",
        "",
      ].join("\n")).join("\n");
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threats-export-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDialogOpen(false);
      setTimeout(() => {
        toastSuccess("Экспорт завершен", "Данные успешно экспортированы в TXT");
      }, 100);
    } catch (error) {
      console.error("Ошибка при экспорте в TXT:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Основная рабочая область */}
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>
                Главная
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Анализ угроз</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Анализ угроз</CardTitle>
                <CardDescription>
                  Найдено угроз: {loading ? "..." : filteredThreats.length}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetFilters}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800"
                    title="Сбросить все активные фильтры"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Сбросить фильтры ({activeFiltersCount})
                  </Button>
                )}
                <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={loading || filteredThreats.length === 0}
                      title={filteredThreats.length === 0 
                        ? "Нет данных для экспорта" 
                        : `Экспортировать ${filteredThreats.length} угроз`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Экспорт данных</DialogTitle>
                      <DialogDescription>
                        Выберите формат для экспорта найденных угроз ({filteredThreats.length} шт.)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-3"
                        onClick={exportToJSON}
                      >
                        <div className="flex items-center gap-3">
                          <FileJson className="h-5 w-5 text-primary" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">JSON</span>
                            <span className="text-xs text-muted-foreground">
                              Структурированный формат данных
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {getFileSize("json")}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-3"
                        onClick={exportToCSV}
                      >
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="h-5 w-5 text-primary" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">CSV</span>
                            <span className="text-xs text-muted-foreground">
                              Табличный формат (запятые)
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {getFileSize("csv")}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-3"
                        onClick={exportToTSV}
                      >
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="h-5 w-5 text-primary" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">TSV</span>
                            <span className="text-xs text-muted-foreground">
                              Табличный формат (табуляция)
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {getFileSize("tsv")}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-3"
                        onClick={exportToTXT}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div className="flex flex-col items-start">
                            <span className="font-medium">TXT</span>
                            <span className="text-xs text-muted-foreground">
                              Текстовый формат
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {getFileSize("txt")}
                        </span>
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setExportDialogOpen(false)}
                      >
                        Отмена
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Поиск и фильтры */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Глобальный поиск по названию, описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Панель фильтров */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">Фильтры:</span>
                
                {/* Тактические задачи */}
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8" title="Фильтр по тактическим задачам">
                        <Filter className="h-3 w-3 mr-2" />
                        Тактические задачи
                        {filters.tacticalTasks?.length ? (
                          <Badge variant="secondary" className="ml-2">
                            {filters.tacticalTasks.length}
                          </Badge>
                        ) : null}
                        <ChevronDown className="h-3 w-3 ml-2" />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Поиск тактических задач..." 
                        value={filterSearch.tacticalTasks}
                        onValueChange={(value) => setFilterSearch(prev => ({ ...prev, tacticalTasks: value }))}
                      />
                      <CommandList>
                        <CommandEmpty>Тактические задачи не найдены</CommandEmpty>
                        <CommandGroup>
                          {uniqueValues.tacticalTasks
                            .filter((task) =>
                              task.toLowerCase().includes(filterSearch.tacticalTasks.toLowerCase())
                            )
                            .map((task) => (
                              <CommandItem
                                key={task}
                                onSelect={() => {
                                  const isChecked = filters.tacticalTasks?.includes(task) || false;
                                  handleTacticalTaskToggle(task, !isChecked);
                                }}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={filters.tacticalTasks?.includes(task) || false}
                                  onCheckedChange={(checked) =>
                                    handleTacticalTaskToggle(task, checked as boolean)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-sm flex-1">{task}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Нарушители */}
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-2" />
                        Нарушители
                        {filters.violators?.length ? (
                          <Badge variant="secondary" className="ml-2">
                            {filters.violators.length}
                          </Badge>
                        ) : null}
                        <ChevronDown className="h-3 w-3 ml-2" />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Поиск нарушителей..." 
                        value={filterSearch.violators}
                        onValueChange={(value) => setFilterSearch(prev => ({ ...prev, violators: value }))}
                      />
                      <CommandList>
                        <CommandEmpty>Нарушители не найдены</CommandEmpty>
                        <CommandGroup>
                          {uniqueValues.violators
                            .filter((violator) =>
                              violator.toLowerCase().includes(filterSearch.violators.toLowerCase())
                            )
                            .map((violator) => (
                              <CommandItem
                                key={violator}
                                onSelect={() => {
                                  const isChecked = filters.violators?.includes(violator) || false;
                                  handleViolatorToggle(violator, !isChecked);
                                }}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={filters.violators?.includes(violator) || false}
                                  onCheckedChange={(checked) =>
                                    handleViolatorToggle(violator, checked as boolean)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-sm flex-1">{violator}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Объекты */}
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-2" />
                        Объекты
                        {filters.objects?.length ? (
                          <Badge variant="secondary" className="ml-2">
                            {filters.objects.length}
                          </Badge>
                        ) : null}
                        <ChevronDown className="h-3 w-3 ml-2" />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Поиск объектов..." 
                        value={filterSearch.objects}
                        onValueChange={(value) => setFilterSearch(prev => ({ ...prev, objects: value }))}
                      />
                      <CommandList>
                        <CommandEmpty>Объекты не найдены</CommandEmpty>
                        <CommandGroup>
                          {uniqueValues.objects
                            .filter((obj) =>
                              obj.toLowerCase().includes(filterSearch.objects.toLowerCase())
                            )
                            .map((obj) => (
                              <CommandItem
                                key={obj}
                                onSelect={() => {
                                  const isChecked = filters.objects?.includes(obj) || false;
                                  handleObjectToggle(obj, !isChecked);
                                }}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={filters.objects?.includes(obj) || false}
                                  onCheckedChange={(checked) =>
                                    handleObjectToggle(obj, checked as boolean)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-sm flex-1">{obj}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Меры защиты */}
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-2" />
                        Меры защиты
                        {filters.protectionMeasures?.length ? (
                          <Badge variant="secondary" className="ml-2">
                            {filters.protectionMeasures.length}
                          </Badge>
                        ) : null}
                        <ChevronDown className="h-3 w-3 ml-2" />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Поиск мер защиты..." 
                        value={filterSearch.protectionMeasures}
                        onValueChange={(value) => setFilterSearch(prev => ({ ...prev, protectionMeasures: value }))}
                      />
                      <CommandList>
                        <CommandEmpty>Меры защиты не найдены</CommandEmpty>
                        <CommandGroup>
                          {uniqueValues.protectionMeasures
                            .filter((measure) =>
                              measure.toLowerCase().includes(filterSearch.protectionMeasures.toLowerCase())
                            )
                            .map((measure) => (
                              <CommandItem
                                key={measure}
                                onSelect={() => {
                                  const isChecked = filters.protectionMeasures?.includes(measure) || false;
                                  handleProtectionMeasureToggle(measure, !isChecked);
                                }}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <Checkbox
                                  checked={filters.protectionMeasures?.includes(measure) || false}
                                  onCheckedChange={(checked) =>
                                    handleProtectionMeasureToggle(measure, checked as boolean)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-sm flex-1">{measure}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* CIA фильтры */}
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-2" />
                        CIA
                        {(filters.confidentiality !== undefined ||
                          filters.integrity !== undefined ||
                          filters.availability !== undefined) && (
                          <Badge variant="secondary" className="ml-2">
                            {[
                              filters.confidentiality !== undefined,
                              filters.integrity !== undefined,
                              filters.availability !== undefined,
                            ].filter(Boolean).length}
                          </Badge>
                        )}
                        <ChevronDown className="h-3 w-3 ml-2" />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-64" align="start">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="confidentiality"
                          checked={filters.confidentiality === true}
                          onCheckedChange={(checked) =>
                            handleCIAToggle("confidentiality", checked ? true : undefined)
                          }
                        />
                        <label htmlFor="confidentiality" className="text-sm cursor-pointer">
                          Конфиденциальность
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="integrity"
                          checked={filters.integrity === true}
                          onCheckedChange={(checked) =>
                            handleCIAToggle("integrity", checked ? true : undefined)
                          }
                        />
                        <label htmlFor="integrity" className="text-sm cursor-pointer">
                          Целостность
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="availability"
                          checked={filters.availability === true}
                          onCheckedChange={(checked) =>
                            handleCIAToggle("availability", checked ? true : undefined)
                          }
                        />
                        <label htmlFor="availability" className="text-sm cursor-pointer">
                          Доступность
                        </label>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Активные фильтры */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
                  <span className="text-sm font-medium text-muted-foreground">Активные:</span>
                  {filters.tacticalTasks?.map((task) => (
                    <Badge
                      key={task}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleTacticalTaskToggle(task, false)}
                    >
                      {task}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.violators?.map((v) => (
                    <Badge
                      key={v}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleViolatorToggle(v, false)}
                    >
                      {v}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.objects?.map((o) => (
                    <Badge
                      key={o}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleObjectToggle(o, false)}
                    >
                      {o}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.protectionMeasures?.map((m) => (
                    <Badge
                      key={m}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleProtectionMeasureToggle(m, false)}
                    >
                      {m}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.confidentiality !== undefined && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCIAToggle("confidentiality", undefined)}
                    >
                      Конфиденциальность
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {filters.integrity !== undefined && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCIAToggle("integrity", undefined)}
                    >
                      Целостность
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {filters.availability !== undefined && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCIAToggle("availability", undefined)}
                    >
                      Доступность
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Таблица результатов */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-4">
                {/* Skeleton для заголовков таблицы */}
                <div className="border-b pb-3">
                  <div className="grid grid-cols-12 gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32 col-span-2" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24 col-span-3" />
                  </div>
                </div>
                {/* Skeleton для строк таблицы */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="border-b pb-3 space-y-2">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-full col-span-2" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-full col-span-3" />
                    </div>
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            ) : filteredThreats.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>Угрозы не найдены</EmptyTitle>
                  <EmptyDescription>Попробуйте изменить параметры фильтрации</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-4">
                {/* Пагинация */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Строк на странице:</span>
                    <Select
                      value={
                        table.getState().pagination.pageSize === filteredThreats.length
                          ? "all"
                          : table.getState().pagination.pageSize.toString()
                      }
                      onValueChange={(value) => {
                        if (value === "all") {
                          table.setPageSize(filteredThreats.length);
                        } else {
                          table.setPageSize(Number(value));
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="all">
                          Все ({filteredThreats.length})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      Страница {table.getState().pagination.pageIndex + 1} из{" "}
                      {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        title="Первая страница"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        title="Предыдущая страница"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        title="Следующая страница"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        title="Последняя страница"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <ScrollArea className="h-[calc(100vh-380px)]">
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                            {headerGroup.headers.map((header) => (
                              <TableHead
                                key={header.id}
                                className="h-10 px-3 text-xs font-semibold whitespace-normal"
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getPaginationRowModel().rows?.length ? (
                          table.getPaginationRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              className="hover:bg-muted/50 border-b"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell
                                  key={cell.id}
                                  className="px-3 py-3 align-top whitespace-normal"
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center"
                            >
                              Нет результатов.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
