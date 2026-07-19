/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { PRODUCTS } from "./data";
import { Product, CartItem } from "./types";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ValueProps from "./components/ValueProps";
import LatestDrop from "./components/LatestDrop";
import PackagingShowcase from "./components/PackagingShowcase";
import ProductDetailModal from "./components/ProductDetailModal";
import CartDrawer from "./components/CartDrawer";
import LookbookModal from "./components/LookbookModal";
import Footer from "./components/Footer";
import AdminModal from "./components/AdminModal";
import TrackingPortal from "./components/TrackingPortal";
import { X, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import AuthModal from "./components/AuthModal";
import Logo from "./components/Logo";
import { motion } from "motion/react";

export default function App() {
  // Premium Authentication states
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("luxevra_auth_token");
    }
    return null;
  });

  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string; createdAt: string } | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("luxevra_auth_user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          console.error("[DATABASE] Failed to parse cached auth user:", e);
        }
      }
    }
    return null;
  });

  const [authChecking, setAuthChecking] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // E-commerce state engines
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Dynamic products list state (initializes immediately with safe local storage fallback)
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("luxevra_products");
      if (saved) {
        try {
          return JSON.parse(saved) as Product[];
        } catch (e) {
          console.error("[DATABASE] Failed to parse initial products from localStorage", e);
        }
      }
    }
    return PRODUCTS;
  });

  // Dynamic UPI payment settings
  const [upiDetails, setUpiDetails] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("luxevra_upi_details");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse initial UPI details", e);
        }
      }
    }
    return { upiId: "luxevra@okaxis", beneficiaryName: "LUXEVRA ATELIER LTD" };
  });

  // Layout UI states
  const [cartOpen, setCartOpen] = useState(false);
  const [lookbookOpen, setLookbookOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);

  // Hydrate states from localStorage on startup
  useEffect(() => {
    const savedCart = localStorage.getItem("luxevra_cart");
    const savedWishlist = localStorage.getItem("luxevra_wishlist");
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart items", e);
      }
    }
    
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse wishlist items", e);
      }
    }
  }, []);

  // Securely verify session authenticity via JWT
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("luxevra_auth_token");
      if (!token) {
        setUser(null);
        setAuthToken(null);
        setAuthChecking(false);
        return;
      }

      console.log("[AUTH ENGINE] Restoring active session from token...");
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
            setAuthToken(token);
            localStorage.setItem("luxevra_auth_user", JSON.stringify(data.user));
            console.log("[AUTH ENGINE] Session verified successfully. Logged in as:", data.user.email);
          } else {
            throw new Error("Token expired or invalid.");
          }
        } else {
          throw new Error("HTTP session check failed.");
        }
      } catch (err: any) {
        console.warn("[AUTH ENGINE] Session restore failure. Clearing credentials:", err.message);
        localStorage.removeItem("luxevra_auth_token");
        localStorage.removeItem("luxevra_auth_user");
        setUser(null);
        setAuthToken(null);
      } finally {
        setAuthChecking(false);
      }
    };

    verifySession();
  }, []);

  const handleAuthSuccess = (token: string, loggedInUser: any) => {
    setAuthToken(token);
    setUser(loggedInUser);
    localStorage.setItem("luxevra_auth_token", token);
    localStorage.setItem("luxevra_auth_user", JSON.stringify(loggedInUser));
    console.log("[AUTH ENGINE] Session login success. Cached state written.");
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("luxevra_auth_token");
    localStorage.removeItem("luxevra_auth_user");
    setAdminOpen(false); // Close admin panel on logout
    console.log("[AUTH ENGINE] Disconnected. Session cache cleared.");
  };

  // Sync products from server-side database on startup with explicit error handling and console logging
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        console.log("[DATABASE] Fetching latest products from server database...");
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.products) {
          setProducts(data.products);
          console.log("[DATABASE] Database fetch success: Successfully initialized products from server database.", data.products);
        } else {
          console.error("[DATABASE] Database fetch failure: Response does not indicate success or missing products data:", data);
        }
      } catch (err: any) {
        console.error("[DATABASE] Database fetch failure: Failed to connect or retrieve database products:", err);
      }
    };
    fetchLatestProducts();
  }, []);

  // Persist states safely with try-catch blocks to prevent QuotaExceededError crashes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem("luxevra_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  };

  const saveWishlist = (items: Product[]) => {
    setWishlist(items);
    try {
      localStorage.setItem("luxevra_wishlist", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  };

  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem("luxevra_products", JSON.stringify(updatedProducts));
    } catch (e) {
      console.warn("Failed to save products to localStorage (often due to browser storage quota limit). Custom images will still persist once saved to codebase.", e);
    }
  };

  const handleUpdateUpi = (updatedUpi: { upiId: string; beneficiaryName: string }) => {
    setUpiDetails(updatedUpi);
    try {
      localStorage.setItem("luxevra_upi_details", JSON.stringify(updatedUpi));
    } catch (e) {
      console.error("Failed to save UPI details to localStorage", e);
    }
  };

  // Add item to bag
  const handleAddToCart = (product: Product, size: "S" | "M" | "L" | "XL", color?: string, hoodColor?: string) => {
    const existingIndex = cartItems.findIndex(
      (item) => 
        item.product.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color &&
        item.selectedHoodColor === hoodColor
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        selectedSize: size,
        selectedColor: color,
        selectedHoodColor: hoodColor,
      };
      saveCart([...cartItems, newItem]);
    }
  };

  // Remove item from bag
  const handleRemoveItem = (productID: string, size: "S" | "M" | "L" | "XL", color?: string, hoodColor?: string) => {
    const filtered = cartItems.filter(
      (item) => 
        !(
          item.product.id === productID && 
          item.selectedSize === size && 
          item.selectedColor === color &&
          item.selectedHoodColor === hoodColor
        )
    );
    saveCart(filtered);
  };

  // Update item quantity in bag
  const handleUpdateQuantity = (
    productID: string,
    size: "S" | "M" | "L" | "XL",
    delta: number,
    color?: string,
    hoodColor?: string
  ) => {
    const updated = cartItems
      .map((item) => {
        if (
          item.product.id === productID && 
          item.selectedSize === size && 
          item.selectedColor === color &&
          item.selectedHoodColor === hoodColor
        ) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    saveCart(updated);
  };

  // Toggle item in wishlist
  const handleToggleWishlist = (product: Product) => {
    const isFav = wishlist.some((item) => item.id === product.id);
    if (isFav) {
      const updated = wishlist.filter((item) => item.id !== product.id);
      saveWishlist(updated);
    } else {
      saveWishlist([...wishlist, product]);
    }
  };

  // Open detailed quick-view directly from lookbook tags
  const handleSelectProductById = (id: string) => {
    const found = products.find((p) => p.id === id);
    if (found) {
      setSelectedProduct(found);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (authChecking) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50 p-6 select-none">
        <div className="text-center relative max-w-xs w-full">
          {/* Pulsing luxurious monogram of the brand */}
          <div className="w-20 h-20 mx-auto mb-8 relative">
            <Logo variant="monogram" className="w-full h-full animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-gold-mid/30 animate-ping opacity-50 pointer-events-none" />
          </div>
          
          <h1 className="font-serif text-sm tracking-[0.3em] text-gold-mid uppercase mb-3 animate-pulse">
            L U X E V R A  A T E L I E R
          </h1>
          <p className="text-[10px] text-zinc-500 font-sans tracking-[0.25em] uppercase font-light">
            Synchronizing Secure Dossier...
          </p>

          {/* Luxury gold loading line */}
          <div className="w-32 h-[1px] bg-zinc-900/60 mx-auto mt-6 overflow-hidden relative">
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-transparent via-gold-mid to-transparent"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-luxury-cream flex flex-col justify-between selection:bg-gold-mid selection:text-luxury-black antialiased relative">
      {/* 1. HEADER & NAVIGATION PORTAL */}
      <Header
        cartCount={totalCartCount}
        wishlist={wishlist}
        onOpenCart={() => setCartOpen(true)}
        onOpenLookbook={() => setLookbookOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onSelectProduct={setSelectedProduct}
        products={products}
        onOpenAdmin={() => {
          // Protect route / action: only allow admins to open Admin portal
          if (user && user.role === "admin") {
            setAdminOpen(true);
          } else {
            setAuthModalOpen(true);
          }
        }}
        onOpenTracking={() => setTrackingOpen(true)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. BODY CONTAINER */}
      <main className="flex-grow">
        {/* HERO INTRO DUCT */}
        <Hero onOpenLookbook={() => setLookbookOpen(true)} />

        {/* HORIZONTAL PREMIUM VALUE BENEFITS BAR */}
        <ValueProps />

        {/* THE NEW ARRIVALS GRID SECTION */}
        <LatestDrop
          onSelectProduct={setSelectedProduct}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          products={products}
        />

        {/* LUXURY UNBOXING & PACKAGING ARCHITECTURE */}
        <PackagingShowcase />
      </main>

      {/* 3. SOPHISTICATED FOOTER */}
      <Footer 
        onOpenAdmin={() => setAdminOpen(true)} 
        onOpenTracking={() => setTrackingOpen(true)} 
      />

      {/* ----------------- INTERACTIVE DRAWER OVERLAYS ----------------- */}

      {/* CART DRAWER SLIDE IN */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => saveCart([])}
        upiDetails={upiDetails}
      />

      {/* FULL-SCREEN IMMERSIVE LOOKBOOK */}
      <LookbookModal
        isOpen={lookbookOpen}
        onClose={() => setLookbookOpen(false)}
        onSelectProductById={handleSelectProductById}
        products={products}
      />

      {/* COUTURE DISPATCH TELEMETRY TRACKER */}
      <TrackingPortal
        isOpen={trackingOpen}
        onClose={() => setTrackingOpen(false)}
      />

      {/* SYSTEM ADMINISTRATIVE MODAL CONFIGURATION */}
      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        onUpdateProducts={handleUpdateProducts}
        upiDetails={upiDetails}
        onUpdateUpi={handleUpdateUpi}
      />

      {/* LUXURIOUS ATELIER CREDENTIALS OVERLAY */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* DETAILED QUICK VIEW / SIZE FINDER MODAL */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
        />
      )}

      {/* WISHLIST SIDE DRAWER PANEL */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" id="wishlist-drawer-root">
          {/* Backdrop */}
          <div
            onClick={() => setWishlistOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Drawer container */}
          <div className="relative w-full max-w-md bg-[#0a0a0a] border-l border-zinc-900 h-full flex flex-col justify-between shadow-2xl z-50 p-6">
            <div>
              {/* Header */}
              <div className="pb-6 border-b border-zinc-900 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans tracking-[0.2em] text-gold-mid uppercase font-bold">
                    MY WISHLIST
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ({wishlist.length} FAVS)
                  </span>
                </div>
                <button
                  onClick={() => setWishlistOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-gold-mid transition-colors"
                  aria-label="Close wishlist"
                  id="wishlist-close-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wishlist Items List */}
              {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Heart className="w-8 h-8 text-zinc-800 mb-4" />
                  <h3 className="font-serif text-xs tracking-widest text-zinc-400 uppercase mb-1">
                    WISHLIST IS EMPTY
                  </h3>
                  <p className="text-[10px] text-zinc-600 font-sans max-w-xs mb-6">
                    Tap the heart icons next to items during drops to save collections here.
                  </p>
                  <button
                    onClick={() => {
                      setWishlistOpen(false);
                      const element = document.getElementById("collection");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="border border-zinc-800 text-zinc-300 hover:text-gold-light text-[10px] tracking-widest py-3 px-6 uppercase transition-all"
                  >
                    EXPLORE NEW DROP
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
                  {wishlist.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-4 p-3 bg-zinc-950 border border-zinc-900/60 items-center hover:border-zinc-800 transition-colors"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-16 object-cover object-center bg-zinc-900"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <h4 className="text-xs font-sans font-semibold tracking-wider text-luxury-cream uppercase">
                          {product.name}
                        </h4>
                        <span className="text-[11px] font-mono text-gold-mid block mt-0.5">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        
                        {/* Interactive actions for favorite */}
                        <div className="flex gap-4 mt-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setWishlistOpen(false);
                            }}
                            className="text-[9px] font-sans text-zinc-400 hover:text-white tracking-widest uppercase transition-colors"
                          >
                            Quick View
                          </button>
                          <button
                            onClick={() => {
                              handleAddToCart(product, "M");
                              setWishlistOpen(false);
                              setCartOpen(true);
                            }}
                            className="text-[9px] font-sans text-gold-mid hover:text-gold-light tracking-widest uppercase transition-colors font-bold"
                          >
                            Add to Bag (Size M)
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                        aria-label="Delete from wishlist"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom info */}
            {wishlist.length > 0 && (
              <div className="pt-4 border-t border-zinc-900">
                <button
                  onClick={() => {
                    setWishlistOpen(false);
                    setCartOpen(true);
                  }}
                  className="w-full bg-[#F5F2EC] hover:bg-white text-luxury-black text-xs font-sans font-bold tracking-[0.25em] py-3.5 transition-all flex items-center justify-center gap-3 uppercase rounded-none"
                >
                  <ShoppingBag className="w-4 h-4 text-luxury-black" />
                  <span>VIEW BAG OUTLET</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
