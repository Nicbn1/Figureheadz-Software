import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser, Show } from "@clerk/react";
import { useCart, useCartId } from "@/lib/cart";
import { estimateShippingCents, estimateTaxCents, getDestinationTaxRate } from "@/lib/pricing";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  fullName: z.string().min(2, "Name is required"),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  postalCode: z.string().min(3, "Zip/Postal Code is required"),
  country: z.string().min(2, "Country is required"),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { data: cart, isLoading: loadingCart } = useCart();
  const { cartId, clearCart } = useCartId();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isSignedIn, isLoaded: userLoaded } = useUser();
  const [checkingOutAsGuest, setCheckingOutAsGuest] = useState(false);
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      fullName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA",
    }
  });

  const watchedState = form.watch("state");
  const watchedCountry = form.watch("country");

  const destination = { state: watchedState, country: watchedCountry };
  const shippingCents = watchedState.trim()
    ? estimateShippingCents(destination)
    : 0;
  const taxCents = watchedState.trim()
    ? estimateTaxCents(cart?.subtotalCents ?? 0, destination)
    : 0;
  const taxRate = watchedState.trim() ? getDestinationTaxRate(destination) : 0;
  const estimatedTotalCents = (cart?.subtotalCents ?? 0) + shippingCents + taxCents;

  // Prefill the email field once we know the signed-in user's address
  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      form.setValue("email", email);
    }
  }, [user, form]);

  const readyToShowForm = !userLoaded || isSignedIn || checkingOutAsGuest;

  const onSubmit = async (values: CheckoutValues) => {
    if (!cartId) return;

    try {
      const order = await createOrder.mutateAsync({
        data: {
          cartId,
          email: values.email,
          shippingAddress: {
            fullName: values.fullName,
            line1: values.line1,
            line2: values.line2 || null,
            city: values.city,
            state: values.state,
            postalCode: values.postalCode,
            country: values.country,
          }
        }
      });

      // Clear the local cart reference so they get a fresh one next time
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/cart", cartId] });

      toast({
        title: "Order Placed!",
        description: "Your stash is secured.",
      });

      setLocation(`/order/${order.id}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to place order. Try again.",
      });
    }
  };

  if (loadingCart) return <div className="p-8 text-center font-display text-2xl">Loading...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-4xl mb-6">Your cart is empty!</h1>
        <Button asChild><Link href="/shop">Shop Now</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-6xl uppercase mb-8 drop-shadow-[2px_2px_0_hsl(48_100%_50%)]">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form */}
        <div className="flex-1 bg-white p-8 comic-border shadow-[8px_8px_0_#000]">
          {!readyToShowForm ? (
            <div>
              <h2 className="font-display text-3xl uppercase mb-6 border-b-4 border-black pb-4">Sign In To Check Out</h2>
              <p className="text-lg font-medium mb-6">
                Sign in for faster checkout and easy order tracking, or continue without an account.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="flex-1">
                  <Link href={`/sign-in?redirect=${encodeURIComponent(`${basePath}/checkout`)}`}>Sign In</Link>
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCheckingOutAsGuest(true)}
                >
                  Continue As Guest
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                New here? <Link href={`/sign-up?redirect=${encodeURIComponent(`${basePath}/checkout`)}`} className="underline font-bold">Create an account</Link> instead.
              </p>
            </div>
          ) : (
          <>
          <h2 className="font-display text-3xl uppercase mb-6 border-b-4 border-black pb-4">Shipping Details</h2>

          <Show when="signed-in">
            <p className="text-sm font-bold uppercase text-muted-foreground mb-4 -mt-2">
              Signed in as {user?.primaryEmailAddress?.emailAddress}
            </p>
          </Show>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="hero@multiverse.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Peter Parker" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="20 Ingram St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="line2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apt, Suite, etc. (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 2B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Queens" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Prov</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip/Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="11375" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-primary/10 border-l-4 border-primary p-4 mt-8">
                <p className="font-bold text-lg mb-2 uppercase">Payment Note</p>
                <p className="text-muted-foreground">
                  Our payment gateway is currently down for maintenance across the multiverse. Submitting this form will secure your items and place a real order, and we'll invoice you later.
                </p>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-16 text-2xl mt-8" 
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "SECURING..." : "COMPLETE ORDER!"}
              </Button>
            </form>
          </Form>
          </>
          )}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-muted p-6 comic-border">
            <h2 className="font-display text-3xl uppercase mb-6 border-b-4 border-black pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-white comic-border shrink-0 p-1">
                    {item.imageUrl && (
                      <img src={`${import.meta.env.BASE_URL}${item.imageUrl}`} alt="" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-bold line-clamp-2 leading-tight">{item.productName}</p>
                    <p className="text-muted-foreground">{item.variationName}</p>
                    <div className="flex justify-between mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span className="font-bold">${(item.lineTotalCents / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t-4 border-black pt-4 space-y-2 text-lg font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(cart.subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{watchedState.trim() ? `${(shippingCents / 100).toFixed(2)}` : "Enter address"}</span>
              </div>
              <div className="flex justify-between">
                <span>{watchedState.trim() && taxRate > 0 ? `Sales Tax (${(taxRate * 100).toFixed(2)}%)` : "Sales Tax"}</span>
                <span>{watchedState.trim() ? `${(taxCents / 100).toFixed(2)}` : "—"}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-dashed border-gray-400">
                <span className="font-display text-2xl uppercase">Total</span>
                <span className="font-display text-3xl text-primary">${(estimatedTotalCents / 100).toFixed(2)}</span>
              </div>
              {!watchedState.trim() && (
                <p className="text-xs text-muted-foreground pt-2">
                  Final shipping and tax are calculated from your shipping address.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
