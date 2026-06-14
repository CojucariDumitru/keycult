import { PrismaClient, Category } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Unsplash electronics photography. The client falls back to a branded
// placeholder on error, so a broken link never shows a missing image.
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

const POOL: Record<string, string[]> = {
  PHONE: [
    'photo-1592750475338-74b7b21085ab',
    'photo-1511707171634-5f897ff02aa9',
    'photo-1598327105666-5b89351aff97',
    'photo-1544244015-0df4b3ffc6b0',
  ],
  LAPTOP: [
    'photo-1517336714731-489689fd1ca8',
    'photo-1496181133206-80ce9b88a853',
    'photo-1531297484001-80022131f5a1',
  ],
  AUDIO: [
    'photo-1505740420928-5e560c06d30e',
    'photo-1606220588913-b3aacb4d2f46',
    'photo-1608043152269-423dbba4e7e1',
    'photo-1583394838336-acd977736f90',
  ],
  TV: [
    'photo-1593359677879-a4bb92f829d1',
    'photo-1527443224154-c4a3942d3acf',
    'photo-1461151304267-38535e780c79',
  ],
  GAMING: [
    'photo-1606144042614-b2417e99c4e3',
    'photo-1486401899868-0e435ed85128',
    'photo-1592840496694-26d035b52b48',
  ],
  SMART_HOME: [
    'photo-1543512214-318c7553f230',
    'photo-1558002038-1055907df827',
    'photo-1518444065439-e933c06ce9cd',
  ],
  WEARABLE: [
    'photo-1546868871-7041f2a55e12',
    'photo-1434493789847-2f02dc6ca35d',
    'photo-1579586337278-3befd40fd17a',
  ],
  ACCESSORY: [
    'photo-1527814050087-3793815479db',
    'photo-1625842268584-8f3296236761',
    'photo-1583863788434-e58a36330cf0',
  ],
};

let counters: Record<string, number> = {};
function pics(cat: string): string[] {
  const pool = POOL[cat];
  const i = counters[cat] ?? 0;
  counters[cat] = i + 1;
  return [img(pool[i % pool.length]), img(pool[(i + 1) % pool.length])];
}

type Seed = {
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number; // cents
  oldPrice?: number; // cents
  category: Category;
  stock: number;
  featured?: boolean;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
};

const items: Seed[] = [
  // ---------------- PHONES & TABLETS ----------------
  { slug: 'iphone-15-pro', name: 'Apple iPhone 15 Pro 256GB', brand: 'Apple', category: 'PHONE',
    description: 'Titanium design, A17 Pro chip, and a customizable Action button. The most powerful iPhone Pro yet with a 48MP main camera.',
    price: 99900, oldPrice: 109900, stock: 24, featured: true, rating: 4.9, reviewCount: 312,
    specs: { Display: '6.1" OLED 120Hz', Chip: 'A17 Pro', Storage: '256GB', Camera: '48MP', Battery: '23h video' } },
  { slug: 'galaxy-s24-ultra', name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', category: 'PHONE',
    description: 'Galaxy AI, a built-in S Pen, and a 200MP camera in a titanium frame. The ultimate Android flagship.',
    price: 119900, stock: 18, rating: 4.8, reviewCount: 241,
    specs: { Display: '6.8" AMOLED 120Hz', Chip: 'Snapdragon 8 Gen 3', Storage: '512GB', Camera: '200MP', SPen: 'Yes' } },
  { slug: 'google-pixel-8', name: 'Google Pixel 8 128GB', brand: 'Google', category: 'PHONE',
    description: 'The smartest Pixel with Google Tensor G3, Magic Editor, and the best computational photography.',
    price: 59900, oldPrice: 69900, stock: 31, rating: 4.7, reviewCount: 158,
    specs: { Display: '6.2" OLED', Chip: 'Tensor G3', Storage: '128GB', Camera: '50MP', Updates: '7 years' } },
  { slug: 'ipad-air-11', name: 'Apple iPad Air 11" M2', brand: 'Apple', category: 'PHONE',
    description: 'Serious performance in a thin, light design. M2 chip, Liquid Retina display, and Apple Pencil Pro support.',
    price: 59900, stock: 27, rating: 4.8, reviewCount: 134,
    specs: { Display: '11" Liquid Retina', Chip: 'M2', Storage: '128GB', Pencil: 'Pro', Connectivity: 'Wi-Fi 6E' } },
  { slug: 'xiaomi-14', name: 'Xiaomi 14 256GB', brand: 'Xiaomi', category: 'PHONE',
    description: 'Leica optics, Snapdragon 8 Gen 3, and a bright LTPO display. Flagship power at a sharper price.',
    price: 79900, oldPrice: 89900, stock: 22, rating: 4.6, reviewCount: 96,
    specs: { Display: '6.36" LTPO OLED', Chip: 'Snapdragon 8 Gen 3', Storage: '256GB', Camera: 'Leica 50MP', Charging: '90W' } },

  // ---------------- LAPTOPS & PCs ----------------
  { slug: 'macbook-pro-14-m3', name: 'Apple MacBook Pro 14" M3', brand: 'Apple', category: 'LAPTOP',
    description: 'Supercharged by the M3 chip. A stunning Liquid Retina XDR display and all-day battery for pros.',
    price: 159900, oldPrice: 179900, stock: 14, featured: true, rating: 4.9, reviewCount: 287,
    specs: { Display: '14.2" XDR 120Hz', Chip: 'M3', RAM: '16GB', Storage: '512GB SSD', Battery: '22h' } },
  { slug: 'dell-xps-13', name: 'Dell XPS 13 Plus', brand: 'Dell', category: 'LAPTOP',
    description: 'A futuristic, edge-to-edge design with a seamless glass touchpad and a vivid InfinityEdge display.',
    price: 119900, stock: 19, rating: 4.6, reviewCount: 112,
    specs: { Display: '13.4" OLED', CPU: 'Intel Core i7', RAM: '16GB', Storage: '1TB SSD', Weight: '1.26kg' } },
  { slug: 'asus-rog-zephyrus-g14', name: 'ASUS ROG Zephyrus G14', brand: 'ASUS', category: 'LAPTOP',
    description: 'A compact gaming powerhouse with a Ryzen 9 CPU, RTX graphics, and a gorgeous OLED screen.',
    price: 149900, oldPrice: 169900, stock: 11, featured: true, rating: 4.8, reviewCount: 178,
    specs: { Display: '14" OLED 120Hz', CPU: 'Ryzen 9', GPU: 'RTX 4070', RAM: '32GB', Storage: '1TB SSD' } },
  { slug: 'thinkpad-x1-carbon', name: 'Lenovo ThinkPad X1 Carbon', brand: 'Lenovo', category: 'LAPTOP',
    description: 'The business legend. Ultralight carbon-fiber build, legendary keyboard, and enterprise-grade security.',
    price: 139900, stock: 16, rating: 4.7, reviewCount: 89,
    specs: { Display: '14" IPS', CPU: 'Intel Core i7', RAM: '16GB', Storage: '512GB SSD', Weight: '1.12kg' } },
  { slug: 'hp-spectre-x360', name: 'HP Spectre x360 14', brand: 'HP', category: 'LAPTOP',
    description: 'A premium 2-in-1 convertible with a jewel-cut design, OLED touchscreen, and all-day battery.',
    price: 124900, oldPrice: 139900, stock: 13, rating: 4.5, reviewCount: 74,
    specs: { Display: '13.5" OLED Touch', CPU: 'Intel Core i7', RAM: '16GB', Storage: '1TB SSD', Form: '2-in-1' } },

  // ---------------- AUDIO ----------------
  { slug: 'sony-wh-1000xm5', name: 'Sony WH-1000XM5 Headphones', brand: 'Sony', category: 'AUDIO',
    description: 'Industry-leading noise cancellation, crystal-clear calls, and 30 hours of battery. Reference-class comfort.',
    price: 34900, oldPrice: 39900, stock: 42, featured: true, rating: 4.9, reviewCount: 521,
    specs: { Type: 'Over-ear', ANC: 'Yes', Battery: '30h', Bluetooth: '5.2', Charging: 'USB-C' } },
  { slug: 'airpods-pro-2', name: 'Apple AirPods Pro (2nd gen)', brand: 'Apple', category: 'AUDIO',
    description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, and a USB-C charging case.',
    price: 22900, oldPrice: 24900, stock: 65, rating: 4.8, reviewCount: 433,
    specs: { Type: 'In-ear', ANC: 'Adaptive', Chip: 'H2', Case: 'USB-C', Battery: '6h + 30h' } },
  { slug: 'bose-qc-ultra', name: 'Bose QuietComfort Ultra', brand: 'Bose', category: 'AUDIO',
    description: 'Immersive spatial audio and world-class quiet. Plush comfort for all-day listening.',
    price: 37900, stock: 28, rating: 4.7, reviewCount: 198,
    specs: { Type: 'Over-ear', ANC: 'Yes', Spatial: 'Immersive', Battery: '24h', Bluetooth: '5.3' } },
  { slug: 'jbl-charge-5', name: 'JBL Charge 5 Speaker', brand: 'JBL', category: 'AUDIO',
    description: 'Bold JBL Pro sound, 20 hours of playtime, and IP67 waterproofing. Doubles as a power bank.',
    price: 14900, oldPrice: 17900, stock: 53, rating: 4.6, reviewCount: 267,
    specs: { Type: 'Portable', Battery: '20h', Waterproof: 'IP67', Powerbank: 'Yes', Bluetooth: '5.1' } },
  { slug: 'sennheiser-momentum-4', name: 'Sennheiser Momentum 4', brand: 'Sennheiser', category: 'AUDIO',
    description: 'Audiophile sound signature, adaptive noise cancellation, and an astonishing 60-hour battery.',
    price: 29900, stock: 24, rating: 4.7, reviewCount: 143,
    specs: { Type: 'Over-ear', ANC: 'Adaptive', Battery: '60h', Codec: 'aptX Adaptive', Bluetooth: '5.2' } },

  // ---------------- TV & MONITORS ----------------
  { slug: 'lg-oled-c4-55', name: 'LG OLED evo C4 55"', brand: 'LG', category: 'TV',
    description: 'Self-lit OLED pixels, the α9 AI Processor Gen7, and 144Hz gaming. Perfect blacks, infinite contrast.',
    price: 139900, oldPrice: 159900, stock: 9, featured: true, rating: 4.9, reviewCount: 211,
    specs: { Size: '55"', Panel: 'OLED evo', Resolution: '4K', Refresh: '144Hz', HDMI: '2.1 x4' } },
  { slug: 'samsung-qled-50', name: 'Samsung 50" QLED 4K', brand: 'Samsung', category: 'TV',
    description: 'Quantum Dot color, 4K upscaling powered by AI, and a slim design that fits any room.',
    price: 64900, oldPrice: 79900, stock: 17, rating: 4.6, reviewCount: 156,
    specs: { Size: '50"', Panel: 'QLED', Resolution: '4K', HDR: 'Quantum HDR', OS: 'Tizen' } },
  { slug: 'lg-ultragear-27', name: 'LG UltraGear 27" 1440p 165Hz', brand: 'LG', category: 'TV',
    description: 'A fast IPS gaming monitor with 165Hz, 1ms response, and NVIDIA G-SYNC compatibility.',
    price: 32900, oldPrice: 39900, stock: 26, rating: 4.7, reviewCount: 188,
    specs: { Size: '27"', Panel: 'IPS', Resolution: '1440p', Refresh: '165Hz', Sync: 'G-SYNC' } },
  { slug: 'dell-ultrasharp-32-4k', name: 'Dell UltraSharp 32" 4K', brand: 'Dell', category: 'TV',
    description: 'A pro-grade 4K monitor with 99% sRGB, USB-C hub, and a beautiful InfinityEdge design.',
    price: 69900, stock: 14, rating: 4.8, reviewCount: 97,
    specs: { Size: '32"', Panel: 'IPS Black', Resolution: '4K', Color: '99% sRGB', Ports: 'USB-C Hub' } },

  // ---------------- GAMING ----------------
  { slug: 'playstation-5-slim', name: 'Sony PlayStation 5 Slim', brand: 'Sony', category: 'GAMING',
    description: 'Lightning-fast loading, stunning 4K graphics, and the immersive DualSense controller. Disc edition.',
    price: 49900, stock: 20, featured: true, rating: 4.9, reviewCount: 642,
    specs: { Storage: '1TB SSD', Resolution: '4K 120Hz', Drive: 'Blu-ray', Controller: 'DualSense', Ray: 'Ray tracing' } },
  { slug: 'xbox-series-x', name: 'Xbox Series X', brand: 'Microsoft', category: 'GAMING',
    description: 'The fastest, most powerful Xbox ever. True 4K gaming and thousands of titles via Game Pass.',
    price: 49900, oldPrice: 54900, stock: 18, rating: 4.8, reviewCount: 398,
    specs: { Storage: '1TB SSD', Resolution: '4K 120Hz', GPU: '12 TFLOPS', Drive: '4K UHD', Quick: 'Quick Resume' } },
  { slug: 'nintendo-switch-oled', name: 'Nintendo Switch OLED', brand: 'Nintendo', category: 'GAMING',
    description: 'A vivid 7" OLED screen, enhanced audio, and a wide adjustable stand. Play at home or on the go.',
    price: 34900, stock: 34, rating: 4.7, reviewCount: 287,
    specs: { Display: '7" OLED', Storage: '64GB', Modes: 'TV / Handheld', Battery: '9h', Dock: 'LAN port' } },
  { slug: 'logitech-g-pro-superlight', name: 'Logitech G Pro X Superlight 2', brand: 'Logitech', category: 'GAMING',
    description: 'A 60g esports mouse with the HERO 2 sensor, LIGHTSPEED wireless, and 95-hour battery.',
    price: 15900, oldPrice: 17900, stock: 47, rating: 4.8, reviewCount: 213,
    specs: { Weight: '60g', Sensor: 'HERO 2 32K', Wireless: 'LIGHTSPEED', Battery: '95h', Buttons: '5' } },
  { slug: 'razer-blackwidow-v4', name: 'Razer BlackWidow V4 Pro', brand: 'Razer', category: 'GAMING',
    description: 'A mechanical gaming keyboard with Razer Green switches, a command dial, and per-key RGB.',
    price: 16900, stock: 29, rating: 4.6, reviewCount: 121,
    specs: { Switches: 'Razer Green', Layout: 'Full', RGB: 'Chroma', Wrist: 'Magnetic rest', Media: 'Dial' } },

  // ---------------- SMART HOME ----------------
  { slug: 'echo-dot-5', name: 'Amazon Echo Dot (5th Gen)', brand: 'Amazon', category: 'SMART_HOME',
    description: 'Crisp vocals and balanced bass, plus a built-in temperature sensor and Alexa.',
    price: 4900, oldPrice: 5900, stock: 88, rating: 4.6, reviewCount: 512,
    specs: { Assistant: 'Alexa', Audio: '1.73" speaker', Sensor: 'Temperature', Connectivity: 'Wi-Fi', Eero: 'Built-in' } },
  { slug: 'google-nest-hub-2', name: 'Google Nest Hub (2nd Gen)', brand: 'Google', category: 'SMART_HOME',
    description: 'A 7" smart display with Sleep Sensing, Google Assistant, and whole-home control.',
    price: 9900, stock: 41, rating: 4.5, reviewCount: 198,
    specs: { Display: '7" Touch', Assistant: 'Google', Sleep: 'Sleep Sensing', Audio: 'Full-range', Hub: 'Thread' } },
  { slug: 'philips-hue-starter', name: 'Philips Hue Starter Kit', brand: 'Philips', category: 'SMART_HOME',
    description: 'Three color smart bulbs plus a bridge. 16 million colors, scenes, and voice control.',
    price: 17900, oldPrice: 19900, stock: 36, rating: 4.7, reviewCount: 164,
    specs: { Bulbs: '3x E27', Colors: '16M', Bridge: 'Included', Control: 'App / Voice', Power: '9W' } },
  { slug: 'ring-doorbell-4', name: 'Ring Video Doorbell 4', brand: 'Ring', category: 'SMART_HOME',
    description: '1080p HD video, color Pre-Roll previews, and quick-replies. Know who is at your door from anywhere.',
    price: 19900, stock: 30, rating: 4.5, reviewCount: 233,
    specs: { Video: '1080p HD', PreRoll: 'Color', Power: 'Battery / Wired', Field: '160°', Audio: 'Two-way' } },

  // ---------------- WEARABLES ----------------
  { slug: 'apple-watch-series-9', name: 'Apple Watch Series 9 GPS 45mm', brand: 'Apple', category: 'WEARABLE',
    description: 'The brightest Apple Watch display yet, the new double-tap gesture, and powerful health features.',
    price: 39900, oldPrice: 42900, stock: 38, featured: true, rating: 4.8, reviewCount: 356,
    specs: { Size: '45mm', Chip: 'S9 SiP', Display: 'Always-On Retina', Health: 'ECG + SpO2', Battery: '18h' } },
  { slug: 'galaxy-watch-6', name: 'Samsung Galaxy Watch 6 44mm', brand: 'Samsung', category: 'WEARABLE',
    description: 'Advanced sleep coaching, body composition, and a slimmer design with a bigger display.',
    price: 32900, stock: 33, rating: 4.6, reviewCount: 147,
    specs: { Size: '44mm', OS: 'Wear OS', Health: 'BIA + ECG', Display: 'Super AMOLED', Battery: '40h' } },
  { slug: 'garmin-fenix-7', name: 'Garmin Fenix 7', brand: 'Garmin', category: 'WEARABLE',
    description: 'A rugged multisport GPS watch with solar charging, topo maps, and weeks of battery life.',
    price: 69900, stock: 15, rating: 4.8, reviewCount: 178,
    specs: { Build: 'Rugged', GPS: 'Multi-band', Battery: '18 days', Maps: 'TopoActive', Solar: 'Yes' } },
  { slug: 'fitbit-charge-6', name: 'Fitbit Charge 6', brand: 'Fitbit', category: 'WEARABLE',
    description: 'The most advanced Fitbit tracker with built-in GPS, heart-rate, and Google apps.',
    price: 15900, oldPrice: 17900, stock: 52, rating: 4.5, reviewCount: 201,
    specs: { GPS: 'Built-in', Sensors: 'HR + EDA', Battery: '7 days', Apps: 'Google Maps/Wallet', Water: '50m' } },

  // ---------------- ACCESSORIES ----------------
  { slug: 'anker-737-powerbank', name: 'Anker 737 Power Bank 24000mAh', brand: 'Anker', category: 'ACCESSORY',
    description: 'A 140W power bank with a smart display. Charges a laptop, phone, and earbuds at once.',
    price: 9900, oldPrice: 12900, stock: 60, rating: 4.7, reviewCount: 289,
    specs: { Capacity: '24000mAh', Output: '140W', Ports: '2x USB-C, 1x USB-A', Display: 'Smart', Recharge: '1h' } },
  { slug: 'mx-master-3s', name: 'Logitech MX Master 3S Mouse', brand: 'Logitech', category: 'ACCESSORY',
    description: 'The flagship productivity mouse: 8K DPI, quiet clicks, MagSpeed scroll, and multi-device flow.',
    price: 9900, stock: 44, rating: 4.8, reviewCount: 372,
    specs: { DPI: '8000', Scroll: 'MagSpeed', Battery: '70 days', Connect: 'Bolt / BT', Devices: '3' } },
  { slug: 'samsung-990-pro-2tb', name: 'Samsung 990 PRO 2TB NVMe SSD', brand: 'Samsung', category: 'ACCESSORY',
    description: 'PCIe 4.0 speeds up to 7,450 MB/s for gaming and creative work. PS5 compatible.',
    price: 16900, oldPrice: 21900, stock: 37, rating: 4.9, reviewCount: 256,
    specs: { Capacity: '2TB', Interface: 'PCIe 4.0', Read: '7450 MB/s', Form: 'M.2 2280', PS5: 'Compatible' } },
  { slug: 'ugreen-100w-charger', name: 'UGREEN Nexode 100W GaN Charger', brand: 'UGREEN', category: 'ACCESSORY',
    description: 'A compact 4-port GaN charger that powers a laptop and three devices simultaneously.',
    price: 4900, stock: 70, rating: 4.6, reviewCount: 184,
    specs: { Output: '100W', Ports: '3x USB-C, 1x USB-A', Tech: 'GaN', Size: 'Compact', Foldable: 'Pins' } },
];

async function main() {
  console.log('🌱 Seeding KEYCULT (electronics) database...');

  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const customerPassword = await bcrypt.hash('Test1234!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@keycult.dev' },
    update: { password: adminPassword, role: 'ADMIN', name: 'KEYCULT Admin' },
    create: { email: 'admin@keycult.dev', password: adminPassword, name: 'KEYCULT Admin', role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: { password: customerPassword, name: 'John Doe' },
    create: { email: 'john@example.com', password: customerPassword, name: 'John Doe', role: 'USER' },
  });
  console.log('   ✓ Users (admin@keycult.dev / john@example.com)');

  counters = {};
  for (const p of items) {
    const data = { ...p, images: pics(p.category), specs: p.specs };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
  }
  console.log(`   ✓ ${items.length} products across 8 categories`);
  console.log(`   ✓ ${items.filter((p) => p.featured).length} featured`);
  console.log(`   ✓ ${items.filter((p) => p.oldPrice).length} on sale`);
  console.log('✅ Seed complete.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
