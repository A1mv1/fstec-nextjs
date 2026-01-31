import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

import { useState, ReactNode } from "react";
import * as React from "react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          href={item?.link}
          key={item?.link}
          className="relative group  block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === idx && (
              <motion.span
                key="hoverBackground"
                className="absolute inset-0 h-full w-full bg-accent/20 dark:bg-accent/25 card-hover-effect block  rounded-3xl"
                layoutId="hoverBackground"
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ isolation: "isolate" }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </a>
      ))}
    </div>
  );
};

// Контекст для управления hover состоянием группы карточек
const HoverGroupContext = React.createContext<{
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  layoutId: string;
  registerCard: (index: number, element: HTMLDivElement | null) => void;
} | null>(null);

// Контейнер для группы карточек с hover эффектом
export const CardHoverGroup = ({
  children,
  layoutId,
  className,
}: {
  children: ReactNode;
  layoutId: string;
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndexState] = useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardElementsRef = React.useRef<Map<number, HTMLDivElement>>(new Map());

  const setHoveredIndex = React.useCallback((index: number | null) => {
    setHoveredIndexState(index);
  }, []);

  const registerCard = React.useCallback((index: number, element: HTMLDivElement | null) => {
    if (element) {
      cardElementsRef.current.set(index, element);
    } else {
      cardElementsRef.current.delete(index);
    }
  }, []);

  const handleMouseLeave = React.useCallback((e: React.MouseEvent) => {
    // Проверяем, что мышь действительно покинула контейнер
    const relatedTarget = e.relatedTarget;
    if (!containerRef.current) {
      setHoveredIndex(null);
      return;
    }
    
    // Проверяем, что relatedTarget является Node и находится внутри контейнера
    if (!relatedTarget || !(relatedTarget instanceof Node) || !containerRef.current.contains(relatedTarget)) {
      setHoveredIndex(null);
    }
  }, [setHoveredIndex]);

  const hoveredCardElement = hoveredIndex !== null ? cardElementsRef.current.get(hoveredIndex) : null;
  const [position, setPosition] = React.useState<{ left: number; top: number; width: number; height: number } | null>(null);

  React.useEffect(() => {
    if (hoveredCardElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const cardRect = hoveredCardElement.getBoundingClientRect();
      setPosition({
        left: cardRect.left - containerRect.left,
        top: cardRect.top - containerRect.top,
        width: cardRect.width,
        height: cardRect.height,
      });
    } else {
      setPosition(null);
    }
  }, [hoveredCardElement, hoveredIndex]);

  return (
    <HoverGroupContext.Provider value={{ hoveredIndex, setHoveredIndex, layoutId, registerCard }}>
      <div 
        ref={containerRef}
        className={cn("relative", className)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Рендерим только один motion.span для всей группы - это предотвращает наложение */}
        <AnimatePresence initial={false}>
          {position && (
            <motion.span
              className="absolute bg-accent/20 dark:bg-accent/25 card-hover-effect block rounded-3xl pointer-events-none"
              initial={{ opacity: 0, x: position.left, y: position.top, width: position.width, height: position.height }}
              animate={{
                opacity: 1,
                x: position.left,
                y: position.top,
                width: position.width,
                height: position.height,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                left: 0,
                top: 0,
                willChange: "transform",
                isolation: "isolate",
                zIndex: 1,
              }}
            />
          )}
        </AnimatePresence>
        {children}
      </div>
    </HoverGroupContext.Provider>
  );
};

// Wrapper компонент для добавления hover эффекта к существующим карточкам
export const CardWithHoverEffect = ({
  children,
  className,
  index,
}: {
  children: ReactNode;
  className?: string;
  index: number;
}) => {
  const context = React.useContext(HoverGroupContext);
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  if (!context) {
    throw new Error("CardWithHoverEffect must be used inside CardHoverGroup");
  }

  const { setHoveredIndex, registerCard } = context;

  React.useEffect(() => {
    registerCard(index, cardRef.current);
    return () => {
      registerCard(index, null);
    };
  }, [index, registerCard]);

  const handleMouseEnter = React.useCallback(() => {
    setHoveredIndex(index);
  }, [index, setHoveredIndex]);

  return (
    <div
      ref={cardRef}
      className={cn("relative group block h-full w-full p-2", className)}
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative z-20">{children}</div>
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide mt-4", className)}>
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
