import { useState } from "react";
import { Link } from "wouter";
import { useListFeaturedProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Cycles the brand's comic-book palette across the category boxes so every
// box on the homepage (not just the "virtual" Exclusives/On Sale ones) reads
// as part of the same color theme.
const categoryThemes = [
  { bg: "bg-primary", text: "text-white", shadow: "drop-shadow-[2px_2px_0_#000]" },
  { bg: "bg-destructive", text: "text-white", shadow: "drop-shadow-[2px_2px_0_#000]" },
  { bg: "bg-secondary", text: "text-white", shadow: "drop-shadow-[2px_2px_0_#000]" },
  { bg: "bg-primary", text: "text-white", shadow: "drop-shadow-[2px_2px_0_#000]" },
];

export default function Home() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useListFeaturedProducts();
  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast({ variant: "destructive", title: "Oops!", description: "Enter a valid email to subscribe." });
      return;
    }
    toast({ title: "You're in!", description: `We'll send drops and secret sales to ${email}.` });
    setEmail("");
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden border-b-4 border-black halftone-blue py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="inline-block bg-secondary font-display text-2xl lg:text-4xl tracking-widest px-6 py-2 border-4 border-black transform -rotate-2 mb-6 shadow-[8px_8px_0_#000] text-white [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000]">
            WELCOME TO FIGUREHEADZ!
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
          <h2 className="font-display text-5xl uppercase text-white [text-shadow:_-3px_-3px_0_#000,_3px_-3px_0_#000,_-3px_3px_0_#000,_3px_3px_0_#000,_-3px_0px_0_#000,_3px_0px_0_#000,_0px_-3px_0_#000,_0px_3px_0_#000,_5px_5px_0_#000]">Hot Drops</h2>
          <Button variant="outline" asChild className="bg-secondary border-black hover:bg-secondary/90">
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
        <h2 className="font-display text-5xl uppercase mb-8 border-b-4 border-black pb-4 text-white [text-shadow:_-3px_-3px_0_#000,_3px_-3px_0_#000,_-3px_3px_0_#000,_3px_3px_0_#000,_-3px_0px_0_#000,_3px_0px_0_#000,_0px_-3px_0_#000,_0px_3px_0_#000,_5px_5px_0_#000]">Browse The Stash</h2>
        
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
            <h3 className="relative z-10 font-display text-4xl text-white uppercase drop-shadow-[2px_2px_0_#000] transform group-hover:scale-110 transition-transform">
              On Sale
            </h3>
          </Link>

          {loadingCategories ? (
            <div className="bg-muted min-h-[200px] comic-border animate-pulse"></div>
          ) : (
            categories
              ?.filter((category) => !category.parentId)
              .map((category, i) => {
                const theme = categoryThemes[i % categoryThemes.length];
                return (
                  <Link
                    key={category.id}
                    href={`/shop?categorySlug=${category.slug}`}
                    className={`group relative ${theme.bg} p-8 comic-border comic-shadow flex items-center justify-center min-h-[200px] overflow-hidden`}
                  >
                    <div className="absolute inset-0 halftone-bg opacity-30"></div>
                    <h3
                      className={`relative z-10 font-display text-4xl ${theme.text} uppercase ${theme.shadow} transform group-hover:scale-110 transition-transform`}
                    >
                      {category.name}
                    </h3>
                  </Link>
                );
              })
          )}
        </div>
      </section>

      {/* Mailing List CTA */}
      <section className="container mx-auto px-4 mt-8">
        <div className="bg-primary halftone-blue p-8 md:p-16 comic-border comic-shadow relative overflow-hidden">
          <div className="absolute inset-0 halftone-bg opacity-20"></div>
          <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <div>
              <h2 className="font-display text-5xl md:text-6xl uppercase mb-4 text-white [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000]">Don't Miss Out!</h2>
              <p className="text-xl font-medium">Join the Figureheadz Family! Get alerts on new drops, upcoming appearances as well as the latest sales.</p>
            </div>
            <form className="w-full flex flex-col sm:flex-row gap-4 items-stretch justify-center" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL..."
                className="h-16 px-5 comic-border text-xl font-bold bg-white text-black placeholder:text-black/50 w-full sm:w-auto sm:min-w-[2in] sm:flex-1 sm:max-w-md"
              />
              <Button type="submit" size="lg" className="h-16 text-xl px-8 sm:flex-shrink-0">
                SUBSCRIBE
              </Button>
            </form>
            {email && (
              <p className="relative z-10 -mt-2 text-sm font-bold bg-white/70 comic-border px-3 py-1 inline-block">
                We'll send drops to: <span className="font-display">{email}</span>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
