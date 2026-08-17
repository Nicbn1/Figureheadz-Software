import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, useListRelatedProducts, useAddCartItem } from "@workspace/api-client-react";
import { useCartId } from "@/lib/cart";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading: loadingProduct } = useGetProduct(slug || "");
  const { data: relatedProducts } = useListRelatedProducts(slug || "");
  const { getOrCreateCart } = useCartId();
  const addItem = useAddCartItem();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Initialize variation when product loads
  if (product && selectedVariationId === null && product.variations.length > 0) {
    setSelectedVariationId(product.variations[0].id);
  }

  const selectedVariation = product?.variations.find(v => v.id === selectedVariationId) || product?.variations[0];
  const priceToDisplay = selectedVariation?.priceCents ?? product?.priceCents ?? 0;
  
  const handleAddToCart = async () => {
    if (!selectedVariationId) return;
    
    try {
      const cartId = await getOrCreateCart();
      await addItem.mutateAsync({
        cartId,
        data: {
          variationId: selectedVariationId,
          quantity
        }
      });
      
      // Invalidate cart query to update header badge
      queryClient.invalidateQueries({ queryKey: ["/api/cart", cartId] });
      
      toast({
        title: "BAM! Added to Cart",
        description: `${quantity}x ${product?.name} ready for checkout.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to cart.",
      });
    }
  };

  if (loadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 aspect-square bg-muted comic-border"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-muted w-1/4 comic-border"></div>
            <div className="h-16 bg-muted w-3/4 comic-border"></div>
            <div className="h-10 bg-muted w-1/3 comic-border"></div>
            <div className="h-32 bg-muted w-full comic-border"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-6xl mb-6">Product Not Found!</h1>
        <Button asChild><Link href="/shop">Back to Shop</Link></Button>
      </div>
    );
  }

  const displayImage = selectedVariation?.imageUrl 
    ? `${import.meta.env.BASE_URL}${selectedVariation.imageUrl}` 
    : `${import.meta.env.BASE_URL}${product.images[selectedImageIdx]}`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-8 overflow-x-auto whitespace-nowrap">
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/shop?categorySlug=${product.categoryName.toLowerCase()}`} className="hover:text-primary">{product.categoryName}</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/shop?franchise=${product.franchise}`} className="hover:text-primary">{product.franchise}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-muted-foreground">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        {/* Images */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="bg-white comic-border comic-shadow aspect-square flex items-center justify-center p-8 relative overflow-hidden halftone-bg group">
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-secondary text-white border-2 border-black font-display px-4 py-1 text-xl uppercase transform -rotate-2 drop-shadow-[2px_2px_0_#000] [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">New!</span>
              )}
              {product.isExclusive && (
                <span className="bg-destructive text-white border-2 border-black font-display px-4 py-1 text-xl uppercase transform rotate-3 drop-shadow-[2px_2px_0_#000] [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">Exclusive</span>
              )}
            </div>
            
            <img 
              src={displayImage} 
              alt={product.name} 
              className="w-full h-full object-contain drop-shadow-2xl z-0 transform group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`shrink-0 w-24 h-24 bg-white comic-border p-2 ${selectedImageIdx === idx ? 'ring-4 ring-primary ring-offset-2' : 'hover:bg-muted'}`}
                >
                  <img src={`${import.meta.env.BASE_URL}${img}`} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <p className="text-lg font-bold text-muted-foreground uppercase tracking-wider mb-2">{product.franchise}</p>
          <h1 className="font-display text-5xl md:text-7xl leading-none uppercase mb-6 text-white [text-shadow:-3px_-3px_0_#000,3px_-3px_0_#000,-3px_3px_0_#000,3px_3px_0_#000,-3px_0px_0_#000,3px_0px_0_#000,0px_-3px_0_#000,0px_3px_0_#000]">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b-4 border-black">
            {product.isOnSale && product.salePriceCents ? (
              <div className="flex items-center gap-4">
                <span className="font-display text-3xl line-through text-muted-foreground">${(product.priceCents / 100).toFixed(2)}</span>
                <span className="font-display text-5xl text-destructive bg-secondary px-4 py-1 comic-border transform -rotate-2 shadow-[4px_4px_0_#000]">
                  ${(product.salePriceCents / 100).toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-display text-5xl bg-white px-4 py-1 comic-border shadow-[4px_4px_0_#000]">${(priceToDisplay / 100).toFixed(2)}</span>
            )}
            
            <div className="ml-auto">
              <span className={`font-bold px-3 py-1 comic-border ${selectedVariation?.stockQuantity && selectedVariation.stockQuantity > 0 ? 'bg-green-400' : 'bg-red-400 text-white'}`}>
                {selectedVariation?.stockQuantity && selectedVariation.stockQuantity > 0 ? `${selectedVariation.stockQuantity} IN STOCK` : 'OUT OF STOCK'}
              </span>
            </div>
          </div>

          <div className="prose prose-lg mb-8 font-medium">
            <p>{product.description}</p>
          </div>

          {/* Variations */}
          {product.variations.length > 1 && (
            <div className="mb-8 p-6 bg-white comic-border shadow-[4px_4px_0_#000]">
              <h3 className="font-display text-2xl uppercase mb-4">Select Variant</h3>
              <div className="flex flex-wrap gap-4">
                {product.variations.map(variation => (
                  <button
                    key={variation.id}
                    onClick={() => setSelectedVariationId(variation.id)}
                    className={`px-4 py-3 comic-border font-bold uppercase transition-all ${
                      selectedVariationId === variation.id 
                        ? 'bg-primary text-white shadow-[4px_4px_0_#000] translate-x-[-2px] translate-y-[-2px]' 
                        : 'bg-white hover:bg-muted shadow-[2px_2px_0_#000]'
                    } ${variation.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={variation.stockQuantity === 0}
                  >
                    {variation.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Actions */}
          <div className="flex items-center gap-4 mt-auto p-6 bg-muted comic-border">
            <div className="flex items-center comic-border bg-white h-16">
              <button 
                className="w-12 h-full flex items-center justify-center font-display text-2xl hover:bg-gray-100 border-r-2 border-black"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <div className="w-16 h-full flex items-center justify-center font-bold text-xl">{quantity}</div>
              <button 
                className="w-12 h-full flex items-center justify-center font-display text-2xl hover:bg-gray-100 border-l-2 border-black"
                onClick={() => setQuantity(Math.min(selectedVariation?.stockQuantity || 1, quantity + 1))}
              >+</button>
            </div>
            
            <Button 
              size="lg" 
              className="flex-1 text-2xl h-16"
              disabled={!selectedVariation || selectedVariation.stockQuantity === 0 || addItem.isPending}
              onClick={handleAddToCart}
            >
              {addItem.isPending ? "ADDING..." : "ADD TO CART!"}
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-20 border-t-4 border-black pt-12">
          <h2 className="font-display text-4xl uppercase tracking-widest mb-8 text-white [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000]">More from {product.franchise}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map(related => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
