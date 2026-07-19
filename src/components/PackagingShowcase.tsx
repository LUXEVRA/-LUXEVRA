/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, ShieldCheck, Heart, PackageCheck, Eye } from "lucide-react";
import { motion } from "motion/react";
import { PACKAGING_ITEMS } from "../data";
import Logo from "./Logo";

export default function PackagingShowcase() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"packaging" | "monogram" | "palette">("packaging");

  const brandColors = [
    { hex: "#111111", name: "LUXURY BLACK", desc: "The deep canvas for heavy cotton drapes." },
    { hex: "#F5F2EC", name: "LUXURY CREAM", desc: "Satin lining & refined brand text labels." },
    { hex: "#C89B6D", name: "BRAND GOLD", desc: "Metallic hot stamping & gold-threaded embroidery." },
    { hex: "#2B2B2B", name: "SLATE GRAY", desc: "Faded vintage washes & structural shadows." }
  ];

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <section 
      id="packaging" 
      className="w-full bg-[#111111] text-luxury-cream py-16 md:py-24 px-4 md:px-8 border-t border-zinc-900 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title Block */}
        <motion.div 
          className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 text-gold-mid text-[10px] md:text-xs font-sans tracking-[0.3em] font-bold uppercase mb-4">
            <span className="w-5 h-[1.5px] bg-gold-mid"></span>
            <span>ATELIER UNBOXING</span>
            <span className="w-5 h-[1.5px] bg-gold-mid"></span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white leading-[1.1] mb-5 uppercase">
            THE EMBLEM OF
            <span className="block mt-1 font-normal text-gold-mid">UNCOMPROMISING CRAFT</span>
          </h2>

          <p className="text-xs md:text-sm font-sans text-zinc-500 font-light leading-relaxed tracking-wide">
            A luxury garment is more than fabric — it is the texture of the cardboard, the weight of the linen-wrapped paper, and the precision of the gold embossing. Every purchase is delivered inside our bespoke signature containers.
          </p>

          {/* Interactive Toggle Navigation */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mt-10 border-b border-zinc-900/60 pb-3 w-full">
            <button
              onClick={() => setActiveTab("packaging")}
              className={`text-[10px] md:text-xs font-sans font-semibold tracking-[0.2em] uppercase transition-all pb-2 border-b cursor-pointer ${
                activeTab === "packaging" ? "text-gold-mid border-gold-mid" : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
            >
              Packaging Details
            </button>
            <button
              onClick={() => setActiveTab("monogram")}
              className={`text-[10px] md:text-xs font-sans font-semibold tracking-[0.2em] uppercase transition-all pb-2 border-b cursor-pointer ${
                activeTab === "monogram" ? "text-gold-mid border-gold-mid" : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
            >
              Monogram Blueprints
            </button>
            <button
              onClick={() => setActiveTab("palette")}
              className={`text-[10px] md:text-xs font-sans font-semibold tracking-[0.2em] uppercase transition-all pb-2 border-b cursor-pointer ${
                activeTab === "palette" ? "text-gold-mid border-gold-mid" : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
            >
              Atelier Color Palette
            </button>
          </div>
        </motion.div>

        {/* Dynamic Display Panels */}
        {activeTab === "packaging" && (
          <motion.div 
            key="packaging"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Left Big Graphic: Rigid Sliding Gift Box & Shopping Bag */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-zinc-950/60 border border-zinc-900/60 p-6 relative group overflow-hidden">
              <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 text-[8px] font-sans tracking-widest text-gold-mid px-2.5 py-1 z-10 uppercase font-semibold">
                PACKAGING 01 / SIGNATURE BOX & BAG
              </div>

              <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-950 border border-zinc-900/80 mb-6">
                <img
                  src="/src/assets/images/luxevra_packaging_1784392190373.jpg"
                  alt="LUXEVRA Gift Box & Shopping Bag Packaging"
                  className="w-full h-full object-cover object-center scale-100 group-hover:scale-[1.03] transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-sans tracking-[0.2em] text-gold-mid uppercase font-bold mb-1">THE MATTE RIGID FORM</span>
                <h3 className="font-serif text-lg md:text-xl text-white font-medium tracking-wide mb-3 uppercase">SIGNATURE BOX & CARRIER</h3>
                <p className="text-xs text-zinc-500 font-sans font-light leading-relaxed tracking-wider">
                  Engineered with premium double-thick felted cardboard, the sliding box features an internal silk pull ribbon. The bag carries thick cotton rope handles and rigid reinforcement bases, ensuring structural integrity from atelier to wardrobe.
                </p>
              </div>
            </div>

            {/* Right Side: Supplementary Packaging items list (Leather label, Hang tag) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Leather patch element */}
              <div className="bg-zinc-950/60 border border-zinc-900/60 p-5 flex flex-col sm:flex-row gap-5 items-stretch group hover:border-zinc-800 transition-colors">
                <div className="w-full sm:w-1/3 aspect-square overflow-hidden bg-zinc-950 border border-zinc-900/80 relative">
                  <img
                    src="/src/assets/images/leather_patch_1784392207167.jpg"
                    alt="Embossed Leather label"
                    className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="w-full sm:w-2/3 flex flex-col justify-center">
                  <span className="text-[8px] font-sans tracking-[0.2em] text-gold-mid uppercase font-bold mb-1">PACKAGING 02 / GENUINE LEATHER</span>
                  <h4 className="font-serif text-sm md:text-base text-white tracking-wide mb-2 uppercase">EMBOSSED SILHOUETTE TAG</h4>
                  <p className="text-xs text-zinc-500 font-sans font-light leading-relaxed tracking-wide">
                    Stitched onto the reverse yoke of premium hoodies and jackets. Cut from premium full-grain Italian leather and debossed with heavy hydraulic force, leaving a thick, high-density metallic gold emblem.
                  </p>
                </div>
              </div>

              {/* Silk ribbons & Hangtag */}
              <div className="bg-zinc-950/60 border border-zinc-900/60 p-5 flex flex-col sm:flex-row gap-5 items-stretch group hover:border-zinc-800 transition-colors">
                <div className="w-full sm:w-1/3 aspect-square overflow-hidden bg-zinc-950 border border-zinc-900/80 relative">
                  {/* Using the beautiful packaging photo showing the gold lock tag */}
                  <img
                    src="/src/assets/images/luxevra_packaging_1784392190373.jpg"
                    alt="Custom clothing security locks"
                    className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="w-full sm:w-2/3 flex flex-col justify-center">
                  <span className="text-[8px] font-sans tracking-[0.2em] text-gold-mid uppercase font-bold mb-1">PACKAGING 03 / FINISHING EMBELLISHMENTS</span>
                  <h4 className="font-serif text-sm md:text-base text-white tracking-wide mb-2 uppercase">SECURITY LOCKS & PAPER TAGS</h4>
                  <p className="text-xs text-zinc-500 font-sans font-light leading-relaxed tracking-wide">
                    Crafted on a 400 GSM heavy-textured felt paper sheet, detailed with the golden intertwined logo. Secured to the neck label with a custom gold-gilded metallic safety toggle, indicating untouched atelier authenticity.
                  </p>
                </div>
              </div>

              {/* The Unboxing Ceremony Detail Card */}
              <div className="bg-gradient-to-br from-zinc-950 to-[#0a0a0a] border border-zinc-900/80 p-6 flex-1 flex flex-col justify-center items-center text-center">
                <ShieldCheck className="w-8 h-8 text-gold-mid mb-3" />
                <h4 className="font-serif text-xs md:text-sm tracking-[0.15em] text-white uppercase mb-2">CERTIFIED LUXURY ORIGINAL</h4>
                <p className="text-[11px] text-zinc-400 font-sans font-light tracking-wide max-w-xs leading-relaxed">
                  Every order includes an embossed authenticity certificate signed by our master tailor, certifying the limited production number and individual dye inspection.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Monogram drafting Blueprint Panel */}
        {activeTab === "monogram" && (
          <motion.div 
            key="monogram"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-zinc-950/40 border border-zinc-900/80 p-6 md:p-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Left drafting grid */}
            <div className="lg:col-span-6 flex justify-center items-center relative aspect-square bg-[#080808] border border-zinc-900/60 p-8 overflow-hidden group">
              {/* Drafting grid background lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#151515_1px,transparent_1px),linear-gradient(to_bottom,#151515_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50"></div>
              
              {/* CAD blueprint circular metrics */}
              <div className="absolute w-[240px] h-[240px] rounded-full border border-zinc-800/20 pointer-events-none group-hover:border-gold-mid/10 transition-colors"></div>
              <div className="absolute w-[180px] h-[180px] rounded-full border border-zinc-800/35 pointer-events-none group-hover:border-gold-mid/20 transition-colors"></div>
              <div className="absolute w-[300px] h-[300px] rounded-full border border-dashed border-zinc-900 pointer-events-none"></div>

              {/* Monogram inside drafting grid */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <Logo variant="monogram" className="w-full h-full opacity-90 scale-110" />
              </div>

              {/* Blueprint Labels */}
              <span className="absolute bottom-4 left-4 font-mono text-[8px] text-zinc-600 tracking-wider">
                SCALE: 1.000 / CAD/CAM STRUCTURAL
              </span>
              <span className="absolute top-4 right-4 font-mono text-[8px] text-gold-mid/40 tracking-wider">
                LX-GEOMETRY-BLUEPRINT-2024
              </span>
            </div>

            {/* Right details block */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[10px] font-sans tracking-[0.25em] text-gold-mid block uppercase font-bold">MONOGRAM DETAILS</span>
              <h3 className="font-serif text-xl md:text-2xl text-white font-medium tracking-wide uppercase">THE SYMMETRY OF THE LX EMBLEM</h3>
              <p className="text-xs text-zinc-500 font-sans font-light leading-relaxed tracking-wider">
                Our emblem is an intertwining of two distinct typographical epochs. The capital letter <strong className="text-gold-mid">L</strong> represents standard serif classicism, defined by sharp serifs, heavy brackets, and hand-rendered structural elegance. 
              </p>
              <p className="text-xs text-zinc-500 font-sans font-light leading-relaxed tracking-wider">
                The lowercase <strong className="text-white">x</strong> features an offset slant, intersecting the vertical stroke of the L at a precise 42-degree angle. This creates a bold contrast of thick and thin strokes that symbolizes the brand's main philosophy: combining heritage with modern streetwear.
              </p>

              {/* Technical bullet stats */}
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-6 font-sans">
                <div>
                  <span className="text-[9px] text-zinc-600 tracking-wider block uppercase">ANGLE OF INTERSECTION</span>
                  <span className="text-xs text-zinc-300 font-mono tracking-widest uppercase block mt-1">42° ATELIER ANGLE</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-600 tracking-wider block uppercase">TYPOGRAPHY RATIOS</span>
                  <span className="text-xs text-zinc-300 font-mono tracking-widest uppercase block mt-1">1:1.618 GOLDEN RATIO</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-600 tracking-wider block uppercase">MONOGRAM EMBROIDERY</span>
                  <span className="text-xs text-zinc-300 font-mono tracking-widest uppercase block mt-1">12,000 PREMIUM STITCHES</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-600 tracking-wider block uppercase">STAMPING STRENGTH</span>
                  <span className="text-xs text-zinc-300 font-mono tracking-widest uppercase block mt-1">1.5 TONS HYDRAULIC FORCE</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Color Palette Panel */}
        {activeTab === "palette" && (
          <motion.div 
            key="palette"
            className="bg-zinc-950/40 border border-zinc-900/80 p-6 md:p-10 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-[10px] font-sans tracking-[0.25em] text-gold-mid block uppercase font-bold mb-3">COUTURE BRAND COLOR PALETTE</span>
            <h3 className="font-serif text-xl md:text-2xl text-white font-medium tracking-wide uppercase mb-2">THE PALETTE OF SILENT LUXURY</h3>
            <p className="text-xs text-zinc-500 font-sans font-light max-w-xl mx-auto mb-10 tracking-wide">
              Selected to represent the materials of high-fashion construction. Click on any color card to copy its precise hex code directly to your clipboard for development.
            </p>

            {/* Grid of colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {brandColors.map((color) => {
                const isCopied = copiedHex === color.hex;

                return (
                  <div
                    key={color.hex}
                    onClick={() => handleCopyColor(color.hex)}
                    className="group bg-zinc-950 border border-zinc-900/80 p-5 cursor-pointer hover:border-gold-mid transition-all relative flex flex-col justify-between aspect-square"
                  >
                    {/* Large color patch */}
                    <div
                      className="w-full h-24 border border-zinc-900 relative flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: color.hex }}
                    >
                      {/* Copy Indicator Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-xs tracking-widest text-gold-light gap-2 font-semibold">
                        {isCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>COPY HEX</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Details block */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-sans font-bold tracking-[0.1em] text-white">
                          {color.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono font-medium">
                          {color.hex}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-sans tracking-wide mt-1 leading-relaxed">
                        {color.desc}
                      </p>
                    </div>

                    {/* Copy notification tick */}
                    {isCopied && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center animate-ping pointer-events-none"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
