import { Header } from "./Header";
import { Link } from "wouter";
import { ContactDialog } from "./ContactDialog";
import { Facebook, Instagram } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <footer className="relative overflow-hidden border-t-4 border-black bg-primary halftone-blue py-12 mt-12">
        {/* Decorative animated elements matching the hero */}
        <div className="absolute top-6 left-10 w-32 h-32 bg-secondary rounded-full mix-blend-overlay opacity-50 animate-pulse"></div>
        <div className="absolute bottom-6 right-16 w-48 h-48 bg-destructive rounded-full mix-blend-overlay opacity-50 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white rounded-full mix-blend-overlay opacity-20 animate-pulse [animation-delay:1s]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-4xl mb-4 uppercase text-white drop-shadow-[2px_2px_0_#000]">Figureheadz</h2>
          <p className="text-lg font-medium mb-6 text-white drop-shadow-[1px_1px_0_#000]">Collectibles with Pop-Art Energy.</p>
          <div className="flex flex-wrap justify-center items-center gap-6 font-display text-xl mb-6">
            <Link href="/shop" className="text-white drop-shadow-[2px_2px_0_#000] hover:text-secondary underline">Shop</Link>
            <Link href="/orders" className="text-white drop-shadow-[2px_2px_0_#000] hover:text-secondary underline">Track Order</Link>
            <Link href="/admin/login" className="text-white drop-shadow-[2px_2px_0_#000] hover:text-secondary underline">Admin</Link>
          </div>
          <ContactDialog />

          <div className="mt-8">
            <p className="text-sm font-display uppercase tracking-wide text-white drop-shadow-[1px_1px_0_#000] mb-3">
              Follow Us On Social Media
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.facebook.com/Figureheadzpops"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Figureheadz on Facebook"
                className="p-2 bg-white comic-border shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all rounded-full text-black"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/figureheadzpop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Figureheadz on Instagram"
                className="p-2 bg-white comic-border shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-all rounded-full text-black"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
