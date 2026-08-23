import { Link, useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import { ShoppingCart, Search, User } from "lucide-react";
import { Show } from "@clerk/react";
import logoUrl from "@/assets/figureheadz-logo.jpeg";

export function Header() {
  const { data: cart } = useCart();
  const itemCount = cart?.itemCount || 0;
  const [location] = useLocation();

  const navLinkClass = (active: boolean) =>
    `font-display text-2xl tracking-wide uppercase drop-shadow-[2px_2px_0_#000] transition-colors ${
      active ? "text-secondary" : "text-white hover:text-secondary"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-primary halftone-blue">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transform hover:scale-105 transition-transform">
            <img src={logoUrl} alt="Figureheadz" className="h-14 w-auto border-2 border-black" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/shop" className={navLinkClass(location === "/shop")}>
              Store
            </Link>
            <Link href="/appearances" className={navLinkClass(location === "/appearances")}>
              Upcoming Appearances
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/shop" className="p-2 bg-white comic-border shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all rounded-full text-black">
            <Search className="h-5 w-5" />
          </Link>
          <Show when="signed-in">
            <Link href="/account" className="p-2 bg-white comic-border shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all rounded-full text-black">
              <User className="h-5 w-5" />
            </Link>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="p-2 bg-white comic-border shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all rounded-full text-black">
              <User className="h-5 w-5" />
            </Link>
          </Show>
          <Link href="/cart" className="p-2 bg-secondary comic-border shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all rounded-full text-black relative flex items-center justify-center">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-white border-2 border-black text-xs font-display px-2 py-0.5 rounded-full z-10 animate-in pop-in">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
