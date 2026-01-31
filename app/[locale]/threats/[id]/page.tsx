"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Copy, Download, FileJson, FileSpreadsheet, FileText, AlertTriangle, Shield, Lock, User, Target, Eye, House } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { getThreatById, getAllProtectionMeasures, getAllTacticalTasks } from "@/lib/data";
import type { Threat, ProtectionMeasure, TacticalTask } from "@/lib/types";

export default function ThreatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const id = parseInt(params.id as string, 10);
  const t = useTranslations('ThreatDetail');
  const tCommon = useTranslations('Common');
  const [threat, setThreat] = useState<Threat | null>(null);
  const [loading, setLoading] = useState(true);
  const [protectionMeasures, setProtectionMeasures] = useState<ProtectionMeasure[]>([]);
  const [tacticalTasks, setTacticalTasks] = useState<TacticalTask[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const threatData = await getThreatById(id, locale);
        if (!threatData) {
          router.push("/threats");
          return;
        }
        setThreat(threatData);

        // Load related data
        const [measures, tasks] = await Promise.all([
          getAllProtectionMeasures(locale),
          getAllTacticalTasks(locale),
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
  }, [id, locale, router]);

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

  // Normalize measure identifier for comparison (Б/Н = N/A)
  const normalizeMeasureId = (id: string) => {
    if (id === 'Б/Н' || id === 'N/A' || id === 'N/A (Not Applicable)') return 'Б/Н';
    return id.trim();
  };

  // Find related protection measures - normalize identifiers for cross-locale comparison
  const relatedMeasures = protectionMeasures.filter((m) => {
    const normalizedMeasureId = normalizeMeasureId(m.identifier);
    return threat.protectionMeasures.some((pm) => {
      const normalizedPm = normalizeMeasureId(pm);
      return normalizedPm === normalizedMeasureId || normalizedPm.includes(normalizedMeasureId) || normalizedMeasureId.includes(normalizedPm);
    });
  });

  // Create mapping: task name -> task ID for current locale
  const taskNameToIdMap = new Map<string, number>();
  tacticalTasks.forEach(t => {
    const normalize = (s: string) => s.trim().toLowerCase();
    taskNameToIdMap.set(normalize(t.name), t.id);
  });

  // Find related tactical tasks - match by task ID (reliable across locales)
  const normalize = (s: string) => s.trim().toLowerCase();
  const relatedTasks = tacticalTasks.filter((task) => {
    const taskId = task.id;
    return threat.tacticalTasks.some((tt) => {
      const threatTaskNames = tt.split(',').map(t => t.trim());
      return threatTaskNames.some(ttn => {
        const normalizedTtn = normalize(ttn);
        const threatTaskId = taskNameToIdMap.get(normalizedTtn);
        // Match by ID - this works across locales!
        return threatTaskId === taskId;
      });
    });
  });

  const handleCopy = () => {
    const text = `${threat.name}\n\n${threat.description}`;
    navigator.clipboard.writeText(text).then(() => {
      toastSuccess(t('copiedSuccess'), t('copiedMessage'));
    }).catch(() => {
      toastError(t('copyError'), t('copyErrorMessage'));
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
    if (bytes === 0) return `0 ${t('bytes')}`;
    const k = 1024;
    const sizes = [t('bytes'), t('kilobytes'), t('megabytes')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileSize = (format: "json" | "csv" | "tsv" | "txt"): string => {
    if (!threat) return `0 ${t('bytes')}`;
    try {
      const data = getExportData();
      let content = "";
      
      switch (format) {
        case "json":
          content = JSON.stringify(data, null, 2);
          break;
        case "csv":
          const csvRows = [
            [t('field'), t('value')],
            [t('id'), data.id.toString()],
            [t('name'), `"${data.name.replace(/"/g, '""')}"`],
            [t('description'), `"${data.description.replace(/"/g, '""')}"`],
            [t('fstecId'), data.fstecId > 0 ? data.fstecId.toString() : ""],
            [t('tacticalTasks'), `"${data.tacticalTasks.join("; ").replace(/"/g, '""')}"`],
            [t('violator'), `"${data.violator.join("; ").replace(/"/g, '""')}"`],
            [t('object'), `"${data.object.join("; ").replace(/"/g, '""')}"`],
            [t('confidentiality'), data.confidentiality ? t('yes') : t('no')],
            [t('integrity'), data.integrity ? t('yes') : t('no')],
            [t('availability'), data.availability ? t('yes') : t('no')],
            [t('protectionMeasures'), `"${data.protectionMeasures.join("; ").replace(/"/g, '""')}"`],
          ];
          content = "\ufeff" + csvRows.map(row => row.join(",")).join("\n");
          break;
        case "tsv":
          const tsvRows = [
            [t('field'), t('value')],
            [t('id'), data.id.toString()],
            [t('name'), data.name],
            [t('description'), data.description],
            [t('fstecId'), data.fstecId > 0 ? data.fstecId.toString() : ""],
            [t('tacticalTasks'), data.tacticalTasks.join("; ")],
            [t('violator'), data.violator.join("; ")],
            [t('object'), data.object.join("; ")],
            [t('confidentiality'), data.confidentiality ? t('yes') : t('no')],
            [t('integrity'), data.integrity ? t('yes') : t('no')],
            [t('availability'), data.availability ? t('yes') : t('no')],
            [t('protectionMeasures'), data.protectionMeasures.join("; ")],
          ];
          content = tsvRows.map(row => row.join("\t")).join("\n");
          break;
        case "txt":
          content = [
            `${t('informationSecurityThreat')} #${data.id}`,
            "=".repeat(50),
            "",
            `${t('name')}: ${data.name}`,
            "",
            `${t('description')}:`,
            data.description,
            "",
            `${t('fstecId')}: ${data.fstecId > 0 ? data.fstecId : t('notSpecified')}`,
            "",
            `${t('tacticalTasks')}:`,
            data.tacticalTasks.length > 0 ? data.tacticalTasks.map((task, i) => `  ${i + 1}. ${task}`).join("\n") : `  ${t('notSpecified')}`,
            "",
            `${t('violator')}:`,
            data.violator.length > 0 ? data.violator.map((v, i) => `  ${i + 1}. ${v}`).join("\n") : `  ${t('notSpecified')}`,
            "",
            `${t('object')}:`,
            data.object.length > 0 ? data.object.map((o, i) => `  ${i + 1}. ${o}`).join("\n") : `  ${t('notSpecified')}`,
            "",
            `${t('ciaTriad')}:`,
            `  ${t('confidentiality')}: ${data.confidentiality ? t('yes') : t('no')}`,
            `  ${t('integrity')}: ${data.integrity ? t('yes') : t('no')}`,
            `  ${t('availability')}: ${data.availability ? t('yes') : t('no')}`,
            "",
            `${t('protectionMeasures')}:`,
            data.protectionMeasures.length > 0 ? data.protectionMeasures.map((m, i) => `  ${i + 1}. ${m}`).join("\n") : `  ${t('notSpecified')}`,
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
      toastSuccess(t('exportSuccess'), t('exportSuccessMessage'));
    } catch (error) {
      console.error("Error exporting to JSON:", error);
      toastError(t('exportError'), t('exportErrorMessage'));
    }
  };

  const exportToCSV = () => {
    if (!threat) return;
    try {
      const data = getExportData();
      const csvRows = [
        [t("field"), t("value")],
        [t("id"), data.id.toString()],
        [t("name"), `"${data.name.replace(/"/g, '""')}"`],
        [t("description"), `"${data.description.replace(/"/g, '""')}"`],
        [t("fstecId"), data.fstecId > 0 ? data.fstecId.toString() : ""],
        [t("tacticalTasks"), `"${data.tacticalTasks.join("; ").replace(/"/g, '""')}"`],
        [t("violator"), `"${data.violator.join("; ").replace(/"/g, '""')}"`],
        [t("object"), `"${data.object.join("; ").replace(/"/g, '""')}"`],
        [t("confidentiality"), data.confidentiality ? tCommon("yes") : tCommon("no")],
        [t("integrity"), data.integrity ? tCommon("yes") : tCommon("no")],
        [t("availability"), data.availability ? tCommon("yes") : tCommon("no")],
        [t("protectionMeasures"), `"${data.protectionMeasures.join("; ").replace(/"/g, '""')}"`],
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
      toastSuccess(t('exportSuccess'), t('exportSuccessMessage'));
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toastError(t('exportError'), t('exportErrorMessage'));
    }
  };

  const exportToTSV = () => {
    if (!threat) return;
    try {
      const data = getExportData();
      const tsvRows = [
        [t("field"), t("value")],
        [t("id"), data.id.toString()],
        [t("name"), data.name],
        [t("description"), data.description],
        [t("fstecId"), data.fstecId > 0 ? data.fstecId.toString() : ""],
        [t("tacticalTasks"), data.tacticalTasks.join("; ")],
        [t("violator"), data.violator.join("; ")],
        [t("object"), data.object.join("; ")],
        [t("confidentiality"), data.confidentiality ? tCommon("yes") : tCommon("no")],
        [t("integrity"), data.integrity ? tCommon("yes") : tCommon("no")],
        [t("availability"), data.availability ? tCommon("yes") : tCommon("no")],
        [t("protectionMeasures"), data.protectionMeasures.join("; ")],
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
      toastSuccess(t('exportSuccess'), t('exportSuccessMessage'));
    } catch (error) {
      console.error("Error exporting to TSV:", error);
      toastError(t('exportError'), t('exportErrorMessage'));
    }
  };

  const exportToTXT = () => {
    if (!threat) return;
    try {
      const data = getExportData();
      const txtContent = [
        t("threatTitle").replace("{id}", data.id.toString()),
        "=".repeat(50),
        "",
        `${t("name")}: ${data.name}`,
        "",
        `${t("description")}:`,
        data.description,
        "",
        `${t("fstecId")}: ${data.fstecId > 0 ? data.fstecId.toString() : t("notSpecified")}`,
        "",
        `${t("tacticalTasksLabel")}`,
        data.tacticalTasks.length > 0 ? data.tacticalTasks.map((t, i) => `  ${i + 1}. ${t}`).join("\n") : `  ${t("notSpecified")}`,
        "",
        `${t("violatorLabel")}`,
        data.violator.length > 0 ? data.violator.map((v, i) => `  ${i + 1}. ${v}`).join("\n") : `  ${t("notSpecified")}`,
        "",
        `${t("objectLabel")}`,
        data.object.length > 0 ? data.object.map((o, i) => `  ${i + 1}. ${o}`).join("\n") : `  ${t("notSpecified")}`,
        "",
        `${t("ciaLabel")}`,
        `  ${t("confidentiality")}: ${data.confidentiality ? tCommon("yes") : tCommon("no")}`,
        `  ${t("integrity")}: ${data.integrity ? tCommon("yes") : tCommon("no")}`,
        `  ${t("availability")}: ${data.availability ? tCommon("yes") : tCommon("no")}`,
        "",
        `${t("protectionMeasuresLabel")}`,
        data.protectionMeasures.length > 0 ? data.protectionMeasures.map((m, i) => `  ${i + 1}. ${m}`).join("\n") : `  ${t("notSpecified")}`,
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
      toastSuccess(t('exportSuccess'), t('exportSuccessMessage'));
    } catch (error) {
      console.error("Error exporting to TXT:", error);
      toastError(t('exportError'), t('exportErrorMessage'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>
                <House className="h-4 w-4 mr-1.5 inline" />
                {tCommon('home')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/threats" />}>
                {tCommon('threats')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{tCommon('threat')} #{threat.id}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-4">
          <Link href="/threats">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToThreats')}
            </Button>
          </Link>
        </div>

        {/* Main information */}
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
                    <Badge variant="destructive">{t("confidentiality")}</Badge>
                  )}
                  {threat.integrity && <Badge variant="destructive">{t("integrity")}</Badge>}
                  {threat.availability && <Badge variant="destructive">{t("availability")}</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t('copyData')}
                </Button>
                <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      {t('exportData')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('exportDialog.title')}</DialogTitle>
                      <DialogDescription>
                        {t('exportDialog.description')}
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
                              {t('exportDialog.jsonDescription')}
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
                              {t('exportDialog.csvDescription')}
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
                              {t('exportDialog.tsvDescription')}
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
                              {t('exportDialog.txtDescription')}
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
                        {tCommon('cancel')}
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
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t('description')}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {threat.description}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('violator')}
                </h3>
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
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {t('object')}
                </h3>
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

        {/* Analytical sections */}
        <Tabs defaultValue="tactical-tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tactical-tasks">{t('tacticalTasks')}</TabsTrigger>
            <TabsTrigger value="protection-measures">{t('protectionMeasures')}</TabsTrigger>
          </TabsList>

          <TabsContent value="tactical-tasks" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>{t('relatedTasks')}</CardTitle>
                </div>
                <CardDescription>
                  {t('relatedTasksDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedTasks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>{t('name')}</TableHead>
                        <TableHead>{t('description')}</TableHead>
                        <TableHead>{t('threatCount')}</TableHead>
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
                  <p className="text-muted-foreground">{t('noRelatedTasks')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protection-measures" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>{t('relatedMeasures')}</CardTitle>
                </div>
                <CardDescription>
                  {t('relatedMeasuresDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedMeasures.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>{t('identifier')}</TableHead>
                        <TableHead>{t('name')}</TableHead>
                        <TableHead>{t('regulatoryDocument')}</TableHead>
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
                      ? t('measuresNotFoundInDb')
                      : t('measuresNotSpecified')}
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

