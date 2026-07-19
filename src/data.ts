/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, ValueProposition, PackagingItem, LookbookScene } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "oversized-hoodie",
    name: "OVERSIZED HOODIE",
    price: 2799,
    originalPrice: 3499,
    image: "/src/assets/images/oversized_hoodie_1784392144459.jpg",
    images: [
      "/src/assets/images/oversized_hoodie_1784392144459.jpg",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600"
    ],
    badge: "NEW",
    description: "An ultra-heavyweight oversized hoodie crafted from 450 GSM double-faced organic loopback cotton. Designed with dropped shoulders, a structured hood without drawcords for a clean aesthetic, and hand-embroidered tone-on-tone signature monogram.",
    details: [
      "450 GSM Organic Cotton Terry",
      "Pre-shrunk, heavy-weight drape",
      "Structured double-layer hood (no drawcords)",
      "Kangaroo pocket with reinforced bartacks",
      "Ribbed side panels for comfort"
    ],
    specs: {
      fit: "Oversized silhouette, dropped shoulders",
      weight: "Heavy-weight (450 GSM)",
      composition: "100% Organic Cotton French Terry"
    },
    colors: [
      { name: "Obsidian Black", hex: "#0a0a0a" },
      { name: "Oatmeal Cream", hex: "#eae6df" },
      { name: "Sage Green", hex: "#636d5e" }
    ]
  },
  {
    id: "signature-tee",
    name: "SIGNATURE TEE",
    price: 1699,
    originalPrice: 2199,
    image: "/src/assets/images/signature_tee_1784392156271.jpg",
    images: [
      "/src/assets/images/signature_tee_1784392156271.jpg",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600"
    ],
    badge: "BESTSELLER",
    description: "A boxy, heavyweight luxury tee made from 280 GSM long-staple combed cotton. Featuring our signature logo printed across the shoulder yoke in high-density premium raised gold matte pigment.",
    details: [
      "280 GSM Long-Staple Combed Cotton",
      "Double-needle stitched 1.2\" neckband",
      "Thick rib collar that retains shape",
      "Signature logo embossed on back yoke in gold matte",
      "Custom woven brand label at hem"
    ],
    specs: {
      fit: "Boxy, relaxed drop-shoulder",
      weight: "Heavy-weight (280 GSM)",
      composition: "100% Premium Combed Cotton"
    },
    colors: [
      { name: "Alabaster White", hex: "#fafafa" },
      { name: "Onyx Black", hex: "#111111" },
      { name: "Desert Sand", hex: "#d5c8b7" }
    ]
  },
  {
    id: "cargo-pants",
    name: "CARGO PANTS",
    price: 2499,
    originalPrice: 3199,
    image: "/src/assets/images/cargo_pants_1784392167112.jpg",
    images: [
      "/src/assets/images/cargo_pants_1784392167112.jpg",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600"
    ],
    badge: "NEW",
    description: "Relaxed-fit cargo trousers constructed from heavy cotton twill. Features structured modular cargo pockets with a subtle gold monogram embroidery, adjustable hem drawcords, and custom hardware.",
    details: [
      "Premium heavy cotton twill fabric",
      "Ergonomic knee darts for movement",
      "Dual-entry side cargo pockets",
      "Engraved brand rivets and custom hardware",
      "Adjustable toggles at ankle hem"
    ],
    specs: {
      fit: "Relaxed fit with straight or tapered hem adjustable toggles",
      weight: "Medium-to-heavy cotton twill",
      composition: "98% Cotton, 2% Elastane for structured stretch"
    },
    colors: [
      { name: "Olive Drab", hex: "#44493c" },
      { name: "Stealth Black", hex: "#18181b" },
      { name: "Vintage Khaki", hex: "#baa68f" }
    ]
  },
  {
    id: "vintage-wash-hoodie",
    name: "VINTAGE WASH HOODIE",
    price: 2999,
    originalPrice: 3799,
    image: "/src/assets/images/vintage_wash_hoodie_1784392179215.jpg",
    images: [
      "/src/assets/images/vintage_wash_hoodie_1784392179215.jpg",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600"
    ],
    badge: "LIMITED",
    description: "Individually dyed and washed for a faded, broken-in vintage feel. Features a heavy-weight 480 French Terry body, distress-dyed seams, and the iconic branding debossed across the shoulders.",
    details: [
      "480 GSM Heavy French Terry",
      "Hand-done vintage-effect stone wash",
      "Signature logo embossed on reverse in tonal grey",
      "Ribbed side gussets for durable structure",
      "Double-stitched stress seams"
    ],
    specs: {
      fit: "Slouchy, classic heavy drape",
      weight: "Ultra-heavyweight (480 GSM)",
      composition: "100% Cotton French Terry"
    },
    colors: [
      { name: "Faded Charcoal", hex: "#2f3136" },
      { name: "Aged Plum", hex: "#413642" },
      { name: "Distressed Sage", hex: "#52574d" }
    ]
  },
  {
    id: "couture-beanie",
    name: "COUTURE WOVEN BEANIE",
    price: 999,
    originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1576871337622-98d48d4353d3?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d4353d3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1608889174636-c4d68205f24f?auto=format&fit=crop&q=80&w=600"
    ],
    badge: "NEW",
    description: "An exceptionally warm, heavy-knit wool beanie displaying the signature double-knit weave. Made with premium ultra-soft merino wool threads and finished with a micro-embossed hand-stitched gold-embroidered leather label.",
    details: [
      "100% Premium Australian Merino Wool",
      "Thick double-knit ribbing structure",
      "Adjustable folded cuff tailoring",
      "Hand-sewn full-grain leather badge with gold hot-stamping",
      "Extremely breathable yet highly thermal"
    ],
    specs: {
      fit: "Universal stretch fit, adjustable fold",
      weight: "Heavy-gauge knit (120g)",
      composition: "100% Fine Merino Wool"
    },
    colors: [
      { name: "Atelier Gold", hex: "#c4a465" },
      { name: "Vanilla Cream", hex: "#faf6f0" },
      { name: "Midnight Onyx", hex: "#0b0b0b" }
    ]
  }
];

export const VALUE_PROPOSITIONS: ValueProposition[] = [
  {
    id: "quality",
    title: "PREMIUM QUALITY",
    subtitle: "Finest fabrics & materials",
    iconName: "crown"
  },
  {
    id: "returns",
    title: "EASY RETURNS",
    subtitle: "14 days return policy",
    iconName: "package"
  },
  {
    id: "payment",
    title: "SECURE PAYMENTS",
    subtitle: "100% secure transactions",
    iconName: "lock"
  },
  {
    id: "support",
    title: "CUSTOMER SUPPORT",
    subtitle: "24/7 support available",
    iconName: "headphones"
  }
];

export const PACKAGING_ITEMS: PackagingItem[] = [
  {
    id: "collateral-box-bag",
    title: "SIGNATURE BOX & BAG",
    description: "Every purchase is delivered in our slide-out rigid white box with gold hot-stamping and custom matte black bag, designed to preserve the structure of heavyweight garments.",
    image: "/src/assets/images/luxevra_packaging_1784392190373.jpg",
    accent: "Gold Foil & Matte Cardboard"
  },
  {
    id: "leather-branding-patch",
    title: "EMBOSSED LEATHER SIGNATURE",
    description: "Our signature garments carry a thick, hand-stitched matte black leather patch with deep gold debossed monograms, reflecting premium craft in every stitch.",
    image: "/src/assets/images/leather_patch_1784392207167.jpg",
    accent: "Full-Grain Italian Leather"
  },
  {
    id: "unboxing-tissue-tags",
    title: "COTTON CORDS & HEAVY TAGS",
    description: "Each item is pinned with thick, textured matte-black card tags suspended by custom-spun heavy cotton cords and secured via gold-finished security locks.",
    image: "/src/assets/images/luxevra_packaging_1784392190373.jpg", // Using premium packaging photo as high-quality match
    accent: "400 GSM Felt Cardstock"
  }
];

export const LOOKBOOK_SCENES: LookbookScene[] = [
  {
    id: "lookbook-1",
    image: "/src/assets/images/oversized_hoodie_1784392144459.jpg",
    title: "NOCTURNAL MINIMALISM",
    description: "Dark drapes and structured silhouettes captured against jagged natural rocks, emphasizing texture and gravity.",
    taggedProducts: [
      {
        productId: "oversized-hoodie",
        name: "OVERSIZED HOODIE",
        price: 2799,
        x: 50,
        y: 45
      }
    ]
  },
  {
    id: "lookbook-2",
    image: "/src/assets/images/signature_tee_1784392156271.jpg",
    title: "LIGHT CONTRASTS",
    description: "Soft off-white cotton paired with high-density gold branding details. Clean, bold lines meant for daylight.",
    taggedProducts: [
      {
        productId: "signature-tee",
        name: "SIGNATURE TEE",
        price: 1699,
        x: 52,
        y: 50
      }
    ]
  },
  {
    id: "lookbook-3",
    image: "/src/assets/images/vintage_wash_hoodie_1784392179215.jpg",
    title: "VINTAGE SOUL",
    description: "An homage to classic street styles. Earthy washed charcoal tones with a broken-in structural drape.",
    taggedProducts: [
      {
        productId: "vintage-wash-hoodie",
        name: "VINTAGE WASH HOODIE",
        price: 2999,
        x: 48,
        y: 35
      }
    ]
  }
];
