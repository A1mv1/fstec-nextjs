"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectPopup as SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllThreats } from "@/lib/data";
import { filterThreats, debounce } from "@/lib/filter";
import type { Threat, ThreatFilters } from "@/lib/types";

export default function ThreatsListPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "name">("id");

  // Загрузка данных
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllThreats();
        setThreats(data);
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
        // Поиск будет обрабатываться в фильтрации
      }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Фильтрация и сортировка
  const filteredAndSortedThreats = useMemo(() => {
    const filters: ThreatFilters = searchQuery ? { search: searchQuery } : {};
    let filtered = filterThreats(threats, filters);

    // Сортировка
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "id") {
        return a.id - b.id;
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [threats, searchQuery, sortBy]);

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
            <BreadcrumbItem>Угрозы</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Список угроз безопасности информации</CardTitle>
            <CardDescription>
              Полный список угроз безопасности информации в соответствии с требованиями ФСТЭК России
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Панель управления */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Поиск по названию или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={sortBy} onValueChange={(value: "id" | "name" | null) => value && setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">По ID</SelectItem>
                  <SelectItem value="name">По названию</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Список угроз */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredAndSortedThreats.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Угрозы не найдены</EmptyTitle>
              <EmptyDescription>Попробуйте изменить параметры поиска</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedThreats.map((threat) => (
              <Card key={threat.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">ID: {threat.id}</Badge>
                        {threat.fstecId > 0 && (
                          <Badge variant="secondary">ФСТЭК: {threat.fstecId}</Badge>
                        )}
                      </div>
                      <CardTitle className="mb-2">
                        <Link
                          href={`/threats/${threat.id}`}
                          className="hover:underline"
                        >
                          {threat.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {threat.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {threat.tacticalTasks.slice(0, 3).map((task) => (
                      <Badge key={task} variant="secondary">
                        {task}
                      </Badge>
                    ))}
                    {threat.tacticalTasks.length > 3 && (
                      <Badge variant="secondary">
                        +{threat.tacticalTasks.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex gap-2">
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
                    <Separator orientation="vertical" className="h-4" />
                    <span>Меры защиты: {threat.protectionMeasures.length || "Б/Н"}</span>
                  </div>
                  <div className="mt-4">
                    <Link href={`/threats/${threat.id}`}>
                      <Button variant="outline" size="sm">
                        Подробнее
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

