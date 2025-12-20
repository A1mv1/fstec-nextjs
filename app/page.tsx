"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Lock, Target, BarChart3 } from "lucide-react";
import { getAllThreats } from "@/lib/data";
import { CIADistributionChart } from "@/components/charts/cia-distribution-chart";
import type { Threat } from "@/lib/types";

export default function Home() {
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
        {/* Вводный блок */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Добро пожаловать</h2>
          <p className="text-muted-foreground max-w-2xl">
            Система анализа угроз безопасности информации позволяет анализировать угрозы,
            меры защиты и тактические задачи в соответствии с требованиями ФСТЭК России.
            Выберите один из доступных сценариев работы для начала анализа.
          </p>
        </div>

        {/* Навигационные карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Анализ угроз</CardTitle>
              </div>
              <CardDescription>
                Фильтрация и поиск угроз по различным критериям с возможностью детального анализа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analysis">
                <Button className="w-full">Перейти к анализу</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Все угрозы</CardTitle>
              </div>
              <CardDescription>
                Просмотр полного списка угроз безопасности информации с возможностью поиска и фильтрации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/threats">
                <Button className="w-full">Просмотреть список</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Меры защиты</CardTitle>
              </div>
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
            <CardContent>
              <Link href="/protection-measures">
                <Button className="w-full">Просмотреть меры</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Тактические задачи</CardTitle>
              </div>
              <CardDescription>
                Тактические задачи из модели MITRE ATT&CK, связанные с угрозами безопасности
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tactical-tasks">
                <Button className="w-full">Просмотреть задачи</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* График и ссылка на страницу графиков */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>Распределение угроз по CIA триаде</CardTitle>
                </div>
                <Link href="/charts">
                  <Button variant="outline" size="sm">
                    Все графики →
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Визуализация распределения угроз по аспектам безопасности: конфиденциальность, целостность, доступность
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">Загрузка данных...</p>
                </div>
              ) : (
                <CIADistributionChart threats={threats} />
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Аналитика и графики</CardTitle>
              </div>
              <CardDescription>
                Детальная визуализация данных по угрозам, нарушителям, объектам воздействия и мерам защиты
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                На странице графиков вы найдете:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Распределение по CIA триаде</li>
                <li>Комбинации CIA</li>
                <li>Топ нарушителей и объектов</li>
                <li>Распределение по MITRE ATT&CK</li>
                <li>Статистика по мерам защиты</li>
              </ul>
              <Link href="/charts">
                <Button className="w-full mt-4">Перейти к графикам</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Информационный блок */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl">Источники данных</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <a
                href="https://fstec.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center transition-transform hover:scale-105"
              >
                <Badge variant="outline" className="border-primary hover:bg-primary/10 cursor-pointer">
                  ФСТЭК России
                </Badge>
              </a>
              <a
                href="/Приказ%20ФСТЭК%20России%20от%2011%20февраля%202013%20г.%20N%2017.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center transition-transform hover:scale-105"
              >
                <Badge variant="outline" className="border-primary hover:bg-primary/10 cursor-pointer">
                  Приказ ФСТЭК №17
                </Badge>
              </a>
              <a
                href="https://attack.mitre.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center transition-transform hover:scale-105"
              >
                <Badge variant="outline" className="border-primary hover:bg-primary/10 cursor-pointer">
                  MITRE ATT&CK
                </Badge>
              </a>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-foreground mb-2">
                💡 Все данные в системе кликабельны — вы можете переходить к детальной информации по угрозам, мерам защиты и тактическим задачам.
              </p>
              <p className="text-sm text-muted-foreground">
                Данные актуальны на момент последнего обновления базы угроз
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
