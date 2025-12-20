"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Основная область */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
        </div>
        {/* Вводный блок */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Графики и статистика</h2>
          <p className="text-muted-foreground max-w-2xl">
            Визуализация данных по угрозам безопасности информации позволяет лучше понять
            распределение угроз, выявить наиболее активных нарушителей и уязвимые объекты,
            а также оценить эффективность мер защиты.
          </p>
        </div>

        {/* Сетка графиков - по два в ряд */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* График 1: Распределение угроз по CIA триаде */}
          <ChartCardWrapper
            title="Распределение угроз по CIA триаде"
            description="Показывает, какие аспекты безопасности (конфиденциальность, целостность, доступность) чаще всего подвергаются угрозам"
            loading={loading}
            loadingHeight="400px"
          >
            <CIADistributionChart threats={threats} />
          </ChartCardWrapper>

          {/* График 2: Комбинации CIA */}
          <ChartCardWrapper
            title="Комбинации CIA"
            description="Показывает, сколько угроз затрагивает один, два или все три аспекта одновременно"
            loading={loading}
            loadingHeight="500px"
          >
            <CIACombinationsChart threats={threats} />
          </ChartCardWrapper>

          {/* График 3: Топ-10 нарушителей */}
          <ChartCardWrapper
            title="Топ-10 нарушителей"
            description="Выявляет наиболее активные типы нарушителей для приоритизации защиты"
            loading={loading}
            loadingHeight="500px"
          >
            <TopViolatorsChart threats={threats} />
          </ChartCardWrapper>

          {/* График 4: Топ-15 объектов воздействия */}
          <ChartCardWrapper
            title="Топ-15 объектов воздействия"
            description="Показывает наиболее уязвимые объекты для фокусировки мер защиты"
            loading={loading}
            loadingHeight="600px"
          >
            <TopObjectsChart threats={threats} />
          </ChartCardWrapper>

          {/* График 5: Распределение по тактическим задачам MITRE ATT&CK */}
          <ChartCardWrapper
            title="Распределение по тактическим задачам MITRE ATT&CK"
            description="Связывает угрозы с тактиками MITRE ATT&CK для понимания векторов атак"
            loading={loading}
            loadingHeight="500px"
          >
            <TacticalTasksChart threats={threats} />
          </ChartCardWrapper>

          {/* График 6: Статистика по мерам защиты */}
          <ChartCardWrapper
            title="Статистика по мерам защиты"
            description="Показывает, сколько угроз покрыто мерами защиты и сколько остаются без защиты"
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

