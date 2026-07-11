import { db, categoriesTable, productsTable, productVariationsTable } from "@workspace/db";
import { logger } from "./lib/logger";

type SeedVariation = {
  name: string;
  sku: string;
  priceCents: number;
  stockQuantity: number;
};

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  franchise: string;
  priceCents: number;
  salePriceCents?: number;
  isExclusive?: boolean;
  isOnSale?: boolean;
  isNew?: boolean;
  popularityScore: number;
  image: string;
  variations: SeedVariation[];
};

const categories: {
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  parentSlug?: string;
}[] = [
  {
    slug: "vinyl-figures",
    name: "Vinyl Figures",
    description: "Stylized chibi vinyl collectibles from your favorite universes.",
    imageUrl: "products/nova-reaper.png",
  },
  {
    slug: "statues",
    name: "Statues",
    description: "Premium display-grade resin statues for serious collectors.",
    imageUrl: "products/crimson-oracle.png",
  },
  {
    slug: "trading-cards",
    name: "Trading Cards",
    description: "Booster packs, holo sets, and chase-card collections.",
    imageUrl: "products/starforge-booster.png",
  },
  {
    slug: "funko",
    name: "Funko",
    description: "Officially licensed Funko collectibles across every fandom.",
  },
  {
    slug: "dorbz",
    name: "Dorbz!",
    description: "Round-bodied stylized collectible figures.",
    parentSlug: "funko",
  },
  {
    slug: "autograph-pops",
    name: "Autograph Pops",
    description: "Hand-signed, authenticated collectible figures.",
    parentSlug: "funko",
  },
  {
    slug: "marvel",
    name: "Marvel",
    description: "Heroes and villains from the Marvel universe.",
    parentSlug: "funko",
  },
  {
    slug: "dc",
    name: "DC",
    description: "Heroes and villains from the DC universe.",
    parentSlug: "funko",
  },
  {
    slug: "anime",
    name: "Anime",
    description: "Fan-favorite characters from anime series and films.",
    parentSlug: "funko",
  },
  {
    slug: "disney",
    name: "Disney",
    description: "Classic and modern Disney characters.",
    parentSlug: "funko",
  },
  {
    slug: "television",
    name: "Television",
    description: "Characters from hit TV series.",
    parentSlug: "funko",
  },
  {
    slug: "horror",
    name: "Horror",
    description: "Icons from classic and modern horror.",
    parentSlug: "funko",
  },
  {
    slug: "movies",
    name: "Movies",
    description: "Characters from blockbuster films.",
    parentSlug: "funko",
  },
  {
    slug: "games",
    name: "Games",
    description: "Characters from video games.",
    parentSlug: "funko",
  },
  {
    slug: "exclusives",
    name: "Exclusives",
    description: "Limited-run, retailer-exclusive Funko drops.",
    parentSlug: "funko",
  },
];

const products: SeedProduct[] = [
  {
    slug: "nova-reaper",
    name: "Nova Reaper",
    description:
      "A cosmic warrior wielding a glowing scythe carved from a dead star. Nova Reaper stands ready atop a starburst display base with a glossy vinyl finish.",
    categorySlug: "vinyl-figures",
    franchise: "Starforge Chronicles",
    priceCents: 1899,
    isNew: true,
    popularityScore: 92,
    image: "nova-reaper.png",
    variations: [
      { name: "Standard Edition", sku: "SF-NOVA-STD", priceCents: 1899, stockQuantity: 42 },
      { name: "Glow-in-the-Dark Chase", sku: "SF-NOVA-GLOW", priceCents: 2899, stockQuantity: 6 },
    ],
  },
  {
    slug: "glitch-king",
    name: "Glitch King",
    description:
      "Half samurai, half rogue AI — Glitch King's neon armor flickers between dimensions. Includes a display-ready starburst base.",
    categorySlug: "vinyl-figures",
    franchise: "Neon Ronin",
    priceCents: 1799,
    isNew: true,
    popularityScore: 87,
    image: "glitch-king.png",
    variations: [
      { name: "Standard Edition", sku: "NR-GLITCH-STD", priceCents: 1799, stockQuantity: 38 },
    ],
  },
  {
    slug: "iron-vanguard-prime",
    name: "Iron Vanguard Prime",
    description:
      "The flagship hero of the Iron Vanguard line, cast in gleaming red and gold with a light-up chest core sculpt. A convention-exclusive release.",
    categorySlug: "vinyl-figures",
    franchise: "Iron Vanguard",
    priceCents: 2499,
    isExclusive: true,
    popularityScore: 98,
    image: "iron-vanguard-prime.png",
    variations: [
      { name: "Exclusive Edition", sku: "IV-PRIME-EXC", priceCents: 2499, stockQuantity: 15 },
    ],
  },
  {
    slug: "rustbolt-the-tinkerer",
    name: "Rustbolt the Tinkerer",
    description:
      "A scrappy steampunk inventor-bot with oversized goggles and a trusty wrench. Currently on sale for a limited time.",
    categorySlug: "vinyl-figures",
    franchise: "Iron Vanguard",
    priceCents: 1699,
    salePriceCents: 1199,
    isOnSale: true,
    popularityScore: 74,
    image: "rustbolt-tinkerer.png",
    variations: [
      { name: "Standard Edition", sku: "IV-RUSTBOLT-STD", priceCents: 1199, stockQuantity: 51 },
    ],
  },
  {
    slug: "crimson-oracle",
    name: "Crimson Oracle",
    description:
      "A museum-quality resin statue of the Skyfall Legends' most powerful sorceress, captured mid-incantation with a glowing orb.",
    categorySlug: "statues",
    franchise: "Skyfall Legends",
    priceCents: 8999,
    isNew: true,
    popularityScore: 81,
    image: "crimson-oracle.png",
    variations: [
      { name: "1:8 Scale", sku: "SL-ORACLE-18", priceCents: 8999, stockQuantity: 9 },
      { name: "1:6 Scale Deluxe", sku: "SL-ORACLE-16", priceCents: 14999, stockQuantity: 3 },
    ],
  },
  {
    slug: "hollow-sentinel",
    name: "The Hollow Sentinel",
    description:
      "A spectral undead knight statue, cracked bone armor lit from within by an eerie green flame. Limited exclusive run.",
    categorySlug: "statues",
    franchise: "Crypt Keepers",
    priceCents: 10999,
    isExclusive: true,
    popularityScore: 90,
    image: "hollow-sentinel.png",
    variations: [
      { name: "1:8 Scale Exclusive", sku: "CK-SENTINEL-18", priceCents: 10999, stockQuantity: 5 },
    ],
  },
  {
    slug: "void-empress",
    name: "Void Empress",
    description:
      "The regal ruler of the Starforge Chronicles' outer rim, draped in a starfield cape and crowned with orbiting planets. On sale now.",
    categorySlug: "statues",
    franchise: "Starforge Chronicles",
    priceCents: 12999,
    salePriceCents: 9999,
    isOnSale: true,
    popularityScore: 88,
    image: "void-empress.png",
    variations: [
      { name: "1:8 Scale", sku: "SF-EMPRESS-18", priceCents: 9999, stockQuantity: 11 },
    ],
  },
  {
    slug: "starforge-founders-booster",
    name: "Founders Series Booster Pack",
    description:
      "The original Starforge Chronicles trading card set. Every pack guarantees one holo and one foil rarity card.",
    categorySlug: "trading-cards",
    franchise: "Starforge Chronicles",
    priceCents: 599,
    popularityScore: 65,
    image: "starforge-booster.png",
    variations: [
      { name: "Single Pack", sku: "SF-CARDS-SINGLE", priceCents: 599, stockQuantity: 120 },
      { name: "Booster Box (24 packs)", sku: "SF-CARDS-BOX", priceCents: 11999, stockQuantity: 14 },
    ],
  },
  {
    slug: "neon-ronin-holo-set",
    name: "Neon Ronin Holo Set",
    description:
      "A full holographic set spotlighting every hero and villain in the Neon Ronin universe. On sale for a limited time.",
    categorySlug: "trading-cards",
    franchise: "Neon Ronin",
    priceCents: 3499,
    salePriceCents: 2499,
    isOnSale: true,
    popularityScore: 70,
    image: "neon-ronin-holo.png",
    variations: [
      { name: "Complete Holo Set", sku: "NR-CARDS-HOLO", priceCents: 2499, stockQuantity: 27 },
    ],
  },
  {
    slug: "crypt-keepers-chase-pack",
    name: "Crypt Keepers Chase Pack",
    description:
      "Ultra-rare chase cards from the Crypt Keepers set, individually numbered. An exclusive drop for dedicated collectors.",
    categorySlug: "trading-cards",
    franchise: "Crypt Keepers",
    priceCents: 1999,
    isExclusive: true,
    popularityScore: 77,
    image: "crypt-keepers-chase.png",
    variations: [
      { name: "Chase Pack", sku: "CK-CARDS-CHASE", priceCents: 1999, stockQuantity: 8 },
    ],
  },
];

async function seed() {
  logger.info("Seeding Figureheadz demo catalog...");

  const categoryIdBySlug = new Map<string, number>();
  for (const category of categories) {
    const parentId = category.parentSlug ? categoryIdBySlug.get(category.parentSlug) ?? null : null;
    if (category.parentSlug && parentId == null) {
      throw new Error(`Unknown parent category slug: ${category.parentSlug} (must be seeded before its children)`);
    }
    const [row] = await db
      .insert(categoriesTable)
      .values({
        slug: category.slug,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl ?? null,
        parentId,
      })
      .onConflictDoUpdate({
        target: categoriesTable.slug,
        set: { name: category.name, description: category.description, imageUrl: category.imageUrl ?? null, parentId },
      })
      .returning();
    if (row) categoryIdBySlug.set(category.slug, row.id);
  }

  for (const product of products) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${product.categorySlug}`);
    }

    const imagePath = `products/${product.image}`;

    const [row] = await db
      .insert(productsTable)
      .values({
        slug: product.slug,
        name: product.name,
        description: product.description,
        categoryId,
        franchise: product.franchise,
        priceCents: product.priceCents,
        salePriceCents: product.salePriceCents ?? null,
        isExclusive: product.isExclusive ?? false,
        isOnSale: product.isOnSale ?? false,
        isNew: product.isNew ?? false,
        images: [imagePath],
        popularityScore: product.popularityScore,
      })
      .onConflictDoUpdate({
        target: productsTable.slug,
        set: {
          name: product.name,
          description: product.description,
          categoryId,
          franchise: product.franchise,
          priceCents: product.priceCents,
          salePriceCents: product.salePriceCents ?? null,
          isExclusive: product.isExclusive ?? false,
          isOnSale: product.isOnSale ?? false,
          isNew: product.isNew ?? false,
          images: [imagePath],
          popularityScore: product.popularityScore,
        },
      })
      .returning();

    if (!row) continue;

    for (const variation of product.variations) {
      await db
        .insert(productVariationsTable)
        .values({
          productId: row.id,
          name: variation.name,
          sku: variation.sku,
          priceCents: variation.priceCents,
          stockQuantity: variation.stockQuantity,
          imageUrl: imagePath,
        })
        .onConflictDoUpdate({
          target: productVariationsTable.sku,
          set: {
            name: variation.name,
            priceCents: variation.priceCents,
            stockQuantity: variation.stockQuantity,
            imageUrl: imagePath,
          },
        });
    }
  }

  logger.info(
    { categories: categories.length, products: products.length },
    "Seed complete",
  );
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
