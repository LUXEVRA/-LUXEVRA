/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Crown, Package, Lock, Headphones } from "lucide-react";
import { motion } from "motion/react";
import { VALUE_PROPOSITIONS } from "../data";

export default function ValueProps() {
  const getIcon = (name: string) => {
    switch (name) {
      case "crown":
        return <Crown className="w-5 h-5 text-gold-mid shrink-0" />;
      case "package":
        return <Package className="w-5 h-5 text-gold-mid shrink-0" />;
      case "lock":
        return <Lock className="w-5 h-5 text-gold-mid shrink-0" />;
      case "headphones":
        return <Headphones className="w-5 h-5 text-gold-mid shrink-0" />;
      default:
        return <Crown className="w-5 h-5 text-gold-mid shrink-0" />;
    }
  };

  return (
    <section 
      id="props-bar"
      className="w-full bg-[#0d0d0d] border-y border-zinc-900/80 py-8 px-4"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        {VALUE_PROPOSITIONS.map((prop, index) => (
          <motion.div 
            key={prop.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            className={`flex items-center gap-4 sm:justify-center ${
              index !== VALUE_PROPOSITIONS.length - 1 ? "lg:border-r lg:border-zinc-900" : ""
            }`}
          >
            <div className="p-2.5 bg-zinc-950 border border-zinc-900/60 flex items-center justify-center">
              {getIcon(prop.iconName)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-sans font-semibold tracking-[0.15em] text-white uppercase">
                {prop.title}
              </span>
              <span className="text-[10px] md:text-xs font-sans text-zinc-500 font-light tracking-wide mt-0.5">
                {prop.subtitle}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
