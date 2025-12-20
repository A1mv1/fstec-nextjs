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
import { getTacticalTaskById, getAllThreats, getAllProtectionMeasures } from "@/lib/data";
import type { TacticalTask, Threat, ProtectionMeasure } from "@/lib/types";

export default function TacticalTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  const [task, setTask] = useState<TacticalTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [protectionMeasures, setProtectionMeasures] = useState<ProtectionMeasure[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const taskData = await getTacticalTaskById(id);
        if (!taskData) {
          router.push("/tactical-tasks");
          return;
        }
        setTask(taskData);

        const [threatsData, measuresData] = await Promise.all([
          getAllThreats(),
          getAllProtectionMeasures(),
        ]);
        setThreats(threatsData);
        setProtectionMeasures(measuresData);
      } catch (error) {
        console.error("Error loading tactical task:", error);
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

  if (!task) {
    return null;
  }

  // Находим связанные угрозы
  const relatedThreats = threats.filter((threat) =>
    threat.tacticalTasks.some((tt) => task.name.includes(tt) || tt.includes(task.name))
  );

  // Находим связанные меры защиты через угрозы
  const relatedMeasures = protectionMeasures.filter((measure) =>
    relatedThreats.some((threat) =>
      threat.protectionMeasures.some((pm) => pm.includes(measure.identifier))
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
              <BreadcrumbLink render={<Link href="/tactical-tasks" />}>
                Тактические задачи
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Задача #{task.id}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-4">
          <Link href="/tactical-tasks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">ID: {task.id}</Badge>
              <Badge variant="secondary">Угроз: {task.threatCount}</Badge>
            </div>
            <CardTitle className="text-2xl mb-2">{task.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            <div>
              <h3 className="font-semibold mb-2">Описание</h3>
              <div className="text-muted-foreground whitespace-pre-wrap break-words">
                {task.description}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="threats" className="w-full">
          <TabsList>
            <TabsTrigger value="threats">Связанные угрозы</TabsTrigger>
            <TabsTrigger value="protection-measures">Связанные меры защиты</TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Связанные угрозы</CardTitle>
                <CardDescription>
                  Угрозы безопасности информации, связанные с данной тактической задачей
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relatedThreats.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Нарушитель</TableHead>
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

          <TabsContent value="protection-measures" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Связанные меры защиты</CardTitle>
                <CardDescription>
                  Меры защиты информации, связанные с угрозами данной тактической задачи
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
                  <p className="text-muted-foreground">Связанные меры защиты не найдены</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

