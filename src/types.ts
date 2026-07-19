/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  badge?: "NEW" | "BESTSELLER" | "LIMITED" | "CLASSIC";
  description: string;
  details: string[];
  specs?: {
    fit: string;
    weight: string;
    composition: string;
  };
  colors?: { name: string; hex: string; image?: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: "S" | "M" | "L" | "XL";
  selectedColor?: string;
  selectedHoodColor?: string;
}

export interface ValueProposition {
  id: string;
  title: string;
  subtitle: string;
  iconName: "crown" | "package" | "lock" | "headphones";
}

export interface PackagingItem {
  id: string;
  title: string;
  description: string;
  image: string;
  accent: string;
}

export interface LookbookScene {
  id: string;
  image: string;
  title: string;
  description: string;
  taggedProducts: {
    productId: string;
    name: string;
    price: number;
    x: number; // percentage coordinate
    y: number; // percentage coordinate
  }[];
}
