/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowRight, Check, ShieldCheck, Mail, Instagram, Twitter, Compass } from "lucide-react";
import Logo from "./Logo";

interface FooterProps {
  onOpenAdmin?: () => void;
  onOpenTracking?: () => void;
}

export default function Footer({ onOpenAdmin, onOpenTracking }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("https://formspree.io/f/mkodragl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          formType: "Newsletter Subscription",
          email: email,
          timestamp: new Date().toISOString(),
          location: window.location.href
        })
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 4000);
      } else {
        setErrorMsg("REGISTRATION ENCOUNTERED AN ATELIER ERROR. PLEASE RETRY.");
      }
    } catch (err) {
      console.error("Formspree subscription error:", err);
      setErrorMsg("CONNECTION DELAYED. PLEASE VERIFY INTERNET CONNECTION AND RETRY.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-[#0a0a0a] text-zinc-400 border-t border-zinc-900/60 font-sans">
      {/* 1. MEDIA MENTIONS BAR (DIRECTLY MATCHING REFERENCE IMAGE) */}
      <div className="w-full bg-[#070707] border-y border-zinc-900/60 py-6 md:py-8 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-8 md:gap-12 opacity-35 hover:opacity-50 transition-opacity duration-500">
          {["GQ", "HYPEBEAST", "Highsnobiety", "Esquire", "GQ", "HYPEBEAST", "Highsnobiety", "Esquire"].map((brand, idx) => (
            <span
              key={`${brand}-${idx}`}
              className="text-lg md:text-xl font-display font-medium tracking-[0.3em] text-white uppercase italic"
              style={{ fontFamily: "Space Grotesk, Arial, sans-serif" }}
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* 2. BRAND MANIFESTO SECTION */}
      <div id="manifesto" className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center border-b border-zinc-900/60">
        <div className="w-16 h-[1px] bg-gold-mid mx-auto mb-8"></div>
        
        <h3 className="font-serif text-xl md:text-2xl text-white font-medium tracking-[0.2em] mb-6 uppercase">
          THE LUXEVRA MANIFESTO
        </h3>
        
        <p className="font-serif italic text-base md:text-lg text-zinc-300 leading-relaxed max-w-3xl mx-auto mb-6">
          "We reject the fleeting noise of transient trends. We believe a garment is an armor of personal identity — carved with structural density, draped with gravity, and made to outlast seasons."
        </p>
        
        <p className="text-xs text-zinc-500 font-light leading-relaxed max-w-xl mx-auto tracking-widest uppercase">
          Every fabric is custom-spun. Every seam is double-locked. From the weight of our 450 GSM fleece to the gold embossing of our leather patch, we build couture beyond ordinary.
        </p>
        
        <div className="w-16 h-[1px] bg-gold-mid mx-auto mt-8"></div>
      </div>

      {/* 3. FOUR-COLUMN ATELIER FOOTER MENUS */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-left">
        {/* Col 1: Brand Info / Newsletter */}
        <div className="space-y-6">
          <Logo variant="wordmark" className="text-left scale-90 -ml-2" />
          <p className="text-xs text-zinc-500 font-light leading-relaxed tracking-wider">
            Subscribe to our privilege newsletter for private digital passcodes, custom atelier catalogs, and notifications on immediate apparel collections.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                placeholder={submitting ? "SENDING SEALS..." : "ENTER ATELIER EMAIL"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-gold-mid text-xs text-luxury-cream p-3 pr-10 focus:outline-none transition-all tracking-widest uppercase rounded-none disabled:opacity-50"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-gold-mid transition-colors disabled:opacity-40"
                aria-label="Subscribe to newsletter"
                id="footer-subscribe-btn"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {subscribed && (
              <span className="text-[10px] text-gold-mid tracking-widest flex items-center gap-1.5 font-semibold">
                <Check className="w-3 h-3 text-emerald-500 animate-bounce" /> ACCESS GRANTED. CHECK INBOX.
              </span>
            )}
            {errorMsg && (
              <span className="text-[9px] text-red-500 tracking-wider block font-medium">
                ⚠️ {errorMsg}
              </span>
            )}
          </form>
        </div>

        {/* Col 2: Collections */}
        <div>
          <h4 className="text-xs font-sans font-bold tracking-[0.2em] text-white uppercase mb-5">
            Collections
          </h4>
          <ul className="space-y-3 text-xs text-zinc-500 font-light tracking-wide">
            {["Oversized Hoodies", "Signature Tees", "Cargo Trousers", "Vintage Fades", "Atelier Outerwear"].map((item) => (
              <li key={item}>
                <a href="#collection" className="hover:text-gold-mid transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Client Atelier */}
        <div>
          <h4 className="text-xs font-sans font-bold tracking-[0.2em] text-white uppercase mb-5">
            Client Services
          </h4>
          <ul className="space-y-3 text-xs text-zinc-500 font-light tracking-wide">
            {["Track Dispatch", "Atelier Sizing Guide", "Authenticity Keys", "Private Consultation", "Exchange Protocol"].map((item) => (
              <li key={item}>
                <span className="hover:text-gold-mid transition-colors cursor-pointer">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Corporate / Craft */}
        <div>
          <h4 className="text-xs font-sans font-bold tracking-[0.2em] text-white uppercase mb-5">
            The Atelier
          </h4>
          <ul className="space-y-3 text-xs text-zinc-500 font-light tracking-wide">
            {["Our Factories", "Sourcing Standards", "Sustainability Audit", "Careers", "Pressroom"].map((item) => (
              <li key={item}>
                <span className="hover:text-gold-mid transition-colors cursor-pointer">
                  {item}
                </span>
              </li>
            ))}
            {onOpenTracking && (
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-gold-mid text-gold-mid font-semibold transition-colors cursor-pointer text-left block text-[11px] tracking-wider uppercase"
                  id="footer-tracking-btn"
                >
                  ◈ TRACK ACTIVE SHIPMENT
                </button>
              </li>
            )}
            {onOpenAdmin && (
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-gold-mid text-gold-mid font-semibold transition-colors cursor-pointer text-left block text-[11px] tracking-wider uppercase"
                  id="footer-admin-btn"
                >
                  ★ ATELIER ADMIN PORTAL
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. BOTTOM COPYRIGHT / SECURITY EMBLEM */}
      <div className="bg-[#070707] py-8 border-t border-zinc-900/60 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social icons row */}
          <div className="flex items-center gap-4 text-zinc-600">
            <Instagram className="w-4 h-4 hover:text-gold-mid transition-colors cursor-pointer" />
            <Twitter className="w-4 h-4 hover:text-gold-mid transition-colors cursor-pointer" />
            <Compass className="w-4 h-4 hover:text-gold-mid transition-colors cursor-pointer" />
          </div>

          <div className="flex items-center gap-2 text-[10px] font-sans text-zinc-600 tracking-wider">
            <ShieldCheck className="w-4 h-4 text-gold-mid" />
            <span>SSL CERTIFIED ATELIER DISPATCH / 256-BIT ENCRYPTION</span>
          </div>

          <div className="text-[10px] font-mono text-zinc-600 tracking-wide text-center md:text-right">
            © {new Date().getFullYear()} LUXEVRA ATELIER LTD. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </footer>
  );
}
