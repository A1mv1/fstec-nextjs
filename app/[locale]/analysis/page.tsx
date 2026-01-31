"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
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
import { X, Filter, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileJson, FileSpreadsheet, FileText, Search, CheckSquare, Square, House } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAllThreats, getAllTacticalTasks, getAllProtectionMeasures } from "@/lib/data";
import { filterThreats, getUniqueValues, debounce } from "@/lib/filter";
import type { Threat, ThreatFilters, TacticalTask, ProtectionMeasure } from "@/lib/types";

export default function AnalysisPage() {
  const t = useTranslations('AnalysisPage');
  const tCommon = useTranslations('Common');
  const tThreatDetail = useTranslations('ThreatDetail');
  const params = useParams();
  const locale = params.locale as string;
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
  // States for opening filter popovers
  const [popoverOpen, setPopoverOpen] = useState({
    tacticalTasks: false,
    violators: false,
    objects: false,
    protectionMeasures: false,
    cia: false,
  });
  // States for search in filters
  const [filterSearch, setFilterSearch] = useState({
    tacticalTasks: "",
    violators: "",
    objects: "",
    protectionMeasures: "",
  });

  // Load data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [threatsData, tasksData, measuresData] = await Promise.all([
          getAllThreats(locale),
          getAllTacticalTasks(locale),
          getAllProtectionMeasures(locale),
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
  }, [locale]);

  // Debounced search
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

  // Filter threats
  const filteredThreats = useMemo(() => {
    return filterThreats(threats, filters);
  }, [threats, filters]);

  // Function to search tactical task by name
  const findTacticalTaskByName = (taskName: string): TacticalTask | undefined => {
    // First search exact match
    let task = tacticalTasks.find((task) => task.name === taskName);
    if (task) return task;
    
    // Then search if task name contains search term
    task = tacticalTasks.find((task) => task.name.includes(taskName));
    if (task) return task;
    
    // And vice versa
    task = tacticalTasks.find((task) => taskName.includes(task.name));
    return task;
  };

  // Function to search protection measure by identifier or name
  const normalizeMeasureIdentifier = (id: string): string => {
    // Normalize "Б/Н" and "N/A" to "Б/Н" for consistent matching
    if (id === 'Б/Н' || id === 'N/A' || id === 'N/A (Not Applicable)') return 'Б/Н';
    return id.trim();
  };

  const findProtectionMeasureByIdentifier = (measureString: string): ProtectionMeasure | undefined => {
    const normalizedMeasureString = normalizeMeasureIdentifier(measureString);
    
    // Search by identifier (exact match)
    let measure = protectionMeasures.find((m) => normalizeMeasureIdentifier(m.identifier) === normalizedMeasureString);
    if (measure) return measure;
    
    // Search if string contains identifier
    measure = protectionMeasures.find((m) => normalizedMeasureString.includes(normalizeMeasureIdentifier(m.identifier)));
    if (measure) return measure;
    
    // Search if identifier is in string
    measure = protectionMeasures.find((m) => normalizeMeasureIdentifier(m.identifier).includes(normalizedMeasureString));
    if (measure) return measure;
    
    // Search by name
    measure = protectionMeasures.find((m) => m.name === measureString);
    if (measure) return measure;
    
    // Search if name contains string
    measure = protectionMeasures.find((m) => m.name.includes(measureString));
    if (measure) return measure;
    
    return measure;
  };

  // Table columns definition
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
      header: t("columns.name"),
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
      header: t("columns.tacticalTask"),
      enableSorting: false,
      cell: ({ row }) => {
        // Split comma-separated strings into separate tasks
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
      header: t("columns.description"),
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
            {t("columns.fstecId")}
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
      header: t("columns.violator"),
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
      header: t("columns.object"),
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
      header: t("columns.measures"),
      enableSorting: false,
      cell: ({ row }) => {
        // Split comma-separated strings into separate measures
        const allMeasures = row.original.protectionMeasures.flatMap(measureString => 
          measureString.split(',').map(m => m.trim()).filter(Boolean)
        );
        
        return (
          <div className="min-w-[150px] max-w-[300px] text-xs flex flex-col gap-0.5">
            {allMeasures.length > 0 ? (
              allMeasures.map((measureString, index) => {
                const measure = findProtectionMeasureByIdentifier(measureString);
                
                if (measure) {
                  // Display the measure identifier from the found measure, not the original string
                  // This ensures "Б/Н" stays as "Б/Н" and doesn't get translated to "N/A"
                  return (
                    <Link
                      key={`measure-${row.original.id}-${index}`}
                      href={`/protection-measures/${measure.id}`}
                      className="text-primary hover:underline block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {measure.identifier}
                    </Link>
                  );
                }
                
                // If measure not found, display original string as-is (shouldn't happen normally)
                return (
                  <span key={`measure-${row.original.id}-${index}`} className="block">
                    {measureString}
                  </span>
                );
              })
            ) : (
              <span className="text-muted-foreground">{t("na")}</span>
            )}
          </div>
        );
      },
    },
  ], [tacticalTasks, protectionMeasures]);

  // Initialize table
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

  // Filter handlers
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

  // Functions for select all and deselect all
  const handleSelectAllTacticalTasks = () => {
    const filtered = uniqueValues.tacticalTasks.filter((task) =>
      task.toLowerCase().includes(filterSearch.tacticalTasks.toLowerCase())
    );
    setFilters((prev) => ({
      ...prev,
      tacticalTasks: [...new Set([...(prev.tacticalTasks || []), ...filtered])],
    }));
  };

  const handleDeselectAllTacticalTasks = () => {
    const filtered = uniqueValues.tacticalTasks.filter((task) =>
      task.toLowerCase().includes(filterSearch.tacticalTasks.toLowerCase())
    );
    setFilters((prev) => {
      const newTasks = (prev.tacticalTasks || []).filter((task) => !filtered.includes(task));
      const newFilters = { ...prev };
      if (newTasks.length > 0) {
        newFilters.tacticalTasks = newTasks;
      } else {
        delete newFilters.tacticalTasks;
      }
      return newFilters;
    });
  };

  const handleToggleAllTacticalTasks = () => {
    const filtered = uniqueValues.tacticalTasks.filter((task) =>
      task.toLowerCase().includes(filterSearch.tacticalTasks.toLowerCase())
    );
    const allSelected = filtered.length > 0 && filtered.every(task => filters.tacticalTasks?.includes(task));
    
    if (allSelected) {
      handleDeselectAllTacticalTasks();
    } else {
      handleSelectAllTacticalTasks();
    }
  };

  const handleSelectAllViolators = () => {
    const filtered = uniqueValues.violators.filter((violator) =>
      violator.toLowerCase().includes(filterSearch.violators.toLowerCase())
    );
    setFilters((prev) => ({
      ...prev,
      violators: [...new Set([...(prev.violators || []), ...filtered])],
    }));
  };

  const handleDeselectAllViolators = () => {
    const filtered = uniqueValues.violators.filter((violator) =>
      violator.toLowerCase().includes(filterSearch.violators.toLowerCase())
    );
    setFilters((prev) => {
      const newViolators = (prev.violators || []).filter((violator) => !filtered.includes(violator));
      const newFilters = { ...prev };
      if (newViolators.length > 0) {
        newFilters.violators = newViolators;
      } else {
        delete newFilters.violators;
      }
      return newFilters;
    });
  };

  const handleToggleAllViolators = () => {
    const filtered = uniqueValues.violators.filter((violator) =>
      violator.toLowerCase().includes(filterSearch.violators.toLowerCase())
    );
    const allSelected = filtered.length > 0 && filtered.every(violator => filters.violators?.includes(violator));
    
    if (allSelected) {
      handleDeselectAllViolators();
    } else {
      handleSelectAllViolators();
    }
  };

  const handleSelectAllObjects = () => {
    const filtered = uniqueValues.objects.filter((obj) =>
      obj.toLowerCase().includes(filterSearch.objects.toLowerCase())
    );
    setFilters((prev) => ({
      ...prev,
      objects: [...new Set([...(prev.objects || []), ...filtered])],
    }));
  };

  const handleDeselectAllObjects = () => {
    const filtered = uniqueValues.objects.filter((obj) =>
      obj.toLowerCase().includes(filterSearch.objects.toLowerCase())
    );
    setFilters((prev) => {
      const newObjects = (prev.objects || []).filter((obj) => !filtered.includes(obj));
      const newFilters = { ...prev };
      if (newObjects.length > 0) {
        newFilters.objects = newObjects;
      } else {
        delete newFilters.objects;
      }
      return newFilters;
    });
  };

  const handleToggleAllObjects = () => {
    const filtered = uniqueValues.objects.filter((obj) =>
      obj.toLowerCase().includes(filterSearch.objects.toLowerCase())
    );
    const allSelected = filtered.length > 0 && filtered.every(obj => filters.objects?.includes(obj));
    
    if (allSelected) {
      handleDeselectAllObjects();
    } else {
      handleSelectAllObjects();
    }
  };

  const handleSelectAllProtectionMeasures = () => {
    const filtered = uniqueValues.protectionMeasures.filter((measure) =>
      measure.toLowerCase().includes(filterSearch.protectionMeasures.toLowerCase())
    );
    setFilters((prev) => ({
      ...prev,
      protectionMeasures: [...new Set([...(prev.protectionMeasures || []), ...filtered])],
    }));
  };

  const handleDeselectAllProtectionMeasures = () => {
    const filtered = uniqueValues.protectionMeasures.filter((measure) =>
      measure.toLowerCase().includes(filterSearch.protectionMeasures.toLowerCase())
    );
    setFilters((prev) => {
      const newMeasures = (prev.protectionMeasures || []).filter((measure) => !filtered.includes(measure));
      const newFilters = { ...prev };
      if (newMeasures.length > 0) {
        newFilters.protectionMeasures = newMeasures;
      } else {
        delete newFilters.protectionMeasures;
      }
      return newFilters;
    });
  };

  const handleToggleAllProtectionMeasures = () => {
    const filtered = uniqueValues.protectionMeasures.filter((measure) =>
      measure.toLowerCase().includes(filterSearch.protectionMeasures.toLowerCase())
    );
    const allSelected = filtered.length > 0 && filtered.every(measure => filters.protectionMeasures?.includes(measure));
    
    if (allSelected) {
      handleDeselectAllProtectionMeasures();
    } else {
      handleSelectAllProtectionMeasures();
    }
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    // Search
    if (filters.search && filters.search.trim().length > 0) count++;
    // Filter arrays - count elements in each array
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
    // CIA filters - each active filter counted separately
    if (filters.confidentiality !== undefined && filters.confidentiality !== null) count++;
    if (filters.integrity !== undefined && filters.integrity !== null) count++;
    if (filters.availability !== undefined && filters.availability !== null) count++;
    return count;
  }, [filters]);

  // Export functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return t("fileSize.zero");
    const k = 1024;
    const sizes = [t("fileSize.bytes"), t("fileSize.kb"), t("fileSize.mb")];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileSize = (format: "json" | "csv" | "tsv" | "txt"): string => {
    if (filteredThreats.length === 0) return t("fileSize.zero");
    try {
      let content = "";
      
      switch (format) {
        case "json":
          content = JSON.stringify(filteredThreats, null, 2);
          break;
        case "csv":
          const csvHeaders = ["ID", t("columns.name"), t("columns.description"), t("columns.fstecId"), t("columns.tacticalTask"), t("columns.violator"), t("columns.object"), t("confidentiality"), t("integrity"), t("availability"), t("protectionMeasures")];
          const csvRows = filteredThreats.map(threat => [
            threat.id.toString(),
            `"${threat.name.replace(/"/g, '""')}"`,
            `"${threat.description.replace(/"/g, '""')}"`,
            threat.fstecId > 0 ? threat.fstecId.toString() : "",
            `"${threat.tacticalTasks.join("; ").replace(/"/g, '""')}"`,
            `"${threat.violator.join("; ").replace(/"/g, '""')}"`,
            `"${threat.object.join("; ").replace(/"/g, '""')}"`,
            threat.confidentiality ? tCommon("yes") : tCommon("no"),
            threat.integrity ? tCommon("yes") : tCommon("no"),
            threat.availability ? tCommon("yes") : tCommon("no"),
            `"${threat.protectionMeasures.join("; ").replace(/"/g, '""')}"`,
          ]);
          content = "\ufeff" + [csvHeaders, ...csvRows].map(row => row.join(",")).join("\n");
          break;
        case "tsv":
          const tsvHeaders = ["ID", t("columns.name"), t("columns.description"), t("columns.fstecId"), t("columns.tacticalTask"), t("columns.violator"), t("columns.object"), t("confidentiality"), t("integrity"), t("availability"), t("protectionMeasures")];
          const tsvRows = filteredThreats.map(threat => [
            threat.id.toString(),
            threat.name,
            threat.description,
            threat.fstecId > 0 ? threat.fstecId.toString() : "",
            threat.tacticalTasks.join("; "),
            threat.violator.join("; "),
            threat.object.join("; "),
            threat.confidentiality ? tCommon("yes") : tCommon("no"),
            threat.integrity ? tCommon("yes") : tCommon("no"),
            threat.availability ? tCommon("yes") : tCommon("no"),
            threat.protectionMeasures.join("; "),
          ]);
          content = [tsvHeaders, ...tsvRows].map(row => row.join("\t")).join("\n");
          break;
        case "txt":
          content = filteredThreats.map((threat, index) => [
            `Угроза безопасности информации #${threat.id} (${index + 1} из ${filteredThreats.length})`,
            "=".repeat(50),
            "",
            `${tThreatDetail("name")}: ${threat.name}`,
            "",
            `${tThreatDetail("description")}:`,
            threat.description,
            "",
            `${tThreatDetail("fstecId")}: ${threat.fstecId > 0 ? threat.fstecId.toString() : tThreatDetail("notSpecified")}`,
            "",
            `${t("columns.tacticalTask")}:`,
            threat.tacticalTasks.length > 0 ? threat.tacticalTasks.map((t, i) => `  ${i + 1}. ${t}`).join("\n") : `  ${tThreatDetail("notSpecified")}`,
            "",
            `${tThreatDetail("violatorLabel")}`,
            threat.violator.length > 0 ? threat.violator.map((v, i) => `  ${i + 1}. ${v}`).join("\n") : `  ${tThreatDetail("notSpecified")}`,
            "",
            `${tThreatDetail("objectLabel")}`,
            threat.object.length > 0 ? threat.object.map((o, i) => `  ${i + 1}. ${o}`).join("\n") : `  ${tThreatDetail("notSpecified")}`,
            "",
            `${tThreatDetail("ciaLabel")}`,
            `  ${tThreatDetail("confidentiality")}: ${threat.confidentiality ? tCommon("yes") : tCommon("no")}`,
            `  ${tThreatDetail("integrity")}: ${threat.integrity ? tCommon("yes") : tCommon("no")}`,
            `  ${tThreatDetail("availability")}: ${threat.availability ? tCommon("yes") : tCommon("no")}`,
            "",
            `${t("protectionMeasures")}:`,
            threat.protectionMeasures.length > 0 ? threat.protectionMeasures.map((m, i) => `  ${i + 1}. ${m}`).join("\n") : `  ${tThreatDetail("notSpecified")}`,
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
        toastSuccess(t("exportComplete"), t("exportSuccessJson"));
      }, 100);
    } catch (error) {
      console.error("Ошибка при экспорте в JSON:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  const exportToCSV = () => {
    if (filteredThreats.length === 0) return;
    try {
      const csvHeaders = ["ID", t("columns.name"), t("columns.description"), t("columns.fstecId"), t("columns.tacticalTask"), t("columns.violator"), t("columns.object"), t("confidentiality"), t("integrity"), t("availability"), t("protectionMeasures")];
      const csvRows = filteredThreats.map(threat => [
        threat.id.toString(),
        `"${threat.name.replace(/"/g, '""')}"`,
        `"${threat.description.replace(/"/g, '""')}"`,
        threat.fstecId > 0 ? threat.fstecId.toString() : "",
        `"${threat.tacticalTasks.join("; ").replace(/"/g, '""')}"`,
        `"${threat.violator.join("; ").replace(/"/g, '""')}"`,
        `"${threat.object.join("; ").replace(/"/g, '""')}"`,
        threat.confidentiality ? tCommon("yes") : tCommon("no"),
        threat.integrity ? tCommon("yes") : tCommon("no"),
        threat.availability ? tCommon("yes") : tCommon("no"),
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
        toastSuccess(t("exportComplete"), t("exportSuccessCsv"));
      }, 100);
    } catch (error) {
      console.error("Ошибка при экспорте в CSV:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  const exportToTSV = () => {
    if (filteredThreats.length === 0) return;
    try {
      const tsvHeaders = ["ID", t("columns.name"), t("columns.description"), t("columns.fstecId"), t("columns.tacticalTask"), t("columns.violator"), t("columns.object"), t("confidentiality"), t("integrity"), t("availability"), t("protectionMeasures")];
      const tsvRows = filteredThreats.map(threat => [
        threat.id.toString(),
        threat.name,
        threat.description,
        threat.fstecId > 0 ? threat.fstecId.toString() : "",
        threat.tacticalTasks.join("; "),
        threat.violator.join("; "),
        threat.object.join("; "),
        threat.confidentiality ? tCommon("yes") : tCommon("no"),
        threat.integrity ? tCommon("yes") : tCommon("no"),
        threat.availability ? tCommon("yes") : tCommon("no"),
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
        toastSuccess(t("exportComplete"), t("exportSuccessTsv"));
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
        `${tThreatDetail("name")}: ${threat.name}`,
        "",
        `${tThreatDetail("description")}:`,
        threat.description,
        "",
        `${tThreatDetail("fstecId")}: ${threat.fstecId > 0 ? threat.fstecId.toString() : tThreatDetail("notSpecified")}`,
        "",
        `${tThreatDetail("tacticalTasksLabel")}`,
        threat.tacticalTasks.length > 0 ? threat.tacticalTasks.map((t, i) => `  ${i + 1}. ${t}`).join("\n") : `  ${tThreatDetail("notSpecified")}`,
        "",
        `${tThreatDetail("violatorLabel")}`,
        threat.violator.length > 0 ? threat.violator.map((v, i) => `  ${i + 1}. ${v}`).join("\n") : `  ${tThreatDetail("notSpecified")}`,
        "",
        `${tThreatDetail("objectLabel")}`,
        threat.object.length > 0 ? threat.object.map((o, i) => `  ${i + 1}. ${o}`).join("\n") : `  ${tThreatDetail("notSpecified")}`,
        "",
        `${tThreatDetail("ciaLabel")}`,
        `  ${tThreatDetail("confidentiality")}: ${threat.confidentiality ? tCommon("yes") : tCommon("no")}`,
        `  ${tThreatDetail("integrity")}: ${threat.integrity ? tCommon("yes") : tCommon("no")}`,
        `  ${tThreatDetail("availability")}: ${threat.availability ? tCommon("yes") : tCommon("no")}`,
        "",
        `${tThreatDetail("protectionMeasuresLabel")}`,
        threat.protectionMeasures.length > 0 ? threat.protectionMeasures.map((m, i) => `  ${i + 1}. ${m}`).join("\n") : `  ${tThreatDetail("notSpecified")}`,
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
        toastSuccess(t("exportComplete"), t("exportSuccessTxt"));
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
                <House className="h-4 w-4 mr-1.5 inline" />
                {t("home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{t("title")}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("title")}</CardTitle>
                <CardDescription>
                  {t("foundThreats", { count: loading ? 0 : filteredThreats.length })}
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
                    {t("clearFilters")} ({activeFiltersCount})
                  </Button>
                )}
                <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={loading || filteredThreats.length === 0}
                      title={filteredThreats.length === 0 
                        ? t("noDataToExport") 
                        : `${t("exportCount", { count: filteredThreats.length })}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("export")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("exportData")}</DialogTitle>
                      <DialogDescription>
                        {t("selectExportFormatWithCount", { count: filteredThreats.length })}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-5"
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
                        <span className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0 text-right min-w-[80px]">
                          {getFileSize("json")}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-5"
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
                        <span className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0 text-right min-w-[80px]">
                          {getFileSize("csv")}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-5"
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
                        <span className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0 text-right min-w-[80px]">
                          {getFileSize("tsv")}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-5"
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
                        <span className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0 text-right min-w-[80px]">
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
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 z-10 transform -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-foreground pointer-events-none" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 flex-1"
                  />
                </div>
              </div>

              {/* Панель фильтров */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">{t("filters")}</span>
                
                {/* Тактические задачи */}
                <Popover open={popoverOpen.tacticalTasks} onOpenChange={(open) => setPopoverOpen(prev => ({ ...prev, tacticalTasks: open }))}>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8" title={t("filterByTacticalTasks")}>
                        <Filter className="h-3 w-3 mr-2" />
                        {t("tacticalTasks")}
                        {filters.tacticalTasks?.length ? (
                          <Badge variant="secondary" className="ml-2">
                            {filters.tacticalTasks.length}
                          </Badge>
                        ) : null}
                        <ChevronDown className={`h-3 w-3 ml-2 transition-transform duration-300 ease-in-out ${popoverOpen.tacticalTasks ? 'rotate-180' : ''}`} />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder={t("searchTacticalTasks")} 
                        value={filterSearch.tacticalTasks}
                        onValueChange={(value) => setFilterSearch(prev => ({ ...prev, tacticalTasks: value }))}
                      />
                      <div className="flex items-center px-2 py-1.5 border-b">
                        {(() => {
                          const filtered = uniqueValues.tacticalTasks.filter((task) =>
                            task.toLowerCase().includes(filterSearch.tacticalTasks.toLowerCase())
                          );
                          const allSelected = filtered.length > 0 && filtered.every(task => filters.tacticalTasks?.includes(task));
                          return (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={handleToggleAllTacticalTasks}
                            >
                              {allSelected ? (
                                <>
                                  <Square className="h-3 w-3 mr-1.5 shrink-0" />
                                  {t("deselectAll")}
                                </>
                              ) : (
                                <>
                                  <CheckSquare className="h-3 w-3 mr-1.5 shrink-0" />
                                  {t("selectAll")}
                                </>
                              )}
                            </Button>
                          );
                        })()}
                      </div>
                      <CommandList>
                        <CommandEmpty>{t("tacticalTasksNotFound")}</CommandEmpty>
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
                <Popover open={popoverOpen.violators} onOpenChange={(open) => setPopoverOpen(prev => ({ ...prev, violators: open }))}>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-2" />
                        {t("violators")}
                        {filters.violators?.length ? (
                          <Badge variant="secondary" className="ml-2">
                            {filters.violators.length}
                          </Badge>
                        ) : null}
                        <ChevronDown className={`h-3 w-3 ml-2 transition-transform duration-300 ease-in-out ${popoverOpen.violators ? 'rotate-180' : ''}`} />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder={t("searchViolators")} 
                        value={filterSearch.violators}
                        onValueChange={(value) => setFilterSearch(prev => ({ ...prev, violators: value }))}
                      />
                      <div className="flex items-center px-2 py-1.5 border-b">
                        {(() => {
                          const filtered = uniqueValues.violators.filter((violator) =>
                            violator.toLowerCase().includes(filterSearch.violators.toLowerCase())
                          );
                          const allSelected = filtered.length > 0 && filtered.every(violator => filters.violators?.includes(violator));
                          return (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={handleToggleAllViolators}
                            >
                              {allSelected ? (
                                <>
                                  <Square className="h-3 w-3 mr-1.5 shrink-0" />
                                  {t("deselectAll")}
                                </>
                              ) : (
                                <>
                                  <CheckSquare className="h-3 w-3 mr-1.5 shrink-0" />
                                  {t("selectAll")}
                                </>
                              )}
                            </Button>
                          );
                        })()}
                      </div>
                      <CommandList>
                        <CommandEmpty>{t("violatorsNotFound")}</CommandEmpty>
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
                <Popover open={popoverOpen.objects} onOpenChange={(open) => setPopoverOpen(prev => ({ ...prev, objects: open }))}>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-2" />
                        {t("objects")}
                        {filters.objects?.length ? (
                          <Badge variant="secondary" className="ml-2">
                            {filters.objects.length}
                          </Badge>
                        ) : null}
                        <ChevronDown className={`h-3 w-3 ml-2 transition-transform duration-300 ease-in-out ${popoverOpen.objects ? 'rotate-180' : ''}`} />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder={t("searchObjects")} 
                        value={filterSearch.objects}
                        onValueChange={(value) => setFilterSearch(prev => ({ ...prev, objects: value }))}
                      />
                      <div className="flex items-center px-2 py-1.5 border-b">
                        {(() => {
                          const filtered = uniqueValues.objects.filter((obj) =>
                            obj.toLowerCase().includes(filterSearch.objects.toLowerCase())
                          );
                          const allSelected = filtered.length > 0 && filtered.every(obj => filters.objects?.includes(obj));
                          return (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={handleToggleAllObjects}
                            >
                              {allSelected ? (
                                <>
                                  <Square className="h-3 w-3 mr-1.5 shrink-0" />
                                  {t("deselectAll")}
                                </>
                              ) : (
                                <>
                                  <CheckSquare className="h-3 w-3 mr-1.5 shrink-0" />
                                  {t("selectAll")}
                                </>
                              )}
                            </Button>
                          );
                        })()}
                      </div>
                      <CommandList>
                        <CommandEmpty>{t("objectsNotFound")}</CommandEmpty>
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
                <Popover open={popoverOpen.protectionMeasures} onOpenChange={(open) => setPopoverOpen(prev => ({ ...prev, protectionMeasures: open }))}>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" size="sm" className="h-8">
                        <Filter className="h-3 w-3 mr-2" />
                        {t("protectionMeasures")}
                        {filters.protectionMeasures?.length ? (
                          <Badge variant="secondary" className="ml-2">
                            {filters.protectionMeasures.length}
                          </Badge>
                        ) : null}
                        <ChevronDown className={`h-3 w-3 ml-2 transition-transform duration-300 ease-in-out ${popoverOpen.protectionMeasures ? 'rotate-180' : ''}`} />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder={t("searchMeasures")} 
                        value={filterSearch.protectionMeasures}
                        onValueChange={(value) => setFilterSearch(prev => ({ ...prev, protectionMeasures: value }))}
                      />
                      <div className="flex items-center px-2 py-1.5 border-b">
                        {(() => {
                          const filtered = uniqueValues.protectionMeasures.filter((measure) =>
                            measure.toLowerCase().includes(filterSearch.protectionMeasures.toLowerCase())
                          );
                          const allSelected = filtered.length > 0 && filtered.every(measure => filters.protectionMeasures?.includes(measure));
                          return (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={handleToggleAllProtectionMeasures}
                            >
                              {allSelected ? (
                                <>
                                  <Square className="h-3 w-3 mr-1.5 shrink-0" />
                                  {t("deselectAll")}
                                </>
                              ) : (
                                <>
                                  <CheckSquare className="h-3 w-3 mr-1.5 shrink-0" />
                                  {t("selectAll")}
                                </>
                              )}
                            </Button>
                          );
                        })()}
                      </div>
                      <CommandList>
                        <CommandEmpty>{t("measuresNotFound")}</CommandEmpty>
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
                <Popover open={popoverOpen.cia} onOpenChange={(open) => setPopoverOpen(prev => ({ ...prev, cia: open }))}>
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
                        <ChevronDown className={`h-3 w-3 ml-2 transition-transform duration-300 ease-in-out ${popoverOpen.cia ? 'rotate-180' : ''}`} />
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
                          {tThreatDetail("confidentiality")}
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
                          {tThreatDetail("integrity")}
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
                          {tThreatDetail("availability")}
                        </label>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Активные фильтры */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 items-center pt-2 border-t">
                  <span className="text-sm font-medium text-muted-foreground">{t("activeFilters")}</span>
                  {filters.tacticalTasks?.map((task, index) => (
                    <Badge
                      key={`tactical-task-${index}-${task}`}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleTacticalTaskToggle(task, false)}
                    >
                      {task}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.violators?.map((v, index) => (
                    <Badge
                      key={`violator-${index}-${v}`}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleViolatorToggle(v, false)}
                    >
                      {v}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.objects?.map((o, index) => (
                    <Badge
                      key={`object-${index}-${o}`}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleObjectToggle(o, false)}
                    >
                      {o}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.protectionMeasures?.map((m, index) => (
                    <Badge
                      key={`protection-measure-${index}-${m}`}
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
                      {tThreatDetail("confidentiality")}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {filters.integrity !== undefined && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCIAToggle("integrity", undefined)}
                    >
                      {tThreatDetail("integrity")}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {filters.availability !== undefined && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCIAToggle("availability", undefined)}
                    >
                      {tThreatDetail("availability")}
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
                  <EmptyTitle>{t("noThreatsFound")}</EmptyTitle>
                  <EmptyDescription>Попробуйте изменить параметры фильтрации</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-4">
                {/* Пагинация */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t("rowsPerPage")}</span>
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
                        <SelectValue>
                          {table.getState().pagination.pageSize === filteredThreats.length
                            ? `${t("all")} (${filteredThreats.length})`
                            : table.getState().pagination.pageSize.toString()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="all">
                          {t("all")} ({filteredThreats.length})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {t("page")} {table.getState().pagination.pageIndex + 1} {t("of")} {" "}
                      {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        title={t("firstPage")}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        title={t("previousPage")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        title={t("nextPage")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        title={t("lastPage")}
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
