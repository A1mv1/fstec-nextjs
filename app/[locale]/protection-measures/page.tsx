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
import { Select, SelectPopup as SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowRight, Shield, FileText, ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, House } from "lucide-react";
import { getAllProtectionMeasures } from "@/lib/data";
import { debounce } from "@/lib/filter";
import type { ProtectionMeasure } from "@/lib/types";

export default function ProtectionMeasuresPage() {
  const t = useTranslations("ProtectionMeasuresPage");
  const tCommon = useTranslations("Common");
  const params = useParams();
  const locale = params.locale as string;
  const [measures, setMeasures] = useState<ProtectionMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number | "all">(20);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllProtectionMeasures(locale);
        setMeasures(data);
      } catch (error) {
        console.error("Error loading protection measures:", error);
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

  const filteredMeasures = useMemo(() => {
    if (!searchQuery) return measures;
    const query = searchQuery.toLowerCase();
    return measures.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.identifier.toLowerCase().includes(query) ||
        m.regulatoryDocument.toLowerCase().includes(query)
    );
  }, [measures, searchQuery]);

  // Pagination
  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;
    return Math.ceil(filteredMeasures.length / pageSize);
  }, [filteredMeasures.length, pageSize]);

  const paginatedMeasures = useMemo(() => {
    if (pageSize === "all") {
      return filteredMeasures;
    }
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filteredMeasures.slice(start, end);
  }, [filteredMeasures, pageSize, pageIndex]);

  // Reset page when filters or page size changes
  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, pageSize]);

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
            <BreadcrumbItem>{tCommon("measures")}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>{t("title")}</CardTitle>
            </div>
            <CardDescription>
              {t("description")}{" "}
              <a
                href="/Приказ%20ФСТЭК%20России%20от%2011%20февраля%202013%20г.%20N%2017.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                <Badge variant="outline" className="border-primary">
                  <FileText className="h-3 w-3 mr-1" />
                  {t("fstecOrder")}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Badge>
              </a>
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
                  {t("foundResults")}: <span className="font-medium text-foreground">{filteredMeasures.length}</span>
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
                        {pageSize === "all" ? `${t("all")} (${filteredMeasures.length})` : pageSize.toString()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="35">35</SelectItem>
                      <SelectItem value="all">
                        {t("all")} ({filteredMeasures.length})
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

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredMeasures.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("noMeasuresFound")}</EmptyTitle>
              <EmptyDescription>{t("tryDifferentSearch")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
              {paginatedMeasures.map((measure) => (
              <Card key={measure.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">ID: {measure.id}</Badge>
                        <Badge variant="secondary">{measure.identifier}</Badge>
                      </div>
                      <CardTitle className="mb-2">
                        <Link
                          href={`/protection-measures/${measure.id}`}
                          className="hover:underline"
                        >
                          {measure.name}
                        </Link>
                      </CardTitle>
                      <CardDescription>{measure.regulatoryDocument}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/protection-measures/${measure.id}`}>
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

