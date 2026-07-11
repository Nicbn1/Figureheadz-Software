import { Header } from "./Header";
import { Link } from "wouter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="border-t-4 border-black bg-white py-12 mt-12 halftone-bg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl mb-4 uppercase drop-shadow-[2px_2px_0_#000] text-primary">Figureheadz</h2>
          <p className="text-lg font-medium mb-6">Collectibles with Pop-Art Energy.</p>
          <div className="flex justify-center gap-6 font-display text-xl">
            <Link href="/shop" className="hover:text-secondary underline">Shop</Link>
            <Link href="/orders" className="hover:text-secondary underline">Track Order</Link>
            <Link href="/admin/login" className="hover:text-secondary underline">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
