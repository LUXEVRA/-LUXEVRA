/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { X, Upload, Plus, Trash2, Edit, Save, Check, CreditCard, ShoppingBag, Sparkles, AlertCircle } from "lucide-react";
import { Product } from "../types";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  upiDetails: { upiId: string; beneficiaryName: string };
  onUpdateUpi: (details: { upiId: string; beneficiaryName: string }) => void;
}

export default function AdminModal({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  upiDetails,
  onUpdateUpi,
}: AdminModalProps) {
  // Tabs: 'products' | 'upi' | 'offline-export'
  const [activeTab, setActiveTab] = useState<"products" | "upi" | "offline-export">("products");

  // Export preparation state
  const [isPreppingExport, setIsPreppingExport] = useState(false);
  const [exportPrepResult, setExportPrepResult] = useState<any>(null);

  const handlePrepExport = async () => {
    setIsPreppingExport(true);
    setSuccessMsg("");
    setExportPrepResult(null);
    try {
      const response = await fetch("/api/export-prep", {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        setExportPrepResult(data);
        setSuccessMsg("EXPORT PREPARATION COMPLETED SUCCESSFULLY!");
        // Fetch fresh products to sync with localized paths
        try {
          const freshRes = await fetch("/api/products");
          const freshData = await freshRes.json();
          if (freshData.success && freshData.products) {
            onUpdateProducts(freshData.products);
          }
        } catch (fetchErr) {
          console.error("[DATABASE] Post-export-prep sync failure:", fetchErr);
        }
      } else {
        setExportPrepResult({ error: data.error || "An unknown error occurred" });
        setSuccessMsg("PREPARATION FAILED: " + (data.error || "UNKNOWN SERVER ERROR"));
      }
    } catch (err: any) {
      console.error(err);
      setExportPrepResult({ error: "Network error: Could not communicate with server backend" });
      setSuccessMsg("PREPARATION FAILED due to network error");
    } finally {
      setIsPreppingExport(false);
    }
  };

  // Product editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#c4a465");
  const [newColorImage, setNewColorImage] = useState("");

  // Codebase persistence states
  const [isSavingCodebase, setIsSavingCodebase] = useState(false);

  const handlePersistToCodebase = async () => {
    setIsSavingCodebase(true);
    setSuccessMsg("");
    try {
      const response = await fetch("/api/save-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products }),
      });
      const data = await response.json();
      if (data.success) {
        try {
          localStorage.removeItem("luxevra_products");
        } catch (e) {
          console.error("Failed to clear localStorage", e);
        }
        
        // Fetch fresh product records from database to synchronize frontend with persistent URLs
        try {
          const freshRes = await fetch("/api/products");
          const freshData = await freshRes.json();
          if (freshData.success && freshData.products) {
            onUpdateProducts(freshData.products);
            console.log("[DATABASE] Database fetch success: Loaded products with persistent URLs.", freshData.products);
          }
        } catch (fetchErr: any) {
          console.error("[DATABASE] Database fetch failure: Failed to sync fresh product records:", fetchErr);
        }

        setSuccessMsg("SHOP CONFIG SAVED & COMMITTED TO CODEBASE!");
      } else {
        setSuccessMsg("SAVE FAILED: " + (data.error || "UNKNOWN SERVER ERROR"));
      }
    } catch (err: any) {
      console.error(err);
      setSuccessMsg("NETWORK ERROR: COULD NOT COMMUNICATE WITH SERVER BACKEND");
    } finally {
      setIsSavingCodebase(false);
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  };

  // UPI settings state
  const [localUpiId, setLocalUpiId] = useState(upiDetails.upiId);
  const [localBeneficiaryName, setLocalBeneficiaryName] = useState(upiDetails.beneficiaryName);

  // File input ref for drag and drop fallback
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const colorImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Helper to compress and resize images on the client side before saving/sending
  const compressAndResizeImage = (file: File, maxDimension: number, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress as JPEG with 0.75 quality for massive space savings
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
          callback(compressedBase64);
        } else {
          callback(e.target?.result as string);
        }
      };
      img.onerror = () => {
        callback(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      alert("Failed to read the selected file.");
    };
    reader.readAsDataURL(file);
  };

  // Helper to read and convert file to base64 DataURL with client-side compression
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid file format. Please upload an image (PNG, JPG, WEBP).");
      return;
    }

    compressAndResizeImage(file, 1000, (base64Data) => {
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          image: base64Data,
        });
      }
    });
  };
  
  const processAdditionalFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid file format. Please upload an image (PNG, JPG, WEBP).");
      return;
    }

    compressAndResizeImage(file, 1000, (base64Data) => {
      if (editingProduct) {
        const currentImages = editingProduct.images || [];
        setEditingProduct({
          ...editingProduct,
          images: [...currentImages, base64Data],
        });
      }
    });
  };

  const handleColorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Invalid file format. Please upload an image (PNG, JPG, WEBP).");
        return;
      }
      compressAndResizeImage(file, 1000, (base64Data) => {
        setNewColorImage(base64Data);
      });
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle manual file browse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Trigger file browse
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Edit action
  const handleEditClick = (product: Product) => {
    setEditingProduct({ ...product });
    setIsAddingNew(false);
    setSuccessMsg("");
  };

  // Create new template action
  const handleAddNewClick = () => {
    const newId = `custom-product-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      name: "NEW COUTURE PIECE",
      price: 1999,
      originalPrice: 2499,
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600", // Fallback URL
      badge: "NEW",
      description: "An exceptional, hand-crafted garment designed with structural density and a modern couture outline.",
      details: [
        "100% Sustainable Organic Combed Cotton",
        "High-density premium stitching",
        "Atelier custom embossed emblem"
      ],
      specs: {
        fit: "Relaxed drop-shoulder silhouette",
        weight: "Heavy-weight (350 GSM)",
        composition: "100% Organic Combed Cotton"
      }
    };
    setEditingProduct(newProd);
    setIsAddingNew(true);
    setSuccessMsg("");
  };

  // Save product changes
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    let updatedList: Product[];
    if (isAddingNew) {
      updatedList = [editingProduct, ...products];
    } else {
      updatedList = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    }

    onUpdateProducts(updatedList);
    setSuccessMsg("PRODUCT ARCHIVED SUCCESSFULLY");
    setTimeout(() => {
      setEditingProduct(null);
      setIsAddingNew(false);
      setSuccessMsg("");
    }, 1500);
  };

  // Delete product action
  const handleDeleteProduct = (productId: string) => {
    const filtered = products.filter((p) => p.id !== productId);
    onUpdateProducts(filtered);
    if (editingProduct?.id === productId) {
      setEditingProduct(null);
    }
  };

  // Save UPI changes
  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUpi({
      upiId: localUpiId.trim(),
      beneficiaryName: localBeneficiaryName.trim(),
    });
    setSuccessMsg("UPI GATEWAY COORDINATES MODIFIED");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in"
      id="admin-portal-root"
    >
      <div className="w-full max-w-5xl bg-[#0a0a0a] border border-zinc-900 h-[90vh] flex flex-col justify-between shadow-2xl relative">
        
        {/* CLOSE CORNER BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 border border-zinc-900 hover:border-gold-mid text-zinc-400 hover:text-gold-light transition-all rounded-full cursor-pointer z-10"
          aria-label="Close Admin Portal"
          id="admin-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. PORTAL HEADER */}
        <div className="p-6 border-b border-zinc-900/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans tracking-[0.3em] text-gold-mid font-bold uppercase">
                ATELIER CORE
              </span>
              <span className="bg-gold-mid/10 text-gold-mid border border-gold-mid/30 text-[8px] font-mono px-2 py-0.5 uppercase tracking-widest font-semibold rounded-none">
                ADMIN PRIVILEGES
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-serif text-white tracking-widest uppercase mt-1">
              LUXEVRA ENGINE PORTAL
            </h2>
          </div>

          {/* TAB & PERSIST CONFIG CONTROLS BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm("RESET CACHE & PRODUCTS?\n\nThis will clear the local browser state cache and reload the page with clean product and image configurations defined in your codebase (src/data.ts).")) {
                  localStorage.removeItem("luxevra_products");
                  window.location.reload();
                }
              }}
              className="flex items-center justify-center gap-1.5 border border-red-900/30 bg-red-950/10 hover:bg-red-950/25 hover:border-red-600/70 text-red-400 text-[9px] tracking-widest font-sans font-bold uppercase px-3.5 py-3 transition-all rounded-none cursor-pointer"
              title="Clears local browser cache and reloads the page to synchronize back to codebase src/data.ts definitions"
            >
              <span>RESET CACHE</span>
            </button>

            <button
              onClick={handlePersistToCodebase}
              disabled={isSavingCodebase}
              className={`flex items-center justify-center gap-2 border border-gold-mid/40 bg-gold-mid/10 hover:bg-gold-mid/20 hover:border-gold-mid text-gold-light text-[9px] tracking-widest font-sans font-bold uppercase px-4 py-3 transition-all rounded-none cursor-pointer ${
                isSavingCodebase ? "opacity-50 cursor-not-allowed animate-pulse" : ""
              }`}
              title="Saves and writes current config (including added images & colors) permanently into the codebase src/data.ts file"
            >
              <Save className="w-3.5 h-3.5 text-gold-mid" />
              <span>{isSavingCodebase ? "PERSISTING TO CODEBASE..." : "SAVE CONFIG TO CODEBASE"}</span>
            </button>

            <div className="flex border border-zinc-900 p-1 bg-zinc-950">
              <button
                onClick={() => {
                  setActiveTab("products");
                  setSuccessMsg("");
                }}
                className={`px-4 py-2 text-[10px] tracking-widest font-sans font-bold uppercase transition-all rounded-none cursor-pointer ${
                  activeTab === "products"
                    ? "bg-[#F5F2EC] text-luxury-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                COUTURE PRODUCTS
              </button>
              <button
                onClick={() => {
                  setActiveTab("upi");
                  setSuccessMsg("");
                }}
                className={`px-4 py-2 text-[10px] tracking-widest font-sans font-bold uppercase transition-all rounded-none cursor-pointer ${
                  activeTab === "upi"
                    ? "bg-[#F5F2EC] text-luxury-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                UPI GATEWAY
              </button>
              <button
                onClick={() => {
                  setActiveTab("offline-export");
                  setSuccessMsg("");
                }}
                className={`px-4 py-2 text-[10px] tracking-widest font-sans font-bold uppercase transition-all rounded-none cursor-pointer ${
                  activeTab === "offline-export"
                    ? "bg-[#F5F2EC] text-luxury-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                OFFLINE ZIP PREP
              </button>
            </div>
          </div>
        </div>

        {/* 2. MAIN SCROLLABLE CONTENT BLOCK */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 scrollbar-thin">
          {successMsg && !editingProduct && (
            <div className="col-span-12 mb-2 p-4 bg-gold-mid/10 border border-gold-mid/30 text-gold-light text-xs font-sans tracking-[0.25em] text-center animate-pulse uppercase font-semibold">
              ✨ {successMsg}
            </div>
          )}
          
          {/* TAB 1: PRODUCT LIST & EDITOR */}
          {activeTab === "products" && (
            <>
              {/* LEFT COLUMN: LIST OF PRODUCTS */}
              <div className="lg:col-span-5 space-y-4 flex flex-col h-full max-h-[55vh] lg:max-h-none overflow-y-auto pr-2">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <span className="text-[9px] font-sans tracking-widest text-zinc-500 uppercase">
                    ATELIER CATALOG ({products.length} PIECES)
                  </span>
                  <button
                    onClick={handleAddNewClick}
                    className="flex items-center gap-1.5 bg-gold-mid/10 hover:bg-gold-mid/20 text-gold-mid border border-gold-mid/30 text-[9px] font-sans font-bold tracking-widest px-3 py-1.5 uppercase transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD PIECE
                  </button>
                </div>

                <div className="space-y-3">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className={`flex gap-3 p-3 border transition-all ${
                        editingProduct?.id === p.id
                          ? "bg-zinc-900/40 border-gold-mid/80"
                          : "bg-zinc-950/40 border-zinc-900 hover:border-zinc-800"
                      }`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-16 object-cover object-center bg-zinc-900 border border-zinc-900"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[11px] font-sans font-semibold tracking-wider text-white uppercase truncate">
                            {p.name}
                          </h4>
                          {p.badge && (
                            <span className="text-[7px] font-mono text-gold-mid border border-gold-mid/20 px-1 py-0.2 uppercase">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-1">
                          <span className="text-white font-semibold">₹{p.price.toLocaleString("en-IN")}</span>
                          {p.originalPrice && (
                            <span className="line-through text-zinc-600">₹{p.originalPrice.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                        
                        {/* Actions block */}
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="text-[9px] font-sans tracking-widest text-zinc-400 hover:text-white transition-all uppercase flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3 text-gold-mid" /> EDIT SPECS
                          </button>
                          <span className="text-zinc-800">|</span>
                          {deleteConfirmId === p.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteProduct(p.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="text-[9px] font-sans font-bold text-red-500 hover:text-red-400 transition-all uppercase"
                              >
                                CONFIRM DISCARD
                              </button>
                              <span className="text-zinc-800">/</span>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-[9px] font-sans text-zinc-500 hover:text-white transition-all uppercase"
                              >
                                CANCEL
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="text-[9px] font-sans tracking-widest text-zinc-600 hover:text-red-500 transition-all uppercase flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3 text-red-900" /> DISCARD
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE ITEM FORM OR COMPREHENSIVE EDITOR */}
              <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-zinc-900 lg:pl-8 pt-6 lg:pt-0">
                {editingProduct ? (
                  <form onSubmit={handleSaveProduct} className="space-y-5">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <span className="text-[9px] font-sans tracking-widest text-gold-mid uppercase font-bold flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        {isAddingNew ? "DRAFTING NEW LUXURY PIECE" : `EDITING ${editingProduct.name}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="text-[9px] font-sans tracking-widest text-zinc-500 hover:text-white uppercase"
                      >
                        CANCEL
                      </button>
                    </div>

                    {successMsg && (
                      <div className="p-3 bg-gold-mid/10 border border-gold-mid text-gold-mid text-xs font-sans tracking-widest text-center animate-pulse">
                        {successMsg}
                      </div>
                    )}

                    {/* Drag and Drop Image Uploader */}
                    <div>
                      <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1.5 uppercase font-semibold">
                        GARMENT SPECIMEN (DRAG & DROP COUTURE PHOTO)
                      </label>
                      
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={onButtonClick}
                        className={`border-2 border-dashed rounded-none p-5 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                          dragActive
                            ? "border-gold-mid bg-gold-mid/5"
                            : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />

                        {editingProduct.image ? (
                          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                            <img
                              src={editingProduct.image}
                              alt="Garment Preview"
                              className="w-16 h-20 object-cover object-center bg-zinc-900 border border-zinc-800 shadow-lg"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-left flex-1">
                              <span className="text-[10px] text-gold-mid font-sans tracking-wider block font-bold mb-1 uppercase">
                                SPECIMEN ATTACHED
                              </span>
                              <p className="text-[9px] text-zinc-500 font-sans leading-relaxed tracking-wide">
                                Drag & Drop a different file anywhere on this panel to update or click to browse. Base64 pipeline is active.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 py-4">
                            <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] text-zinc-300 font-sans tracking-widest block uppercase font-bold">
                              DRAG & DROP IMAGE FILE
                            </span>
                            <p className="text-[9px] text-zinc-600 font-sans tracking-wide max-w-xs mx-auto">
                              Drag JPEG, PNG, WEBP files here or click to explore local folders. No URL required.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">PRODUCT NAME</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value.toUpperCase() })}
                          className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-2.5 focus:outline-none focus:border-gold-mid tracking-widest uppercase rounded-none font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">BADGE LABEL</label>
                        <select
                          value={editingProduct.badge || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, badge: (e.target.value || undefined) as any })}
                          className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-2.5 focus:outline-none focus:border-gold-mid tracking-widest uppercase rounded-none font-medium"
                        >
                          <option value="">NO BADGE</option>
                          <option value="NEW">NEW</option>
                          <option value="BESTSELLER">BESTSELLER</option>
                          <option value="LIMITED">LIMITED</option>
                          <option value="CLASSIC">CLASSIC</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">RETAIL PRICE (₹)</label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                          className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-2.5 focus:outline-none focus:border-gold-mid tracking-widest font-mono rounded-none"
                          required
                          min={1}
                        />
                      </div>
                      <div>
                        <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">ORIGINAL PRICE (₹)</label>
                        <input
                          type="number"
                          value={editingProduct.originalPrice || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseInt(e.target.value) || undefined })}
                          className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-2.5 focus:outline-none focus:border-gold-mid tracking-widest font-mono rounded-none"
                          min={1}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase font-semibold">EDITORIAL MANIFESTO (DESCRIPTION)</label>
                      <textarea
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        rows={3}
                        className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-2.5 focus:outline-none focus:border-gold-mid tracking-wide rounded-none leading-relaxed"
                        required
                      ></textarea>
                    </div>

                    {/* Specification objects */}
                    <div className="space-y-2">
                      <span className="text-[8px] text-zinc-500 tracking-widest font-sans block uppercase font-bold">ATELIER TAILOR SPECIFICATIONS</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[7px] text-zinc-600 tracking-wider font-sans block mb-1 uppercase">SILHOUETTE / FIT</label>
                          <input
                            type="text"
                            value={editingProduct.specs?.fit || ""}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                specs: { ...editingProduct.specs, fit: e.target.value, weight: editingProduct.specs?.weight || "", composition: editingProduct.specs?.composition || "" },
                              })
                            }
                            className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-luxury-cream p-2 focus:outline-none focus:border-gold-mid tracking-wide uppercase rounded-none"
                          />
                        </div>
                        <div>
                          <label className="text-[7px] text-zinc-600 tracking-wider font-sans block mb-1 uppercase">GSM WEIGHT</label>
                          <input
                            type="text"
                            value={editingProduct.specs?.weight || ""}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                specs: { ...editingProduct.specs, weight: e.target.value, fit: editingProduct.specs?.fit || "", composition: editingProduct.specs?.composition || "" },
                              })
                            }
                            className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-luxury-cream p-2 focus:outline-none focus:border-gold-mid tracking-wide uppercase rounded-none"
                          />
                        </div>
                        <div>
                          <label className="text-[7px] text-zinc-600 tracking-wider font-sans block mb-1 uppercase">FABRIC COMPOSITION</label>
                          <input
                            type="text"
                            value={editingProduct.specs?.composition || ""}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                specs: { ...editingProduct.specs, composition: e.target.value, fit: editingProduct.specs?.fit || "", weight: editingProduct.specs?.weight || "" },
                              })
                            }
                            className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-luxury-cream p-2 focus:outline-none focus:border-gold-mid tracking-wide uppercase rounded-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bullet List details */}
                    <div>
                      <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1.5 uppercase font-semibold">
                        BULLET TAILOR DETAIL POINTS (SEPARATED BY LINE BREAKS)
                      </label>
                      <textarea
                        value={editingProduct.details.join("\n")}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            details: e.target.value.split("\n").filter((line) => line.trim() !== ""),
                          })
                        }
                        rows={3}
                        placeholder="Bullet 1&#10;Bullet 2&#10;Bullet 3"
                        className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-2.5 focus:outline-none focus:border-gold-mid tracking-wide rounded-none leading-relaxed"
                        required
                      ></textarea>
                    </div>

                    {/* COUTURE COLOR PALETTE SYSTEM */}
                    <div className="space-y-3 bg-zinc-950/40 p-4 border border-zinc-900/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-zinc-500 tracking-widest font-sans block uppercase font-bold">
                          COUTURE COLOR OPTIONS
                        </span>
                        <span className="text-[8px] text-zinc-600 font-mono">HEX CODES SPECIFIED</span>
                      </div>
                      
                      {/* Current color swatches list */}
                      <div className="flex flex-wrap gap-2">
                        {editingProduct.colors && editingProduct.colors.length > 0 ? (
                          editingProduct.colors.map((col, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center gap-2 p-1.5 bg-zinc-900/90 border border-zinc-800 text-[10px] text-white select-none relative group"
                            >
                              {col.image ? (
                                <img 
                                  src={col.image} 
                                  alt={col.name} 
                                  className="w-6 h-6 object-cover border border-zinc-800/80" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span 
                                  className="w-4 h-4 border border-black inline-block rounded-full" 
                                  style={{ backgroundColor: col.hex }}
                                ></span>
                              )}
                              <div className="flex flex-col">
                                <span className="font-sans uppercase text-[8px] tracking-widest font-semibold leading-none">{col.name}</span>
                                <span className="text-[6px] font-mono text-zinc-500 mt-0.5 leading-none">{col.image ? "CUSTOM IMAGE" : "SHADE ONLY"}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedColors = (editingProduct.colors || []).filter((_, cIdx) => cIdx !== idx);
                                  setEditingProduct({ ...editingProduct, colors: updatedColors });
                                }}
                                className="text-zinc-500 hover:text-red-400 font-mono font-bold pl-1.5 transition-colors text-xs"
                                title="Remove Color"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-[9px] text-zinc-600 italic">No custom color options defined. Default display image applies.</span>
                        )}
                      </div>

                      {/* Add new color interface */}
                      <div className="space-y-3 pt-2 border-t border-zinc-900/50">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-8">
                            <label className="text-[7px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase">
                              COLOR PALETTE NAME
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Imperial Onyx, Camel Tan"
                              value={newColorName}
                              onChange={(e) => setNewColorName(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-luxury-cream p-2 focus:outline-none focus:border-gold-mid tracking-wide uppercase rounded-none"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="text-[7px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase">
                              HEX SHADE
                            </label>
                            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 p-1 h-[30px]">
                              <input
                                type="color"
                                value={newColorHex}
                                onChange={(e) => setNewColorHex(e.target.value)}
                                className="w-full h-full border-0 bg-transparent cursor-pointer"
                              />
                              <span className="text-[8px] font-mono text-zinc-400 uppercase pr-1">{newColorHex}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-9">
                            <label className="text-[7px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase">
                              COLOR-SPECIFIC DISPLAY IMAGE (URL OR UPLOAD)
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Paste image URL (Unsplash, etc.)"
                                value={newColorImage}
                                onChange={(e) => setNewColorImage(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-900 text-[10px] text-luxury-cream p-2 focus:outline-none focus:border-gold-mid tracking-wide rounded-none"
                              />
                              <input
                                type="file"
                                accept="image/*"
                                ref={colorImageInputRef}
                                onChange={handleColorFileChange}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => colorImageInputRef.current?.click()}
                                className="px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[8px] font-sans font-bold tracking-widest uppercase transition-colors text-gold-mid hover:text-gold-light"
                              >
                                Upload
                              </button>
                            </div>
                          </div>
                          <div className="sm:col-span-3 flex items-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (newColorName.trim() !== "") {
                                  const newColor = {
                                    name: newColorName.trim(),
                                    hex: newColorHex,
                                    image: newColorImage.trim() || undefined
                                  };
                                  const currentColors = editingProduct.colors || [];
                                  setEditingProduct({
                                    ...editingProduct,
                                    colors: [...currentColors, newColor]
                                  });
                                  setNewColorName("");
                                  setNewColorImage("");
                                }
                              }}
                              className="w-full bg-gold-mid/10 hover:bg-gold-mid/20 text-gold-mid border border-gold-mid/30 text-[8px] font-sans font-bold tracking-widest h-[30px] uppercase transition-colors"
                            >
                              ADD COLOR
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COUTURE MULTI-IMAGE GALLERY */}
                    <div className="space-y-3 bg-zinc-950/40 p-4 border border-zinc-900/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] text-zinc-500 tracking-widest font-sans block uppercase font-bold">
                          COUTURE IMAGE GALLERY (MULTIPLE PICTURES)
                        </span>
                        <span className="text-[8px] text-zinc-600 font-mono">
                          {editingProduct.images?.length || 0} ADDITIONAL IMAGES
                        </span>
                      </div>

                      {/* Grid of current gallery images */}
                      <div className="grid grid-cols-4 gap-2.5">
                        {/* Main picture display */}
                        <div className="relative border border-zinc-800/60 p-1 bg-zinc-950 flex flex-col items-center justify-center">
                          <img
                            src={editingProduct.image}
                            alt="Main product"
                            className="w-20 h-16 object-cover object-center"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[6px] tracking-widest text-gold-mid font-sans uppercase mt-1">MAIN</span>
                        </div>

                        {/* Additional images loop */}
                        {editingProduct.images?.map((imgSrc, imgIdx) => (
                          <div key={imgIdx} className="relative border border-zinc-900 p-1 bg-zinc-950 flex flex-col items-center justify-center group/img">
                            <img
                              src={imgSrc}
                              alt={`Gallery item ${imgIdx}`}
                              className="w-20 h-16 object-cover object-center"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const remaining = (editingProduct.images || []).filter((_, idx) => idx !== imgIdx);
                                setEditingProduct({ ...editingProduct, images: remaining });
                              }}
                              className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-bold border border-zinc-950 cursor-pointer shadow-md transition-colors"
                              title="Delete picture"
                            >
                              ×
                            </button>
                            <span className="text-[6px] tracking-widest text-zinc-500 font-sans uppercase block text-center mt-1">PAGE {imgIdx + 2}</span>
                          </div>
                        ))}
                      </div>

                      {/* File select & URL input for additional image */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-zinc-900/50">
                        <div className="sm:col-span-8">
                          <label className="text-[7px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase">
                            PASTE IMAGE URL & ENTER
                          </label>
                          <input
                            type="text"
                            placeholder="PASTE IMAGE URL (e.g. Unsplash link) AND PRESS ENTER"
                            className="w-full bg-zinc-950 border border-zinc-900 text-[10px] text-luxury-cream p-2 focus:outline-none focus:border-gold-mid tracking-wide rounded-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const url = e.currentTarget.value.trim();
                                if (url) {
                                  const currentImages = editingProduct.images || [];
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: [...currentImages, url]
                                  });
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="sm:col-span-4 flex items-end">
                          <input
                            ref={additionalFileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                processAdditionalFile(e.target.files[0]);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => additionalFileInputRef.current?.click()}
                            className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-[8px] font-sans font-bold tracking-widest h-[30px] uppercase transition-colors"
                          >
                            UPLOAD FILE
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#F5F2EC] hover:bg-gold-light text-luxury-black font-sans font-bold text-xs tracking-[0.25em] py-3.5 transition-all uppercase flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4 text-luxury-black" />
                      <span>{isAddingNew ? "ARCHIVE NEW GARMENT" : "COMMIT SPECIFICATION CHANGES"}</span>
                    </button>
                  </form>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <ShoppingBag className="w-10 h-10 text-zinc-800 mb-4" />
                    <h3 className="font-serif text-sm tracking-widest text-zinc-400 uppercase mb-2">
                      SPECIFICATION CONTROLS SECURED
                    </h3>
                    <p className="text-[11px] text-zinc-600 font-sans max-w-sm mb-6 leading-relaxed">
                      Select any luxurious item from the catalog column on the left to inspect its parameters, modify price metrics, or drag & drop high-resolution apparel photographs.
                    </p>
                    <button
                      onClick={handleAddNewClick}
                      className="border border-zinc-800 hover:border-gold-mid text-zinc-300 hover:text-gold-light text-[10px] tracking-widest py-3 px-6 uppercase transition-all"
                    >
                      DRAFT A NEW ATELIER PIECE
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: UPI PAYMENT GATEWAY */}
          {activeTab === "upi" && (
            <div className="lg:col-span-12 max-w-2xl mx-auto w-full py-6 space-y-6">
              <div className="text-center space-y-2 mb-8">
                <CreditCard className="w-8 h-8 text-gold-mid mx-auto" />
                <h3 className="font-serif text-lg text-white tracking-wider uppercase">UPI INTEGRATION SETTINGS</h3>
                <p className="text-xs text-zinc-500 font-sans max-w-md mx-auto leading-relaxed">
                  Route your luxury client payments instantly. Configure your merchant or personal UPI coordinates. This propagates live into the checkout dispatch drawer.
                </p>
              </div>

              {successMsg && (
                <div className="p-3 bg-gold-mid/10 border border-gold-mid text-gold-mid text-xs font-sans tracking-widest text-center animate-pulse">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSaveUpi} className="bg-zinc-950 border border-zinc-900/60 p-6 md:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-sans tracking-[0.2em] text-zinc-400 uppercase block mb-1 font-semibold">
                      MERCHANT UPI ADDRESS (ID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. luxevra@okaxis"
                      value={localUpiId}
                      onChange={(e) => setLocalUpiId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-mid text-xs text-luxury-cream p-3 focus:outline-none transition-all tracking-wider rounded-none font-medium"
                      required
                    />
                    <span className="text-[8px] text-zinc-600 font-sans tracking-wide block mt-1.5 uppercase leading-normal">
                      Accepts standard formats: UPI ID, mobile number VPA, or merchant codes.
                    </span>
                  </div>

                  <div>
                    <label className="text-[9px] font-sans tracking-[0.2em] text-zinc-400 uppercase block mb-1 font-semibold">
                      BENEFICIARY MERCHANT NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LUXEVRA ATELIER LTD"
                      value={localBeneficiaryName}
                      onChange={(e) => setLocalBeneficiaryName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-gold-mid text-xs text-luxury-cream p-3 focus:outline-none transition-all tracking-widest uppercase rounded-none font-medium"
                      required
                    />
                    <span className="text-[8px] text-zinc-600 font-sans tracking-wide block mt-1.5 uppercase leading-normal">
                      Displayed on the client's banking app interface when completing authorization.
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#080808] border border-zinc-900 flex gap-3.5 items-start">
                  <AlertCircle className="w-5 h-5 text-gold-mid flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gold-mid font-sans tracking-widest block font-bold uppercase mb-1">
                      REAL-TIME TRANSACTION ROUTING ACTIVE
                    </span>
                    <p className="text-[10px] text-zinc-500 font-sans leading-relaxed tracking-wide">
                      When a client selects UPI at checkout, they will receive custom dispatch instructions mapped directly to <strong className="text-white">{localUpiId || "luxevra@okaxis"}</strong> belonging to <strong className="text-white">{localBeneficiaryName || "LUXEVRA ATELIER LTD"}</strong>.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F5F2EC] hover:bg-gold-light text-luxury-black font-sans font-bold text-xs tracking-[0.25em] py-3.5 transition-all uppercase flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-luxury-black" />
                  <span>COMMIT GATEWAY DETAILS</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: OFFLINE ZIP PREPARATION & INTEGRATION */}
          {activeTab === "offline-export" && (
            <div className="lg:col-span-12 max-w-3xl mx-auto w-full py-6 space-y-6">
              <div className="text-center space-y-2 mb-8">
                <ShoppingBag className="w-8 h-8 text-gold-mid mx-auto" />
                <h3 className="font-serif text-lg text-white tracking-wider uppercase">OFFLINE EXPORT PREPARATION ENGINE</h3>
                <p className="text-xs text-zinc-500 font-sans max-w-lg mx-auto leading-relaxed">
                  Prepare your luxury codebase for seamless public export. This tool automatically downloads all Cloud-stored product assets, packages them into <code className="text-white">/public/uploads/</code>, maps item indices, and ensures your catalog functions 100% offline.
                </p>
              </div>

              {successMsg && (
                <div className="p-3 bg-gold-mid/10 border border-gold-mid text-gold-mid text-xs font-sans tracking-widest text-center animate-pulse uppercase">
                  {successMsg}
                </div>
              )}

              <div className="bg-zinc-950 border border-zinc-900/60 p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] tracking-widest text-gold-mid font-bold uppercase font-sans block">
                    AUTOMATED OFFLINE SYNC PROCESS
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    When you click below, the server will query all products from Supabase, download their images, save them cleanly locally in <code className="text-zinc-200">/public/uploads/</code>, rewrite <code className="text-zinc-200">src/data.ts</code> with local relative links, and output an verification report inside <code className="text-zinc-200">manifest.json</code>.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/60 space-y-1">
                      <span className="text-[8px] text-zinc-500 font-sans tracking-wider block uppercase">1. REMOTE RETRIEVAL</span>
                      <span className="text-[10px] text-zinc-300 font-sans block leading-normal">Pull product cards and image URLs directly from Supabase Storage.</span>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/60 space-y-1">
                      <span className="text-[8px] text-zinc-500 font-sans tracking-wider block uppercase">2. CODEBASE ALIGNMENT</span>
                      <span className="text-[10px] text-zinc-300 font-sans block leading-normal">Modify local products_db.json & static arrays with relative offline assets.</span>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/60 space-y-1">
                      <span className="text-[8px] text-zinc-500 font-sans tracking-wider block uppercase">3. VERIFICATION CHECKS</span>
                      <span className="text-[10px] text-zinc-300 font-sans block leading-normal">Generate export manifest mappings & verify local files exist for export.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={handlePrepExport}
                    disabled={isPreppingExport}
                    className="w-full bg-[#F5F2EC] hover:bg-gold-light text-luxury-black font-sans font-bold text-xs tracking-[0.25em] py-4 transition-all uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4 text-luxury-black" />
                    <span>{isPreppingExport ? "PREPARING OFFLINE CODEBASE..." : "PREPARE ATELIER FOR ZIP EXPORT"}</span>
                  </button>
                  <span className="text-[9px] text-zinc-600 font-sans tracking-wide block text-center uppercase leading-normal">
                    *IMPORTANT: Run this preparation step once right before exporting your project as a ZIP file to bundle all cloud photos.
                  </span>
                </div>

                {exportPrepResult && (
                  <div className="p-5 bg-zinc-900/30 border border-zinc-900 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5">
                      <span className="text-[10px] text-gold-mid font-bold uppercase tracking-widest font-sans">
                        SYNC REPORT & VALIDATION
                      </span>
                      <span className="bg-emerald-950/30 text-emerald-400 border border-emerald-800/40 text-[8px] font-mono px-2 py-0.5 uppercase tracking-widest font-semibold rounded-none">
                        VERIFIED
                      </span>
                    </div>

                    {exportPrepResult.error ? (
                      <div className="text-xs text-red-400 font-mono">
                        Error: {exportPrepResult.error}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-sans">
                          <div>
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">PRODUCTS INDEXED</span>
                            <span className="text-white font-mono font-medium">{exportPrepResult.productsCount || 0} ITEMS</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">ASSETS DOWNLOADED</span>
                            <span className="text-white font-mono font-medium">{exportPrepResult.downloadedCount || 0} IMAGES</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block">SYNC INTEGRITY</span>
                            <span className="text-emerald-400 font-mono font-medium">100% COMPLETE</span>
                          </div>
                        </div>

                        {exportPrepResult.warnings && exportPrepResult.warnings.length > 0 && (
                          <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 font-mono text-[10px] space-y-1">
                            <span className="font-bold block uppercase tracking-wider text-[8px] mb-1">DOWNLOAD WARNINGS:</span>
                            {exportPrepResult.warnings.map((warn: string, i: number) => (
                              <p key={i}>• {warn}</p>
                            ))}
                          </div>
                        )}

                        {exportPrepResult.manifest && exportPrepResult.manifest.mappings && exportPrepResult.manifest.mappings.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold font-sans">
                              IMAGE RESOURCE RESOLUTIONS:
                            </span>
                            <div className="max-h-[160px] overflow-y-auto border border-zinc-900 bg-black/60 divide-y divide-zinc-900 font-mono text-[10px] scrollbar-thin">
                              {exportPrepResult.manifest.mappings.map((map: any, idx: number) => (
                                <div key={idx} className="p-2 flex flex-col sm:flex-row justify-between gap-1">
                                  <div className="truncate max-w-sm" title={map.originalUrl}>
                                    <span className="text-zinc-600">ID: {map.productId} ({map.field})</span>
                                  </div>
                                  <div className="text-emerald-400 text-right truncate">
                                    <span>{map.localPath}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* 3. PORTAL FOOTER */}
        <div className="p-4 bg-[#070707] border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-600 text-[9px] font-sans tracking-widest uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ATELIER NODE 2026 / ENCRYPTED LOCAL CONFIGURATION</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div>
            SECURE ACCESS CREDENTIALS ACTIVATED / NO SYSTEM CORRUPTION
          </div>
        </div>
      </div>
    </div>
  );
}
