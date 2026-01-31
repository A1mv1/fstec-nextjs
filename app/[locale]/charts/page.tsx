"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";
import { getAllThreats } from "@/lib/data";
import { CIADistributionChart } from "@/components/charts/cia-distribution-chart";
import { CIACombinationsChart } from "@/components/charts/cia-combinations-chart";
import { TopViolatorsChart } from "@/components/charts/top-violators-chart";
import { TopObjectsChart } from "@/components/charts/top-objects-chart";
import { TacticalTasksChart } from "@/components/charts/tactical-tasks-chart";
import { ProtectionMeasuresChart } from "@/components/charts/protection-measures-chart";
import { ChartCardWrapper } from "@/components/charts/chart-card-wrapper";
import type { Threat } from "@/lib/types";

export default function ChartsPage() {
  const t = useTranslations('ChartsPage');
  const params = useParams();
  const locale = params.locale as string;
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Основная область */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />{t("backToHome")}</Button>
          </Link>
        </div>
        {/* Вводный блок */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">{t("title")}</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl flex items-start gap-2">
            <TrendingUp className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{t("description.part1")}
            {t("description.part2")}
            {t("description.part3")}</span>
          </p>
        </div>

        {/* Сетка графиков - по два в ряд */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* График 1: Распределение угроз по CIA триаде */}
          <ChartCardWrapper
            title={t("charts.ciaDistribution.title")}
            description={t("charts.ciaDistribution.description")}
            loading={loading}
            loadingHeight="400px"
          >
            <CIADistributionChart threats={threats} />
          </ChartCardWrapper>

          {/* График 2: Комбинации CIA */}
          <ChartCardWrapper
            title={t("charts.ciaCombinations.title")}
            description={t("charts.ciaCombinations.description")}
            loading={loading}
            loadingHeight="500px"
          >
            <CIACombinationsChart threats={threats} />
          </ChartCardWrapper>

          {/* График 3: Топ-10 нарушителей */}
          <ChartCardWrapper
            title={t("charts.topViolators.title")}
            description={t("charts.topViolators.description")}
            loading={loading}
            loadingHeight="500px"
          >
            <TopViolatorsChart threats={threats} />
          </ChartCardWrapper>

          {/* График 4: Топ-15 объектов воздействия */}
          <ChartCardWrapper
            title={t("charts.topObjects.title")}
            description={t("charts.topObjects.description")}
            loading={loading}
            loadingHeight="600px"
          >
            <TopObjectsChart threats={threats} />
          </ChartCardWrapper>

          {/* График 5: Распределение по тактическим задачам MITRE ATT&CK */}
          <ChartCardWrapper
            title={t("charts.tacticalTasks.title")}
            description={t("charts.tacticalTasks.description")}
            loading={loading}
            loadingHeight="500px"
          >
            <TacticalTasksChart threats={threats} />
          </ChartCardWrapper>

          {/* График 6: Статистика по мерам защиты */}
          <ChartCardWrapper
            title={t("charts.protectionMeasures.title")}
            description={t("charts.protectionMeasures.description")}
            loading={loading}
            loadingHeight="400px"
          >
            <ProtectionMeasuresChart threats={threats} />
          </ChartCardWrapper>
        </div>
      </main>
    </div>
  );
}

