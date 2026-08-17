import { useState } from "react";
import { Link } from "wouter";
import { useListOrdersByEmail, getListOrdersByEmailQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Orders() {
  const [emailInput, setEmailInput] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const { data: orders, isLoading, isError } = useListOrdersByEmail(
    { email: searchEmail },
    {
      query: {
        enabled: !!searchEmail,
        retry: false,
        queryKey: getListOrdersByEmailQueryKey({ email: searchEmail }),
      },
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSearchEmail(emailInput.trim());
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="font-display text-6xl uppercase mb-8 text-white [text-shadow:-3px_-3px_0_#000,3px_-3px_0_#000,-3px_3px_0_#000,3px_3px_0_#000,-3px_0px_0_#000,3px_0px_0_#000,0px_-3px_0_#000,0px_3px_0_#000]">Track Orders</h1>
      
      <div className="bg-white p-8 comic-border shadow-[8px_8px_0_#000] mb-12">
        <h2 className="font-bold text-xl uppercase mb-4">Enter your email to find past transmissions</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <Input 
            type="email" 
            placeholder="hero@multiverse.com" 
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" size="lg" className="shrink-0">
            <Search className="mr-2 h-5 w-5" /> Locate
          </Button>
        </form>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse comic-border"></div>
          <div className="h-32 bg-muted animate-pulse comic-border"></div>
        </div>
      )}

      {isError && searchEmail && (
        <div className="bg-destructive text-white p-6 comic-border font-bold text-center text-lg">
          Failed to fetch orders. Ensure you entered the correct email.
        </div>
      )}

      {orders && orders.length === 0 && searchEmail && (
        <div className="text-center p-12 bg-white comic-border">
          <h2 className="font-display text-4xl mb-4">No Orders Found</h2>
          <p className="text-xl font-medium">We couldn't find any orders for {searchEmail}.</p>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-8">
          <h2 className="font-display text-3xl uppercase mb-6 border-b-4 border-black pb-2">Orders for {searchEmail}</h2>
          
          {orders.map(order => (
            <div key={order.id} className="bg-white comic-border shadow-[4px_4px_0_#000] overflow-hidden flex flex-col sm:flex-row">
              <div className="bg-muted p-6 border-b-4 sm:border-b-0 sm:border-r-4 border-black flex flex-col justify-center w-full sm:w-64 shrink-0">
                <p className="text-sm font-bold text-muted-foreground uppercase">Order #{order.id}</p>
                <p className="font-display text-4xl text-primary mb-2">${(order.totalCents / 100).toFixed(2)}</p>
                <div className="inline-block bg-white text-center font-bold px-3 py-1 comic-border text-sm mb-4">
                  {order.status.toUpperCase()}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-3 mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-muted comic-border shrink-0 p-1">
                        {item.imageUrl && (
                          <img src={`${import.meta.env.BASE_URL}${item.imageUrl}`} alt="" className="w-full h-full object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto pt-4 border-t-2 border-black border-dashed">
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link href={`/order/${order.id}`}>View Receipt</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
