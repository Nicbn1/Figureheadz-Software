import { useState } from "react";
import { useLocation } from "wouter";
import { useListProducts, useListCategories, useListFranchises, type ListProductsSort } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X, ChevronDown } from "lucide-react";

export default function Shop() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const categorySlug = searchParams.get("categorySlug") || undefined;
  const franchise = searchParams.get("franchise") || undefined;
  const search = searchParams.get("search") || undefined;
  const inStockOnly = searchParams.get("inStockOnly") === "true";
  const isOnSale = searchParams.get("isOnSale") === "true";
  const isExclusive = searchParams.get("isExclusive") === "true";
  const sort = (searchParams.get("sort") as ListProductsSort) || "newest";

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(search || "");

  const { data: products, isLoading: loadingProducts } = useListProducts({
    categorySlug,
    franchise,
    search,
    inStockOnly: inStockOnly ? true : undefined,
    sort,
  });

  const { data: categories } = useListCategories();
  const { data: franchises } = useListFranchises();

  // Filter products by boolean flags locally since the API params don't support them directly
  // In a real app we'd add these to ListProductsParams, but we work with what we have
  const filteredProducts = products?.filter(p => {
    if (isOnSale && !p.isOnSale) return false;
    if (isExclusive && !p.isExclusive) return false;
    return true;
  });

  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setLocation(`/shop?${newParams.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || null });
  };

  const activeFilterCount = [categorySlug, franchise, inStockOnly, isOnSale, isExclusive, search].filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="font-display text-6xl uppercase drop-shadow-[2px_2px_0_hsl(48_100%_50%)]">The Catalog</h1>
          {search && <p className="text-xl font-bold mt-2">Showing results for "{search}"</p>}
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex flex-1 md:w-64 gap-2">
            <Input 
              placeholder="Search..." 
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value)} 
              className="h-12"
            />
          </form>
          <Button 
            variant={activeFilterCount > 0 ? "primary" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden shrink-0"
          >
            <Filter className="mr-2 h-5 w-5" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 space-y-8`}>
          <div className="bg-white p-6 comic-border comic-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-2xl uppercase">Filters</h3>
              {activeFilterCount > 0 && (
                <button 
                  onClick={() => setLocation("/shop")}
                  className="text-sm font-bold text-destructive hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 uppercase tracking-wider text-sm">Sort By</h4>
              <div className="relative">
                <select 
                  className="w-full comic-border h-10 px-3 appearance-none bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  value={sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                >
                  <option value="newest">Newest First</option>
                  <option value="popularity">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 pointer-events-none" />
              </div>
            </div>

            {/* Special Collections */}
            <div className="mb-6 space-y-2">
              <h4 className="font-bold mb-2 uppercase tracking-wider text-sm">Collections</h4>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isOnSale} 
                  onChange={(e) => updateFilters({ isOnSale: e.target.checked ? "true" : null })}
                  className="w-5 h-5 comic-border accent-primary cursor-pointer" 
                />
                <span className="font-medium group-hover:text-primary transition-colors">On Sale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isExclusive} 
                  onChange={(e) => updateFilters({ isExclusive: e.target.checked ? "true" : null })}
                  className="w-5 h-5 comic-border accent-primary cursor-pointer" 
                />
                <span className="font-medium group-hover:text-primary transition-colors">Exclusives</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={inStockOnly} 
                  onChange={(e) => updateFilters({ inStockOnly: e.target.checked ? "true" : null })}
                  className="w-5 h-5 comic-border accent-primary cursor-pointer" 
                />
                <span className="font-medium group-hover:text-primary transition-colors">In Stock Only</span>
              </label>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-bold mb-2 uppercase tracking-wider text-sm">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category"
                    checked={!categorySlug} 
                    onChange={() => updateFilters({ categorySlug: null })}
                    className="w-5 h-5 comic-border accent-primary cursor-pointer" 
                  />
                  <span className="font-medium group-hover:text-primary transition-colors">All Categories</span>
                </label>
                {categories?.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category"
                      checked={categorySlug === c.slug} 
                      onChange={() => updateFilters({ categorySlug: c.slug })}
                      className="w-5 h-5 comic-border accent-primary cursor-pointer" 
                    />
                    <span className="font-medium group-hover:text-primary transition-colors">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Franchises */}
            <div>
              <h4 className="font-bold mb-2 uppercase tracking-wider text-sm">Franchise</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="franchise"
                    checked={!franchise} 
                    onChange={() => updateFilters({ franchise: null })}
                    className="w-5 h-5 comic-border accent-primary cursor-pointer" 
                  />
                  <span className="font-medium group-hover:text-primary transition-colors">All Franchises</span>
                </label>
                {franchises?.map(f => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="franchise"
                      checked={franchise === f} 
                      onChange={() => updateFilters({ franchise: f })}
                      className="w-5 h-5 comic-border accent-primary cursor-pointer" 
                    />
                    <span className="font-medium group-hover:text-primary transition-colors">{f}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse comic-border"></div>
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="bg-white p-12 text-center comic-border comic-shadow">
              <h2 className="font-display text-4xl mb-4">No Products Found!</h2>
              <p className="text-xl font-medium mb-6">Looks like that shipment hasn't arrived yet in this dimension.</p>
              <Button onClick={() => setLocation("/shop")} variant="primary">View All Products</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts?.map((product, i) => (
                <div key={product.id} className="animate-in fade-in zoom-in-95" style={{ animationDelay: `${(i % 6) * 50}ms`, animationFillMode: 'both' }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
