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
import { ArrowLeft } from "lucide-react";
import { getProtectionMeasureById, getAllThreats, getAllTacticalTasks } from "@/lib/data";
import type { ProtectionMeasure, Threat, TacticalTask } from "@/lib/types";

export default function ProtectionMeasureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [measure, setMeasure] = useState<ProtectionMeasure | null>(null);
  const [loading, setLoading] = useState(true);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [tacticalTasks, setTacticalTasks] = useState<TacticalTask[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const measureData = await getProtectionMeasureById(id);
        if (!measureData) {
          router.push("/protection-measures");
          return;
        }
        setMeasure(measureData);

        const [threatsData, tasksData] = await Promise.all([
          getAllThreats(),
          getAllTacticalTasks(),
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
  }, [id, router]);

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

  // Находим связанные угрозы
  const relatedThreats = threats.filter((threat) =>
    threat.protectionMeasures.some((pm) => pm.includes(measure.identifier))
  );

  // Находим связанные тактические задачи через угрозы
  const relatedTasks = tacticalTasks.filter((task) =>
    relatedThreats.some((threat) =>
      threat.tacticalTasks.some((tt) => task.name.includes(tt) || tt.includes(task.name))
    )
  );

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
              <BreadcrumbLink render={<Link href="/protection-measures" />}>
                Меры защиты
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Мера #{measure.id}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-4">
          <Link href="/protection-measures">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
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
                  className="inline-flex items-center"
                >
                  <Badge variant="outline" className="border-primary">Приказ ФСТЭК №17</Badge>
                </a>
              ) : (
                measure.regulatoryDocument
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="threats" className="w-full">
          <TabsList>
            <TabsTrigger value="threats">Связанные угрозы</TabsTrigger>
            <TabsTrigger value="tactical-tasks">Связанные тактические задачи</TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Связанные угрозы</CardTitle>
                <CardDescription>
                  Угрозы безопасности информации, для которых применяется данная мера защиты
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedThreats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Тактическая задача</TableHead>
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
                  <p className="text-muted-foreground">Связанные угрозы не найдены</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tactical-tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Связанные тактические задачи</CardTitle>
                <CardDescription>
                  Тактические задачи, связанные с угрозами, для которых применяется данная мера защиты
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
                  <p className="text-muted-foreground">Связанные тактические задачи не найдены</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

