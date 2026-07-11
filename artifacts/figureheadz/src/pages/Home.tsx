import { Link } from "wouter";
import { useListFeaturedProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useListFeaturedProducts();
  const { data: categories, isLoading: loadingCategories } = useListCategories();

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden border-b-4 border-black halftone-blue py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="inline-block bg-secondary text-black font-display text-2xl lg:text-4xl px-6 py-2 border-4 border-black transform -rotate-2 mb-6 shadow-[8px_8px_0_#000]">
            POW! NEW ARRIVALS!
          </div>
          <h1 className="font-display text-6xl lg:text-9xl text-white uppercase drop-shadow-[4px_4px_0_#000] mb-8 max-w-4xl leading-none">
            Unleash Your Inner Collector
          </h1>
          <p className="text-xl lg:text-3xl text-white font-medium mb-10 max-w-2xl drop-shadow-[2px_2px_0_#000]">
            Premium vinyl figures, statues, and cards from the multiverse's greatest franchises.
          </p>
          <Button size="lg" asChild className="text-2xl transform hover:scale-105">
            <Link href="/shop">SHOP THE MULTIVERSE</Link>
          </Button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-secondary rounded-full mix-blend-overlay opacity-50 animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-48 h-48 bg-destructive rounded-full mix-blend-overlay opacity-50 animate-bounce"></div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 border-b-4 border-black pb-4">
          <h2 className="font-display text-5xl uppercase drop-shadow-[2px_2px_0_hsl(48_100%_50%)]">Hot Drops</h2>
          <Button variant="outline" asChild>
            <Link href="/shop">View All</Link>
          </Button>
        </div>
        
        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse comic-border"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts?.slice(0, 4).map((product, i) => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <h2 className="font-display text-5xl uppercase mb-8 drop-shadow-[2px_2px_0_hsl(48_100%_50%)] border-b-4 border-black pb-4">Browse The Stash</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Virtual Categories */}
          <Link href="/shop?isExclusive=true" className="group relative bg-destructive p-8 comic-border comic-shadow flex items-center justify-center min-h-[200px] overflow-hidden">
            <div className="absolute inset-0 halftone-bg opacity-30"></div>
            <h3 className="relative z-10 font-display text-4xl text-white uppercase drop-shadow-[2px_2px_0_#000] transform group-hover:scale-110 transition-transform">
              Exclusives
            </h3>
          </Link>

          <Link href="/shop?isOnSale=true" className="group relative bg-secondary p-8 comic-border comic-shadow flex items-center justify-center min-h-[200px] overflow-hidden">
            <div className="absolute inset-0 halftone-bg opacity-30"></div>
            <h3 className="relative z-10 font-display text-4xl text-black uppercase drop-shadow-[2px_2px_0_#fff] transform group-hover:scale-110 transition-transform">
              On Sale
            </h3>
          </Link>

          {loadingCategories ? (
            <div className="bg-muted min-h-[200px] comic-border animate-pulse"></div>
          ) : (
            categories?.map((category) => (
              <Link key={category.id} href={`/shop?categorySlug=${category.slug}`} className="group relative bg-white p-8 comic-border comic-shadow flex items-center justify-center min-h-[200px] overflow-hidden hover:bg-primary transition-colors">
                <div className="absolute inset-0 halftone-bg opacity-10 group-hover:opacity-30"></div>
                <h3 className="relative z-10 font-display text-4xl text-black group-hover:text-white uppercase drop-shadow-[2px_2px_0_#fff] group-hover:drop-shadow-[2px_2px_0_#000] transform group-hover:scale-110 transition-all">
                  {category.name}
                </h3>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Mailing List CTA */}
      <section className="container mx-auto px-4 mt-8">
        <div className="bg-secondary p-8 md:p-16 comic-border comic-shadow relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 halftone-bg opacity-20"></div>
          <div className="relative z-10 max-w-xl">
            <h2 className="font-display text-5xl md:text-6xl uppercase mb-4 drop-shadow-[2px_2px_0_#fff]">Don't Miss Out!</h2>
            <p className="text-xl font-medium">Join the Figureheadz transmission. Get alerts on new drops, exclusive variants, and secret sales.</p>
          </div>
          <form className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-4 flex-1 max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="YOUR EMAIL..." className="h-14 px-4 comic-border text-lg font-bold w-full" />
            <Button type="button" size="lg">SUBSCRIBE</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
