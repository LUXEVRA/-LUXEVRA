/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface LogoProps {
  variant?: "full" | "monogram" | "wordmark";
  className?: string;
  light?: boolean;
}

export default function Logo({ variant = "full", className = "", light = false }: LogoProps) {
  // Brand color guidelines:
  // Ivory/Cream: #F5F2EC
  // Gold/Bronze: #C89B6D
  const mainColor = light ? "#111111" : "#F5F2EC";
  const goldColor = "#C89B6D";

  if (variant === "monogram") {
    return (
      <div className={`relative flex items-center justify-center select-none ${className}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Intertwined elegant L and X in Serif style */}
          <g>
            {/* Elegant Serif L */}
            <text
              x="20"
              y="75"
              fontFamily="Playfair Display, Georgia, serif"
              fontSize="68"
              fontWeight="500"
              fill={goldColor}
              letterSpacing="-2"
            >
              L
            </text>
            {/* Intertwined Serif X, slightly offset and layered */}
            <text
              x="42"
              y="85"
              fontFamily="Playfair Display, Georgia, serif"
              fontSize="52"
              fontWeight="400"
              fill={mainColor}
              className="mix-blend-normal"
            >
              x
            </text>
          </g>
        </svg>
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={`flex flex-col items-center tracking-[0.25em] text-center select-none ${className}`}>
        <h1 
          className="font-serif font-light text-2xl md:text-3xl"
          style={{ color: mainColor, letterSpacing: "0.22em" }}
        >
          LUXEVRA
        </h1>
        <div className="flex items-center gap-2 mt-1 w-full max-w-[180px]">
          <div className="h-[1px] bg-zinc-800 flex-1"></div>
          <span 
            className="text-[8px] font-sans font-light tracking-[0.3em] uppercase whitespace-nowrap"
            style={{ color: goldColor }}
          >
            CRAFTED BEYOND ORDINARY
          </span>
          <div className="h-[1px] bg-zinc-800 flex-1"></div>
        </div>
      </div>
    );
  }

  // Full Brand Lockup
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Monogram portion */}
      <svg
        viewBox="0 0 100 65"
        className="w-16 h-12 md:w-20 md:h-14"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          {/* L */}
          <text
            x="24"
            y="52"
            fontFamily="Playfair Display, Georgia, serif"
            fontSize="54"
            fontWeight="500"
            fill={goldColor}
          >
            L
          </text>
          {/* X */}
          <text
            x="44"
            y="60"
            fontFamily="Playfair Display, Georgia, serif"
            fontSize="40"
            fontWeight="400"
            fill={mainColor}
          >
            x
          </text>
        </g>
      </svg>
      
      {/* Wordmark portion */}
      <h1 
        className="font-serif font-light text-xl md:text-2xl mt-1"
        style={{ color: mainColor, letterSpacing: "0.26em" }}
      >
        LUXEVRA
      </h1>
      
      {/* Tagline portion */}
      <div className="flex items-center gap-2 mt-1.5 w-full max-w-[200px]">
        <div className="h-[1px] bg-zinc-800/80 flex-1"></div>
        <span 
          className="text-[7px] font-sans font-medium tracking-[0.35em] whitespace-nowrap"
          style={{ color: goldColor }}
        >
          CRAFTED BEYOND ORDINARY
        </span>
        <div className="h-[1px] bg-zinc-800/80 flex-1"></div>
      </div>
    </div>
  );
}
