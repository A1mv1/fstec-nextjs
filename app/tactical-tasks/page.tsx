"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllTacticalTasks } from "@/lib/data";
import { debounce } from "@/lib/filter";
import type { TacticalTask } from "@/lib/types";

export default function TacticalTasksPage() {
  const [tasks, setTasks] = useState<TacticalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllTacticalTasks();
        setTasks(data);
      } catch (error) {
        console.error("Error loading tactical tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce(() => {
        // Поиск обрабатывается в useMemo ниже
      }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch();
  }, [searchQuery, debouncedSearch]);

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

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
            <BreadcrumbItem>Тактические задачи</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Тактические задачи</CardTitle>
            <CardDescription>
              Тактические задачи из модели MITRE ATT&CK, связанные с угрозами безопасности информации
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <Input
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Тактические задачи не найдены</EmptyTitle>
              <EmptyDescription>Попробуйте изменить параметры поиска</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">ID: {task.id}</Badge>
                        <Badge variant="secondary">
                          Угроз: {task.threatCount}
                        </Badge>
                      </div>
                      <CardTitle className="mb-2">
                        <Link
                          href={`/tactical-tasks/${task.id}`}
                          className="hover:underline"
                        >
                          {task.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {task.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/tactical-tasks/${task.id}`}>
                    <Button variant="outline" size="sm">
                      Подробнее
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

