"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations('CommandMenu');
  const [openState, setOpenState] = React.useState(open ?? false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      
      // Открыть/закрыть командное меню: Cmd+K или Ctrl+K
      if ((e.key === "k" || e.key === "K") && modifier && !e.shiftKey) {
        e.preventDefault();
        setOpenState((open) => !open);
        return;
      }

      // Прямые шорткаты (работают только если модификатор нажат и фокус на документе)
      // Проверяем, что пользователь не вводит текст в input/textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      // Ранний перехват для Y (меры защиты) - предотвращаем действие браузера
      if (modifier && !e.shiftKey && (e.key === 'y' || e.key === 'Y')) {
        if (!isInput) {
          e.preventDefault();
          e.stopPropagation();
          router.push('/protection-measures');
          return;
        }
      }
      
      // Команды с Ctrl/Cmd без Shift (не конфликтующие с браузером)
      if (modifier && !isInput && !e.shiftKey) {
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
              // Отправляем событие для открытия справки (работает на всех страницах)
              window.dispatchEvent(new CustomEvent('openHelp'));
            }
            break;
        }
      }

      // Команды с Ctrl+Shift/Cmd+Shift (для избежания конфликтов с браузером)
      // Ctrl+T, Ctrl+P, Ctrl+L конфликтуют с браузером
      // Используем: Ctrl+Shift+T (угрозы), Ctrl+Shift+L (задачи)
      if (modifier && e.shiftKey && !isInput) {
        const key = e.key.toLowerCase();
        // Проверяем и предотвращаем действие браузера заранее
        if (key === 't' || key === 'l') {
          e.preventDefault();
          e.stopPropagation();
        }
        
        switch (key) {
          case 't':
            router.push('/threats');
            break;
          case 'l':
            router.push('/tactical-tasks');
            break;
        }
      }
    };

    // Используем capture phase для более раннего перехвата
    document.addEventListener("keydown", down, true);
    return () => document.removeEventListener("keydown", down, true);
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
      title={t("title")}
      description={t("description")}
    >
      <CommandInput placeholder={t("placeholder")} />
      <CommandList>
        <CommandEmpty>{t("empty")}</CommandEmpty>
        
        <CommandGroup heading={t("navigation")}>
          <CommandItem onSelect={() => handleSelect("/")}>
            <Home className="mr-2 h-4 w-4" />
            <span>{t("homePage")}</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("sections")}>
          <CommandItem onSelect={() => handleSelect("/analysis")}>
            <Target className="mr-2 h-4 w-4" />
            <span>{t("threatAnalysis")}</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/threats")}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>{t("allThreats")}</span>
            <CommandShortcut>⌘⇧T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/protection-measures")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>{t("protectionMeasures")}</span>
            <CommandShortcut>⌘Y</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/tactical-tasks")}>
            <Lock className="mr-2 h-4 w-4" />
            <span>{t("tacticalTasks")}</span>
            <CommandShortcut>⌘⇧L</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("/charts")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>{t("charts")}</span>
            <CommandShortcut>⌘G</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("help")}>
          <CommandItem onSelect={() => {
            // Открываем справку на текущей странице
            window.dispatchEvent(new CustomEvent('openHelp'));
          }}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>{t("openHelp")}</span>
            <CommandShortcut>⌘?</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
