"use client";

import * as React from "react";
import { Settings, Palette, Check, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { motion } from "motion/react";

type ThemeOption = {
  id: string;
  name: string;
  description: string;
  value: string;
};

type TabType = 'palette' | 'language';

const themes: ThemeOption[] = [
  {
    id: "default",
    name: "Sunset Horizon",
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

function DialogSidebar({
  currentThemeStyle,
  activeTab,
  setActiveTab,
}: {
  currentThemeStyle: string;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}) {
  const { open, setOpen, animate } = useSidebar();
  const t = useTranslations('SettingsDialog');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  return (
    <motion.div
      className="h-full px-4 py-4 flex flex-col bg-background border-r shrink-0 overflow-hidden"
      animate={{
        width: animate ? (open ? "280px" : "60px") : "280px",
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex flex-col h-full w-full overflow-hidden">
        <div className="py-4 w-full space-y-2">
          <div onClick={() => setActiveTab('palette')}>
            <SidebarLink
              icon={
                <Palette 
                  className="h-4 w-4 shrink-0" 
                />
              }
              label={t('paletteTab')}
              isActive={activeTab === 'palette'}
              currentThemeStyle={currentThemeStyle}
            />
          </div>
          <div onClick={() => setActiveTab('language')}>
            <SidebarLink
              icon={
                <Globe 
                  className="h-4 w-4 shrink-0" 
                />
              }
              label={t('languageTab')}
              isActive={activeTab === 'language'}
              currentThemeStyle={currentThemeStyle}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SidebarLink({
  icon,
  label,
  isActive,
  currentThemeStyle,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  currentThemeStyle?: string;
}) {
  const { open, animate } = useSidebar();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  return (
    <div className={cn(
      "flex items-center h-9 cursor-pointer rounded-lg px-2 transition-colors w-full min-w-0 box-border border border-transparent",
      animate && !open ? "justify-center" : "justify-start gap-2",
      isActive && "bg-accent text-accent-foreground"
    )}>
      {icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
          width: animate ? (open ? "auto" : 0) : "auto",
        }}
        className={cn(
          "text-sm whitespace-nowrap overflow-hidden"
        )}
      >
        {label}
      </motion.span>
    </div>
  );
}

function ThemeColorPalette({ 
  isDark, 
  themeStyle 
}: { 
  isDark: boolean;
  themeStyle: string;
}) {
  // Цвета для Sunset Horizon (default)
  const sunsetColors = isDark 
    ? [
        'oklch(0.7357 0.1641 34.7091)', // primary
        'oklch(0.3637 0.0203 342.2664)', // secondary
        'oklch(0.8278 0.1131 57.9984)', // accent
        'oklch(0.3184 0.0176 341.4465)', // card
      ]
    : [
        'oklch(0.7357 0.1641 34.7091)', // primary
        'oklch(0.9596 0.0200 28.9029)', // secondary
        'oklch(0.8278 0.1131 57.9984)', // accent
        'oklch(0.9656 0.0176 39.4009)', // muted
      ];

  // Цвета для Retro Arcade
  const retroColors = isDark
    ? [
        'oklch(0.5924 0.2025 355.8943)', // primary
        'oklch(0.6437 0.1019 187.3840)', // secondary
        'oklch(0.5808 0.1732 39.5003)', // accent
        'oklch(0.3092 0.0518 219.6516)', // card
      ]
    : [
        'oklch(0.5924 0.2025 355.8943)', // primary
        'oklch(0.6437 0.1019 187.3840)', // secondary
        'oklch(0.5808 0.1732 39.5003)', // accent
        'oklch(0.6979 0.0159 196.7940)', // muted
      ];

  const colors = themeStyle === "retro-arcade" ? retroColors : sunsetColors;

  return (
    <div className="flex items-center gap-1.5">
      {colors.map((color, index) => (
        <div 
          key={index}
          className="w-4 h-4 rounded-full border-2 border-white shrink-0" 
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function PaletteContent({
  themes,
  currentThemeStyle,
  handleThemeChange,
}: {
  themes: ThemeOption[];
  currentThemeStyle: string;
  handleThemeChange: (value: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const t = useTranslations('SettingsDialog');
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">{t('themeStyle')}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t('themeStyleDescription')}
        </p>
        <div className="grid gap-2">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => {
                handleThemeChange(themeOption.value);
              }}
              className={cn(
                "group flex items-center justify-between rounded-lg border border-transparent p-4 text-left transition-colors hover:bg-accent box-border",
                currentThemeStyle === themeOption.id && "border-primary bg-accent"
              )}
            >
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {themeOption.name}
                  </div>
                  <div className="text-xs text-muted-foreground group-hover:text-white transition-colors mt-1">
                    {themeOption.description}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ThemeColorPalette isDark={isDark} themeStyle={themeOption.value} />
                  {currentThemeStyle === themeOption.id && (
                    <Check className="h-4 w-4 text-white shrink-0" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LanguageContent() {
  const t = useTranslations('SettingsDialog');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const languages = [
    { code: 'ru', name: t('russian'), nativeName: 'Русский' },
    { code: 'en', name: t('english'), nativeName: 'English' }
  ];

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">{t('selectLanguage')}</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {t('currentLanguage')}: {languages.find(l => l.code === locale)?.nativeName}
        </p>
        <div className="grid gap-2">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "group flex items-center justify-between rounded-lg border border-transparent p-4 text-left transition-colors hover:bg-accent box-border",
                locale === language.code && "border-primary bg-accent"
              )}
            >
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {language.nativeName}
                  </div>
                  <div className="text-xs text-muted-foreground group-hover:text-white transition-colors mt-1">
                    {language.name}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {locale === language.code && (
                    <Check className="h-4 w-4 text-white shrink-0" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsDialog() {
  const t = useTranslations('SettingsDialog');
  const [open, setOpen] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [currentThemeStyle, setCurrentThemeStyle] = React.useState<string>("default");
  const [activeTab, setActiveTab] = React.useState<TabType>('palette');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const savedStyle = localStorage.getItem("theme-style") || "default";
    setCurrentThemeStyle(savedStyle);
  }, [mounted, theme]);

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

    localStorage.setItem("theme-style", themeValue);
    setCurrentThemeStyle(themeValue);
    
    const currentMode = resolvedTheme === "dark" ? "dark" : "light";
    
    const changeThemeStyle = () => {
      try {
        container.classList.remove("retro-arcade");
        
        if (themeValue === "retro-arcade") {
          container.classList.add("retro-arcade");
        }
        
        setTheme(currentMode);
      } catch (error) {
        console.error("Failed to change theme style:", error);
        setIsTransitioning(false);
      }
    };
    
    const cardCount = document.querySelectorAll('[data-slot="card"]').length;
    const isLargePage = cardCount > 50;
    
    if (isLargePage) {
      document.documentElement.classList.add("theme-transition-large-page");
      
      const cards = document.querySelectorAll('[data-slot="card"]');
      const viewportHeight = window.innerHeight;
      const viewportTop = window.scrollY;
      const viewportBottom = viewportTop + viewportHeight;
      
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardTop = viewportTop + rect.top;
        const cardBottom = cardTop + rect.height;
        
        if (cardBottom < viewportTop - 500 || cardTop > viewportBottom + 500) {
          (card as HTMLElement).style.transition = "none";
          (card as HTMLElement).style.willChange = "auto";
        }
      });
      
      setIsTransitioning(true);
      requestAnimationFrame(() => {
        changeThemeStyle();
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

  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const container = document.documentElement;
    const savedStyle = localStorage.getItem("theme-style") || "default";
    
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
        aria-label={t('title')}
      >
        <Settings className="h-4 w-4" />
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
        aria-label={t('title')}
        title={t('title')}
      >
        <Settings className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[900px] h-[600px] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>
              {t('description')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex">
            <SidebarProvider animate={true}>
              <DialogSidebar 
                currentThemeStyle={currentThemeStyle} 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'palette' ? (
                  <PaletteContent
                    themes={themes}
                    currentThemeStyle={currentThemeStyle}
                    handleThemeChange={handleThemeChange}
                  />
                ) : (
                  <LanguageContent />
                )}
              </div>
            </SidebarProvider>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

