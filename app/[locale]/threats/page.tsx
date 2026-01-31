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
import { Separator } from "@/components/ui/separator";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectPopup as SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowRight, AlertTriangle, Shield, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, House } from "lucide-react";
import { getAllThreats } from "@/lib/data";
import { filterThreats, debounce } from "@/lib/filter";
import type { Threat, ThreatFilters } from "@/lib/types";

export default function ThreatsListPage() {
  const t = useTranslations("ThreatsPage");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const locale = params.locale as string;
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number | "all">(25);
  const [pageIndex, setPageIndex] = useState(0);

  // Load data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllThreats(locale);
        setThreats(data);
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
        // Search handled in filtering
      }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Filtering and sorting
  const filteredAndSortedThreats = useMemo(() => {
    const filters: ThreatFilters = searchQuery ? { search: searchQuery } : {};
    let filtered = filterThreats(threats, filters);

    // Sort by ID
    filtered = [...filtered].sort((a, b) => {
      return sortDirection === "asc" ? a.id - b.id : b.id - a.id;
    });

    return filtered;
  }, [threats, searchQuery, sortDirection]);

  // Pagination
  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;
    return Math.ceil(filteredAndSortedThreats.length / pageSize);
  }, [filteredAndSortedThreats.length, pageSize]);

  const paginatedThreats = useMemo(() => {
    if (pageSize === "all") {
      return filteredAndSortedThreats;
    }
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredAndSortedThreats.slice(start, end);
  }, [filteredAndSortedThreats, pageSize, pageIndex]);

  // Reset page when filters or page size changes
  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, sortDirection, pageSize]);

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
            <BreadcrumbItem>{tCommon("threats")}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>{t("title")}</CardTitle>
            </div>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Панель управления */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 z-10 transform -translate-y-1/2 h-4 w-4 text-slate-600 dark:text-foreground pointer-events-none" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortDirection} onValueChange={(value: "asc" | "desc" | null) => value && setSortDirection(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        {sortDirection === "asc" ? t("sortAsc") : t("sortDesc")}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">{t("sortAsc")}</SelectItem>
                    <SelectItem value="desc">{t("sortDesc")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {searchQuery && (
                <div className="text-sm text-muted-foreground">
                  {t("foundResults")}: <span className="font-medium text-foreground">{filteredAndSortedThreats.length}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t("rowsPerPage")}:</span>
                  <Select
                    value={
                      pageSize === "all"
                        ? "all"
                        : pageSize.toString()
                    }
                    onValueChange={(value) => {
                      if (value === "all") {
                        setPageSize("all");
                      } else {
                        setPageSize(Number(value));
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 w-[100px]">
                      <SelectValue>
                        {pageSize === "all" ? `${t("all")} (${filteredAndSortedThreats.length})` : pageSize.toString()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="all">
                        {t("all")} ({filteredAndSortedThreats.length})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {pageSize !== "all" && totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {t("page")} {pageIndex + 1} {t("of")} {totalPages}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPageIndex(0)}
                        disabled={pageIndex === 0}
                        title={t("firstPage")}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPageIndex(pageIndex - 1)}
                        disabled={pageIndex === 0}
                        title={t("previousPage")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPageIndex(pageIndex + 1)}
                        disabled={pageIndex >= totalPages - 1}
                        title={t("nextPage")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPageIndex(totalPages - 1)}
                        disabled={pageIndex >= totalPages - 1}
                        title={t("lastPage")}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
              <EmptyTitle>{t("noThreatsFound")}</EmptyTitle>
              <EmptyDescription>{t("tryDifferentSearch")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
              {paginatedThreats.map((threat) => (
              <Card key={threat.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">ID: {threat.id}</Badge>
                        {threat.fstecId > 0 && (
                          <Badge variant="secondary">{tCommon("fstecId")}: {threat.fstecId}</Badge>
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
                        <Badge variant="destructive" className="text-xs">{tCommon("ciaShortC")}</Badge>
                      )}
                      {threat.integrity && (
                        <Badge variant="destructive" className="text-xs">{tCommon("ciaShortI")}</Badge>
                      )}
                      {threat.availability && (
                        <Badge variant="destructive" className="text-xs">{tCommon("ciaShortA")}</Badge>
                      )}
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {t("protectionMeasures")}: {threat.protectionMeasures.length || t("na")}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link href={`/threats/${threat.id}`}>
                      <Button variant="outline" size="sm">{t("viewDetails")}<ArrowRight className="h-4 w-4 ml-2" />
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

