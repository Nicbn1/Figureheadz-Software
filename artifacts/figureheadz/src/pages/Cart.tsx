import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import { useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { data: cart, isLoading } = useCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Both mutations return the full, freshly-recalculated Cart. Writing that
  // straight into the query cache (instead of just invalidating and waiting
  // on a refetch) is what makes quantity/removal changes show up instantly.
  const cartQueryKey = cart ? getGetCartQueryKey(cart.id) : undefined;

  const updateItem = useUpdateCartItem({
    mutation: {
      onSuccess: (updatedCart) => {
        if (cartQueryKey) queryClient.setQueryData(cartQueryKey, updatedCart);
      },
    },
  });
  const removeItem = useRemoveCartItem({
    mutation: {
      onSuccess: (updatedCart) => {
        if (cartQueryKey) queryClient.setQueryData(cartQueryKey, updatedCart);
      },
    },
  });

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (!cart?.id || newQuantity < 1) return;
    try {
      await updateItem.mutateAsync({
        cartId: cart.id,
        itemId,
        data: { quantity: newQuantity }
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Oops!", description: "Failed to update quantity." });
    }
  };

  const handleRemove = async (itemId: number) => {
    if (!cart?.id) return;
    try {
      await removeItem.mutateAsync({
        cartId: cart.id,
        itemId
      });
      toast({ title: "Removed", description: "Item kicked out of the cart." });
    } catch (err) {
      toast({ variant: "destructive", title: "Oops!", description: "Failed to remove item." });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="font-display text-5xl uppercase mb-8 text-white [text-shadow:_-3px_-3px_0_#000,_3px_-3px_0_#000,_-3px_3px_0_#000,_3px_3px_0_#000,_-3px_0px_0_#000,_3px_0px_0_#000,_0px_-3px_0_#000,_0px_3px_0_#000,_5px_5px_0_#000]">Your Stash</h1>
        <div className="bg-muted h-64 animate-pulse comic-border"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-6xl uppercase mb-6 text-white [text-shadow:_-3px_-3px_0_#000,_3px_-3px_0_#000,_-3px_3px_0_#000,_3px_3px_0_#000,_-3px_0px_0_#000,_3px_0px_0_#000,_0px_-3px_0_#000,_0px_3px_0_#000,_5px_5px_0_#000]">Your Cart is Empty!</h1>
        <p className="text-2xl font-medium mb-8">Don't leave empty-handed. There's a multiverse to explore.</p>
        <Button size="lg" asChild>
          <Link href="/shop">BACK TO SHOP</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-6xl uppercase mb-8 text-white [text-shadow:_-3px_-3px_0_#000,_3px_-3px_0_#000,_-3px_3px_0_#000,_3px_3px_0_#000,_-3px_0px_0_#000,_3px_0px_0_#000,_0px_-3px_0_#000,_0px_3px_0_#000,_5px_5px_0_#000]">Your Stash</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="bg-white p-4 comic-border comic-shadow flex gap-6 items-center flex-col sm:flex-row">
              <div className="w-24 h-24 shrink-0 bg-muted comic-border halftone-bg p-2">
                {item.imageUrl && (
                  <img src={`${import.meta.env.BASE_URL}${item.imageUrl}`} alt={item.productName} className="w-full h-full object-contain" />
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <Link href={`/product/${item.productSlug}`} className="font-display text-2xl hover:underline">
                  {item.productName}
                </Link>
                <p className="text-sm font-bold text-muted-foreground uppercase">{item.variationName}</p>
                <div className="font-display text-xl mt-2 text-primary">
                  ${(item.unitPriceCents / 100).toFixed(2)}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center comic-border bg-background h-12">
                  <button 
                    className="w-10 h-full flex items-center justify-center font-display text-xl hover:bg-gray-100 border-r-2 border-black"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={updateItem.isPending}
                  >-</button>
                  <div className="w-12 h-full flex items-center justify-center font-bold">{item.quantity}</div>
                  <button 
                    className="w-10 h-full flex items-center justify-center font-display text-xl hover:bg-gray-100 border-l-2 border-black"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.availableStock || updateItem.isPending}
                  >+</button>
                </div>
                
                <button 
                  className="p-3 text-destructive hover:bg-red-50 comic-border transition-colors"
                  onClick={() => handleRemove(item.id)}
                  disabled={removeItem.isPending}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white p-6 comic-border shadow-[8px_8px_0_#000] sticky top-28">
            <h2 className="font-display text-3xl uppercase mb-6 border-b-4 border-black pb-4">Summary</h2>
            
            <div className="space-y-4 mb-6 text-lg font-medium">
              <div className="flex justify-between">
                <span>Items ({cart.itemCount})</span>
                <span className="font-display text-xl">${(cart.subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated next</span>
              </div>
            </div>
            
            <div className="border-t-4 border-black pt-4 mb-8 flex justify-between items-end">
              <span className="font-display text-2xl uppercase">Subtotal</span>
              <span className="font-display text-4xl text-primary">${(cart.subtotalCents / 100).toFixed(2)}</span>
            </div>
            
            <Button size="lg" className="w-full" onClick={() => setLocation("/checkout")}>
              CHECKOUT NOW
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
