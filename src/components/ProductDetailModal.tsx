/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Heart, ShieldCheck, Ruler, Truck, ChevronRight, HelpCircle, Check, Star, ThumbsUp, Camera, ImageIcon, Layers } from "lucide-react";
import { Product } from "../types";

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  fit: "Runs Small" | "True to Size" | "Runs Large";
  image?: string;
  helpfulCount: number;
}

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: "S" | "M" | "L" | "XL", color?: string, hoodColor?: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
}

// Interactive Vector Customizer Preview Component
interface CustomGarmentSVGProps {
  productId: string;
  baseColor: string;
  accentColor: string;
  baseImage?: string;
  accentImage?: string;
}

function CustomGarmentSVG({ productId, baseColor, accentColor, baseImage, accentImage }: CustomGarmentSVGProps) {
  const id = productId.toLowerCase();

  const finalBaseFill = baseImage ? "url(#baseImagePattern)" : baseColor;
  const finalAccentFill = accentImage ? "url(#accentImagePattern)" : accentColor;

  const renderDefs = () => (
    <defs>
      {baseImage && (
        <pattern id="baseImagePattern" patternContentUnits="objectBoundingBox" width="1" height="1">
          <image href={baseImage} x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice" />
        </pattern>
      )}
      {accentImage && (
        <pattern id="accentImagePattern" patternContentUnits="objectBoundingBox" width="1" height="1">
          <image href={accentImage} x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice" />
        </pattern>
      )}
    </defs>
  );
  
  // Interactive hoodie layout
  if (id.includes("hoodie") || id.includes("hood")) {
    return (
      <svg viewBox="0 0 200 210" className="w-full h-full max-h-[360px] mx-auto filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] animate-fade-in">
        {renderDefs()}
        {/* Left Sleeve */}
        <path d="M 50,70 L 25,130 L 42,136 L 68,85 Z" fill={finalBaseFill} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d="M 25,130 L 42,136 L 39,142 L 22,136 Z" fill={finalAccentFill} /> {/* Cuff */}
        
        {/* Right Sleeve */}
        <path d="M 150,70 L 175,130 L 158,136 L 132,85 Z" fill={finalBaseFill} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d="M 175,130 L 158,136 L 161,142 L 178,136 Z" fill={finalAccentFill} /> {/* Cuff */}
        
        {/* Main Torso Body */}
        <path d="M 60,80 L 140,80 L 146,180 L 54,180 Z" fill={finalBaseFill} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d="M 54,180 L 146,180 L 146,190 L 54,190 Z" fill={finalAccentFill} /> {/* Waistband */}
        
        {/* Kangaroo Pocket */}
        <path d="M 75,180 L 80,145 L 120,145 L 125,180 Z" fill={finalBaseFill} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        <path d="M 75,180 L 80,145" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <path d="M 125,180 L 120,145" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        
        {/* THE HOOD (Customizable Contrast Element) */}
        {/* Outer Hood */}
        <path d="M 64,80 C 50,15, 150,15, 136,80 C 136,80, 100,92, 64,80 Z" fill={finalAccentFill} stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
        {/* Inner hood shaded volume */}
        <path d="M 80,80 C 70,38, 130,38, 120,80 C 120,80, 100,88, 80,80 Z" fill="#000000" fillOpacity="0.35" />
        <path d="M 83,80 C 75,42, 125,42, 117,80 C 117,80, 100,85, 83,80 Z" fill={finalAccentFill} />
        
        {/* Premium metal-tipped drawstrings */}
        <path d="M 94,84 C 94,115, 88,125, 91,145" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M 106,84 C 106,115, 112,125, 109,145" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  
  // Interactive T-shirt layout
  if (id.includes("tee") || id.includes("shirt")) {
    return (
      <svg viewBox="0 0 200 210" className="w-full h-full max-h-[360px] mx-auto filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] animate-fade-in">
        {renderDefs()}
        {/* Left Sleeve */}
        <path d="M 55,60 L 22,95 L 38,110 L 65,80 Z" fill={finalBaseFill} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d="M 22,95 L 38,110 L 41,106 L 25,91 Z" fill={finalAccentFill} /> {/* Sleeve band */}
        
        {/* Right Sleeve */}
        <path d="M 145,60 L 178,95 L 162,110 L 135,80 Z" fill={finalBaseFill} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d="M 178,95 L 162,110 L 159,106 L 175,91 Z" fill={finalAccentFill} /> {/* Sleeve band */}
        
        {/* Main Torso */}
        <path d="M 65,70 L 135,70 L 140,185 L 60,185 Z" fill={finalBaseFill} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        
        {/* Collar Accent */}
        <path d="M 80,70 C 80,88, 120,88, 120,70 Z" fill={finalAccentFill} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      </svg>
    );
  }
  
  // Interactive Cargo Trousers layout
  if (id.includes("pant") || id.includes("cargo") || id.includes("trousers")) {
    return (
      <svg viewBox="0 0 200 210" className="w-full h-full max-h-[360px] mx-auto filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] animate-fade-in">
        {renderDefs()}
        {/* Pants legs */}
        <path d="M 70,40 L 130,40 L 135,190 L 112,190 L 100,105 L 88,190 L 65,190 Z" fill={finalBaseFill} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        {/* Waistband */}
        <path d="M 70,40 L 130,40 L 130,52 L 70,52 Z" fill={finalAccentFill} />
        {/* Side cargo pockets */}
        <path d="M 64,95 L 72,95 L 72,125 L 64,125 Z" fill={finalAccentFill} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <path d="M 128,95 L 136,95 L 136,125 L 128,125 Z" fill={finalAccentFill} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      </svg>
    );
  }
  
  // Interactive Beanie layout
  return (
    <svg viewBox="0 0 200 210" className="w-full h-full max-h-[360px] mx-auto filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] animate-fade-in">
      {renderDefs()}
      {/* Beanie main weave body */}
      <path d="M 60,130 C 50,45, 150,45, 140,130 Z" fill={finalBaseFill} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <path d="M 75,130 C 70,65, 130,65, 125,130" stroke="rgba(0,0,0,0.25)" strokeWidth="1" fill="none" />
      <path d="M 90,130 C 85,55, 115,55, 110,130" stroke="rgba(0,0,0,0.25)" strokeWidth="1" fill="none" />
      <path d="M 105,130 C 100,55, 100,55, 95,130" stroke="rgba(0,0,0,0.25)" strokeWidth="1" fill="none" />
      
      {/* Folded Cuff */}
      <rect x="52" y="115" width="96" height="28" rx="4" fill={finalAccentFill} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      {/* Leather patch */}
      <rect x="88" y="122" width="24" height="14" rx="1" fill="#4d3e26" stroke="#c4a465" strokeWidth="0.5" />
      <text x="100" y="131" fill="#c4a465" fontSize="5" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">LVX</text>
    </svg>
  );
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  wishlist,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<"S" | "M" | "L" | "XL">("M");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedHoodColor, setSelectedHoodColor] = useState<string>("");
  const [activeAccordion, setActiveAccordion] = useState<"fabric" | "delivery" | "sizefinder" | null>("fabric");
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Layout Tab for Left Preview: "photography" | "studio"
  const [previewTab, setPreviewTab] = useState<"photography" | "studio">("photography");
  
  // Image gallery slider index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Size finder calculations state
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  // Persistent reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewContent, setNewReviewContent] = useState("");
  const [newReviewFit, setNewReviewFit] = useState<"Runs Small" | "True to Size" | "Runs Large">("True to Size");
  const [newReviewImage, setNewReviewImage] = useState<string>("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Fetch reviews when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize("M");
      setPreviewTab("photography");
      setActiveImageIndex(0);

      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0].name);
        setSelectedHoodColor(product.colors[0].name);
      } else {
        setSelectedColor("");
        setSelectedHoodColor("");
      }

      // Load persistent reviews from local storage
      const storedReviews = localStorage.getItem(`luxevra_reviews_${product.id}`);
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      } else {
        // Initial premium couture reviews mapping
        const defaultReviewsMap: { [key: string]: Review[] } = {
          "oversized-hoodie": [
            {
              id: "rev-h1",
              author: "Aravind K.",
              rating: 5,
              title: "IMPERIAL WEIGHT AND DRAPE",
              content: "The 450 GSM organic cotton loopback has an outstanding structure. It stands upright perfectly on shoulders and the double-layer hood holds its shape beautifully. Adding contrast colors to the hood is incredibly modern.",
              date: "July 12, 2026",
              verified: true,
              fit: "True to Size",
              helpfulCount: 28,
            },
            {
              id: "rev-h2",
              author: "Neha S.",
              rating: 4,
              title: "SUPREMELY SOFT BUT EXTREMELY OVERSIZED",
              content: "The knit is absolutely luxurious and very soft. Keep in mind it has a highly relaxed boxy fit. Sized down to an S for a slightly cleaner, but still slouchy drape. Customized Oatmeal/Black is gorgeous.",
              date: "July 08, 2026",
              verified: true,
              fit: "Runs Large",
              helpfulCount: 19,
            }
          ],
          "signature-tee": [
            {
              id: "rev-t1",
              author: "Rohan M.",
              rating: 5,
              title: "MATTE GOLD EMBOSSING IS INCREDIBLE",
              content: "The raised matte gold pigment across the shoulders is stunning. It has been through 4 wash cycles now and has absolutely zero cracking. The 280 GSM long-staple cotton feels heavy but extremely breathable.",
              date: "June 29, 2026",
              verified: true,
              fit: "True to Size",
              helpfulCount: 22,
            }
          ],
          "cargo-pants": [
            {
              id: "rev-c1",
              author: "Vikram P.",
              rating: 5,
              title: "OUTSTANDING TWILL IMPLEMENTATION",
              content: "The ergonomic knee darts allow perfect mobility while maintaining a highly structured leg. Woven labels and the micro gold monogram are beautifully subtle details. Perfect straight cut.",
              date: "July 14, 2026",
              verified: true,
              fit: "True to Size",
              helpfulCount: 12,
            }
          ]
        };

        const initialReviews = defaultReviewsMap[product.id] || [
          {
            id: "rev-d1",
            author: "Atelier Client",
            rating: 5,
            title: "EXCEPTIONALLY CRAFTED SPECIMEN",
            content: "Outstanding density, beautiful finish, and premium feel. It is rare to find organic loopback with this level of visual and tactile craftsmanship.",
            date: "July 16, 2026",
            verified: true,
            fit: "True to Size",
            helpfulCount: 5,
          }
        ];

        setReviews(initialReviews);
        localStorage.setItem(`luxevra_reviews_${product.id}`, JSON.stringify(initialReviews));
      }
    }
  }, [product]);

  if (!product) return null;

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  // Helper to compile all product images cleanly
  const colorImages = (product.colors || [])
    .map((c) => c.image)
    .filter((img): img is string => !!img);

  const allImages = Array.from(
    new Set([product.image, ...(product.images || []), ...colorImages])
  ).filter(Boolean);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor || undefined, selectedHoodColor || undefined);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2000);
  };

  const handleCalculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || isNaN(w)) return;

    let size = "M";
    if (w < 60) {
      size = "S";
    } else if (w >= 60 && w <= 75) {
      size = "M";
    } else if (w > 75 && w <= 88) {
      size = "L";
    } else {
      size = "XL";
    }

    setRecommendedSize(size);
    setSelectedSize(size as "S" | "M" | "L" | "XL");
  };

  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    // By default, match hood/accent color to main body color
    setSelectedHoodColor(colorName);

    // If this color has a custom image, find its index in allImages and switch to it!
    const foundColor = product.colors?.find((c) => c.name === colorName);
    if (foundColor?.image) {
      const imgIndex = allImages.indexOf(foundColor.image);
      if (imgIndex > -1) {
        setActiveImageIndex(imgIndex);
        setPreviewTab("photography"); // Switch from customizer back to photography if clicked
      }
    }
  };

  // Convert Color Name to Hex Code for SVG Customizer
  const getColorHex = (colorName: string): string => {
    if (!product.colors) return "#c4a465";
    const found = product.colors.find(c => c.name === colorName);
    return found ? found.hex : "#c4a465";
  };

  // Review helper interactions
  const handleHelpfulClick = (reviewId: string) => {
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        return { ...r, helpfulCount: r.helpfulCount + 1 };
      }
      return r;
    });
    setReviews(updated);
    localStorage.setItem(`luxevra_reviews_${product.id}`, JSON.stringify(updated));
  };

  // Review image upload handler
  const handleReviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewReviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Write new review submission
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewTitle || !newReviewContent) return;

    setReviewSubmitting(true);
    setReviewError("");

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: newReviewName,
      rating: newReviewRating,
      title: newReviewTitle.toUpperCase(),
      content: newReviewContent,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }),
      verified: true,
      fit: newReviewFit,
      image: newReviewImage || undefined,
      helpfulCount: 0,
    };

    try {
      const response = await fetch("https://formspree.io/f/mkodragl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          formType: "Product Review",
          productId: product.id,
          productName: product.name,
          authorName: newReview.author,
          rating: newReview.rating,
          reviewTitle: newReview.title,
          reviewContent: newReview.content,
          fitRating: newReview.fit,
          imageUrl: newReview.image || "",
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const updated = [newReview, ...reviews];
        setReviews(updated);
        localStorage.setItem(`luxevra_reviews_${product.id}`, JSON.stringify(updated));

        // Reset Form
        setNewReviewName("");
        setNewReviewRating(5);
        setNewReviewTitle("");
        setNewReviewContent("");
        setNewReviewImage("");
        setNewReviewFit("True to Size");
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewSuccess(false);
          setShowReviewForm(false);
        }, 2000);
      } else {
        setReviewError("COULD NOT DEPOSIT GUEST ENTRY. PLEASE RETRY.");
      }
    } catch (err) {
      console.error("Formspree review submission error:", err);
      setReviewError("CONNECTION ERROR. SYSTEM TIMEOUT.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Average Rating calculation
  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : "5.0";

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-4xl bg-[#0a0a0a] border border-zinc-900 rounded-none relative my-8 shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-gold-mid transition-colors z-20"
          aria-label="Close modal"
          id="detail-modal-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Two-Column split grid */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT COLUMN: ACTIVE VISUAL CONTAINER */}
          <div className="relative aspect-[3/4] md:aspect-auto md:h-[650px] bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between overflow-hidden">
            
            {/* Gallery Tabs (Photography vs Vector Studio) */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button
                onClick={() => setPreviewTab("photography")}
                className={`px-3 py-1 text-[8px] tracking-[0.2em] font-sans font-bold uppercase transition-all ${
                  previewTab === "photography"
                    ? "bg-white text-luxury-black border border-white"
                    : "bg-black/60 backdrop-blur-sm text-zinc-400 border border-zinc-800 hover:text-white"
                }`}
              >
                Photography ({allImages.length})
              </button>
              <button
                onClick={() => setPreviewTab("studio")}
                className={`px-3 py-1 text-[8px] tracking-[0.2em] font-sans font-bold uppercase transition-all flex items-center gap-1.5 ${
                  previewTab === "studio"
                    ? "bg-gold-mid text-luxury-black border border-gold-mid"
                    : "bg-black/60 backdrop-blur-sm text-zinc-400 border border-zinc-800 hover:text-gold-mid"
                }`}
              >
                <Layers className="w-2.5 h-2.5" />
                Atelier Customizer
              </button>
            </div>

            {/* Main view area */}
            <div className="flex-1 w-full h-full flex items-center justify-center relative bg-[#060606]">
              {previewTab === "photography" ? (
                <>
                  <img
                    src={allImages[activeImageIndex]}
                    alt={`${product.name} View ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover object-center scale-100 hover:scale-[1.03] transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Arrow Indicators for photo slider */}
                  {allImages.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-3 flex justify-between items-center pointer-events-none">
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                        className="w-8 h-8 rounded-full bg-black/60 border border-zinc-800/80 text-white flex items-center justify-center hover:bg-gold-mid hover:text-black pointer-events-auto transition-colors"
                        title="Previous Picture"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                        className="w-8 h-8 rounded-full bg-black/60 border border-zinc-800/80 text-white flex items-center justify-center hover:bg-gold-mid hover:text-black pointer-events-auto transition-colors"
                        title="Next Picture"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 w-full h-full flex flex-col justify-center items-center">
                  <CustomGarmentSVG 
                    productId={product.id} 
                    baseColor={getColorHex(selectedColor)} 
                    accentColor={getColorHex(selectedHoodColor)} 
                    baseImage={product.colors?.find(c => c.name === selectedColor)?.image}
                    accentImage={product.colors?.find(c => c.name === selectedHoodColor)?.image}
                  />
                  
                  {/* Spec labels explaining custom values */}
                  <div className="text-center mt-3 select-none">
                    <span className="text-[9px] font-sans tracking-[0.2em] text-gold-light uppercase block font-semibold">
                      ATELIER CONTRAST SELECTION
                    </span>
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase block mt-1">
                      Body: {selectedColor || "Default"} | Contrast Element: {selectedHoodColor || "Default"}
                    </span>
                  </div>
                </div>
              )}

              {/* Corner Watermark */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 border border-zinc-800 text-[8px] tracking-[0.2em] font-sans text-gold-mid uppercase">
                LUXEVRA ATELIER / LAB 24
              </div>
            </div>

            {/* Thumbnail Navigator Row (For Photography Gallery) */}
            {previewTab === "photography" && allImages.length > 1 && (
              <div className="bg-black/90 border-t border-zinc-900 p-3 flex justify-center gap-2">
                {allImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-10 h-12 bg-zinc-900 border overflow-hidden transition-all ${
                      activeImageIndex === index 
                        ? "border-gold-mid ring-1 ring-gold-mid/30 opacity-100 scale-105" 
                        : "border-zinc-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TECHNICAL TEXT DETAILS */}
          <div className="p-6 md:p-8 flex flex-col justify-between md:max-h-[650px] overflow-y-auto bg-[#0a0a0a]">
            <div>
              {/* Category label */}
              <span className="text-[10px] font-sans tracking-[0.25em] text-gold-mid block uppercase font-bold mb-1">
                COUTURE SERIES
              </span>

              {/* Product Header Name */}
              <h1 className="font-serif text-2xl md:text-3xl text-white font-medium tracking-wide uppercase mb-3">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-lg font-mono font-medium text-white">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <span className="text-xs font-mono text-zinc-500 line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-[9px] font-sans tracking-widest border border-zinc-800/80 text-zinc-400 px-2 py-0.5 uppercase">
                  Duties Included
                </span>
              </div>

              {/* Short description */}
              <p className="text-xs text-zinc-400 font-sans font-light tracking-wide leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Sizing Selectors */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-sans tracking-[0.2em] text-zinc-500 uppercase block font-semibold">
                    SELECT SIZE (OVERSIZED FIT)
                  </span>
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === "sizefinder" ? null : "sizefinder")}
                    className="flex items-center gap-1 text-[9px] font-sans tracking-widest text-gold-mid hover:text-gold-light transition-colors uppercase font-bold"
                    id="size-finder-toggle-btn"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>Size Guide / Calculator</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  {(["S", "M", "L", "XL"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 flex items-center justify-center border text-xs font-semibold tracking-widest transition-all rounded-none cursor-pointer ${
                        selectedSize === size
                          ? "border-gold-mid bg-gold-mid text-luxury-black font-bold"
                          : "border-zinc-800 hover:border-zinc-500 text-zinc-300 hover:text-white bg-transparent"
                      }`}
                      aria-label={`Select size ${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <span className="text-[10px] font-sans tracking-[0.2em] text-zinc-500 uppercase block font-semibold mb-2">
                    SELECT BASE COLOR: <span className="text-gold-light font-bold ml-1">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => handleSelectColor(color.name)}
                          className={`flex items-center gap-2 px-3 py-2 border transition-all cursor-pointer rounded-none text-[9px] font-sans tracking-widest uppercase font-medium ${
                            isSelected
                              ? "border-gold-mid bg-zinc-900/60 text-white"
                              : "border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white bg-transparent"
                          }`}
                          title={color.name}
                        >
                          <span 
                            className="w-3 h-3 rounded-full border border-black inline-block" 
                            style={{ backgroundColor: color.hex }}
                          ></span>
                          <span>{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CONTRAST HOOD / ACCENT COLOR CUSTOMIZER */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6 bg-zinc-950/40 p-4 border border-zinc-900/60 rounded-none animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-sans tracking-[0.2em] text-zinc-400 uppercase block font-bold">
                      {product.name.includes("HOODIE") ? "CUSTOM HOOD COLOR" : "CUSTOM ACCENT COLOR"}
                    </span>
                    <span className="text-[7.5px] font-mono tracking-widest text-gold-mid uppercase bg-gold-mid/5 border border-gold-mid/20 px-1.5 py-0.5">
                      {selectedHoodColor === selectedColor ? "MONOCHROME" : "CONTRAST ACTIVE"}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-sans tracking-wide leading-relaxed mb-3">
                    Personalize your specimen. Swap the hood/accent with a contrast color. Selecting a shade auto-activates the Custom Studio.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const isSelected = selectedHoodColor === color.name;
                      return (
                        <button
                          key={`hood-${color.name}`}
                          type="button"
                          onClick={() => {
                            setSelectedHoodColor(color.name);
                            setPreviewTab("studio");
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all cursor-pointer text-[8px] font-sans tracking-widest uppercase font-medium ${
                            isSelected
                              ? "border-gold-mid bg-gold-mid/10 text-white"
                              : "border-zinc-900 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 bg-transparent"
                          }`}
                          title={`Contrast Shade: ${color.name}`}
                        >
                          <span 
                            className="w-2 h-2 rounded-full border border-black inline-block" 
                            style={{ backgroundColor: color.hex }}
                          ></span>
                          <span>{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic size finder calculator */}
              {activeAccordion === "sizefinder" && (
                <div className="mb-6 p-4 bg-zinc-950 border border-zinc-900 animate-slide-down">
                  <span className="text-[9px] font-sans tracking-[0.2em] text-gold-mid block uppercase font-bold mb-2">
                    ATELIER SIZING CALCULATOR
                  </span>
                  <p className="text-[10px] text-zinc-500 font-sans leading-relaxed mb-3">
                    Enter your dimensions for an immediate recommendation based on our heavyweight relaxed drapes.
                  </p>

                  <form onSubmit={handleCalculateSize} className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-[8px] text-zinc-500 tracking-widest font-sans block mb-1 uppercase">HEIGHT (CM)</label>
                      <input
                        type="number"
                        placeholder="e.g. 175"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-xs text-luxury-cream p-2 focus:outline-none focus:border-gold-mid tracking-widest"
                        required
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="text-[8px] text-zinc-500 tracking-widest font-sans block mb-1 uppercase">WEIGHT (KG)</label>
                      <input
                        type="number"
                        placeholder="e.g. 68"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-xs text-luxury-cream p-2 focus:outline-none focus:border-gold-mid tracking-widest"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto bg-zinc-850 hover:bg-gold-mid hover:text-luxury-black text-white text-[9px] tracking-widest font-semibold py-2.5 px-4 transition-all uppercase rounded-none cursor-pointer border border-zinc-800"
                    >
                      Calculate
                    </button>
                  </form>

                  {recommendedSize && (
                    <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 font-sans">RECOMMENDED FIT:</span>
                      <span className="text-xs text-gold-light font-sans font-bold tracking-widest">
                        SIZE {recommendedSize} (BOXEY DRAPE)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Accordions Details */}
              <div className="border-t border-zinc-900 pt-3 mt-4 space-y-2">
                {/* Accordion 1: Fabric & Craft */}
                <div className="border-b border-zinc-900/40 pb-2">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === "fabric" ? null : "fabric")}
                    className="flex items-center justify-between w-full text-left text-xs font-sans tracking-[0.15em] text-zinc-300 hover:text-gold-light uppercase py-1"
                  >
                    <span>Fabrication & Specs</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeAccordion === "fabric" ? "rotate-90 text-gold-mid" : "text-zinc-600"}`} />
                  </button>
                  {activeAccordion === "fabric" && (
                    <div className="pt-2 pl-1 space-y-2 text-[11px] text-zinc-500 font-sans tracking-wide leading-relaxed">
                      <p>
                        <strong>Weight:</strong> {product.specs?.weight || "Heavyweight Cotton"}
                      </p>
                      <p>
                        <strong>Composition:</strong> {product.specs?.composition || "100% Cotton"}
                      </p>
                      <p>
                        <strong>Fit Style:</strong> {product.specs?.fit || "Relaxed / Oversized drape"}
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-zinc-600 pt-1">
                        {product.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Courier & Returns */}
                <div className="border-b border-zinc-900/40 pb-2">
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === "delivery" ? null : "delivery")}
                    className="flex items-center justify-between w-full text-left text-xs font-sans tracking-[0.15em] text-zinc-300 hover:text-gold-light uppercase py-1"
                  >
                    <span>Complementary Dispatch</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeAccordion === "delivery" ? "rotate-90 text-gold-mid" : "text-zinc-600"}`} />
                  </button>
                  {activeAccordion === "delivery" && (
                    <div className="pt-2 pl-1 text-[11px] text-zinc-500 font-sans tracking-wide space-y-1.5">
                      <p className="flex items-center gap-2"><Truck className="w-3.5 h-3.5 text-gold-mid shrink-0" /> Free DHL Shipping over ₹4,999</p>
                      <p><strong>Dispatch:</strong> Same day from our regional atelier</p>
                      <p><strong>Courier:</strong> Delivered within 2-4 business days</p>
                      <p><strong>Returns:</strong> 14-day premium collection service</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Add button / Wishlist */}
            <div className="mt-8 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row gap-3 items-stretch">
              <button
                onClick={handleAddToCart}
                disabled={addedSuccess}
                className={`flex-1 text-xs font-sans font-bold tracking-[0.25em] py-4 transition-all duration-300 flex items-center justify-center gap-3 uppercase rounded-none cursor-pointer ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-[#F5F2EC] hover:bg-white text-luxury-black hover:scale-[1.01]"
                }`}
                aria-label="Add to cart"
                id="modal-add-to-cart-btn"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>ADDED TO COUTURE BAG</span>
                  </>
                ) : (
                  <>
                    <span>ADD TO COUTURE BAG</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onToggleWishlist(product)}
                className={`px-4 border flex items-center justify-center hover:scale-[1.01] transition-all rounded-none cursor-pointer ${
                  isWishlisted
                    ? "border-gold-mid text-gold-mid bg-gold-mid/5"
                    : "border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white bg-transparent"
                }`}
                aria-label="Toggle wishlist"
                id="modal-wishlist-toggle-btn"
              >
                <Heart className={`w-[18px] h-[18px] ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM FULL-WIDTH COUTURE GUESTBOOK & REVIEW SYSTEM */}
        <div className="border-t border-zinc-900 bg-[#060606] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-6 mb-6 gap-4">
            <div>
              <span className="text-[10px] font-sans tracking-[0.25em] text-gold-mid block uppercase font-bold mb-1">
                COUTURE GUESTBOOK
              </span>
              <h2 className="font-serif text-lg md:text-xl text-white font-medium tracking-wide uppercase">
                CLIENT CONVERSATIONS & REVIEWS
              </h2>
            </div>
            
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-transparent hover:bg-white/5 border border-zinc-850 hover:border-zinc-600 text-gold-mid hover:text-gold-light text-[9px] tracking-widest font-sans uppercase font-bold transition-all rounded-none self-start md:self-auto cursor-pointer"
            >
              {showReviewForm ? "CLOSE GUEST FORM" : "WRITE A GUEST REVIEW"}
            </button>
          </div>

          {/* Sizing, Stars and stats breakdown banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#090909] border border-zinc-950 p-6 mb-8 text-zinc-300">
            <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-zinc-900 pb-4 md:pb-0 md:pr-6">
              <span className="text-3xl font-mono text-white font-bold block mb-1">{avgRating} / 5.0</span>
              <div className="flex justify-center md:justify-start gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(parseFloat(avgRating)) 
                        ? "text-gold-mid fill-gold-mid" 
                        : "text-zinc-800"
                    }`} 
                  />
                ))}
              </div>
              <span className="text-[8.5px] font-sans tracking-widest text-zinc-500 uppercase block">
                BASED ON {totalReviewsCount} VERIFIED CLIENT REVIEWS
              </span>
            </div>

            {/* Sizing Fit breakdown */}
            <div className="md:col-span-8 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[8px] font-sans tracking-widest text-zinc-500 block uppercase mb-1">RUNS SMALL</span>
                <div className="h-1 bg-zinc-900 w-full relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-gold-mid/40" style={{ width: "10%" }}></div>
                </div>
                <span className="text-[9px] font-mono font-semibold text-zinc-400 mt-1 block">10%</span>
              </div>
              <div>
                <span className="text-[8px] font-sans tracking-widest text-gold-mid block uppercase mb-1">TRUE TO SIZE</span>
                <div className="h-1 bg-zinc-900 w-full relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-gold-mid" style={{ width: "80%" }}></div>
                </div>
                <span className="text-[9px] font-mono font-semibold text-gold-light mt-1 block">80%</span>
              </div>
              <div>
                <span className="text-[8px] font-sans tracking-widest text-zinc-500 block uppercase mb-1">RUNS LARGE</span>
                <div className="h-1 bg-zinc-900 w-full relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-gold-mid/40" style={{ width: "10%" }}></div>
                </div>
                <span className="text-[9px] font-mono font-semibold text-zinc-400 mt-1 block">10%</span>
              </div>
            </div>
          </div>

          {/* Write a Review Drawer form */}
          {showReviewForm && (
            <form onSubmit={handleAddReview} className="mb-8 p-6 bg-zinc-950 border border-zinc-900 animate-slide-down">
              <span className="text-[9px] font-sans tracking-[0.2em] text-gold-mid block uppercase font-bold mb-4">
                ENTER ATELIER GUEST LOG
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">YOUR COUTURE NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. MARCUS A."
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    disabled={reviewSubmitting}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-luxury-cream p-2.5 focus:outline-none focus:border-gold-mid tracking-widest uppercase rounded-none font-medium disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">GUESTBOOK LOG TITLE</label>
                  <input
                    type="text"
                    placeholder="e.g. EXCEPTIONAL SEAMLESS FIT"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    disabled={reviewSubmitting}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-luxury-cream p-2.5 focus:outline-none focus:border-gold-mid tracking-widest uppercase rounded-none font-medium disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              {/* Rating + Fit Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1.5 uppercase font-semibold">RATING STARS</label>
                  <div className="flex gap-1.5 items-center h-[38px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => !reviewSubmitting && setNewReviewRating(star)}
                        disabled={reviewSubmitting}
                        className="text-zinc-600 hover:text-gold-light hover:scale-110 transition-all cursor-pointer disabled:opacity-50"
                        title={`${star} Stars`}
                      >
                        <Star className={`w-5 h-5 ${star <= newReviewRating ? "text-gold-mid fill-gold-mid" : ""}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">SIZE FIT ESTIMATE</label>
                  <select
                    value={newReviewFit}
                    onChange={(e) => setNewReviewFit(e.target.value as any)}
                    disabled={reviewSubmitting}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-luxury-cream p-2.5 h-[38px] focus:outline-none focus:border-gold-mid tracking-widest uppercase rounded-none font-medium disabled:opacity-50"
                  >
                    <option value="Runs Small">RUNS SMALL</option>
                    <option value="True to Size">TRUE TO SIZE</option>
                    <option value="Runs Large">RUNS LARGE</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">ATTACH SPECIMEN PICTURE (OPTIONAL)</label>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 h-[38px] relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReviewImageChange}
                      disabled={reviewSubmitting}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {newReviewImage ? (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-4 h-4" />
                        <span className="text-[8px] tracking-widest font-sans font-bold uppercase">ATTACHMENT LOCKED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Camera className="w-4 h-4" />
                        <span className="text-[8px] tracking-widest font-sans uppercase">BROWSE SPECIMEN FILE</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Text Body */}
              <div className="mb-5">
                <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">YOUR COUTURE COMMENTS</label>
                <textarea
                  placeholder="Share details of the fabric weave, weight, fit, drape, and overall silhouette."
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                  disabled={reviewSubmitting}
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-luxury-cream p-2.5 focus:outline-none focus:border-gold-mid tracking-wide rounded-none leading-relaxed disabled:opacity-50"
                  required
                ></textarea>
              </div>

              {reviewSuccess ? (
                <div className="bg-emerald-600/15 border border-emerald-500/30 p-3 text-center text-emerald-400 text-[10px] tracking-widest font-sans uppercase font-bold animate-pulse">
                  GUESTBOOK LOGGED IN ATELIER ARCHIVES
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full bg-[#F5F2EC] hover:bg-gold-light text-luxury-black font-sans font-bold text-xs tracking-[0.25em] py-3.5 transition-all uppercase rounded-none cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitting ? "TRANSMITTING SIGNATURES..." : "COMMIT GUEST REVIEW"}
                  </button>
                  {reviewError && (
                    <span className="text-[9px] text-red-500 tracking-wider block font-semibold text-center uppercase">
                      ⚠️ {reviewError}
                    </span>
                  )}
                </div>
              )}
            </form>
          )}

          {/* List of Reviews */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-zinc-600">
                <span className="text-[10px] font-sans tracking-[0.2em] uppercase">NO CURRENT GUEST LOGS SPECIFIED</span>
              </div>
            ) : (
              reviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="border-b border-zinc-900 pb-6 last:border-b-0 animate-fade-in"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-2.5">
                    <div>
                      {/* Name with buyer validation */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans font-bold text-[10px] tracking-widest text-white uppercase">
                          {rev.author}
                        </span>
                        {rev.verified && (
                          <span className="text-[7.5px] font-sans tracking-widest text-gold-mid font-bold uppercase border border-gold-mid/30 bg-gold-mid/5 px-1.5 py-0.5 select-none">
                            VERIFIED BUYER
                          </span>
                        )}
                      </div>

                      {/* Stars count */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-2.5 h-2.5 ${
                              s <= rev.rating 
                                ? "text-gold-mid fill-gold-mid" 
                                : "text-zinc-800"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                    <span className="text-[9px] font-mono text-zinc-500 font-medium">
                      {rev.date}
                    </span>
                  </div>

                  {/* Review Title */}
                  <h4 className="text-[10.5px] font-sans font-bold tracking-wider text-luxury-cream uppercase mb-2">
                    {rev.title}
                  </h4>

                  {/* Review Content */}
                  <p className="text-xs text-zinc-400 font-sans tracking-wide leading-relaxed mb-3.5">
                    {rev.content}
                  </p>

                  {/* Attachment if present */}
                  {rev.image && (
                    <div className="mb-3.5 p-1 bg-zinc-950 border border-zinc-900 inline-block">
                      <img 
                        src={rev.image} 
                        alt="User review attachment" 
                        className="max-w-[140px] max-h-[140px] object-cover object-center bg-zinc-900 hover:scale-105 transition-all duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Metadata and helpful feedback */}
                  <div className="flex items-center justify-between text-[9px] font-sans tracking-widest text-zinc-500 uppercase">
                    <span className="bg-zinc-950 px-2 py-0.5 border border-zinc-900 font-medium">
                      FIT ESTIMATED: <span className="text-white font-bold ml-0.5">{rev.fit.toUpperCase()}</span>
                    </span>

                    <button
                      onClick={() => handleHelpfulClick(rev.id)}
                      className="flex items-center gap-1 hover:text-gold-mid transition-all font-bold cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3 shrink-0" />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
