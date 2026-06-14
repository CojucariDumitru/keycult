import { PrismaClient, Category } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// A pool of mechanical-keyboard photos. The client has an onError fallback to
// a branded placeholder, so broken links never show a missing image.
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;
// All visually confirmed to render as keyboard/keycap photography.
const KB = [
  'photo-1587829741301-dc798b83add3',
  'photo-1618384887929-16ec33fab9ef',
  'photo-1541140532154-b024d705b90a',
  'photo-1612198188060-c7c2a3b66eae',
  'photo-1595044426077-d36d9236d54a',
  'photo-1563191911-e65f8655ebf9',
  'photo-1602025882379-e01cf08baa51',
];
const pic = (i: number) => [img(KB[i % KB.length]), img(KB[(i + 1) % KB.length])];

type Seed = {
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number; // cents
  category: Category;
  stock: number;
  featured?: boolean;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  images: string[];
};

const products: Seed[] = [
  {
    slug: 'keycult-no2-65',
    name: 'KEYCULT No. 2/65',
    brand: 'KEYCULT',
    description:
      'The flagship. A CNC-machined aluminum 65% with brass internal weight, gasket-mounted plate, and a typing feel that defines the high-end hobby. Limited production run.',
    price: 180000,
    category: 'KEYBOARD',
    stock: 6,
    featured: true,
    rating: 5.0,
    reviewCount: 42,
    specs: { Layout: '65%', Case: 'CNC Aluminum', Mount: 'Gasket', Weight: 'Brass', Hotswap: 'No' },
    images: pic(0),
  },
  {
    slug: 'mode-sonnet',
    name: 'Mode Sonnet',
    brand: 'Mode Designs',
    description:
      'A refined 75% with an O-ring mount system and interchangeable accent pieces. Premium without the wait — ships hotswap-ready.',
    price: 34900,
    category: 'KEYBOARD',
    stock: 18,
    featured: true,
    rating: 4.9,
    reviewCount: 67,
    specs: { Layout: '75%', Case: 'Aluminum', Mount: 'O-Ring', Hotswap: 'Yes', Connection: 'USB-C' },
    images: pic(1),
  },
  {
    slug: 'keychron-q1-pro',
    name: 'Keychron Q1 Pro',
    brand: 'Keychron',
    description:
      'Wireless QMK/VIA 75% with a full aluminum body, double-gasket design, and a screw-in stabilizer setup. The best value gateway into custom keyboards.',
    price: 19900,
    category: 'KEYBOARD',
    stock: 54,
    featured: true,
    rating: 4.8,
    reviewCount: 213,
    specs: { Layout: '75%', Wireless: 'Bluetooth 5.1', Hotswap: 'Yes', Firmware: 'QMK/VIA', Battery: '4000mAh' },
    images: pic(2),
  },
  {
    slug: 'tofu65-20',
    name: 'Tofu65 2.0',
    brand: 'KBDfans',
    description:
      'The iconic budget aluminum 65% case, now with a flex-cut PCB option and improved foam stack. A blank canvas for your first build.',
    price: 12900,
    category: 'KEYBOARD',
    stock: 31,
    rating: 4.6,
    reviewCount: 158,
    specs: { Layout: '65%', Case: 'Aluminum', Mount: 'Tray', Hotswap: 'Optional', Connection: 'USB-C' },
    images: pic(3),
  },
  {
    slug: 'gmmk-pro',
    name: 'GMMK Pro',
    brand: 'Glorious',
    description:
      'A 75% gasket-mounted board with a rotary knob, aluminum frame, and a thriving aftermarket ecosystem.',
    price: 16900,
    category: 'KEYBOARD',
    stock: 27,
    rating: 4.5,
    reviewCount: 189,
    specs: { Layout: '75%', Case: 'Aluminum', Mount: 'Gasket', Knob: 'Yes', Hotswap: 'Yes' },
    images: pic(4),
  },
  {
    slug: 'zoom65',
    name: 'Zoom65',
    brand: 'Meletrix',
    description:
      'A rounded 65% with a unique top-mount-meets-gasket structure, decorative weights, and a flex-cut PCB. Beloved for its sound profile.',
    price: 19900,
    category: 'KEYBOARD',
    stock: 12,
    rating: 4.9,
    reviewCount: 96,
    specs: { Layout: '65%', Case: 'Aluminum', Mount: 'Gasket', Knob: 'Optional', Hotswap: 'Yes' },
    images: pic(5),
  },
  {
    slug: 'nk65-entry',
    name: 'NK65 Entry Edition',
    brand: 'NovelKeys',
    description:
      'A plastic-case 65% that punches far above its price. Hotswap, RGB, and a surprisingly poppy sound out of the box.',
    price: 9900,
    category: 'KEYBOARD',
    stock: 40,
    rating: 4.4,
    reviewCount: 121,
    specs: { Layout: '65%', Case: 'Polycarbonate', Hotswap: 'Yes', RGB: 'Yes', Connection: 'USB-C' },
    images: pic(6),
  },
  {
    slug: 'bakeneko65',
    name: 'Bakeneko65',
    brand: 'CannonKeys',
    description:
      'A minimalist gasket-burger-mount 65% in anodized aluminum. Clean lines, deep sound, open-source design.',
    price: 11500,
    category: 'KEYBOARD',
    stock: 22,
    rating: 4.7,
    reviewCount: 78,
    specs: { Layout: '65%', Case: 'Aluminum', Mount: 'O-Ring Gasket', Hotswap: 'Optional' },
    images: pic(7),
  },

  // ---- KEYCAPS ----
  {
    slug: 'gmk-olivia',
    name: 'GMK Olivia',
    brand: 'GMK',
    description:
      'The legendary rose-gold, white, and mauve doubleshot ABS set. Cherry profile, the most sought-after colorway in the hobby.',
    price: 13900,
    category: 'KEYCAP',
    stock: 15,
    featured: true,
    rating: 4.9,
    reviewCount: 142,
    specs: { Profile: 'Cherry', Material: 'Doubleshot ABS', Manufacturer: 'GMK', Compatibility: 'MX' },
    images: pic(1),
  },
  {
    slug: 'gmk-botanical',
    name: 'GMK Botanical',
    brand: 'GMK',
    description:
      'A muted sage-and-cream set inspired by vintage field guides. Calm, organic, and endlessly versatile.',
    price: 13500,
    category: 'KEYCAP',
    stock: 19,
    rating: 4.8,
    reviewCount: 88,
    specs: { Profile: 'Cherry', Material: 'Doubleshot ABS', Manufacturer: 'GMK', Compatibility: 'MX' },
    images: pic(2),
  },
  {
    slug: 'pbtfans-blue-samurai',
    name: 'PBTfans Blue Samurai',
    brand: 'PBTfans',
    description:
      'A bold red-on-deep-blue set in durable dye-sub PBT. Inspired by samurai armor, with crisp legends that never fade.',
    price: 9500,
    category: 'KEYCAP',
    stock: 33,
    rating: 4.7,
    reviewCount: 64,
    specs: { Profile: 'Cherry', Material: 'Dye-sub PBT', Manufacturer: 'PBTfans', Compatibility: 'MX' },
    images: pic(3),
  },
  {
    slug: 'epbt-kuro-shiro',
    name: 'ePBT Kuro/Shiro',
    brand: 'ePBT',
    description:
      'A clean monochrome PBT set with reversible black or white themes. The perfect minimalist daily driver.',
    price: 7900,
    category: 'KEYCAP',
    stock: 41,
    rating: 4.5,
    reviewCount: 52,
    specs: { Profile: 'Cherry', Material: 'PBT', Manufacturer: 'ePBT', Compatibility: 'MX' },
    images: pic(4),
  },
  {
    slug: 'sa-carbon',
    name: 'SA Carbon',
    brand: 'Signature Plastics',
    description:
      'The retro-futurist classic. Tall, sculpted SA profile in charcoal and yellow — a true desk centerpiece.',
    price: 14900,
    category: 'KEYCAP',
    stock: 9,
    rating: 4.6,
    reviewCount: 47,
    specs: { Profile: 'SA', Material: 'Doubleshot ABS', Manufacturer: 'SP', Compatibility: 'MX' },
    images: pic(5),
  },

  // ---- SWITCHES ----
  {
    slug: 'gateron-oil-king',
    name: 'Gateron Oil King (90x)',
    brand: 'Gateron',
    description:
      'A factory-lubed linear switch with a buttery 55g actuation and deep, refined sound. Pack of 90.',
    price: 5400,
    category: 'SWITCH',
    stock: 120,
    rating: 4.8,
    reviewCount: 203,
    specs: { Type: 'Linear', Actuation: '55g', Lube: 'Factory', Pins: '5-pin', Count: '90' },
    images: pic(6),
  },
  {
    slug: 'holy-panda-x',
    name: 'Holy Panda X (35x)',
    brand: 'Drop',
    description:
      'The benchmark tactile. A rounded, snappy bump with a satisfying thock. Pack of 35.',
    price: 3500,
    category: 'SWITCH',
    stock: 85,
    rating: 4.7,
    reviewCount: 176,
    specs: { Type: 'Tactile', Actuation: '67g', Lube: 'Factory', Pins: '5-pin', Count: '35' },
    images: pic(7),
  },
  {
    slug: 'cherry-mx2a-red',
    name: 'Cherry MX2A Red (70x)',
    brand: 'Cherry',
    description:
      'The reinvented classic. MX2A redesign brings factory lube and smoother travel to the iconic red linear. Pack of 70.',
    price: 2800,
    category: 'SWITCH',
    stock: 140,
    rating: 4.5,
    reviewCount: 98,
    specs: { Type: 'Linear', Actuation: '45g', Lube: 'Factory', Pins: '3-pin', Count: '70' },
    images: pic(0),
  },
  {
    slug: 'boba-u4t',
    name: 'Boba U4T Tactile (70x)',
    brand: 'Gazzew',
    description:
      'A loud, sharp tactile with a strong bump and a clacky signature. The thocky favorite. Pack of 70.',
    price: 3900,
    category: 'SWITCH',
    stock: 76,
    rating: 4.8,
    reviewCount: 134,
    specs: { Type: 'Tactile', Actuation: '62g', Lube: 'None', Pins: '5-pin', Count: '70' },
    images: pic(1),
  },

  // ---- ACCESSORIES ----
  {
    slug: 'coiled-cable-aviator',
    name: 'Coiled USB-C Cable — Aviator',
    brand: 'KEYCULT',
    description:
      'A hand-built double-sleeved coiled cable with a brass aviator connector. The finishing touch for any build.',
    price: 4500,
    category: 'ACCESSORY',
    stock: 60,
    rating: 4.6,
    reviewCount: 71,
    specs: { Connector: 'USB-C', Detachable: 'Aviator', Length: '1.5m', Sleeve: 'Double' },
    images: pic(2),
  },
  {
    slug: 'brass-rotary-knob',
    name: 'Brass Rotary Knob',
    brand: 'KEYCULT',
    description:
      'A machined brass knob upgrade with a knurled grip. Adds heft and a premium tactile turn to compatible boards.',
    price: 2500,
    category: 'ACCESSORY',
    stock: 48,
    rating: 4.4,
    reviewCount: 33,
    specs: { Material: 'Brass', Finish: 'Knurled', Compatibility: 'GMMK Pro / Q-series' },
    images: pic(3),
  },

  // ---- DESKMAT ----
  {
    slug: 'deskmat-nightfall',
    name: 'KEYCULT Deskmat — Nightfall',
    brand: 'KEYCULT',
    description:
      'A 900×400mm stitched-edge deskmat with a deep gradient nightscape. Smooth cloth top, rubber base.',
    price: 3500,
    category: 'DESKMAT',
    stock: 90,
    rating: 4.7,
    reviewCount: 59,
    specs: { Size: '900×400mm', Thickness: '4mm', Edge: 'Stitched', Base: 'Rubber' },
    images: pic(4),
  },
];

async function main() {
  console.log('🌱 Seeding KEYCULT database...');

  // --- Users ---
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const customerPassword = await bcrypt.hash('Test1234!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@keycult.dev' },
    update: { password: adminPassword, role: 'ADMIN', name: 'KEYCULT Admin' },
    create: {
      email: 'admin@keycult.dev',
      password: adminPassword,
      name: 'KEYCULT Admin',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: { password: customerPassword, name: 'John Doe' },
    create: {
      email: 'john@example.com',
      password: customerPassword,
      name: 'John Doe',
      role: 'USER',
    },
  });
  console.log('   ✓ Users (admin@keycult.dev / john@example.com)');

  // --- Products ---
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...p, specs: p.specs },
      create: { ...p, specs: p.specs },
    });
  }
  console.log(`   ✓ ${products.length} products`);

  const featured = products.filter((p) => p.featured).length;
  console.log(`   ✓ ${featured} featured products`);
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
