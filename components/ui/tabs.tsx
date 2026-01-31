"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type TabsVariant = "default" | "underline";

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      className={cn(
        "flex flex-col gap-2 data-[orientation=vertical]:flex-row",
        className,
      )}
      data-slot="tabs"
      {...props}
    />
  );
}

function TabsList({
  variant = "default",
  className,
  children,
  ...props
}: TabsPrimitive.List.Props & {
  variant?: TabsVariant;
}) {
  return (
    <TabsPrimitive.List
      className={cn(
        "relative z-0 flex w-fit items-center justify-center gap-x-0.5",
        "data-[orientation=vertical]:flex-col",
        variant === "default"
          ? "rounded-lg bg-muted p-0.5"
          : "data-[orientation=vertical]:px-1 data-[orientation=horizontal]:py-1 *:data-[slot=tabs-trigger]:hover:bg-accent",
        className,
      )}
      data-slot="tabs-list"
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        render={<AnimatedIndicator variant={variant} />}
        data-slot="tab-indicator"
      />
    </TabsPrimitive.List>
  );
}

// Анимированный индикатор с использованием Framer Motion
function AnimatedIndicator({ 
  variant = "default",
  style,
  ...props 
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: TabsVariant }) {
  // Извлекаем CSS-переменные из style
  const cssVars = style as React.CSSProperties & {
    '--active-tab-left'?: string;
    '--active-tab-width'?: string;
    '--active-tab-height'?: string;
    '--active-tab-bottom'?: string;
  };

  const left = cssVars?.['--active-tab-left'] ? parseFloat(cssVars['--active-tab-left']) : 0;
  const width = cssVars?.['--active-tab-width'] ? parseFloat(cssVars['--active-tab-width']) : 0;
  const height = cssVars?.['--active-tab-height'] ? parseFloat(cssVars['--active-tab-height']) : 0;
  const bottom = cssVars?.['--active-tab-bottom'] ? parseFloat(cssVars['--active-tab-bottom']) : 0;

  return (
    <motion.span
      {...props}
      className={cn(
        "absolute bottom-0 left-0",
        variant === "underline"
          ? "z-10 bg-primary"
          : "-z-1 rounded-md bg-background shadow-sm dark:bg-accent",
      )}
      initial={false}
      animate={{
        x: left,
        y: -bottom,
        width: width,
        height: height,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 35,
        mass: 1,
      }}
    />
  );
}

function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        "[&_svg]:-mx-0.5 flex shrink-0 grow cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-transparent font-medium text-base outline-none transition-[color,background-color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-64 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "text-muted-foreground [&[data-active]]:!text-foreground [&[aria-selected=true]]:!text-foreground",
        "h-9 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:h-8",
        "data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start",
        className,
      )}
      data-slot="tabs-trigger"
      {...props}
    />
  );
}

function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      className={cn(
        "flex-1 outline-none",
        className
      )}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTab,
  TabsTab as TabsTrigger,
  TabsPanel,
  TabsPanel as TabsContent,
};
