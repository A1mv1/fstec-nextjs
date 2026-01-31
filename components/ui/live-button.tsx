"use client"

import React, { useState } from "react"

interface LiveButtonProps {
  text: string
  url: string
  className?: string
}

export default function LiveButton({
  text,
  url,
  className = "",
}: LiveButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button
      className={`group relative flex h-12 min-w-[9.3rem] items-center justify-center gap-3 overflow-hidden rounded-lg border border-border bg-background px-6 transition-all duration-500 ease-out before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent before:transition-transform before:duration-700 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 hover:before:translate-x-[100%] active:scale-[0.98] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={() => (window.location.href = url)}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* Text */}
      <span className="relative z-10 text-sm font-medium tracking-wide whitespace-nowrap text-foreground transition-all duration-300 group-hover:text-primary">
        {text}
      </span>

      {/* Animated dot */}
      <span
        className={`relative z-10 h-3 w-3 rounded-full bg-primary transition-all duration-500 ease-out ${isHovered ? "scale-110 bg-primary/80 shadow-lg shadow-primary/50" : ""} ${isPressed ? "scale-95" : ""} before:absolute before:inset-0 before:animate-pulse before:rounded-full before:bg-primary/30 before:opacity-0 group-hover:before:opacity-50`}
      >
        {/* Ripple effect */}
        <div
          className="absolute inset-0 animate-ping rounded-full bg-primary opacity-0 group-hover:opacity-60"
          style={{ animationDuration: "2s" }}
        ></div>
      </span>

      {/* Hover state border animation */}
      <div className="absolute inset-0 animate-pulse rounded-lg border-2 border-primary/0 opacity-0 transition-all duration-500 group-hover:border-primary/30 group-hover:opacity-100"></div>
    </button>
  )
}
