"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LiveButton from "@/components/ui/live-button";
import { Shield, AlertTriangle, Lock, Target, BarChart3, Globe, FileText, ExternalLink, Lightbulb, Database, Info, TrendingUp, Activity, PieChart } from "lucide-react";
import { getAllThreats, loadData } from "@/lib/data";
import { CIADistributionChart } from "@/components/charts/cia-distribution-chart";
import type { Threat } from "@/lib/types";
import { AnimatedShinyButton } from "@/components/ui/animated-shiny-button";
import { CardHoverGroup, CardWithHoverEffect } from "@/components/ui/card-hover-effect";

export default function Home() {
  const t = useTranslations('HomePage');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<{ generatedAt: string; threatsCount: number; measuresCount: number; tasksCount: number } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [threatsData, fullData] = await Promise.all([
          getAllThreats(locale),
          loadData(locale)
        ]);
        setThreats(threatsData);
        setMetadata(fullData.metadata);
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
        {/* Вводный блок */}
        <div className="mb-8 rounded-lg border-2 border-border bg-background p-8">
          <h2 className="text-3xl font-bold mb-4">{t('welcome')}</h2>
          <p className="text-muted-foreground max-w-2xl mb-4">
            {t('description')}
          </p>
          {/* <AnimatedShinyButton url={`/${locale}/register`}>
            {t('getStarted')}
          </AnimatedShinyButton> */}
        </div>

        {/* Навигационные карточки */}
        <CardHoverGroup layoutId="nav-cards">
          <div className="grid grid-cols-1 md:grid-cols-2 mb-8">
            <CardWithHoverEffect index={0}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle>{t('analysisCard.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('analysisCard.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveButton text={t('analysisCard.button')} url={`/${locale}/analysis`} className="w-full" />
                </CardContent>
              </Card>
            </CardWithHoverEffect>

            <CardWithHoverEffect index={1}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <CardTitle>{t('threatsCard.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('threatsCard.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveButton text={t('threatsCard.button')} url={`/${locale}/threats`} className="w-full" />
                </CardContent>
              </Card>
            </CardWithHoverEffect>

            <CardWithHoverEffect index={2}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>{t('measuresCard.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('measuresCard.description')}{" "}
                    <a
                      href="/Приказ%20ФСТЭК%20России%20от%2011%20февраля%202013%20г.%20N%2017.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1"
                    >
                      <Badge variant="outline" className="border-primary">
                        <FileText className="h-3 w-3 mr-1" />
                        {t('measuresCard.fstecOrder')}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Badge>
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveButton text={t('measuresCard.button')} url={`/${locale}/protection-measures`} className="w-full" />
                </CardContent>
              </Card>
            </CardWithHoverEffect>

            <CardWithHoverEffect index={3}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle>{t('tasksCard.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('tasksCard.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveButton text={t('tasksCard.button')} url={`/${locale}/tactical-tasks`} className="w-full" />
                </CardContent>
              </Card>
            </CardWithHoverEffect>
          </div>
        </CardHoverGroup>

        {/* Графики и описание */}
        <CardHoverGroup layoutId="chart-cards">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
            {/* График распределения угроз по CIA */}
            <CardWithHoverEffect index={0}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <CardTitle>{t('chartsCard.title')}</CardTitle>
                    </div>
                    <LiveButton text={t('chartsCard.button')} url={`/${locale}/charts`} className="h-9 min-w-[7rem] px-4 text-xs" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-muted-foreground">{tCommon('loading')}</div>
                    </div>
                  ) : (
                    <CIADistributionChart threats={threats} />
                  )}
                </CardContent>
              </Card>
            </CardWithHoverEffect>

            {/* Карточка с описанием всех графиков */}
            <CardWithHoverEffect index={1}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{t('analyticsCard.title')}</CardTitle>
                  </div>
                  <CardDescription>
                    {t('analyticsCard.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <BarChart3 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('analyticsCard.ciaDistribution')}</p>
                        <p className="text-xs text-muted-foreground">{t('analyticsCard.ciaDistributionDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('analyticsCard.ciaCombinations')}</p>
                        <p className="text-xs text-muted-foreground">{t('analyticsCard.ciaCombinationsDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('analyticsCard.topViolators')}</p>
                        <p className="text-xs text-muted-foreground">{t('analyticsCard.topViolatorsDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <PieChart className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{t('analyticsCard.mitreAndMeasures')}</p>
                        <p className="text-xs text-muted-foreground">{t('analyticsCard.mitreAndMeasuresDesc')}</p>
                      </div>
                    </div>
                  </div>
                  <LiveButton text={t('analyticsCard.button')} url={`/${locale}/charts`} className="w-full" />
                </CardContent>
              </Card>
            </CardWithHoverEffect>
          </div>
        </CardHoverGroup>

        {/* Информационный блок об источнике данных */}
        {metadata && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t('dataSourcesCard.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://fstec.ru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <Badge variant="outline" className="border-primary hover:bg-primary/10 cursor-pointer">
                    <Globe className="h-3 w-3 mr-1" />
                    {t('dataSourcesCard.fstecRussia')}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Badge>
                </a>
                <a
                  href="/Приказ%20ФСТЭК%20России%20от%2011%20февраля%202013%20г.%20N%2017.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <Badge variant="outline" className="border-primary hover:bg-primary/10 cursor-pointer">
                    <FileText className="h-3 w-3 mr-1" />
                    {t('dataSourcesCard.fstecOrder')}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Badge>
                </a>
                <a
                  href="https://attack.mitre.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <Badge variant="outline" className="border-primary hover:bg-primary/10 cursor-pointer">
                    <Globe className="h-3 w-3 mr-1" />
                    {t('dataSourcesCard.mitreAttack')}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Badge>
                </a>
              </div>
              <div className="pt-2 border-t border-primary/20">
                <p className="text-sm font-medium text-foreground mb-2 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{t('dataSourcesCard.clickableData')}</span>
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>{t('dataSourcesCard.dataActuality')}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

