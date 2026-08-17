import { CalendarDays, MapPin, ExternalLink, Ticket } from "lucide-react";
import { useListAppearances } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(dateStr: string, includeMonth = true) {
  const d = parseLocalDate(dateStr);
  if (includeMonth) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { day: "numeric" });
}

function isSameMonth(a: string, b: string) {
  return a.slice(0, 7) === b.slice(0, 7);
}

export default function Appearances() {
  const { data: appearances, isLoading } = useListAppearances();

  return (
    <main className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 comic-border mb-6">
          <CalendarDays className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-5xl uppercase mb-4 text-white [text-shadow:_-2px_-2px_0_#000,_2px_-2px_0_#000,_-2px_2px_0_#000,_2px_2px_0_#000,_3px_3px_0_#000]">
          Upcoming Appearances
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Catch us in person at Conventions and Card Show events near you!
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 bg-muted animate-pulse comic-border"
            />
          ))}
        </div>
      ) : !appearances || appearances.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            No appearances scheduled yet — check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {appearances.map((event) => (
            <div
              key={event.id}
              className="bg-white comic-border shadow-[6px_6px_0_#000] p-6 flex flex-col sm:flex-row gap-6"
            >
              {/* Date badge */}
              <div className="shrink-0 flex flex-col items-center justify-center bg-primary text-white comic-border px-6 py-4 min-w-[90px]">
                {event.endDate && event.endDate !== event.date ? (
                  // Multi-day: Month / "16 – 22" or "30 – Sep 1" / Year
                  <>
                    <span className="font-display text-3xl leading-none [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
                      {parseLocalDate(event.date).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                      {!isSameMonth(event.date, event.endDate) && (
                        <>–{parseLocalDate(event.endDate).toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</>
                      )}
                    </span>
                    <span className="font-bold text-xl leading-none mt-1 [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
                      {parseLocalDate(event.date).getDate()}
                      {" – "}
                      {parseLocalDate(event.endDate).getDate()}
                    </span>
                    <span className="text-sm opacity-80 mt-1 [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
                      {event.date.split("-")[0]}
                    </span>
                  </>
                ) : (
                  // Single day: show day-of-week, "Aug 16", year
                  <>
                    <span className="font-display text-3xl leading-none [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
                      {formatDate(event.date).split(",")[0].trim().slice(0, 3).toUpperCase()}
                    </span>
                    <span className="font-bold text-xl leading-none mt-1 [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
                      {formatShortDate(event.date)}
                    </span>
                    <span className="text-sm opacity-80 mt-1 [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
                      {event.date.split("-")[0]}
                    </span>
                  </>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-2xl uppercase tracking-widest leading-tight mb-1 text-white [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000]">
                  {event.name}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground font-medium mb-3">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline transition-colors"
                  >
                    {event.location}
                  </a>
                </div>
                {event.description && (
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                    {event.description}
                  </p>
                )}
                {event.link && (
                  <Button asChild size="sm" className="comic-border">
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {event.link.toLowerCase().includes("ticket") ? (
                        <>
                          <Ticket className="mr-2 h-4 w-4" />
                          Get Tickets
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Learn More
                        </>
                      )}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
