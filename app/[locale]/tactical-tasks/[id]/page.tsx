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
import { ArrowLeft, Lock, AlertTriangle, Shield, Eye, House } from "lucide-react";
import { getTacticalTaskById, getAllThreats, getAllProtectionMeasures, getAllTacticalTasks } from "@/lib/data";
import type { TacticalTask, Threat, ProtectionMeasure } from "@/lib/types";

export default function TacticalTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const id = parseInt(params.id as string, 10);
  const t = useTranslations("TaskDetail");
  const tCommon = useTranslations("Common");
  const [task, setTask] = useState<TacticalTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [protectionMeasures, setProtectionMeasures] = useState<ProtectionMeasure[]>([]);
  const [allTasks, setAllTasks] = useState<TacticalTask[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const taskData = await getTacticalTaskById(id, locale);
        if (!taskData) {
          router.push("/tactical-tasks");
          return;
        }
        setTask(taskData);

        const [threatsData, measuresData, tasksData] = await Promise.all([
          getAllThreats(locale),
          getAllProtectionMeasures(locale),
          getAllTacticalTasks(locale),
        ]);
        setThreats(threatsData);
        setProtectionMeasures(measuresData);
        setAllTasks(tasksData);
      } catch (error) {
        console.error("Error loading tactical task:", error);
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

  if (!task) {
    return null;
  }

  // Create mapping: task name -> task ID for current locale
  const taskNameToIdMap = new Map<string, number>();
  allTasks.forEach(t => {
    const normalize = (s: string) => s.trim().toLowerCase();
    taskNameToIdMap.set(normalize(t.name), t.id);
  });

  // Find related threats - match by task ID (reliable across locales)
  const normalize = (s: string) => s.trim().toLowerCase();
  const currentTaskId = task.id;
  const relatedThreats = threats.filter((threat) =>
    threat.tacticalTasks.some((tt) => {
      // Split comma-separated task names
      const threatTaskNames = tt.split(',').map(t => t.trim());
      // Check if any threat task name corresponds to a task with same ID as current task
      return threatTaskNames.some(ttn => {
        const normalizedTtn = normalize(ttn);
        const threatTaskId = taskNameToIdMap.get(normalizedTtn);
        // Match by ID - this works across locales!
        return threatTaskId === currentTaskId;
      });
    })
  );

  // Normalize measure identifier for comparison (Б/Н = N/A)
  const normalizeMeasureId = (id: string) => {
    if (id === 'Б/Н' || id === 'N/A' || id === 'N/A (Not Applicable)') return 'Б/Н';
    return id.trim();
  };

  // Find related measures through threats - normalize identifiers for cross-locale comparison
  const relatedMeasures = protectionMeasures.filter((measure) => {
    const normalizedMeasureId = normalizeMeasureId(measure.identifier);
    return relatedThreats.some((threat) =>
      threat.protectionMeasures.some((pm) => {
        const normalizedPm = normalizeMeasureId(pm);
        return normalizedPm === normalizedMeasureId || normalizedPm.includes(normalizedMeasureId) || normalizedMeasureId.includes(normalizedPm);
      })
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/" />}>
                <House className="h-4 w-4 mr-1.5 inline" />
                {tCommon("home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/tactical-tasks" />}>
                {tCommon("tasks")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{tCommon("tasks")} #{task.id}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-4">
          <Link href="/tactical-tasks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToTasks")}
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">ID: {task.id}</Badge>
              <Badge variant="secondary">{t("threatCount")}: {task.threatCount}</Badge>
            </div>
            <CardTitle className="text-2xl mb-2">{task.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {t("description")}
              </h3>
              <div className="text-muted-foreground whitespace-pre-wrap break-words">
                {task.description}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="threats" className="w-full">
          <TabsList>
            <TabsTrigger value="threats">{t("relatedThreats")}</TabsTrigger>
            <TabsTrigger value="protection-measures">{t("relatedMeasures")}</TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle>{t("relatedThreats")}</CardTitle>
                </div>
                <CardDescription>
                  {t("relatedThreatsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedThreats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>{t("name")}</TableHead>
                        <TableHead>{tCommon("violator")}</TableHead>
                        <TableHead>CIA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedThreats.map((threat) => (
                        <TableRow key={threat.id}>
                          <TableCell>
                            <Badge variant="outline">{threat.id}</Badge>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/threats/${threat.id}`}
                              className="font-medium hover:underline"
                            >
                              {threat.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {threat.violator.slice(0, 1).map((v) => (
                                <Badge key={v} variant="secondary" className="text-xs">
                                  {v}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {threat.confidentiality && (
                                <Badge variant="destructive" className="text-xs">{tCommon("ciaShortC")}</Badge>
                              )}
                              {threat.integrity && (
                                <Badge variant="destructive" className="text-xs">{tCommon("ciaShortI")}</Badge>
                              )}
                              {threat.availability && (
                                <Badge variant="destructive" className="text-xs">{tCommon("ciaShortA")}</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">{t("noRelatedThreats")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protection-measures" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>{t("relatedMeasures")}</CardTitle>
                </div>
                <CardDescription>
                  {t("relatedMeasuresDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedMeasures.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>{t("identifier")}</TableHead>
                        <TableHead>{t("name")}</TableHead>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">{t("noRelatedMeasures")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

