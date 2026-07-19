/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import { Product } from "../types";

interface HeaderProps {
  cartCount: number;
  wishlist: Product[];
  onOpenCart: () => void;
  onOpenLookbook: () => void;
  onOpenWishlist: () => void;
  onSelectProduct: (product: Product) => void;
  products: Product[];
  onOpenAdmin?: () => void;
  onOpenTracking?: () => void;
  user: { id: string; name: string; email: string; role: string; createdAt: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Header({
  cartCount,
  wishlist,
  onOpenCart,
  onOpenLookbook,
  onOpenWishlist,
  onSelectProduct,
  products,
  onOpenAdmin,
  onOpenTracking,
  user,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const filteredProducts = searchQuery
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchItemClick = (product: Product) => {
    onSelectProduct(product);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="relative w-full z-40 bg-luxury-black text-luxury-cream">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="w-full bg-[#0a0a0a] border-b border-zinc-900 text-[10px] md:text-xs font-sans tracking-[0.2em] font-light py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-12 text-center text-zinc-400">
          <span>FREE SHIPPING ON ORDERS ABOVE ₹4,999</span>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <span>COD AVAILABLE</span>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <span>EASY RETURNS</span>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION */}
      <div className="w-full border-b border-zinc-900/60 sticky top-0 bg-luxury-black/95 backdrop-blur-md px-4 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1 text-zinc-300 hover:text-gold-mid transition-colors"
            aria-label="Open mobile menu"
            id="mobile-menu-open-btn"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Left Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-sans font-medium tracking-[0.25em] text-zinc-400">
            <button
              onClick={() => scrollToSection("collection")}
              className="hover:text-gold-mid transition-colors cursor-pointer uppercase"
            >
              Shop
            </button>
            <button
              onClick={() => scrollToSection("packaging")}
              className="hover:text-gold-mid transition-colors cursor-pointer uppercase"
            >
              Collections
            </button>
            <button
              onClick={() => scrollToSection("manifesto")}
              className="hover:text-gold-mid transition-colors cursor-pointer uppercase"
            >
              About
            </button>
            <button
              onClick={onOpenLookbook}
              className="hover:text-gold-mid transition-colors cursor-pointer uppercase"
            >
              Lookbook
            </button>
            <button
              onClick={() => scrollToSection("packaging")}
              className="hover:text-gold-mid transition-colors cursor-pointer uppercase"
            >
              Packaging
            </button>
            {onOpenTracking && (
              <button
                onClick={onOpenTracking}
                className="text-gold-mid hover:text-white transition-colors cursor-pointer uppercase font-bold flex items-center gap-1.5"
                id="header-tracking-btn"
              >
                <span className="w-1 h-1 bg-gold-mid rounded-full animate-pulse"></span>
                TRACKING
              </button>
            )}
          </nav>

          {/* Center Brand Identity */}
          <div className="flex-1 md:flex-none flex justify-center">
            <a 
              href="/" 
              className="cursor-pointer hover:opacity-95 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Logo variant="full" className="scale-90 md:scale-100" />
            </a>
          </div>

          {/* Right Icons Row */}
          <div className="flex items-center gap-3 md:gap-5 text-zinc-300">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 hover:text-gold-mid transition-colors relative"
              aria-label="Search brand products"
              id="header-search-btn"
            >
              <Search className="w-[18px] h-[18px] md:w-5 md:h-5" />
            </button>

            {/* Account Toggle */}
            <button
              onClick={() => {
                if (user) {
                  setAccountOpen(true);
                } else {
                  onOpenAuth();
                }
              }}
              className="p-1.5 hover:text-gold-mid transition-colors relative"
              aria-label="Customer portal"
              id="header-account-btn"
            >
              {user ? (
                <div className="w-5 h-5 md:w-[22px] md:h-[22px] rounded-full border border-gold-mid text-[9px] font-sans font-bold flex items-center justify-center text-gold-mid">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              ) : (
                <User className="w-[18px] h-[18px] md:w-5 md:h-5" />
              )}
            </button>

            {/* Wishlist Button with Badge */}
            <button
              onClick={onOpenWishlist}
              className="p-1.5 hover:text-gold-mid transition-colors relative"
              aria-label="Wishlist items"
              id="header-wishlist-btn"
            >
              <Heart className="w-[18px] h-[18px] md:w-5 md:h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-gold-mid text-luxury-black font-sans font-bold text-[9px] rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button with Badge */}
            <button
              onClick={onOpenCart}
              className="p-1.5 hover:text-gold-mid transition-colors relative"
              aria-label="Shopping cart"
              id="header-cart-btn"
            >
              <ShoppingBag className="w-[18px] h-[18px] md:w-5 md:h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#F5F2EC] text-luxury-black font-sans font-bold text-[9px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE MENU FULL-SCREEN OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-[#060606] flex flex-col justify-between overflow-y-auto"
            id="mobile-menu-overlay"
          >
            {/* Upper Action Bar */}
            <div className="w-full px-6 py-5 flex items-center justify-between border-b border-zinc-900/80 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-10">
              <Logo variant="wordmark" className="scale-95 text-left" />
              
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-zinc-800 hover:border-gold-mid bg-zinc-950/60 text-zinc-400 hover:text-gold-mid active:scale-95 transition-all cursor-pointer"
                id="mobile-menu-close-btn"
                aria-label="Close mobile menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Immersive Navigation Options */}
            <div className="flex-1 flex flex-col justify-center px-8 py-10 md:py-16 max-w-lg mx-auto w-full">
              <span className="text-[9px] font-sans tracking-[0.35em] text-gold-mid/80 uppercase mb-8 block text-center">
                Atelier Catalog & Expedition
              </span>

              <nav className="flex flex-col space-y-2">
                {[
                  { label: "Shop Collection", id: "collection", onClick: () => scrollToSection("collection") },
                  { label: "Immersive Lookbook", id: "lookbook", onClick: () => { setMobileMenuOpen(false); onOpenLookbook(); } },
                  { label: "Our Packaging", id: "packaging", onClick: () => scrollToSection("packaging") },
                  { label: "Brand Manifesto", id: "manifesto", onClick: () => scrollToSection("manifesto") },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 + 0.1, duration: 0.3 }}
                  >
                    <button
                      onClick={item.onClick}
                      className="w-full text-left py-4 px-2 group flex items-center justify-between border-b border-zinc-900/50 hover:border-gold-mid/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-[10px] text-zinc-600 tracking-wider">
                          0{index + 1}
                        </span>
                        <span className="font-sans font-light text-xl sm:text-2xl tracking-[0.15em] text-zinc-200 group-hover:text-gold-light group-hover:pl-2 transition-all duration-300 uppercase">
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-gold-mid group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                  </motion.div>
                ))}

                {onOpenTracking && (
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42, duration: 0.3 }}
                  >
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenTracking();
                      }}
                      className="w-full text-left py-5 px-4 bg-gold-mid/5 hover:bg-gold-mid/10 border border-gold-mid/20 hover:border-gold-mid/40 transition-all flex items-center justify-between cursor-pointer mt-6"
                      id="mobile-tracking-btn"
                    >
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-mid opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-mid"></span>
                        </span>
                        <span className="font-sans font-bold text-xs tracking-[0.25em] text-gold-light uppercase">
                          Track Expedition
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-gold-mid uppercase tracking-widest font-semibold">
                        LIVE STATUS
                      </span>
                    </button>
                  </motion.div>
                )}
              </nav>
            </div>

            {/* Bottom Premium Concierge & Social Block */}
            <div className="w-full max-w-lg mx-auto px-8 pb-10 pt-6 border-t border-zinc-900/60 bg-zinc-950/20">
              <div className="flex flex-col items-center text-center">
                <span className="text-[9px] font-sans tracking-[0.3em] text-gold-mid uppercase block mb-3 font-semibold">
                  LUXEVRA PRIVILEGE CLUB
                </span>
                
                <p className="text-[11px] text-zinc-500 font-sans tracking-wide leading-relaxed mb-5 max-w-xs">
                  Access bespoke atelier custom tailoring, shipping updates, and private drop invitations.
                </p>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user) {
                      setAccountOpen(true);
                    } else {
                      onOpenAuth();
                    }
                  }}
                  className="w-full py-4 px-6 border border-zinc-800 bg-zinc-950 text-gold-light hover:text-white hover:bg-zinc-900 hover:border-gold-mid active:scale-[0.98] transition-all text-xs tracking-[0.2em] font-sans font-bold uppercase cursor-pointer"
                >
                  {user ? "ENTER PRIVILEGE PORTAL" : "JOIN CONCIERGE LOCKER"}
                </button>

                {/* Social references/Help */}
                <div className="flex items-center gap-6 mt-8 text-[10px] font-sans tracking-widest text-zinc-500 uppercase">
                  <a href="#instagram" className="hover:text-gold-mid transition-colors">Instagram</a>
                  <span className="text-zinc-800">|</span>
                  <a href="#whatsapp" className="hover:text-gold-mid transition-colors">WhatsApp Concierge</a>
                  <span className="text-zinc-800">|</span>
                  <a href="#support" className="hover:text-gold-mid transition-colors">Atelier Support</a>
                </div>

                <p className="text-[9px] text-zinc-600 font-sans tracking-wider mt-6">
                  © {new Date().getFullYear()} LUXEVRA COUTURE. STYLED WITH ABSOLUTE INTENT.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. SEARCH DROP-DOWN OVERLAY */}
      {searchOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0d0d0d] border-b border-zinc-800 py-6 px-4 shadow-2xl z-30 animate-fade-in" id="search-dropdown-panel">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-2">
              <Search className="w-5 h-5 text-gold-mid" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH FOR COUTURE (HOODIE, TEE, PANTS...)"
                className="w-full bg-transparent border-0 text-sm md:text-base text-luxury-cream placeholder-zinc-600 focus:outline-none focus:ring-0 tracking-widest uppercase font-light"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-1 hover:text-gold-mid text-zinc-500 transition-colors"
                id="search-panel-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions */}
            {searchQuery === "" ? (
              <div className="mt-4">
                <span className="text-[9px] font-sans tracking-[0.25em] text-zinc-500 block mb-2">
                  SUGGESTED COLLECTIONS
                </span>
                <div className="flex flex-wrap gap-2">
                  {["HOODIE", "SIGNATURE", "CARGO", "VINTAGE WASH", "COTTON"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1 bg-zinc-950 border border-zinc-900 text-[10px] tracking-widest text-zinc-400 hover:border-gold-mid hover:text-luxury-cream transition-all rounded-none uppercase"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 max-h-72 overflow-y-auto">
                <span className="text-[10px] font-sans tracking-[0.2em] text-gold-mid block mb-3">
                  SEARCH RESULTS ({filteredProducts.length})
                </span>

                {filteredProducts.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSearchItemClick(p)}
                        className="flex items-center gap-4 p-2 bg-zinc-950/60 hover:bg-zinc-950 border border-transparent hover:border-zinc-800 cursor-pointer transition-all"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-12 object-cover object-center bg-zinc-900"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-sans font-medium tracking-wider text-luxury-cream uppercase">
                            {p.name}
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 hover:text-gold-mid" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 font-sans tracking-wide py-4">
                    NO LUXURY PRODUCTS MATCHED "{searchQuery.toUpperCase()}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. ACCOUNT CONCIERGE MODAL */}
      {accountOpen && user && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4" id="account-concierge-modal">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-zinc-900 p-8 relative">
            <button
              onClick={() => {
                setAccountOpen(false);
                setNewsletterSubscribed(false);
              }}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-gold-mid transition-colors cursor-pointer"
              id="account-modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full border border-gold-mid flex items-center justify-center mx-auto mb-4 text-gold-mid text-xl font-serif">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="font-serif text-lg text-luxury-cream tracking-widest uppercase mb-1">
                {user.role === "admin" ? "★ ATELIER ADMINISTRATOR ★" : "PRIVILEGE CLUB MEMBER"}
              </h3>
              <p className="text-xs font-mono text-zinc-500 tracking-wide mb-6">
                {user.email}
              </p>

              <div className="h-[1px] bg-zinc-900 my-6"></div>

              <div className="text-left space-y-4">
                <span className="text-[10px] font-sans tracking-[0.25em] text-gold-mid block uppercase">
                  ACTIVE ORDERS & RESERVATIONS
                </span>
                <div className="p-4 bg-zinc-950 border border-zinc-900/60 rounded-none text-center">
                  <p className="text-xs text-zinc-400 font-sans">
                    YOUR COMMISSIONS ARE UP TO DATE
                  </p>
                  <span className="text-[10px] text-zinc-600 font-sans block mt-1">
                    No active orders found. Add items to your cart to checkout.
                  </span>
                </div>

                <span className="text-[10px] font-sans tracking-[0.25em] text-gold-mid block uppercase pt-2">
                  EXCLUSIVE BENEFITS ACTIVE
                </span>
                <ul className="text-xs text-zinc-400 space-y-2 font-light">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold-mid" /> Pre-access to Drop '26 Collections
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold-mid" /> Complementary Atelier Tailoring
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold-mid" /> White-glove concierge dispatch
                  </li>
                </ul>
              </div>

              {user.role === "admin" && onOpenAdmin && (
                <button
                  onClick={() => {
                    setAccountOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full mt-6 bg-gold-mid/10 hover:bg-gold-mid/20 text-gold-mid font-sans font-bold text-xs tracking-[0.2em] py-3.5 border border-gold-mid/40 transition-all uppercase cursor-pointer"
                  id="account-admin-portal-btn"
                >
                  ★ ACCESS ADMIN PORTAL
                </button>
              )}

              <button
                onClick={() => {
                  onLogout();
                  setAccountOpen(false);
                }}
                className="w-full mt-4 bg-zinc-950 hover:bg-zinc-900 text-xs font-sans tracking-[0.2em] py-3 text-zinc-500 hover:text-luxury-cream border border-zinc-900 transition-all uppercase cursor-pointer"
              >
                DISCONNECT ATELIER
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
