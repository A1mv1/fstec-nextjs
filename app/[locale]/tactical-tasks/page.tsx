"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowRight, Lock, AlertTriangle, House } from "lucide-react";
import { getAllTacticalTasks } from "@/lib/data";
import { debounce } from "@/lib/filter";
import type { TacticalTask } from "@/lib/types";

export default function TacticalTasksPage() {
  const t = useTranslations("TacticalTasksPage");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const locale = params.locale as string;
  const [tasks, setTasks] = useState<TacticalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllTacticalTasks(locale);
        setTasks(data);
      } catch (error) {
        console.error("Error loading tactical tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [locale]);

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
                <House className="h-4 w-4 mr-1.5 inline" />
                {tCommon("home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{tCommon("tasks")}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>{tCommon("tasks")}</CardTitle>
            </div>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 z-10 transform -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-foreground pointer-events-none" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  {t("foundResults")}: <span className="font-medium text-foreground">{filteredTasks.length}</span>
                </div>
              )}
            </div>
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
              <EmptyTitle>{t("noTasksFound")}</EmptyTitle>
              <EmptyDescription>{t("tryDifferentSearch")}</EmptyDescription>
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
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {t("threats")} {task.threatCount}
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
                      {t("viewDetails")}
                      <ArrowRight className="h-4 w-4 ml-2" />
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

