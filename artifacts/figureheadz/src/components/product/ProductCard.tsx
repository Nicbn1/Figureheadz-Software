import { Link } from "wouter";
import type { Product } from "@workspace/api-client-react";

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = `${import.meta.env.BASE_URL}${product.images[0]}`;
  
  return (
    <Link href={`/product/${product.slug}`} className="group block relative h-full">
      <div className="bg-white comic-border comic-shadow rounded-none overflow-hidden h-full flex flex-col relative group-hover:border-primary transition-colors">
        
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-secondary text-white border-2 border-black font-display px-3 py-1 uppercase transform -rotate-2 drop-shadow-[2px_2px_0_#000]">New!</span>
          )}
          {product.isExclusive && (
            <span className="bg-destructive text-white border-2 border-black font-display px-3 py-1 uppercase transform rotate-3 drop-shadow-[2px_2px_0_#000]">Exclusive</span>
          )}
          {product.isOnSale && (
            <span className="bg-primary text-white border-2 border-black font-display px-3 py-1 uppercase transform -rotate-3 drop-shadow-[2px_2px_0_#000]">Sale!</span>
          )}
        </div>

        {/* Image — fixed height so all cards are uniform regardless of image dimensions */}
        <div className="h-56 bg-gray-100 p-6 flex items-center justify-center border-b-2 border-black relative overflow-hidden halftone-bg shrink-0">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300 drop-shadow-xl" 
          />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">{product.franchise}</p>
          <h3 className="font-display text-2xl leading-tight mb-2 line-clamp-2">{product.name}</h3>
          
          <div className="mt-auto flex items-end justify-between pt-4">
            <div>
              {product.isOnSale && product.salePriceCents ? (
                <div className="flex flex-col">
                  <span className="text-sm line-through text-muted-foreground">${(product.priceCents / 100).toFixed(2)}</span>
                  <span className="font-display text-2xl text-destructive">${(product.salePriceCents / 100).toFixed(2)}</span>
                </div>
              ) : (
                <span className="font-display text-2xl">${(product.priceCents / 100).toFixed(2)}</span>
              )}
            </div>
            
            <div className="bg-secondary px-3 py-1 comic-border transform group-hover:bg-primary group-hover:text-white transition-colors shadow-[2px_2px_0_#000]">
              <span className="font-display text-lg uppercase tracking-wide">View</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
