"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark", "retro-arcade": ".retro-arcade", "retro-arcade-dark": ".retro-arcade.dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isRetroArcade, setIsRetroArcade] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Определяем, активна ли retro-arcade тема
  React.useEffect(() => {
    if (!mounted || typeof window === "undefined") return
    const container = document.documentElement
    const hasRetroArcade = container.classList.contains("retro-arcade")
    setIsRetroArcade(hasRetroArcade)

    // Наблюдаем за изменениями класса
    const observer = new MutationObserver(() => {
      const hasRetro = container.classList.contains("retro-arcade")
      setIsRetroArcade(hasRetro)
    })

    observer.observe(container, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [mounted, resolvedTheme])

  const colorConfig = React.useMemo(
    () => Object.entries(config).filter(
      ([, config]) => config.theme || config.color
    ),
    [config]
  )

  if (!colorConfig.length) {
    return null
  }

  // Определяем текущую тему для применения цветов
  const getCurrentTheme = (): keyof typeof THEMES => {
    if (!mounted) return "light"
    
    if (isRetroArcade) {
      return resolvedTheme === "dark" ? "retro-arcade-dark" : "retro-arcade"
    }
    
    return resolvedTheme === "dark" ? "dark" : "light"
  }

  const currentTheme = getCurrentTheme()

  // Применяем цвета динамически через inline стили
  React.useEffect(() => {
    if (!mounted || typeof document === "undefined") return
    
    const applyColors = () => {
      const chartElement = document.querySelector(`[data-chart=${id}]`) as HTMLElement
      if (!chartElement) return

      // Сначала очищаем все существующие inline стили для переменных цветов
      colorConfig.forEach(([key]) => {
        chartElement.style.removeProperty(`--color-${key}`)
      })

      // Затем применяем новые цвета
      colorConfig.forEach(([key, itemConfig]) => {
        let color =
          itemConfig.theme?.[currentTheme as keyof typeof itemConfig.theme] ||
          itemConfig.color
        
        if (color) {
          // Разрешаем CSS-переменные из темы (например, var(--chart-1))
          if (color.startsWith('var(')) {
            // Получаем имя переменной
            const varName = color.match(/var\(([^)]+)\)/)?.[1]?.trim()
            if (varName) {
              // Получаем вычисленное значение переменной из темы
              const computedValue = getComputedStyle(document.documentElement)
                .getPropertyValue(varName)
                .trim()
              if (computedValue) {
                color = computedValue
              }
            }
          }
          // Принудительно применяем через setProperty
          chartElement.style.setProperty(`--color-${key}`, color)
        }
      })
      
      // Принудительно обновляем все SVG элементы, которые используют CSS переменные
      const allElements = chartElement.querySelectorAll('*')
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const fill = htmlEl.getAttribute('fill')
        const stroke = htmlEl.getAttribute('stroke')
        
        if (fill?.includes('var(--color-') || stroke?.includes('var(--color-')) {
          colorConfig.forEach(([key, itemConfig]) => {
            let color =
              itemConfig.theme?.[currentTheme as keyof typeof itemConfig.theme] ||
              itemConfig.color
            
            if (color) {
              // Разрешаем CSS-переменные из темы (например, var(--chart-1))
              if (color.startsWith('var(')) {
                const varName = color.match(/var\(([^)]+)\)/)?.[1]?.trim()
                if (varName) {
                  const computedValue = getComputedStyle(document.documentElement)
                    .getPropertyValue(varName)
                    .trim()
                  if (computedValue) {
                    color = computedValue
                  }
                }
              }
              htmlEl.style.setProperty(`--color-${key}`, color)
            } else {
              htmlEl.style.removeProperty(`--color-${key}`)
            }
          })
        }
      })
    }
    
    // Используем несколько попыток для гарантии применения
    const timeoutId1 = setTimeout(applyColors, 0)
    const timeoutId2 = setTimeout(applyColors, 100)
    const timeoutId3 = setTimeout(applyColors, 300)

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
      clearTimeout(timeoutId3)
    }
  }, [mounted, currentTheme, id, colorConfig])

  // Также генерируем статические стили для всех тем на случай, если динамическое применение не сработает
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => {
              // Для retro-arcade тем используем более специфичные селекторы
              if (theme === "retro-arcade") {
                return `
.retro-arcade:not(.dark) [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color} !important;` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`
              } else if (theme === "retro-arcade-dark") {
                return `
.retro-arcade.dark [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color} !important;` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`
              } else if (theme === "light") {
                return `
:root:not(.retro-arcade):not(.dark) [data-chart=${id}],
html:not(.retro-arcade):not(.dark) [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color} !important;` : null
  })
  .filter(Boolean)
  .join("\n")}
}

/* Переопределяем для default темы (когда retro-arcade отсутствует) */
html:not(.retro-arcade) [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color} !important;` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`
              } else if (theme === "dark") {
                return `
.dark:not(.retro-arcade) [data-chart=${id}],
html.dark:not(.retro-arcade) [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color} !important;` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`
              }
              return null
            }
          )
          .filter(Boolean)
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
