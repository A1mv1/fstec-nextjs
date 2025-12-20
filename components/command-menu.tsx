"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  BarChart3, 
  Shield, 
  Lock, 
  Target, 
  AlertTriangle,
  FileText,
  HelpCircle,
  Home
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const [openState, setOpenState] = React.useState(open ?? false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      
      // Открыть/закрыть командное меню: Cmd+K или Ctrl+K
      if ((e.key === "k" || e.key === "K") && modifier) {
        e.preventDefault();
        setOpenState((open) => !open);
        return;
      }

      // Прямые шорткаты (работают только если модификатор нажат и фокус на документе)
      // Проверяем, что пользователь не вводит текст в input/textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (modifier && !isInput) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            router.push('/');
            break;
          case 'a':
            e.preventDefault();
            router.push('/analysis');
            break;
          case 'g':
            e.preventDefault();
            router.push('/charts');
            break;
          case '?':
          case '/':
            // Проверяем, что это Shift+? или Shift+/
            if (e.shiftKey) {
              e.preventDefault();
              // Открываем справку на главной странице
              router.push('/');
              // Отправляем событие для открытия справки
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('openHelp'));
              }, 200);
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router]);

  React.useEffect(() => {
    if (open !== undefined) {
      setOpenState(open);
    }
  }, [open]);

  const handleSelect = (path: string) => {
    router.push(path);
    setOpenState(false);
    onOpenChange?.(false);
  };

  return (
    <CommandDialog 
      open={openState} 
      onOpenChange={(value) => {
        setOpenState(value);
        onOpenChange?.(value);
      }}
      title="Командное меню"
      description="Быстрый поиск и навигация по системе"
    >
      <CommandInput placeholder="Введите команду или поиск..." />
      <CommandList>
        <CommandEmpty>Ничего не найдено.</CommandEmpty>
        
        <CommandGroup heading="Навигация">
          <CommandItem onSelect={() => handleSelect("/")}>
            <Home className="mr-2 h-4 w-4" />
            <span>Главная страница</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Разделы">
          <CommandItem onSelect={() => handleSelect("/analysis")}>
            <Target className="mr-2 h-4 w-4" />
            <span>Анализ угроз</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/threats")}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Все угрозы</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/protection-measures")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Меры защиты</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/tactical-tasks")}>
            <Lock className="mr-2 h-4 w-4" />
            <span>Тактические задачи</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/charts")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Графики и аналитика</span>
            <CommandShortcut>⌘G</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Справка">
          <CommandItem onSelect={() => {
            // Переходим на главную и открываем справку там
            router.push("/");
            // Даем время на навигацию, затем открываем справку
            setTimeout(() => {
              const event = new CustomEvent('openHelp');
              window.dispatchEvent(event);
            }, 100);
          }}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Открыть справку</span>
            <CommandShortcut>⌘?</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
