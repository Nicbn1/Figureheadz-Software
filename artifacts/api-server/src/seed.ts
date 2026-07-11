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
  {
    slug: "one-piece",
    name: "One Piece",
    description: "High-seas pirate adventure trading card sets.",
    parentSlug: "trading-cards",
  },
  {
    slug: "yu-gi-oh",
    name: "Yu-Gi-Oh!",
    description: "Duel monster summoner card sets.",
    parentSlug: "trading-cards",
  },
  {
    slug: "pokemon",
    name: "Pokemon",
    description: "Creature-collector trading card sets.",
    parentSlug: "trading-cards",
  },
  {
    slug: "magic",
    name: "Magic",
    description: "Fantasy spellcasting trading card sets.",
    parentSlug: "trading-cards",
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

  // Funko Pop line -- one figure seeded per Funko subcategory so browsing the
  // "Funko" parent category (which has no products of its own) surfaces the
  // full spread of pops across every subcategory.
  {
    slug: "rustbot-dorbz",
    name: "Rustbot Dorbz",
    description:
      "A scrappy steampunk copper-and-brass mascot squashed into the signature round-bodied Dorbz sculpt, with oversized goggle eyes and a tiny wrench.",
    categorySlug: "dorbz",
    franchise: "Iron Vanguard",
    priceCents: 1299,
    isNew: true,
    popularityScore: 60,
    image: "dorbz-rustbot.png",
    variations: [
      { name: "Standard Dorbz", sku: "FK-DORBZ-RUSTBOT", priceCents: 1299, stockQuantity: 45 },
    ],
  },
  {
    slug: "captain-solara-autograph-pop",
    name: "Captain Solara Autograph Pop",
    description:
      "A hand-signed, individually authenticated Pop of Starforge Chronicles' Captain Solara, complete with certificate of authenticity sticker.",
    categorySlug: "autograph-pops",
    franchise: "Starforge Chronicles",
    priceCents: 5999,
    isExclusive: true,
    popularityScore: 71,
    image: "autograph-captain-solara.png",
    variations: [
      { name: "Signed Edition", sku: "FK-AUTO-SOLARA", priceCents: 5999, stockQuantity: 4 },
    ],
  },
  {
    slug: "crimson-bolt-pop",
    name: "Crimson Bolt Pop",
    description:
      "Vortex Legion's lightning-fast vigilante Crimson Bolt, captured mid-strike in the classic big-head Pop sculpt.",
    categorySlug: "marvel",
    franchise: "Vortex Legion",
    priceCents: 1399,
    popularityScore: 68,
    image: "marvel-crimson-bolt.png",
    variations: [
      { name: "Standard Pop", sku: "FK-MARVEL-BOLT", priceCents: 1399, stockQuantity: 60 },
    ],
  },
  {
    slug: "twilight-sentinel-pop",
    name: "Twilight Sentinel Pop",
    description:
      "The stoic, moonlit guardian of the Twilight Guard, rendered in navy and silver with a crescent-moon emblem.",
    categorySlug: "dc",
    franchise: "Twilight Guard",
    priceCents: 1399,
    popularityScore: 66,
    image: "dc-twilight-sentinel.png",
    variations: [
      { name: "Standard Pop", sku: "FK-DC-SENTINEL", priceCents: 1399, stockQuantity: 55 },
    ],
  },
  {
    slug: "sakura-blade-pop",
    name: "Sakura Blade Pop",
    description:
      "Blade & Blossom's pink-haired ninja Sakura Blade, sword drawn and scarf flowing, in glossy vinyl Pop form.",
    categorySlug: "anime",
    franchise: "Blade & Blossom",
    priceCents: 1499,
    isNew: true,
    popularityScore: 73,
    image: "anime-sakura-blade.png",
    variations: [
      { name: "Standard Pop", sku: "FK-ANIME-SAKURA", priceCents: 1499, stockQuantity: 50 },
    ],
  },
  {
    slug: "princess-wishwood-pop",
    name: "Princess Wishwood Pop",
    description:
      "The gentle heart of the Wishwood Kingdom, Princess Wishwood twirls in a pastel ballgown with a sparkling tiara.",
    categorySlug: "disney",
    franchise: "Wishwood Kingdom",
    priceCents: 1399,
    popularityScore: 69,
    image: "disney-princess-wishwood.png",
    variations: [
      { name: "Standard Pop", sku: "FK-DISNEY-WISHWOOD", priceCents: 1399, stockQuantity: 58 },
    ],
  },
  {
    slug: "detective-muncher-pop",
    name: "Detective Muncher Pop",
    description:
      "Static Sitcom's beloved retro TV detective, trench coat, fedora, and coffee mug included, in classic Pop proportions.",
    categorySlug: "television",
    franchise: "Static Sitcom",
    priceCents: 1299,
    popularityScore: 58,
    image: "tv-detective-muncher.png",
    variations: [
      { name: "Standard Pop", sku: "FK-TV-MUNCHER", priceCents: 1299, stockQuantity: 62 },
    ],
  },
  {
    slug: "nightshade-reaper-pop",
    name: "Nightshade Reaper Pop",
    description:
      "A glowing-eyed, lantern-carrying undead figure from the Crypt Keepers universe, tattered robes and all, for horror collectors.",
    categorySlug: "horror",
    franchise: "Crypt Keepers",
    priceCents: 1499,
    isExclusive: true,
    popularityScore: 75,
    image: "horror-nightshade-reaper.png",
    variations: [
      { name: "Standard Pop", sku: "FK-HORROR-NIGHTSHADE", priceCents: 1499, stockQuantity: 30 },
    ],
  },
  {
    slug: "galaxy-reel-stunt-hero-pop",
    name: "Galaxy Reel Stunt Hero Pop",
    description:
      "The rugged blaster-toting adventurer from the Galaxy Reel film series, leather jacket and all, in glossy vinyl Pop form.",
    categorySlug: "movies",
    franchise: "Galaxy Reel",
    priceCents: 1399,
    popularityScore: 64,
    image: "movies-galaxy-reel-hero.png",
    variations: [
      { name: "Standard Pop", sku: "FK-MOVIES-GALAXYREEL", priceCents: 1399, stockQuantity: 47 },
    ],
  },
  {
    slug: "pixel-rift-warrior-pop",
    name: "Pixel Rift Warrior Pop",
    description:
      "A blocky, glowing-cyan armored warrior straight out of the Pixel Rift video game, sword crackling with pixelated energy.",
    categorySlug: "games",
    franchise: "Pixel Rift",
    priceCents: 1399,
    isNew: true,
    popularityScore: 67,
    image: "games-pixel-rift-warrior.png",
    variations: [
      { name: "Standard Pop", sku: "FK-GAMES-PIXELRIFT", priceCents: 1399, stockQuantity: 52 },
    ],
  },
  {
    slug: "golden-nova-reaper-pop",
    name: "Golden Nova Reaper Pop",
    description:
      "A limited-run, all-chrome gold variant of Starforge Chronicles' Nova Reaper, individually numbered for serious collectors.",
    categorySlug: "exclusives",
    franchise: "Starforge Chronicles",
    priceCents: 2999,
    isExclusive: true,
    popularityScore: 80,
    image: "exclusive-golden-nova-reaper.png",
    variations: [
      { name: "Gold Chrome Exclusive", sku: "FK-EXCL-GOLDNOVA", priceCents: 2999, stockQuantity: 10 },
    ],
  },

  // Trading card subcategory boosters -- one per subcategory so browsing
  // "Trading Cards" surfaces every subcategory's pack, same as Funko above.
  {
    slug: "grand-voyage-booster",
    name: "Grand Voyage Booster Pack",
    description:
      "Set sail with the Grand Voyage crew in this high-seas pirate-adventure booster pack, guaranteed one holo captain card per pack.",
    categorySlug: "one-piece",
    franchise: "Grand Voyage",
    priceCents: 699,
    isNew: true,
    popularityScore: 63,
    image: "one-piece-grand-voyage-booster.png",
    variations: [
      { name: "Single Pack", sku: "TC-ONEPIECE-SINGLE", priceCents: 699, stockQuantity: 90 },
      { name: "Booster Box (24 packs)", sku: "TC-ONEPIECE-BOX", priceCents: 13999, stockQuantity: 10 },
    ],
  },
  {
    slug: "arcane-duelists-booster",
    name: "Arcane Duelists Booster Pack",
    description:
      "Summon fierce dragon-like monsters from the Arcane Duelists set, every pack guarantees one dark-fantasy foil rarity.",
    categorySlug: "yu-gi-oh",
    franchise: "Arcane Duelists",
    priceCents: 699,
    popularityScore: 61,
    image: "yugioh-arcane-duelists-booster.png",
    variations: [
      { name: "Single Pack", sku: "TC-YUGIOH-SINGLE", priceCents: 699, stockQuantity: 85 },
      { name: "Booster Box (24 packs)", sku: "TC-YUGIOH-BOX", priceCents: 13999, stockQuantity: 8 },
    ],
  },
  {
    slug: "critter-league-booster",
    name: "Critter League Booster Pack",
    description:
      "Catch and collect adorable creatures from the Critter League set, bright and colorful with a guaranteed rare per pack.",
    categorySlug: "pokemon",
    franchise: "Critter League",
    priceCents: 599,
    isNew: true,
    popularityScore: 68,
    image: "pokemon-critter-league-booster.png",
    variations: [
      { name: "Single Pack", sku: "TC-POKEMON-SINGLE", priceCents: 599, stockQuantity: 100 },
      { name: "Booster Box (24 packs)", sku: "TC-POKEMON-BOX", priceCents: 11999, stockQuantity: 12 },
    ],
  },
  {
    slug: "runebound-chronicles-booster",
    name: "Runebound Chronicles Booster Pack",
    description:
      "Weave epic spells with the Runebound Chronicles set, featuring hooded spellcasters and glowing rune magic in every pack.",
    categorySlug: "magic",
    franchise: "Runebound Chronicles",
    priceCents: 799,
    popularityScore: 64,
    image: "magic-runebound-booster.png",
    variations: [
      { name: "Single Pack", sku: "TC-MAGIC-SINGLE", priceCents: 799, stockQuantity: 80 },
      { name: "Booster Box (24 packs)", sku: "TC-MAGIC-BOX", priceCents: 15999, stockQuantity: 9 },
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
