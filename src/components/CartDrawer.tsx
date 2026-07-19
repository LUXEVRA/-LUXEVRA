/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Minus, Plus, Trash2, ArrowRight, Sparkles, Check, CreditCard, ShieldCheck } from "lucide-react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productID: string, size: "S" | "M" | "L" | "XL", delta: number, color?: string, hoodColor?: string) => void;
  onRemoveItem: (productID: string, size: "S" | "M" | "L" | "XL", color?: string, hoodColor?: string) => void;
  onClearCart: () => void;
  upiDetails?: { upiId: string; beneficiaryName: string };
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  upiDetails,
}: CartDrawerProps) {
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [discountError, setDiscountError] = useState("");

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "payment" | "success">("cart");
  const [addressForm, setAddressForm] = useState({ name: "", phone: "", address: "", city: "", zip: "" });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod" | "upi">("cod");
  const [orderId, setOrderId] = useState("");
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  if (!isOpen) return null;

  const FREE_SHIPPING_LIMIT = 4999;
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_LIMIT || subtotal === 0 ? 0 : 350;

  let discountAmount = 0;
  if (appliedDiscount) {
    discountAmount = Math.round(subtotal * (appliedDiscount.percent / 100));
  }

  const upiDiscount = paymentMethod === "upi" ? Math.round((subtotal - discountAmount) * 0.1) : 0;
  const finalTotal = subtotal - discountAmount - upiDiscount + shippingCost;
  const remainingForFreeShipping = FREE_SHIPPING_LIMIT - subtotal;
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_LIMIT) * 100, 100);

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountError("");
    const code = discountCode.toUpperCase().trim();

    if (code === "LUXEVRA10") {
      setAppliedDiscount({ code: "LUXEVRA10", percent: 100 }); // Free gift code for this test or 10%! Let's make it 10%
      setAppliedDiscount({ code: "LUXEVRA10", percent: 10 });
    } else if (code === "ORDINARY") {
      setAppliedDiscount({ code: "ORDINARY", percent: 20 }); // 20% off
    } else if (code === "COUTURE") {
      setAppliedDiscount({ code: "COUTURE", percent: 15 }); // 15% off
    } else {
      setDiscountError("INVALID COUTURE ATELIER CODE");
    }
    setDiscountCode("");
  };

  const handleStartCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutStep("address");
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressForm.name && addressForm.phone && addressForm.address) {
      setCheckoutStep("payment");
    }
  };

  const handlePlaceOrder = async () => {
    setCheckoutSubmitting(true);
    setCheckoutError("");

    const randomId = "LX-" + Math.floor(100000 + Math.random() * 900000);
    
    // Compile items list for Formspree
    const compiledItems = cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      size: item.selectedSize,
      color: item.selectedColor || "default",
      accentColor: item.selectedHoodColor || "default",
      quantity: item.quantity,
      unitPrice: item.product.price,
      itemTotal: item.product.price * item.quantity
    }));

    try {
      const response = await fetch("https://formspree.io/f/mkodragl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          formType: "Couture Order Checkout",
          orderId: randomId,
          recipientName: addressForm.name,
          telephone: addressForm.phone,
          streetAddress: addressForm.address,
          city: addressForm.city,
          zipCode: addressForm.zip,
          paymentMethod: paymentMethod.toUpperCase(),
          totalAmount: finalTotal,
          items: compiledItems,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setOrderId(randomId);

        // Save order to localStorage for Real-time Tracking Portal integration
        try {
          const orderData = {
            id: randomId,
            items: cartItems,
            address: addressForm,
            paymentMethod,
            total: finalTotal,
            timestamp: Date.now(),
          };
          const savedOrders = JSON.parse(localStorage.getItem("luxevra_orders") || "[]");
          localStorage.setItem("luxevra_orders", JSON.stringify([orderData, ...savedOrders]));
        } catch (e) {
          console.error("Failed to save order to history", e);
        }

        setCheckoutStep("success");
      } else {
        setCheckoutError("ATELIER CHECKOUT PROTOCOL FAILED. PLEASE TRY AGAIN.");
      }
    } catch (err) {
      console.error("Formspree checkout error:", err);
      setCheckoutError("DISPATCH CONGESTION. PLEASE CHECK CONNECTION AND RETRY.");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    if (checkoutStep === "success") {
      onClearCart();
      setCheckoutStep("cart");
      setAppliedDiscount(null);
      setAddressForm({ name: "", phone: "", address: "", city: "", zip: "" });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" id="cart-drawer-root">
      {/* 1. BACKDROP OVERLAY */}
      <div
        onClick={handleCloseAndReset}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      ></div>

      {/* 2. DRAWER CONTAINER */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border-l border-zinc-900 h-full flex flex-col justify-between shadow-2xl z-50">
        {/* Header */}
        <div className="p-6 border-b border-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans tracking-[0.2em] text-gold-mid uppercase font-bold">
              ATELIER BAG
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              ({cartItems.length} ITEMS)
            </span>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-1.5 text-zinc-400 hover:text-gold-mid transition-colors"
            aria-label="Close cart drawer"
            id="cart-drawer-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3. DYNAMIC DRAWER BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {checkoutStep === "cart" && (
            <div className="space-y-6">
              {/* Free Shipping Progress Meter */}
              {cartItems.length > 0 && (
                <div className="bg-zinc-950 p-4 border border-zinc-900">
                  <div className="flex justify-between items-center text-[10px] font-sans tracking-wide mb-2">
                    <span className="text-zinc-400 font-light">
                      {subtotal >= FREE_SHIPPING_LIMIT
                        ? "COMPLEMENTARY DISPATCH EARNED"
                        : `ADD ₹${remainingForFreeShipping.toLocaleString("en-IN")} MORE FOR FREE SHIPPING`}
                    </span>
                    <span className="text-gold-mid font-semibold">₹{FREE_SHIPPING_LIMIT.toLocaleString("en-IN")} Target</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-[3px] bg-zinc-900">
                    <div
                      className="h-full bg-gold-mid transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Cart List Items */}
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-700 mb-4">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-sm tracking-widest text-zinc-400 uppercase mb-2">
                    YOUR COUTURE BAG IS EMPTY
                  </h3>
                  <p className="text-[11px] text-zinc-600 font-sans max-w-xs mb-8">
                    Discover our heavyweight tailoring. Items added to your bag will be showcased here.
                  </p>
                  <button
                    onClick={onClose}
                    className="border border-zinc-800 hover:border-gold-mid text-zinc-300 hover:text-gold-light text-[10px] tracking-widest py-3 px-6 uppercase transition-all"
                  >
                    CONTINUE BROWSING
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor || "default"}-${item.selectedHoodColor || "default"}`}
                      className="flex gap-4 p-3 bg-zinc-950/40 border border-zinc-900/60 hover:border-zinc-900 transition-all group"
                    >
                      {/* Image */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-18 object-cover object-center bg-zinc-900"
                        referrerPolicy="no-referrer"
                      />
                      {/* Product Text details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-sans font-semibold tracking-wider text-luxury-cream uppercase">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor, item.selectedHoodColor)}
                              className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* Selected attributes */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-zinc-500 font-sans tracking-widest uppercase mt-1">
                            <span>SIZE: {item.selectedSize}</span>
                            {item.selectedColor && (
                              <>
                                <span>|</span>
                                <span className="text-zinc-400">
                                  COLOR: <span className="text-white font-medium">{item.selectedColor}</span>
                                </span>
                              </>
                            )}
                            {item.selectedHoodColor && item.selectedHoodColor !== item.selectedColor && (
                              <>
                                <span>|</span>
                                <span className="text-gold-mid">
                                  ACCENT: <span className="font-medium text-gold-light">{item.selectedHoodColor}</span>
                                </span>
                              </>
                            )}
                            <span>|</span>
                            <span>QTY: {item.quantity}</span>
                          </div>
                        </div>

                        {/* Quantity manipulators & price display */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-zinc-900">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, -1, item.selectedColor, item.selectedHoodColor)}
                              className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-mono text-zinc-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, 1, item.selectedColor, item.selectedHoodColor)}
                              className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <span className="text-xs font-mono text-white">
                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {checkoutStep === "address" && (
            <form onSubmit={handleAddressSubmit} className="space-y-4 animate-fade-in">
              <span className="text-[10px] font-sans tracking-[0.2em] text-gold-mid block uppercase font-bold">
                DELIVERY PROTOCOL (STEP 1 OF 2)
              </span>

              <div>
                <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase">RECIPIENT NAME</label>
                <input
                  type="text"
                  placeholder="e.g. UJWAL VERMA"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-3 focus:outline-none focus:border-gold-mid tracking-widest uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase">CONTACT TELEPHONE</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-3 focus:outline-none focus:border-gold-mid tracking-widest"
                  required
                />
              </div>

              <div>
                <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase">STREET ADDRESS / APARTMENT</label>
                <input
                  type="text"
                  placeholder="HOUSE NO. 12, ATELIER HEIGHTS, SAKET"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-3 focus:outline-none focus:border-gold-mid tracking-widest uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase">CITY / DISTRICT</label>
                  <input
                    type="text"
                    placeholder="NEW DELHI"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-3 focus:outline-none focus:border-gold-mid tracking-widest uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-[8px] text-zinc-500 tracking-wider font-sans block mb-1 uppercase">PINCODE / ZIP</label>
                  <input
                    type="text"
                    placeholder="110017"
                    value={addressForm.zip}
                    onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-900 text-xs text-luxury-cream p-3 focus:outline-none focus:border-gold-mid tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("cart")}
                  className="w-1/3 border border-zinc-900 hover:border-zinc-700 text-xs tracking-wider py-3.5 text-zinc-400 font-sans"
                >
                  BACK
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[#F5F2EC] hover:bg-white text-luxury-black font-sans font-bold text-xs tracking-[0.2em] py-3.5 transition-all uppercase"
                >
                  NEXT: DISPATCH
                </button>
              </div>
            </form>
          )}

          {checkoutStep === "payment" && (
            <div className="space-y-4 animate-fade-in">
              <span className="text-[10px] font-sans tracking-[0.2em] text-gold-mid block uppercase font-bold">
                SECURE ATELIER DISPATCH (STEP 2 OF 2)
              </span>

              <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-2">
                <span className="text-[8px] text-zinc-500 tracking-widest font-sans block uppercase">SHIPPING SUMMARY</span>
                <p className="text-xs text-zinc-300 font-sans tracking-wide uppercase font-semibold">{addressForm.name}</p>
                <p className="text-[10px] text-zinc-500 font-sans tracking-wide leading-relaxed uppercase">
                  {addressForm.address}, {addressForm.city} - {addressForm.zip}
                </p>
              </div>

              <span className="text-[9px] text-zinc-500 tracking-widest font-sans block uppercase pt-2">SELECT PAYMENT PROTOCOL</span>
              
              <div className="space-y-2">
                {/* Cash on Delivery option */}
                <label className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === "cod" ? "border-gold-mid bg-gold-mid/5" : "border-zinc-900 hover:border-zinc-800"
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="text-gold-mid focus:ring-0 focus:ring-offset-0 bg-transparent border-zinc-800"
                    />
                    <span className="text-xs text-white font-sans tracking-widest uppercase">CASH ON ATELIER DELIVERY (COD)</span>
                  </div>
                  <span className="text-[9px] text-gold-mid tracking-widest font-bold">FREE DISPATCH</span>
                </label>

                {/* Simulated Credit Card option */}
                <label className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === "card" ? "border-gold-mid bg-gold-mid/5" : "border-zinc-900 hover:border-zinc-800"
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="text-gold-mid focus:ring-0 focus:ring-offset-0 bg-transparent border-zinc-800"
                    />
                    <span className="text-xs text-white font-sans tracking-widest uppercase flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-zinc-500" /> CREDIT / DEBIT CARD
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-500 tracking-wider">SECURE LINK</span>
                </label>

                {/* Simulated UPI option */}
                <label className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === "upi" ? "border-gold-mid bg-gold-mid/5" : "border-zinc-900 hover:border-zinc-800"
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="text-gold-mid focus:ring-0 focus:ring-offset-0 bg-transparent border-zinc-800"
                    />
                    <span className="text-xs text-white font-sans tracking-widest uppercase">INSTANT UPI TRANSFER</span>
                  </div>
                  <span className="text-[9px] text-gold-mid tracking-wider font-semibold">10% DISCOUNT APPLICABLE</span>
                </label>
              </div>

              {paymentMethod === "card" && (
                <div className="p-3 bg-zinc-950 border border-zinc-900 space-y-2 animate-slide-down">
                  <span className="text-[8px] text-zinc-600 tracking-widest block uppercase">SIMULATED ATELIER LINK PREVIEW</span>
                  <input
                    type="text"
                    placeholder="•••• •••• •••• ••••"
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-2.5 tracking-widest"
                    maxLength={19}
                  />
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="p-4 bg-zinc-950 border border-gold-mid/30 space-y-3 animate-slide-down">
                  <div className="flex items-center gap-1.5 text-[8px] text-gold-mid tracking-widest font-sans uppercase font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ATELIER UPI SECURE ENDPOINT</span>
                  </div>
                  <div className="space-y-1 font-sans">
                    <span className="text-[9px] text-zinc-500 uppercase block">Beneficiary Name</span>
                    <p className="text-xs text-white font-semibold uppercase tracking-wide">
                      {upiDetails?.beneficiaryName || "LUXEVRA ATELIER LTD"}
                    </p>
                  </div>
                  <div className="space-y-1 font-sans">
                    <span className="text-[9px] text-zinc-500 uppercase block">UPI ID / Address</span>
                    <div className="flex items-center justify-between gap-2 p-2 bg-zinc-900 border border-zinc-800">
                      <span className="text-xs text-gold-light font-mono select-all">
                        {upiDetails?.upiId || "luxevra@okaxis"}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(upiDetails?.upiId || "luxevra@okaxis");
                          alert("Atelier UPI ID copied to clipboard!");
                        }}
                        className="text-[9px] font-sans tracking-widest bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white px-2 py-1 uppercase font-semibold border border-zinc-800"
                        type="button"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <span className="text-[8px] text-zinc-600 tracking-wide block uppercase leading-relaxed">
                    Authorize transfer inside any UPI application (BHIM, PhonePe, GPay, Paytm) for high-priority dispatch.
                  </span>
                </div>
              )}

              <div className="space-y-3 pt-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => !checkoutSubmitting && setCheckoutStep("address")}
                    disabled={checkoutSubmitting}
                    className="w-1/3 border border-zinc-900 hover:border-zinc-700 text-xs tracking-wider py-3.5 text-zinc-400 font-sans disabled:opacity-50"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={checkoutSubmitting}
                    className="w-2/3 bg-gold-mid hover:bg-gold-light text-luxury-black font-sans font-bold text-xs tracking-[0.2em] py-3.5 transition-all uppercase disabled:opacity-50"
                  >
                    {checkoutSubmitting ? "TRANSMITTING TO COUTURE LOGS..." : "CONFIRM COUTURE ORDER"}
                  </button>
                </div>
                {checkoutError && (
                  <span className="text-[10px] text-red-500 tracking-wider block font-semibold text-center uppercase">
                    ⚠️ {checkoutError}
                  </span>
                )}
              </div>
            </div>
          )}

          {checkoutStep === "success" && (
            <div className="text-center py-10 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full border-2 border-gold-mid flex items-center justify-center mx-auto text-gold-mid">
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <span className="text-[9px] font-sans tracking-[0.3em] text-gold-mid uppercase block font-semibold mb-1">
                  ORDER CERTIFIED & FILED
                </span>
                <h3 className="font-serif text-lg text-white tracking-widest uppercase mb-1">
                  ORDER {orderId} SUCCESSFUL
                </h3>
                <span className="text-[9px] font-mono text-zinc-500 block uppercase">
                  REFERENCE KEY: {orderId}-DISPATCH-2026
                </span>
              </div>

              <div className="h-[1px] bg-zinc-900 my-4"></div>

              <div className="p-4 bg-zinc-950 border border-zinc-900 text-left space-y-3">
                <span className="text-[8px] text-zinc-500 tracking-widest font-sans block uppercase">THE UNBOXING ASSURANCE</span>
                <p className="text-xs text-zinc-400 font-sans font-light leading-relaxed tracking-wider">
                  Dear <strong className="text-white">{addressForm.name}</strong>, your premium couture order has been logged into our regional atelier.
                </p>
                <p className="text-[11px] text-zinc-500 font-sans font-light leading-relaxed tracking-wide">
                  Our master tailor is conducting final micro-dye inspection. Your items will be hand-folded, wrapped in custom silk liners, sealed inside our gold-embossed sliding white gift box, and dispatched via high-priority secure DHL express.
                </p>
              </div>

              <button
                onClick={handleCloseAndReset}
                className="w-full bg-[#F5F2EC] hover:bg-white text-luxury-black text-xs font-sans font-bold tracking-[0.2em] py-4 transition-all uppercase cursor-pointer"
              >
                RETURN TO SHOP
              </button>
            </div>
          )}
        </div>

        {/* 4. TOTALS BAR SUMMARY (Persistent footer in Cart view) */}
        {cartItems.length > 0 && checkoutStep === "cart" && (
          <div className="p-6 border-t border-zinc-900/80 bg-[#0d0d0d] space-y-4">
            {/* Promo input field */}
            <form onSubmit={handleApplyDiscount} className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE (ORDINARY, LUXEVRA10)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-gold-mid text-[10px] tracking-widest text-luxury-cream p-2.5 focus:outline-none uppercase"
              />
              <button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-900 hover:border-gold-mid text-zinc-300 hover:text-white text-[10px] tracking-widest py-2.5 px-4 transition-all uppercase cursor-pointer font-semibold"
              >
                Apply
              </button>
            </form>

            {discountError && (
              <span className="text-[9px] font-sans tracking-wide text-red-500 block">
                {discountError}
              </span>
            )}

            {appliedDiscount && (
              <div className="flex items-center justify-between text-[10px] font-sans text-emerald-500 tracking-wide">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> CODE "{appliedDiscount.code}" APPLIED
                </span>
                <span>-{appliedDiscount.percent}%</span>
              </div>
            )}

            <div className="space-y-2 border-b border-zinc-900/60 pb-4">
              <div className="flex justify-between text-xs text-zinc-400 font-sans">
                <span className="font-light">ATELIER SUBTOTAL</span>
                <span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-xs text-emerald-500 font-sans">
                  <span className="font-light">COUTURE PRIVILEGE DISCOUNT</span>
                  <span className="font-mono">-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              {upiDiscount > 0 && (
                <div className="flex justify-between text-xs text-gold-mid font-sans font-medium">
                  <span className="font-light">INSTANT UPI PRIVILEGE DISCOUNT (10%)</span>
                  <span className="font-mono">-₹{upiDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-zinc-400 font-sans">
                <span className="font-light">DHL COURIER DISPATCH</span>
                <span className="font-mono uppercase">
                  {shippingCost === 0 ? (
                    <span className="text-gold-mid font-semibold tracking-wider">COMPLEMENTARY</span>
                  ) : (
                    `₹${shippingCost}`
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-sans font-semibold tracking-wider text-white">
              <span>FINAL ATELIER TOTAL</span>
              <span className="font-mono text-base text-gold-light">
                ₹{finalTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={handleStartCheckout}
              className="w-full bg-[#F5F2EC] hover:bg-white text-luxury-black text-xs font-sans font-bold tracking-[0.25em] py-4 transition-all duration-300 flex items-center justify-center gap-3 uppercase cursor-pointer"
              id="start-checkout-btn"
            >
              <span>PROCEED TO ATELIER DISPATCH</span>
              <ArrowRight className="w-4 h-4 text-luxury-black" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
