"use client";

import * as React from "react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ThemeOption = {
  id: string;
  name: string;
  description: string;
  value: string;
};

const themes: ThemeOption[] = [
  {
    id: "default",
    name: "По умолчанию",
    description: "Стандартная тема с Science Gothic",
    value: "default",
  },
  {
    id: "retro-arcade",
    name: "Retro Arcade",
    description: "Ретро аркадная тема",
    value: "retro-arcade",
  },
];

export function ThemeSelector() {
  const [open, setOpen] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Состояние для отслеживания выбранной темы
  const [currentThemeStyle, setCurrentThemeStyle] = React.useState<string>("default");

  // Определяем текущую тему
  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const savedStyle = localStorage.getItem("theme-style") || "default";
    setCurrentThemeStyle(savedStyle);
  }, [mounted, theme]);

  const currentTheme = currentThemeStyle;

  const handleThemeChange = (themeValue: string) => {
    if (typeof window === "undefined" || !mounted || isTransitioning) return;
    const container = document.documentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const percentX = (centerX / window.innerWidth) * 100;
    const percentY = (centerY / window.innerHeight) * 100;

    document.documentElement.style.setProperty("--wave-x", `${percentX}%`);
    document.documentElement.style.setProperty("--wave-y", `${percentY}%`);

    // Сохраняем выбор темы
    localStorage.setItem("theme-style", themeValue);
    setCurrentThemeStyle(themeValue);
    
    // Сохраняем текущий режим (light/dark) чтобы не потерять его
    const currentMode = resolvedTheme === "dark" ? "dark" : "light";
    
    // Функция для изменения темы стиля
    const changeThemeStyle = () => {
      try {
        // Удаляем класс перед применением новой темы
        container.classList.remove("retro-arcade");
        
        // Применяем новую тему синхронно (без requestAnimationFrame для избежания мигания)
        if (themeValue === "retro-arcade") {
          container.classList.add("retro-arcade");
        }
        
        // Устанавливаем режим (light/dark) - сохраняем текущий выбор пользователя
        setTheme(currentMode);
      } catch (error) {
        console.error("Failed to change theme style:", error);
        setIsTransitioning(false);
      }
    };
    
      // Оптимизация для больших страниц
      const cardCount = document.querySelectorAll('[data-slot="card"]').length;
      const isLargePage = cardCount > 50;
      
      // Для больших страниц используем агрессивную оптимизацию
      if (isLargePage) {
        document.documentElement.classList.add("theme-transition-large-page");
        
        // Временно отключаем transitions для элементов вне viewport
        const cards = document.querySelectorAll('[data-slot="card"]');
        const viewportHeight = window.innerHeight;
        const viewportTop = window.scrollY;
        const viewportBottom = viewportTop + viewportHeight;
        
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardTop = viewportTop + rect.top;
          const cardBottom = cardTop + rect.height;
          
          // Если карточка полностью вне viewport (с запасом 500px), отключаем transitions
          if (cardBottom < viewportTop - 500 || cardTop > viewportBottom + 500) {
            (card as HTMLElement).style.transition = "none";
            (card as HTMLElement).style.willChange = "auto";
          }
        });
        
        setIsTransitioning(true);
        // Используем requestAnimationFrame для батчинга изменений
        requestAnimationFrame(() => {
          changeThemeStyle();
          // Восстанавливаем transitions после небольшой задержки
          setTimeout(() => {
            const cards = document.querySelectorAll('[data-slot="card"]');
            cards.forEach((card) => {
              (card as HTMLElement).style.transition = "";
              (card as HTMLElement).style.willChange = "";
            });
            document.documentElement.classList.remove("theme-transition-large-page");
            setIsTransitioning(false);
          }, 150);
        });
      } else {
        // Для маленьких страниц используем View Transitions
        if (
          typeof document !== "undefined" &&
          "startViewTransition" in document &&
          typeof (document as any).startViewTransition === "function"
        ) {
          try {
            setIsTransitioning(true);
            const transition = (document as any).startViewTransition(changeThemeStyle);
            transition.finished
              .then(() => {
                setIsTransitioning(false);
              })
              .catch((error: unknown) => {
                console.warn("View Transition failed:", error);
                setIsTransitioning(false);
              });
          } catch (error) {
            console.warn("View Transitions API failed, using fallback:", error);
            setIsTransitioning(true);
            changeThemeStyle();
            setTimeout(() => setIsTransitioning(false), 300);
          }
        } else {
          setIsTransitioning(true);
          changeThemeStyle();
          setTimeout(() => setIsTransitioning(false), 300);
        }
      }
  };

  // Синхронизируем классы с темой при монтировании и изменении
  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const container = document.documentElement;
    const savedStyle = localStorage.getItem("theme-style") || "default";
    
    // Синхронизируем класс темы стиля
    if (savedStyle === "retro-arcade") {
      if (!container.classList.contains("retro-arcade")) {
        container.classList.add("retro-arcade");
      }
    } else {
      if (container.classList.contains("retro-arcade")) {
        container.classList.remove("retro-arcade");
      }
    }
  }, [mounted, theme]);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Выбрать тему"
      >
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
        aria-label="Выбрать тему"
        title="Выбрать тему"
      >
        <Palette className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Выбор темы</DialogTitle>
            <DialogDescription>
              Выберите тему оформления для приложения
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => {
                  handleThemeChange(themeOption.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-accent hover:text-white",
                  currentTheme === themeOption.id && "border-primary bg-accent text-white"
                )}
              >
                <div className="flex-1">
                  <div className={cn(
                    "font-medium",
                    currentTheme === themeOption.id && "text-white"
                  )}>
                    {themeOption.name}
                  </div>
                  <div className={cn(
                    "text-sm text-muted-foreground",
                    currentTheme === themeOption.id && "text-white/80"
                  )}>
                    {themeOption.description}
                  </div>
                </div>
                {currentTheme === themeOption.id && (
                  <Check className="h-5 w-5 text-white" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

