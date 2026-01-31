"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, AlertTriangle, Lock, Target, BarChart3, Globe, FileText, ExternalLink, Database, Lightbulb, Info } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const t = useTranslations("HelpDialog");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* О системе */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg text-primary">{t("aboutSystem")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {t("aboutDescription")}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                <li>{t("aboutFeature1")}</li>
                <li>{t("aboutFeature2")}</li>
                <li>{t("aboutFeature3")}</li>
                <li>{t("aboutFeature4")}</li>
                <li>{t("aboutFeature5")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Основные понятия и Разделы системы в grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основные понятия */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg text-primary">{t("keyConcepts")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1 text-sm">{t("threatsTitle")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("threatsDesc")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm">{t("ciaTitle")}</h4>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("ciaDesc")}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li><strong>{t("confidentiality")}</strong></li>
                    <li><strong>{t("integrity")}</strong></li>
                    <li><strong>{t("availability")}</strong></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm">{t("measuresTitle")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("measuresDesc")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm">{t("tasksTitle")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("tasksDesc")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Разделы системы */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg text-primary">{t("sections")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    {t("analysisSection")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("analysisSectionDesc")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    {t("threatsSection")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("threatsSectionDesc")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    {t("measuresSection")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("measuresSectionDesc")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    {t("tasksSection")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("tasksSectionDesc")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    {t("chartsSection")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("chartsSectionDesc")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Источники данных и Советы по использованию в grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Источники данных */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{t("dataSources")}</CardTitle>
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
                      {t("fstecRussia")}
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
                      {t("fstecOrder")}
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
                      MITRE ATT&CK
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Badge>
                  </a>
                </div>
                <div className="pt-2 border-t border-primary/20">
                  <p className="text-sm font-medium text-foreground mb-2 flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{t("clickableData")}</span>
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4 flex-shrink-0" />
                    <span>{t("dataActuality")}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Советы по использованию */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg text-primary">{t("tips")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
                  <li>{t("tip1")}</li>
                  <li>{t("tip2")}</li>
                  <li>{t("tip3")}</li>
                  <li>{t("tip4")}</li>
                  <li>{t("tip5")}</li>
                  <li>{t("tip6")}</li>
                  <li>{t("tip7")}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Часто задаваемые вопросы */}
          <Card className="border-primary/10 overflow-hidden transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="text-lg text-primary">{t("faq")}</CardTitle>
            </CardHeader>
            <CardContent className="transition-all duration-300 ease-in-out">
              <Accordion className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    {t("faq1Q")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {t("faq1APart1")} {" "}
                      <Link href="/analysis" className="text-primary hover:underline">
                        "{t("faq1ALink")}"
                      </Link>
                      {" "}{t("faq1APart2")}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    {t("faq2Q")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("faq2A")}
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                      <li><strong>{t("faq2AConfidentiality")}</strong></li>
                      <li><strong>{t("faq2AIntegrity")}</strong></li>
                      <li><strong>{t("faq2AAvailability")}</strong></li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("faq2APart2")} {" "}
                      <Link href="/analysis" className="text-primary hover:underline">
                        {t("faq2ALink")}
                      </Link>.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    {t("faq3Q")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {t("faq3APart1")} {" "}
                      <Link href="/threats" className="text-primary hover:underline">
                        {t("faq3AThreatsLink")}
                      </Link>
                      {" "}{t("faq3APart2")} {" "}
                      <Link href="/protection-measures" className="text-primary hover:underline">
                        {t("faq3AMeasuresLink")}
                      </Link>.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    {t("faq4Q")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      <a 
                        href="https://attack.mitre.org/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        MITRE ATT&CK
                      </a>
                      {" "}{t("faq4APart1")} {" "}
                      <Link href="/tactical-tasks" className="text-primary hover:underline">
                        {t("faq4ALink")}
                      </Link>.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    {t("faq5Q")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {t("faq5APart1")} {" "}
                      <Link href="/analysis" className="text-primary hover:underline">
                        "{t("faq5AAnalysisLink")}"
                      </Link>
                      {" "}{t("faq5APart2")} {" "}
                      <Link href="/threats" className="text-primary hover:underline">
                        {t("faq5AThreatsLink")}
                      </Link>
                      {" "}{t("faq5APart3")} {" "}
                      <span className="font-medium">{t("faq5AExportButton")}</span>
                      {" "}{t("faq5APart4")}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    {t("faq6Q")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {t("faq6A")}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left">
                    {t("faq7Q")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {t("faq7APart1")} {" "}
                      <Link href="/analysis" className="text-primary hover:underline">
                        "{t("faq7ALink")}"
                      </Link>
                      {" "}{t("faq7APart2")}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-left">
                    {t("faq8Q")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      {t("faq8APart1")} {" "}
                      <a 
                        href="https://fstec.ru/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t("faq8AFstecWebsite")}
                      </a>
                      {" "}{t("faq8APart2")} {" "}
                      <a
                        href="/Приказ%20ФСТЭК%20России%20от%2011%20февраля%202013%20г.%20N%2017.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t("faq8AOrderLink")}
                      </a>
                      {" "}{t("faq8APart3")} {" "}
                      <Link href="/protection-measures" className="text-primary hover:underline">
                        {t("faq8AProtectionMeasuresLink")}
                      </Link>
                      {" "}{t("faq8APart4")} {" "}
                      <span className="font-medium">{t("faq8ADataSources")}</span>
                      {" "}{t("faq8APart5")}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

