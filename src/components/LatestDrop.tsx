/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Heart, ArrowRight, ArrowLeft, Eye, ShoppingCart, Check } from "lucide-react";
import { motion } from "motion/react";
import { PRODUCTS } from "../data";
import { Product } from "../types";

interface LatestDropProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: "S" | "M" | "L" | "XL") => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
  products?: Product[];
}

export default function LatestDrop({
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  products,
}: LatestDropProps) {
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [addingSizeState, setAddingSizeState] = useState<{ [key: string]: "S" | "M" | "L" | "XL" | null }>({});
  const [successAnimation, setSuccessAnimation] = useState<{ [key: string]: boolean }>({});

  const isWishlisted = (product: Product) => wishlist.some((item) => item.id === product.id);

  const handleQuickAdd = (product: Product, size: "S" | "M" | "L" | "XL") => {
    onAddToCart(product, size);
    
    // Animate local success state
    setSuccessAnimation((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setSuccessAnimation((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <section 
      id="collection" 
      className="w-full bg-[#f9f8f6] text-luxury-black py-16 md:py-24 px-4 md:px-8 overflow-hidden relative"
    >
      {/* Dynamic Faint Backdrop Watermark */}
      <div className="absolute left-4 bottom-4 w-96 h-96 opacity-[0.04] text-luxury-black select-none pointer-events-none z-0">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <text x="10" y="80" fontFamily="Playfair Display, serif" fontSize="110">LX</text>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start relative z-10">
        {/* LEFT COLUMN: ATELIER STATEMENT */}
        <motion.div 
          className="lg:col-span-3 flex flex-col items-start pt-4 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Large faint watermarked background text */}
          <div className="absolute -left-12 -top-20 text-[180px] font-serif font-light text-zinc-200/80 pointer-events-none select-none z-0 hidden lg:block">
            LX
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 text-gold-dark text-[10px] md:text-xs font-sans tracking-[0.3em] font-bold uppercase mb-4">
              <span className="w-5 h-[1.5px] bg-gold-mid"></span>
              <span>NEW ARRIVALS</span>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-luxury-black leading-[1.1] mb-5 uppercase">
              THE LATEST
              <span className="block mt-1 font-normal text-gold-dark">DROP</span>
            </h2>

            <p className="text-xs md:text-sm font-sans text-zinc-600 font-light leading-relaxed tracking-wide max-w-xs mb-8">
              Fresh designs. Heavyweights. Limited drops. Designed with structural precision and a timeless, relaxed drape.
            </p>

            <button
              onClick={() => {
                const element = document.getElementById("packaging");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group bg-luxury-black hover:bg-zinc-900 text-luxury-cream text-xs font-sans font-bold tracking-[0.2em] px-6 py-4 transition-all duration-300 flex items-center gap-4 uppercase cursor-pointer"
              id="view-all-products-btn"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 text-luxury-cream transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: HORIZONTAL PRODUCTS ROW / GRID */}
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {(products || PRODUCTS).map((product, index) => {
            const hasSuccess = successAnimation[product.id];

            return (
              <motion.div
                key={product.id}
                className="flex flex-col group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: (index % 4) * 0.1, ease: "easeOut" }}
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => {
                  setHoveredProductId(null);
                  setAddingSizeState((prev) => ({ ...prev, [product.id]: null }));
                }}
              >
                {/* 1. PRODUCT CARD STAGE */}
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 border border-zinc-200/40 shadow-sm">
                  {/* Product Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />

                  {/* Top-Left Status Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 bg-white text-luxury-black font-sans font-bold text-[9px] tracking-[0.15em] px-2 py-1 uppercase border border-zinc-100 shadow-sm z-10">
                      {product.badge}
                    </div>
                  )}

                  {/* Dark Vignette Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  {/* HOVER INTERACTIVE ACTIONS PANEL */}
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out flex flex-col gap-2 z-20">
                    {/* Quick Size Select */}
                    <div className="bg-white/95 backdrop-blur-sm p-3 border border-zinc-200/50 flex flex-col items-center shadow-lg">
                      <span className="text-[8px] font-sans tracking-[0.15em] text-zinc-500 uppercase font-semibold mb-1.5">
                        {hasSuccess ? "ADDED TO ATELIER BAG" : "QUICK ADD COUTURE"}
                      </span>
                      
                      {hasSuccess ? (
                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-[10px] font-bold py-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>SIZE {addingSizeState[product.id]} SELECTED</span>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center gap-1.5 w-full">
                          {(["S", "M", "L", "XL"] as const).map((size) => (
                            <button
                              key={size}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddingSizeState((prev) => ({ ...prev, [product.id]: size }));
                                handleQuickAdd(product, size);
                              }}
                              className="w-7 h-7 flex items-center justify-center border border-zinc-200 text-[9px] font-sans font-semibold hover:border-gold-mid hover:text-gold-dark text-luxury-black bg-white transition-all hover:scale-105 rounded-none"
                              aria-label={`Add size ${size}`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick View Button */}
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="w-full bg-luxury-black hover:bg-zinc-900 text-white font-sans text-[10px] tracking-widest font-bold py-3 flex items-center justify-center gap-2 shadow-md uppercase transition-all"
                      aria-label={`View ${product.name} details`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>VIEW DETAILS</span>
                    </button>
                  </div>
                </div>

                {/* 2. PRODUCT DETAILS BLOCK */}
                <div className="mt-4 flex flex-col justify-start">
                  <div className="flex items-center justify-between">
                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="font-sans font-medium text-xs md:text-sm tracking-[0.1em] text-luxury-black hover:text-gold-dark cursor-pointer transition-colors uppercase"
                    >
                      {product.name}
                    </h3>
                    
                    {/* Wishlist Heart Icon */}
                    <button
                      onClick={() => onToggleWishlist(product)}
                      className="p-1 hover:text-gold-mid transition-colors text-zinc-400"
                      aria-label={`Add ${product.name} to wishlist`}
                      id={`wishlist-btn-${product.id}`}
                    >
                      <Heart 
                        className={`w-4 h-4 transition-all duration-300 ${
                          isWishlisted(product) ? "fill-gold-mid text-gold-mid scale-110" : "hover:scale-110"
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Price display with Original strikethrough if active */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs md:text-sm font-mono font-medium text-zinc-900">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] md:text-xs font-mono text-zinc-400 line-through">
                        ₹{product.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
