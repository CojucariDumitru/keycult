import {
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Gamepad2,
  Home,
  Watch,
  Cable,
  LucideIcon,
} from 'lucide-react';

export interface CategoryMeta {
  key: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: 'PHONE', label: 'Phones & Tablets', icon: Smartphone, blurb: 'iPhone, Galaxy, Pixel & more' },
  { key: 'LAPTOP', label: 'Laptops & PCs', icon: Laptop, blurb: 'MacBook, XPS, ThinkPad, gaming' },
  { key: 'AUDIO', label: 'Audio', icon: Headphones, blurb: 'Headphones, earbuds, speakers' },
  { key: 'TV', label: 'TV & Monitors', icon: Tv, blurb: 'OLED, QLED, gaming monitors' },
  { key: 'GAMING', label: 'Gaming', icon: Gamepad2, blurb: 'Consoles, mice, keyboards' },
  { key: 'SMART_HOME', label: 'Smart Home', icon: Home, blurb: 'Assistants, lighting, security' },
  { key: 'WEARABLE', label: 'Wearables', icon: Watch, blurb: 'Smartwatches & trackers' },
  { key: 'ACCESSORY', label: 'Accessories', icon: Cable, blurb: 'Chargers, storage, mice' },
];
