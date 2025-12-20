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
import { getAllProtectionMeasures } from "@/lib/data";
import { debounce } from "@/lib/filter";
import type { ProtectionMeasure } from "@/lib/types";

export default function ProtectionMeasuresPage() {
  const [measures, setMeasures] = useState<ProtectionMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getAllProtectionMeasures();
        setMeasures(data);
      } catch (error) {
        console.error("Error loading protection measures:", error);
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
            <BreadcrumbItem>Меры защиты</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Меры защиты информации</CardTitle>
            <CardDescription>
              Список мер защиты информации в соответствии с{" "}
              <a
                href="/Приказ%20ФСТЭК%20России%20от%2011%20февраля%202013%20г.%20N%2017.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Badge variant="outline" className="border-primary">Приказом ФСТЭК №17</Badge>
              </a>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <Input
              placeholder="Поиск по названию, идентификатору или документу..."
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
        ) : filteredMeasures.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Меры защиты не найдены</EmptyTitle>
              <EmptyDescription>Попробуйте изменить параметры поиска</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-4">
            {filteredMeasures.map((measure) => (
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

