"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Избегаем гидратации mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Определяем isDark с учетом resolvedTheme для правильного начального состояния
  const isDark = mounted ? (resolvedTheme === "dark") : false;

  // Применяем стили для плавной анимации после монтирования
  React.useEffect(() => {
    if (!mounted) return;
    
    const thumb = containerRef.current?.querySelector('[data-slot="switch-thumb"]') as HTMLElement;
    if (thumb) {
      // Принудительно применяем transition через inline стили
      thumb.style.transition = 'transform 1500ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 1500ms cubic-bezier(0.4, 0, 0.2, 1), background-color 1500ms cubic-bezier(0.4, 0, 0.2, 1)';
      thumb.style.willChange = 'transform';
    }
  }, [mounted, isDark]);

  const handleCheckedChange = (checked: boolean) => {
    const container = containerRef.current;
    if (!container || !mounted || isTransitioning) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Устанавливаем CSS переменные для позиции волны на странице
    const percentX = (centerX / window.innerWidth) * 100;
    const percentY = (centerY / window.innerHeight) * 100;

    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--wave-x", `${percentX}%`);
      document.documentElement.style.setProperty("--wave-y", `${percentY}%`);

      // Создаем волну для всей страницы через View Transitions API
      // Используем более надежную обработку с fallback
      const changeTheme = () => {
        try {
          setTheme(checked ? "dark" : "light");
        } catch (error) {
          console.error("Failed to change theme:", error);
          setIsTransitioning(false);
        }
      };

      // Оптимизация для больших страниц: проверяем количество элементов
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
      }

      // Для больших страниц отключаем View Transitions и используем простой переключатель
      if (isLargePage) {
        setIsTransitioning(true);
        // Используем requestAnimationFrame для батчинга изменений
        requestAnimationFrame(() => {
          changeTheme();
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
            const transition = (document as any).startViewTransition(changeTheme);
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
            changeTheme();
            setTimeout(() => setIsTransitioning(false), 300);
          }
        } else {
          setIsTransitioning(true);
          changeTheme();
          setTimeout(() => setIsTransitioning(false), 300);
        }
      }
    } else {
      setTheme(checked ? "dark" : "light");
    }
  };

  return (
    <div ref={containerRef} className="flex items-center relative">
      <SwitchPrimitive.Root
        checked={isDark}
        onCheckedChange={handleCheckedChange}
        disabled={!mounted || isTransitioning}
        aria-label="Переключить тему"
        className={cn(
          "group/switch relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          "transition-[background-color,border-color,box-shadow]",
          "data-checked:bg-primary data-unchecked:bg-input",
          "data-checked:shadow-[0_0_12px_hsl(var(--primary)/0.4)] data-unchecked:shadow-none",
          "border-input hover:border-primary/50"
        )}
        style={{
          transitionDuration: '1500ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Иконка солнца слева - видна в светлой теме, за thumb */}
        <Sun
          className={cn(
            "absolute left-1 h-3.5 w-3.5 transition-all z-0",
            isDark
              ? "opacity-0 scale-0 rotate-180"
              : "opacity-60 scale-100 rotate-0 text-muted-foreground"
          )}
          style={{
            transitionDuration: '1500ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        {/* Иконка луны справа - видна в темной теме, за thumb */}
        <Moon
          className={cn(
            "absolute right-1 h-3.5 w-3.5 transition-all z-0",
            isDark
              ? "opacity-60 scale-100 rotate-0 text-primary-foreground"
              : "opacity-0 scale-0 -rotate-180"
          )}
          style={{
            transitionDuration: '1500ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        {/* Thumb с плавной анимацией и иконками внутри */}
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className={cn(
            "theme-toggle-thumb pointer-events-none relative flex items-center justify-center h-5 w-5 rounded-full bg-background ring-0 shrink-0 z-10",
            "shadow-[0_2px_8px_rgba(0,0,0,0.15)] data-checked:shadow-[0_2px_12px_rgba(0,0,0,0.25)]",
            "data-checked:translate-x-5 data-unchecked:translate-x-0"
          )}
        >
          {/* Иконка солнца внутри thumb в светлой теме */}
          <Sun
            className={cn(
              "h-3 w-3 absolute transition-all",
              isDark
                ? "opacity-0 scale-0 rotate-180"
                : "opacity-100 scale-100 rotate-0 text-foreground"
            )}
            style={{
              transitionDuration: '1500ms',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          {/* Иконка луны внутри thumb в темной теме */}
          <Moon
            className={cn(
              "h-3 w-3 absolute transition-all",
              isDark
                ? "opacity-100 scale-100 rotate-0 text-primary-foreground"
                : "opacity-0 scale-0 -rotate-180"
            )}
            style={{
              transitionDuration: '1500ms',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
    </div>
  );
}

