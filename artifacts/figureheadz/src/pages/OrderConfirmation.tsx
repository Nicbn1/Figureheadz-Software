import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useGetOrder(Number(id));

  if (isLoading) {
    return <div className="container mx-auto px-4 py-20 text-center font-display text-3xl">Locating transmission...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-5xl mb-4">Order Not Found</h1>
        <Button asChild><Link href="/shop">Back to Shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-sky-200 p-8 md:p-12 comic-border shadow-[12px_12px_0_#000] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-600 opacity-60 rounded-bl-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-600 opacity-60 rounded-tr-full pointer-events-none"></div>

        <div className="text-center mb-10">
          <div className="inline-block bg-secondary text-black font-display text-2xl px-6 py-2 comic-border transform -rotate-2 mb-4 shadow-[4px_4px_0_#000]">
            SUCCESS!
          </div>
          <h1 className="font-display text-5xl md:text-7xl uppercase text-white [text-shadow:-3px_-3px_0_#000,3px_-3px_0_#000,-3px_3px_0_#000,3px_3px_0_#000,-3px_0px_0_#000,3px_0px_0_#000,0px_-3px_0_#000,0px_3px_0_#000]">
            Order Secured
          </h1>
          <p className="text-white font-bold mt-4 text-xl [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
            Transmission received. We're packing your stash.
          </p>
        </div>

        <div className="bg-muted p-6 comic-border mb-8">
          <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b-2 border-black border-dashed">
            <div>
              <p className="text-sm font-bold uppercase text-muted-foreground">Order Number</p>
              <p className="font-display text-2xl">#{order.id}</p>
            </div>
            <div className="mt-4 md:mt-0 md:text-right">
              <p className="text-sm font-bold uppercase text-muted-foreground">Status</p>
              <p className="font-display text-2xl text-primary">{order.status}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-bold uppercase text-muted-foreground mb-1">Email</p>
            <p className="font-medium">{order.email}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="font-display text-2xl uppercase border-b-4 border-black pb-2 mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted comic-border p-1">
                  {item.imageUrl && (
                    <img src={`${import.meta.env.BASE_URL}${item.imageUrl}`} alt="" className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">{item.variationName} &times; {item.quantity}</p>
                </div>
                <div className="font-display text-xl">
                  ${(item.lineTotalCents / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-4 border-black pt-4 mb-4 space-y-2 text-lg font-medium">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${(order.subtotalCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${(order.shippingCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              {order.taxCents > 0 && order.subtotalCents > 0
                ? `Sales Tax (${((order.taxCents / order.subtotalCents) * 100).toFixed(2)}%)`
                : "Sales Tax"}
            </span>
            <span>${(order.taxCents / 100).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-dashed border-gray-400 pt-4 mb-8">
          <span className="font-display text-3xl uppercase">Total</span>
          <span className="font-display text-5xl text-black">${(order.totalCents / 100).toFixed(2)}</span>
        </div>

        <div className="bg-secondary/20 p-6 comic-border">
          <h2 className="font-display text-xl uppercase mb-2">Shipping To</h2>
          <p className="font-medium">{order.shippingAddress.fullName}</p>
          <p className="text-muted-foreground">
            {order.shippingAddress.line1}<br/>
            {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br/></>}
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br/>
            {order.shippingAddress.country}
          </p>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link href="/shop">CONTINUE SHOPPING</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
