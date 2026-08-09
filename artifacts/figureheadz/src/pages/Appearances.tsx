import { CalendarDays } from "lucide-react";

export default function Appearances() {
  return (
    <main className="container mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 comic-border mb-6">
        <CalendarDays className="h-10 w-10 text-primary" />
      </div>
      <h1 className="font-display text-5xl uppercase mb-4 drop-shadow-[3px_3px_0_#000]">
        Upcoming Appearances
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto">
        No appearances scheduled yet — check back soon for conventions, pop-ups,
        and signing events near you!
      </p>
    </main>
  );
}
