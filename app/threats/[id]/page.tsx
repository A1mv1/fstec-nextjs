"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Copy, Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { getThreatById, getAllProtectionMeasures, getAllTacticalTasks } from "@/lib/data";
import type { Threat, ProtectionMeasure, TacticalTask } from "@/lib/types";

export default function ThreatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [threat, setThreat] = useState<Threat | null>(null);
  const [loading, setLoading] = useState(true);
  const [protectionMeasures, setProtectionMeasures] = useState<ProtectionMeasure[]>([]);
  const [tacticalTasks, setTacticalTasks] = useState<TacticalTask[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const threatData = await getThreatById(id);
        if (!threatData) {
          router.push("/threats");
          return;
        }
        setThreat(threatData);

        // Загружаем связанные данные
        const [measures, tasks] = await Promise.all([
          getAllProtectionMeasures(),
          getAllTacticalTasks(),
        ]);
        setProtectionMeasures(measures);
        setTacticalTasks(tasks);
      } catch (error) {
        console.error("Error loading threat:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background container mx-auto px-4 py-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!threat) {
    return null;
  }

  // Находим связанные меры защиты
  const relatedMeasures = protectionMeasures.filter((m) =>
    threat.protectionMeasures.some((pm) => pm.includes(m.identifier))
  );

  // Находим связанные тактические задачи
  const relatedTasks = tacticalTasks.filter((task) =>
    threat.tacticalTasks.some((tt) => task.name.includes(tt) || tt.includes(task.name))
  );

  const handleCopy = () => {
    const text = `${threat.name}\n\n${threat.description}`;
    navigator.clipboard.writeText(text).then(() => {
      toastSuccess("Скопировано", "Данные угрозы скопированы в буфер обмена");
    }).catch(() => {
      toastError("Ошибка", "Не удалось скопировать данные");
    });
  };

  const getExportData = () => {
    return {
      id: threat.id,
      name: threat.name,
      description: threat.description,
      fstecId: threat.fstecId,
      tacticalTasks: threat.tacticalTasks,
      violator: threat.violator,
      object: threat.object,
      confidentiality: threat.confidentiality,
      integrity: threat.integrity,
      availability: threat.availability,
      protectionMeasures: threat.protectionMeasures,
    };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Б";
    const k = 1024;
    const sizes = ["Б", "КБ", "МБ"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileSize = (format: "json" | "csv" | "tsv" | "txt"): string => {
    if (!threat) return "0 Б";
    try {
      const data = getExportData();
      let content = "";
      
      switch (format) {
        case "json":
          content = JSON.stringify(data, null, 2);
          break;
        case "csv":
          const csvRows = [
            ["Поле", "Значение"],
            ["ID", data.id.toString()],
            ["Название", `"${data.name.replace(/"/g, '""')}"`],
            ["Описание", `"${data.description.replace(/"/g, '""')}"`],
            ["ФСТЭК ID", data.fstecId > 0 ? data.fstecId.toString() : ""],
            ["Тактические задачи", `"${data.tacticalTasks.join("; ").replace(/"/g, '""')}"`],
            ["Нарушитель", `"${data.violator.join("; ").replace(/"/g, '""')}"`],
            ["Объект", `"${data.object.join("; ").replace(/"/g, '""')}"`],
            ["Конфиденциальность", data.confidentiality ? "Да" : "Нет"],
            ["Целостность", data.integrity ? "Да" : "Нет"],
            ["Доступность", data.availability ? "Да" : "Нет"],
            ["Меры защиты", `"${data.protectionMeasures.join("; ").replace(/"/g, '""')}"`],
          ];
          content = "\ufeff" + csvRows.map(row => row.join(",")).join("\n");
          break;
        case "tsv":
          const tsvRows = [
            ["Поле", "Значение"],
            ["ID", data.id.toString()],
            ["Название", data.name],
            ["Описание", data.description],
            ["ФСТЭК ID", data.fstecId > 0 ? data.fstecId.toString() : ""],
            ["Тактические задачи", data.tacticalTasks.join("; ")],
            ["Нарушитель", data.violator.join("; ")],
            ["Объект", data.object.join("; ")],
            ["Конфиденциальность", data.confidentiality ? "Да" : "Нет"],
            ["Целостность", data.integrity ? "Да" : "Нет"],
            ["Доступность", data.availability ? "Да" : "Нет"],
            ["Меры защиты", data.protectionMeasures.join("; ")],
          ];
          content = tsvRows.map(row => row.join("\t")).join("\n");
          break;
        case "txt":
          content = [
            `Угроза безопасности информации #${data.id}`,
            "=".repeat(50),
            "",
            `Название: ${data.name}`,
            "",
            `Описание:`,
            data.description,
            "",
            `ФСТЭК ID: ${data.fstecId > 0 ? data.fstecId : "Не указан"}`,
            "",
            `Тактические задачи:`,
            data.tacticalTasks.length > 0 ? data.tacticalTasks.map((t, i) => `  ${i + 1}. ${t}`).join("\n") : "  Не указаны",
            "",
            `Нарушитель:`,
            data.violator.length > 0 ? data.violator.map((v, i) => `  ${i + 1}. ${v}`).join("\n") : "  Не указан",
            "",
            `Объект:`,
            data.object.length > 0 ? data.object.map((o, i) => `  ${i + 1}. ${o}`).join("\n") : "  Не указан",
            "",
            `CIA:`,
            `  Конфиденциальность: ${data.confidentiality ? "Да" : "Нет"}`,
            `  Целостность: ${data.integrity ? "Да" : "Нет"}`,
            `  Доступность: ${data.availability ? "Да" : "Нет"}`,
            "",
            `Меры защиты:`,
            data.protectionMeasures.length > 0 ? data.protectionMeasures.map((m, i) => `  ${i + 1}. ${m}`).join("\n") : "  Не указаны",
          ].join("\n");
          break;
      }
      
      // Используем TextEncoder для правильного расчета размера в байтах
      const encoder = new TextEncoder();
      const bytes = encoder.encode(content).length;
      return formatFileSize(bytes);
    } catch (error) {
      return "—";
    }
  };

  const exportToJSON = () => {
    if (!threat) return;
    try {
      const data = getExportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threat-${threat.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDialogOpen(false);
      toastSuccess("Экспорт завершен", "Данные успешно экспортированы в JSON");
    } catch (error) {
      console.error("Ошибка при экспорте в JSON:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  const exportToCSV = () => {
    if (!threat) return;
    try {
      const data = getExportData();
      const csvRows = [
        ["Поле", "Значение"],
        ["ID", data.id.toString()],
        ["Название", `"${data.name.replace(/"/g, '""')}"`],
        ["Описание", `"${data.description.replace(/"/g, '""')}"`],
        ["ФСТЭК ID", data.fstecId > 0 ? data.fstecId.toString() : ""],
        ["Тактические задачи", `"${data.tacticalTasks.join("; ").replace(/"/g, '""')}"`],
        ["Нарушитель", `"${data.violator.join("; ").replace(/"/g, '""')}"`],
        ["Объект", `"${data.object.join("; ").replace(/"/g, '""')}"`],
        ["Конфиденциальность", data.confidentiality ? "Да" : "Нет"],
        ["Целостность", data.integrity ? "Да" : "Нет"],
        ["Доступность", data.availability ? "Да" : "Нет"],
        ["Меры защиты", `"${data.protectionMeasures.join("; ").replace(/"/g, '""')}"`],
      ];
      const csvContent = csvRows.map(row => row.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threat-${threat.id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDialogOpen(false);
      toastSuccess("Экспорт завершен", "Данные успешно экспортированы в CSV");
    } catch (error) {
      console.error("Ошибка при экспорте в CSV:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  const exportToTSV = () => {
    if (!threat) return;
    try {
      const data = getExportData();
      const tsvRows = [
        ["Поле", "Значение"],
        ["ID", data.id.toString()],
        ["Название", data.name],
        ["Описание", data.description],
        ["ФСТЭК ID", data.fstecId > 0 ? data.fstecId.toString() : ""],
        ["Тактические задачи", data.tacticalTasks.join("; ")],
        ["Нарушитель", data.violator.join("; ")],
        ["Объект", data.object.join("; ")],
        ["Конфиденциальность", data.confidentiality ? "Да" : "Нет"],
        ["Целостность", data.integrity ? "Да" : "Нет"],
        ["Доступность", data.availability ? "Да" : "Нет"],
        ["Меры защиты", data.protectionMeasures.join("; ")],
      ];
      const tsvContent = tsvRows.map(row => row.join("\t")).join("\n");
      const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threat-${threat.id}.tsv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDialogOpen(false);
      toastSuccess("Экспорт завершен", "Данные успешно экспортированы в TSV");
    } catch (error) {
      console.error("Ошибка при экспорте в TSV:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  const exportToTXT = () => {
    if (!threat) return;
    try {
      const data = getExportData();
      const txtContent = [
        `Угроза безопасности информации #${data.id}`,
        "=".repeat(50),
        "",
        `Название: ${data.name}`,
        "",
        `Описание:`,
        data.description,
        "",
        `ФСТЭК ID: ${data.fstecId > 0 ? data.fstecId : "Не указан"}`,
        "",
        `Тактические задачи:`,
        data.tacticalTasks.length > 0 ? data.tacticalTasks.map((t, i) => `  ${i + 1}. ${t}`).join("\n") : "  Не указаны",
        "",
        `Нарушитель:`,
        data.violator.length > 0 ? data.violator.map((v, i) => `  ${i + 1}. ${v}`).join("\n") : "  Не указан",
        "",
        `Объект:`,
        data.object.length > 0 ? data.object.map((o, i) => `  ${i + 1}. ${o}`).join("\n") : "  Не указан",
        "",
        `CIA:`,
        `  Конфиденциальность: ${data.confidentiality ? "Да" : "Нет"}`,
        `  Целостность: ${data.integrity ? "Да" : "Нет"}`,
        `  Доступность: ${data.availability ? "Да" : "Нет"}`,
        "",
        `Меры защиты:`,
        data.protectionMeasures.length > 0 ? data.protectionMeasures.map((m, i) => `  ${i + 1}. ${m}`).join("\n") : "  Не указаны",
      ].join("\n");
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `threat-${threat.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportDialogOpen(false);
      toastSuccess("Экспорт завершен", "Данные успешно экспортированы в TXT");
    } catch (error) {
      console.error("Ошибка при экспорте в TXT:", error);
      toastError("Ошибка экспорта", "Не удалось экспортировать данные");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>
                Главная
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/threats" />}>
                Угрозы
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Угроза #{threat.id}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-4">
          <Link href="/threats">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
          </Link>
        </div>

        {/* Основная информация */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">ID: {threat.id}</Badge>
                  {threat.fstecId > 0 && (
                    <Badge variant="secondary">ФСТЭК ID: {threat.fstecId}</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl mb-2">{threat.name}</CardTitle>
                <div className="flex gap-2 mt-4">
                  {threat.confidentiality && (
                    <Badge variant="destructive">Конфиденциальность</Badge>
                  )}
                  {threat.integrity && <Badge variant="destructive">Целостность</Badge>}
                  {threat.availability && <Badge variant="destructive">Доступность</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Копировать
                </Button>
                <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Экспорт данных</DialogTitle>
                      <DialogDescription>
                        Выберите формат для экспорта данных об угрозе
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
            <Separator className="my-4" />
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Описание</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {threat.description}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Нарушитель</h3>
                <div className="flex flex-wrap gap-2">
                  {threat.violator.map((v) => (
                    <Badge key={v} variant="secondary">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Объект</h3>
                <div className="flex flex-wrap gap-2">
                  {threat.object.map((o) => (
                    <Badge key={o} variant="secondary">
                      {o}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Аналитические разделы */}
        <Tabs defaultValue="tactical-tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tactical-tasks">Тактические задачи</TabsTrigger>
            <TabsTrigger value="protection-measures">Меры защиты</TabsTrigger>
          </TabsList>

          <TabsContent value="tactical-tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Связанные тактические задачи</CardTitle>
                <CardDescription>
                  Тактические задачи из модели MITRE ATT&CK, связанные с данной угрозой
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedTasks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Описание</TableHead>
                        <TableHead>Количество угроз</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <Badge variant="outline">{task.id}</Badge>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/tactical-tasks/${task.id}`}
                              className="font-medium hover:underline"
                            >
                              {task.name}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{task.threatCount}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">Связанные тактические задачи не найдены</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protection-measures" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Связанные меры защиты</CardTitle>
                <CardDescription>
                  Меры защиты информации, связанные с данной угрозой
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedMeasures.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Идентификатор</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Нормативный документ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedMeasures.map((measure) => (
                        <TableRow key={measure.id}>
                          <TableCell>
                            <Badge variant="outline">{measure.id}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{measure.identifier}</Badge>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/protection-measures/${measure.id}`}
                              className="font-medium hover:underline"
                            >
                              {measure.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {measure.regulatoryDocument}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">
                    {threat.protectionMeasures.length > 0
                      ? "Меры защиты не найдены в базе данных"
                      : "Меры защиты не указаны (Б/Н)"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

