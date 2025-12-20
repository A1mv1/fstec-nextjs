"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, AlertTriangle, Lock, Target, BarChart3 } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>Справка по системе</DialogTitle>
          <DialogDescription>
            Информация о системе анализа угроз безопасности информации
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* О системе */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg text-primary">О системе</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Threat Analyzer — система для анализа угроз безопасности информации 
                в соответствии с требованиями ФСТЭК России. Система позволяет:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                <li>Анализировать угрозы безопасности информации</li>
                <li>Изучать меры защиты информации</li>
                <li>Исследовать тактические задачи из модели MITRE ATT&CK</li>
                <li>Визуализировать данные через графики и диаграммы</li>
                <li>Фильтровать и искать угрозы по различным критериям</li>
              </ul>
            </CardContent>
          </Card>

          {/* Основные понятия и Разделы системы в grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основные понятия */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Основные понятия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1 text-sm">Угрозы безопасности информации</h4>
                  <p className="text-sm text-muted-foreground">
                    Потенциальные действия нарушителей, которые могут привести к нарушению 
                    безопасности информации. Каждая угроза характеризуется аспектами CIA триады 
                    (Конфиденциальность, Целостность, Доступность), источниками угроз и объектами воздействия.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm">CIA триада</h4>
                  <p className="text-sm text-muted-foreground mb-1">
                    Модель информационной безопасности, включающая три аспекта:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li><strong>Конфиденциальность</strong> — защита от несанкционированного доступа</li>
                    <li><strong>Целостность</strong> — защита от несанкционированного изменения</li>
                    <li><strong>Доступность</strong> — обеспечение доступа к информации в нужное время</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm">Меры защиты</h4>
                  <p className="text-sm text-muted-foreground">
                    Меры защиты информации, определенные в соответствии с Приказом ФСТЭК России 
                    от 11 февраля 2013 г. N 17. Каждая мера защиты связана с угрозами, которые она помогает предотвратить.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm">Тактические задачи (MITRE ATT&CK)</h4>
                  <p className="text-sm text-muted-foreground">
                    Тактические задачи из модели MITRE ATT&CK, которые описывают техники и тактики, 
                    используемые нарушителями. Связаны с угрозами безопасности информации.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Разделы системы */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Разделы системы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Анализ угроз
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Фильтрация и поиск угроз по различным критериям: тактическим задачам, 
                    нарушителям, объектам воздействия, аспектам CIA триады и мерам защиты.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Все угрозы
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Просмотр полного списка угроз безопасности информации с возможностью 
                    поиска, фильтрации и перехода к детальной информации.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Меры защиты
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Список мер защиты информации в соответствии с Приказом ФСТЭК №17. 
                    Каждая мера содержит идентификатор и описание.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Тактические задачи
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Тактические задачи из модели MITRE ATT&CK, связанные с угрозами безопасности информации.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Графики и аналитика
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Визуализация данных: распределение угроз по CIA триаде, комбинации CIA, 
                    топ нарушителей и объектов, статистика по мерам защиты и тактическим задачам.
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
                <CardTitle className="text-lg">Источники данных</CardTitle>
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
                <div className="pt-2 border-t border-primary/20">
                  <p className="text-sm font-medium text-foreground mb-2">
                    💡 Все данные в системе кликабельны — вы можете переходить к детальной информации по угрозам, мерам защиты и тактическим задачам.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Данные актуальны на момент последнего обновления базы угроз
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Советы по использованию */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Советы по использованию</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside ml-2">
                  <li>Все элементы интерфейса кликабельны — используйте их для навигации</li>
                  <li>Фильтры можно комбинировать для точного поиска угроз</li>
                  <li>Графики интерактивны — наводите курсор для детальной информации</li>
                  <li>Используйте поиск для быстрого нахождения нужных элементов</li>
                  <li>Переключайте тему для комфортной работы в любое время суток</li>
                  <li>На страницах детального просмотра вы можете переходить к связанным сущностям</li>
                  <li>Используйте горячие клавиши для быстрой навигации (см. KEYBOARD_SHORTCUTS.md)</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Часто задаваемые вопросы */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Часто задаваемые вопросы</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    Как найти угрозу по конкретному нарушителю?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Перейдите в раздел{" "}
                      <Link href="/analysis" className="text-primary hover:underline">
                        "Анализ угроз"
                      </Link>
                      {" "}и используйте фильтр по нарушителям. 
                      Вы можете выбрать одного или нескольких нарушителей из списка. 
                      Система автоматически отфильтрует угрозы, связанные с выбранными нарушителями.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    Что означает CIA триада и как она используется?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      CIA триада — это модель информационной безопасности, состоящая из трех аспектов:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                      <li><strong>Конфиденциальность (Confidentiality)</strong> — защита от несанкционированного доступа к информации</li>
                      <li><strong>Целостность (Integrity)</strong> — защита от несанкционированного изменения информации</li>
                      <li><strong>Доступность (Availability)</strong> — обеспечение доступа к информации в нужное время</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      Каждая угроза может затрагивать один или несколько аспектов триады. 
                      Вы можете фильтровать угрозы по этим аспектам в разделе{" "}
                      <Link href="/analysis" className="text-primary hover:underline">
                        анализа
                      </Link>.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    Как связаны меры защиты и угрозы?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Каждая мера защиты направлена на противодействие определенным угрозам. 
                      В системе вы можете просмотреть, какие угрозы связаны с конкретной мерой защиты, 
                      и наоборот — какие меры защиты рекомендуются для противодействия конкретной угрозе. 
                      Эта информация доступна на страницах детального просмотра{" "}
                      <Link href="/threats" className="text-primary hover:underline">
                        угроз
                      </Link>
                      {" "}и{" "}
                      <Link href="/protection-measures" className="text-primary hover:underline">
                        мер защиты
                      </Link>.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    Что такое тактические задачи MITRE ATT&CK?
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
                      {" "}— это модель знаний о тактиках и техниках кибератак, используемых нарушителями. 
                      Тактические задачи в этой модели описывают конкретные действия, которые могут выполнять злоумышленники. 
                      В системе каждая угроза может быть связана с одной или несколькими тактическими задачами, 
                      что помогает лучше понять природу угрозы и способы ее реализации. 
                      Подробнее о тактических задачах можно узнать в разделе{" "}
                      <Link href="/tactical-tasks" className="text-primary hover:underline">
                        "Тактические задачи"
                      </Link>.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Можно ли экспортировать данные из системы?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Да, в системе реализован экспорт данных в различных форматах. 
                      На странице{" "}
                      <Link href="/analysis" className="text-primary hover:underline">
                        "Анализ угроз"
                      </Link>
                      {" "}вы можете экспортировать отфильтрованные результаты в форматах JSON, CSV, TSV и TXT. 
                      На страницах детального просмотра{" "}
                      <Link href="/threats" className="text-primary hover:underline">
                        угроз
                      </Link>
                      {" "}также доступен экспорт данных об отдельной угрозе в тех же форматах. 
                      Для экспорта используйте кнопку "Экспорт" на соответствующих страницах.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    Как часто обновляются данные в системе?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Данные в системе основаны на официальных источниках ФСТЭК России и MITRE ATT&CK. 
                      Обновления базы угроз происходят по мере публикации новых версий нормативных документов. 
                      Актуальность данных указана в информационном блоке на главной странице.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left">
                    Можно ли комбинировать несколько фильтров одновременно?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Да, в разделе{" "}
                      <Link href="/analysis" className="text-primary hover:underline">
                        "Анализ угроз"
                      </Link>
                      {" "}вы можете применять несколько фильтров одновременно. 
                      Например, вы можете выбрать конкретного нарушителя, объект воздействия и аспекты CIA триады. 
                      Система покажет только те угрозы, которые соответствуют всем выбранным критериям.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-left">
                    Где можно найти официальные документы ФСТЭК?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Официальные документы ФСТЭК России доступны на сайте{" "}
                      <a 
                        href="https://fstec.ru/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        fstec.ru
                      </a>
                      . Приказ ФСТЭК №17 также доступен для скачивания прямо из системы — 
                      ссылка на него находится на главной странице в разделе "Меры защиты" и в блоке "Источники данных".
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

