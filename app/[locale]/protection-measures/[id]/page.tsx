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
import { ArrowLeft, Shield, AlertTriangle, Lock, FileText, ExternalLink, House } from "lucide-react";
import { getProtectionMeasureById, getAllThreats, getAllTacticalTasks } from "@/lib/data";
import type { ProtectionMeasure, Threat, TacticalTask } from "@/lib/types";

export default function ProtectionMeasureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const id = parseInt(params.id as string, 10);
  const t = useTranslations('MeasureDetail');
  const tCommon = useTranslations('Common');
  const [measure, setMeasure] = useState<ProtectionMeasure | null>(null);
  const [loading, setLoading] = useState(true);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [tacticalTasks, setTacticalTasks] = useState<TacticalTask[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const measureData = await getProtectionMeasureById(id, locale);
        if (!measureData) {
          router.push("/protection-measures");
          return;
        }
        setMeasure(measureData);

        const [threatsData, tasksData] = await Promise.all([
          getAllThreats(locale),
          getAllTacticalTasks(locale),
        ]);
        setThreats(threatsData);
        setTacticalTasks(tasksData);
      } catch (error) {
        console.error("Error loading protection measure:", error);
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

  if (!measure) {
    return null;
  }

  // Normalize measure identifier for comparison (Б/Н = N/A)
  const normalizeMeasureId = (id: string) => {
    if (id === 'Б/Н' || id === 'N/A' || id === 'N/A (Not Applicable)') return 'Б/Н';
    return id.trim();
  };

  const normalizedMeasureId = normalizeMeasureId(measure.identifier);

  // Find related threats - normalize identifiers for cross-locale comparison
  const relatedThreats = threats.filter((threat) =>
    threat.protectionMeasures.some((pm) => {
      const normalizedPm = normalizeMeasureId(pm);
      return normalizedPm === normalizedMeasureId || normalizedPm.includes(normalizedMeasureId) || normalizedMeasureId.includes(normalizedPm);
    })
  );

  // Create mapping: task name -> task ID for current locale
  const taskNameToIdMap = new Map<string, number>();
  tacticalTasks.forEach(t => {
    const normalize = (s: string) => s.trim().toLowerCase();
    taskNameToIdMap.set(normalize(t.name), t.id);
  });

  // Find related tactical tasks through threats - match by task ID (reliable across locales)
  const normalize = (s: string) => s.trim().toLowerCase();
  const relatedTasks = tacticalTasks.filter((task) => {
    const taskId = task.id;
    return relatedThreats.some((threat) =>
      threat.tacticalTasks.some((tt) => {
        const threatTaskNames = tt.split(',').map(t => t.trim());
        return threatTaskNames.some(ttn => {
          const normalizedTtn = normalize(ttn);
          const threatTaskId = taskNameToIdMap.get(normalizedTtn);
          // Match by ID - this works across locales!
          return threatTaskId === taskId;
        });
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
              <BreadcrumbLink render={<Link href="/protection-measures" />}>
                {tCommon("measures")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{tCommon("measures")} #{measure.id}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-4">
          <Link href="/protection-measures">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToMeasures")}
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">ID: {measure.id}</Badge>
              <Badge variant="secondary">{measure.identifier}</Badge>
            </div>
            <CardTitle className="text-2xl mb-2">{measure.name}</CardTitle>
            <CardDescription>
              {measure.regulatoryDocument.includes("Приказ ФСТЭК") ? (
                <a
                  href="/Приказ%20ФСТЭК%20России%20от%2011%20февраля%202013%20г.%20N%2017.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  <Badge variant="outline" className="border-primary">
                    <FileText className="h-3 w-3 mr-1" />
                    Приказ ФСТЭК №17
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Badge>
                </a>
              ) : (
                measure.regulatoryDocument
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="threats" className="w-full">
          <TabsList>
            <TabsTrigger value="threats">{t("relatedThreats")}</TabsTrigger>
            <TabsTrigger value="tactical-tasks">{t("relatedTasks")}</TabsTrigger>
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
                        <TableHead>{t("tacticalTask")}</TableHead>
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
                              {threat.tacticalTasks.flatMap(taskString => 
                                taskString.split(',').map(t => t.trim()).filter(Boolean)
                              ).slice(0, 2).map((taskName) => {
                                const task = tacticalTasks.find((t) => 
                                  t.name === taskName || 
                                  taskName.includes(t.name) || 
                                  t.name.includes(taskName)
                                );
                                
                                if (task) {
                                  return (
                                    <Link
                                      key={taskName}
                                      href={`/tactical-tasks/${task.id}`}
                                      className="inline-block"
                                    >
                                      <Badge variant="secondary" className="text-xs hover:bg-secondary/80 cursor-pointer">
                                        {taskName}
                                      </Badge>
                                    </Link>
                                  );
                                }
                                
                                return (
                                  <Badge key={taskName} variant="secondary" className="text-xs">
                                    {taskName}
                                  </Badge>
                                );
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {threat.confidentiality && (
                                <Badge variant="destructive" className="text-xs">К</Badge>
                              )}
                              {threat.integrity && (
                                <Badge variant="destructive" className="text-xs">Ц</Badge>
                              )}
                              {threat.availability && (
                                <Badge variant="destructive" className="text-xs">Д</Badge>
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

          <TabsContent value="tactical-tasks" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>{t("relatedTasks")}</CardTitle>
                </div>
                <CardDescription>
                  {t("relatedTasksDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedTasks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>{t("name")}</TableHead>
                        <TableHead>{t("description")}</TableHead>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">{t("noRelatedTasks")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

