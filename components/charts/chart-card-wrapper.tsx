"use client";

import { useState, useEffect } from "react";
import { useIsInView } from "@/hooks/use-is-in-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { ReactNode } from "react";

interface ChartCardWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
  loading?: boolean;
  loadingHeight?: string;
}

export function ChartCardWrapper({
  title,
  description,
  children,
  loading = false,
  loadingHeight = "400px",
}: ChartCardWrapperProps) {
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const { ref, isInView } = useIsInView<HTMLDivElement>(null, {
    inViewOnce: false, // Отслеживаем постоянно
    inViewMargin: "0px 0px -50px 0px", // Начинаем анимацию когда элемент на 50px выше видимой области
  });

  useEffect(() => {
    if (isInView && !hasBeenInView) {
      setHasBeenInView(true);
    }
  }, [isInView, hasBeenInView]);

  return (
    <Card
      ref={ref}
      className={`transition-all duration-1000 ${
        hasBeenInView
          ? "animate-in fade-in slide-in-from-bottom-4 opacity-100"
          : "opacity-0 translate-y-4"
      }`}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div style={{ height: loadingHeight }} className="flex items-center justify-center">
            <p className="text-muted-foreground">Загрузка данных...</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

