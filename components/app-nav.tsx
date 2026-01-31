"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  BarChart3,
  Shield,
  Lock,
  Target,
  AlertTriangle,
  Menu,
  Search,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetPopup as SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { CommandMenu } from "@/components/command-menu";
import { HelpDialog } from "@/components/help-dialog";

const navItems = [
  {
    title: "Главная",
    href: "/",
    icon: Target,
  },
  {
    title: "Анализ угроз",
    href: "/analysis",
    icon: Target,
  },
  {
    title: "Все угрозы",
    href: "/threats",
    icon: AlertTriangle,
  },
  {
    title: "Меры защиты",
    href: "/protection-measures",
    icon: Shield,
  },
  {
    title: "Тактические задачи",
    href: "/tactical-tasks",
    icon: Lock,
  },
  {
    title: "Графики",
    href: "/charts",
    icon: BarChart3,
  },
];

export function AppNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  // Обработка шортката для справки (Cmd+Shift+? или Ctrl+Shift+?)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      // Проверяем Cmd/Ctrl + Shift + ? (на большинстве раскладок ? требует Shift)
      if (modifier && e.shiftKey && (e.key === '?' || (e.key === '/' && e.shiftKey)) && !isInput) {
        e.preventDefault();
        setHelpOpen(true);
      }
    };

    const handleOpenHelp = () => {
      setHelpOpen(true);
    };

    document.addEventListener("keydown", down);
    window.addEventListener('openHelp', handleOpenHelp);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener('openHelp', handleOpenHelp);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold">Threat Analyzer</h1>
                  <p className="text-xs text-muted-foreground">
                    Анализ угроз ФСТЭК
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.slice(1).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname?.startsWith(item.href));
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "gap-2",
                        isActive && "bg-secondary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2"
                onClick={() => setCommandMenuOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span className="text-muted-foreground">⌘K</span>
              </Button>
              <CommandMenu open={commandMenuOpen} onOpenChange={setCommandMenuOpen} />
              {pathname === "/" ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setHelpOpen(true)}
                  title="Открыть справку (Cmd+Shift+?)"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Справка</span>
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setHelpOpen(true)}
                  title="Открыть справку (Cmd+Shift+?)"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">Открыть справку</span>
                </Button>
              )}
              <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
              <ThemeSelector />
              <ThemeToggle />
              
              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger
                  render={
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Открыть меню</span>
                    </Button>
                  }
                />
                <SheetContent side="left" className="w-[300px] sm:w-[400px]" showCloseButton>
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="flex items-center gap-2 pb-4 border-b">
                      <Target className="h-6 w-6 text-primary" />
                      <div>
                        <h2 className="text-lg font-bold">Threat Analyzer</h2>
                        <p className="text-xs text-muted-foreground">
                          Анализ угроз ФСТЭК
                        </p>
                      </div>
                    </div>
                    
                    <nav className="flex flex-col gap-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || 
                          (item.href !== "/" && pathname?.startsWith(item.href));
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start gap-2",
                                isActive && "bg-secondary"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {item.title}
                            </Button>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
