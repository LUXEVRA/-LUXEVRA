/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, ShoppingBag, Eye, Heart } from "lucide-react";
import { LOOKBOOK_SCENES } from "../data";
import { Product } from "../types";

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductById: (id: string) => void;
  products?: Product[];
}

export default function LookbookModal({ isOpen, onClose, onSelectProductById, products }: LookbookModalProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentScene = LOOKBOOK_SCENES[currentSceneIndex];

  const handleNext = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % LOOKBOOK_SCENES.length);
    setActiveHotspot(null);
  };

  const handlePrev = () => {
    setCurrentSceneIndex((prev) => (prev - 1 + LOOKBOOK_SCENES.length) % LOOKBOOK_SCENES.length);
    setActiveHotspot(null);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4 md:p-8 animate-fade-in" id="lookbook-fullscreen-root">
      {/* 1. TOP HEADER STATUS */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto border-b border-zinc-900/80 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-sans tracking-[0.3em] text-gold-mid font-bold uppercase">
            IMMERSIVE CAMPAIGN
          </span>
          <span className="text-xs text-zinc-400 font-sans tracking-widest uppercase font-light">
            DROP '24: SILENT GEOMETRY
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 border border-zinc-900 hover:border-gold-mid text-zinc-400 hover:text-gold-light transition-all rounded-full cursor-pointer"
          aria-label="Close lookbook"
          id="lookbook-close-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. CORE SLIDESHOW STAGE */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Left Control Arrow (Desktop) */}
        <div className="hidden lg:flex lg:col-span-1 justify-center">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full border border-zinc-900 hover:border-gold-mid flex items-center justify-center text-zinc-500 hover:text-white transition-all cursor-pointer"
            aria-label="Previous lookbook slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Central Campaign Image with interactive hotspots */}
        <div className="col-span-1 lg:col-span-7 flex justify-center items-center relative aspect-[3/4] md:aspect-auto h-auto md:h-[500px] overflow-hidden bg-zinc-950 border border-zinc-900 shadow-2xl">
          <img
            src={currentScene.image}
            alt={currentScene.title}
            className="w-full h-full object-cover object-center scale-100 hover:scale-[1.02] transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          {/* Subtle vignette over the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

          {/* Shoppable Hotspots */}
          {currentScene.taggedProducts.map((hotspot) => {
            const isActive = activeHotspot === hotspot.productId;
            const matchedProduct = products?.find((p) => p.id === hotspot.productId);
            const displayPrice = matchedProduct ? matchedProduct.price : hotspot.price;
            const displayName = matchedProduct ? matchedProduct.name : hotspot.name;

            return (
              <div
                key={hotspot.productId}
                className="absolute"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              >
                {/* Glowing Core Ring */}
                <button
                  onClick={() => setActiveHotspot(isActive ? null : hotspot.productId)}
                  className="w-7 h-7 bg-gold-mid/40 rounded-full flex items-center justify-center relative cursor-pointer group focus:outline-none"
                  aria-label={`View tagged item: ${displayName}`}
                  id={`hotspot-${hotspot.productId}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full group-hover:scale-125 transition-transform"></div>
                  {/* Outer pulsating ring */}
                  <div className="absolute inset-0 rounded-full border border-white animate-ping opacity-75"></div>
                </button>

                {/* Pop-up Luxury Product Hover Tag */}
                {isActive && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-black/95 border border-gold-mid/80 p-3 shadow-2xl animate-fade-in z-30">
                    <span className="text-[8px] font-sans tracking-[0.15em] text-gold-mid block uppercase font-bold mb-1">
                      TAGGED ATELIER PIECE
                    </span>
                    <h4 className="text-[10px] font-sans font-semibold tracking-wider text-white uppercase mb-1">
                      {displayName}
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400 block mb-2">
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </span>
                    
                    <button
                      onClick={() => {
                        onSelectProductById(hotspot.productId);
                        onClose();
                      }}
                      className="w-full bg-[#F5F2EC] hover:bg-gold-light text-luxury-black font-sans font-bold text-[8px] tracking-widest py-1.5 flex items-center justify-center gap-1.5 transition-colors uppercase"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>QUICK SHOP</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick swipe indicator details */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 border border-zinc-800 text-[8px] tracking-[0.25em] font-sans text-gold-mid uppercase">
            Atelier Scene {currentSceneIndex + 1} of {LOOKBOOK_SCENES.length}
          </div>
        </div>

        {/* Right Editorial Text Card (Desktop) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col justify-center items-start lg:pl-6 text-left">
          <div className="flex items-center gap-2 text-gold-mid text-[10px] font-sans tracking-[0.25em] font-bold uppercase mb-4">
            <span className="w-4 h-[1px] bg-gold-mid"></span>
            <span>CAMPAIGN STORY</span>
          </div>

          <h3 className="font-serif text-xl md:text-2xl text-white font-medium tracking-wide uppercase mb-4 leading-snug">
            {currentScene.title}
          </h3>

          <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed tracking-wider mb-6">
            {currentScene.description}
          </p>

          <span className="text-[9px] font-sans tracking-[0.15em] text-zinc-600 uppercase block mb-2 font-semibold">
            SHOP FROM CAMPAIGN
          </span>
          <div className="space-y-2 w-full">
            {currentScene.taggedProducts.map((tag) => (
              <button
                key={tag.productId}
                onClick={() => {
                  onSelectProductById(tag.productId);
                  onClose();
                }}
                className="w-full text-left p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-gold-mid transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-sans font-semibold tracking-wider text-white uppercase block">
                    {tag.name}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">
                    ₹{tag.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-400 hover:text-gold-light">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Control Arrow (Desktop) */}
        <div className="hidden lg:flex lg:col-span-1 justify-center">
          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full border border-zinc-900 hover:border-gold-mid flex items-center justify-center text-zinc-500 hover:text-white transition-all cursor-pointer"
            aria-label="Next lookbook slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. MOBILE CONTROLS FOOTER */}
      <div className="flex lg:hidden items-center justify-between w-full max-w-7xl mx-auto border-t border-zinc-900/80 pt-4">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 text-xs font-sans tracking-widest text-zinc-400 uppercase"
        >
          <ChevronLeft className="w-4 h-4" /> Prev Look
        </button>
        <span className="text-[10px] font-mono text-zinc-600">
          Scene {currentSceneIndex + 1} / {LOOKBOOK_SCENES.length}
        </span>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 text-xs font-sans tracking-widest text-zinc-400 uppercase"
        >
          Next Look <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
