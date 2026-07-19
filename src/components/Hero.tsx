/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  onOpenLookbook: () => void;
}

export default function Hero({ onOpenLookbook }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSlides = [
    {
      subtitle: "NEW DROP '24",
      titleLine1: "CRAFTED",
      titleLine2: "BEYOND ORDINARY",
      description: "Luxury is in the details. Every stitch, every fabric, every design — crafted to define your identity.",
      image: "/src/assets/images/hero_tee_1784392131084.jpg",
      badge: "LIMITED QUANTITIES"
    },
    {
      subtitle: "THE ATELIER LINE",
      titleLine1: "HEAVYWEIGHT",
      titleLine2: "STRUCTURAL DRAPES",
      description: "Designed for premium volume, our signature 450 GSM organic fleece contours the body with structural precision.",
      image: "/src/assets/images/oversized_hoodie_1784392144459.jpg",
      badge: "ORGANIC COTTON"
    },
    {
      subtitle: "UNBOXING ATELIER",
      titleLine1: "CURATED",
      titleLine2: "EXPERIENCE",
      description: "Delivered in silk-wrapped premium gold-stamped sliding boxes. Crafted to be unforgettable from the first touch.",
      image: "/src/assets/images/luxevra_packaging_1784392190373.jpg",
      badge: "EXPERIENCE"
    }
  ];

  const current = heroSlides[activeSlide];

  const handleScrollDown = () => {
    const element = document.getElementById("props-bar");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-90px)] bg-luxury-black text-luxury-cream overflow-hidden flex items-center pt-8 pb-16 px-4 md:px-8">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] rounded-full bg-gold-mid/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-zinc-800/10 blur-[90px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* LEFT VERTICAL SLIDER NAVIGATION (Static on mobile, visible on desktop) */}
        <div className="hidden lg:flex lg:col-span-1 flex-col gap-8 text-[11px] font-sans tracking-[0.2em] text-zinc-600 relative">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`flex items-center gap-3 group text-left cursor-pointer transition-all ${
                activeSlide === index ? "text-gold-mid font-medium" : "hover:text-zinc-400"
              }`}
            >
              <span className="w-5">{`0${index + 1}`}</span>
              <div
                className={`h-[1px] transition-all duration-500 bg-current ${
                  activeSlide === index ? "w-10 bg-gold-mid" : "w-4 bg-zinc-800 group-hover:w-8"
                }`}
              ></div>
            </button>
          ))}
        </div>

        {/* MAIN TEXT CONTENT */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-start pr-0 lg:pr-4">
          {/* Animated Subtitle Badge */}
          <motion.div
            key={`sub-${activeSlide}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 text-gold-mid text-[10px] md:text-xs font-sans tracking-[0.3em] uppercase font-semibold mb-6"
          >
            <span className="w-6 h-[1px] bg-gold-mid"></span>
            <span>{current.subtitle}</span>
          </motion.div>

          {/* Animated Header */}
          <motion.h2
            key={`title-${activeSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.1] mb-6 uppercase"
          >
            {current.titleLine1}
            <span className="block mt-1 font-normal text-luxury-cream">
              {current.titleLine2}
            </span>
          </motion.h2>

          {/* Animated Description */}
          <motion.p
            key={`desc-${activeSlide}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm md:text-base font-sans text-zinc-400 font-light leading-relaxed tracking-wide max-w-md mb-8"
          >
            {current.description}
          </motion.p>

          {/* Call To Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => {
                const element = document.getElementById("collection");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="bg-[#F5F2EC] hover:bg-white text-luxury-black text-xs font-sans font-bold tracking-[0.25em] px-8 py-4 transition-all duration-300 flex items-center justify-center gap-3 uppercase cursor-pointer"
            >
              <span>Shop Collection</span>
              <ArrowRight className="w-4 h-4 text-luxury-black transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onOpenLookbook}
              className="border border-zinc-800 hover:border-gold-mid bg-transparent text-zinc-300 hover:text-gold-light text-xs font-sans font-medium tracking-[0.25em] px-8 py-4 transition-all duration-300 flex items-center justify-center uppercase cursor-pointer"
            >
              Explore Lookbook
            </button>
          </motion.div>

          {/* Mobile Slide indicators */}
          <div className="flex lg:hidden items-center gap-3 mt-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  activeSlide === index ? "w-8 bg-gold-mid" : "w-2 bg-zinc-800"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* RIGHT HERO IMAGE */}
        <div className="col-span-1 lg:col-span-6 relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
          <motion.div
            key={`img-${activeSlide}`}
            initial={{ opacity: 0, scale: 0.98, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg lg:max-w-xl aspect-[3/2] lg:aspect-auto h-auto lg:h-[500px] overflow-hidden bg-zinc-950 border border-zinc-900 shadow-2xl"
          >
            {/* The image */}
            <img
              src={current.image}
              alt="LUXEVRA Haute Couture"
              className="w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none"></div>

            {/* Premium small overlay detail */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-zinc-800/40 px-3 py-1 text-[9px] font-sans tracking-[0.2em] text-gold-mid uppercase">
              {current.badge}
            </div>
          </motion.div>

          {/* Floating Monogram Icon background */}
          <div className="absolute -bottom-10 -right-10 w-44 h-44 opacity-[0.03] text-gold-mid select-none pointer-events-none hidden lg:block">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <text x="10" y="80" fontFamily="Playfair Display, serif" fontSize="90">LX</text>
            </svg>
          </div>
        </div>
      </div>

      {/* SCROLL TO DISCOVER INDICATOR */}
      <div className="absolute bottom-6 right-4 md:right-8 z-10 hidden sm:flex items-center gap-3">
        <button
          onClick={handleScrollDown}
          className="group flex items-center gap-3 text-zinc-500 hover:text-gold-mid transition-colors text-[10px] md:text-xs font-sans tracking-[0.25em] uppercase cursor-pointer"
          id="hero-scroll-btn"
        >
          <span>Scroll to Discover</span>
          <div className="w-8 h-8 rounded-full border border-zinc-800 group-hover:border-gold-mid flex items-center justify-center transition-colors">
            <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-gold-mid animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}
