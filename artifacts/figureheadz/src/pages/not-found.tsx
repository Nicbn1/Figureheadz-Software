import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-background halftone-bg p-4">
      <Card className="w-full max-w-md bg-white comic-border shadow-[8px_8px_0_#000] border-4">
        <CardContent className="pt-12 pb-10 text-center">
          <h1 className="font-display text-8xl font-bold text-destructive mb-4 drop-shadow-[2px_2px_0_#000]">
            404
          </h1>
          <p className="text-2xl font-display uppercase text-muted-foreground mb-8">
            Whoops! This dimension doesn't exist.
          </p>
          <p className="text-lg font-medium mb-8">
            The portal closed before we could find what you were looking for.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center bg-primary text-white font-display text-2xl h-14 px-8 comic-border shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_hsl(48_100%_50%)] hover:-translate-y-1 transition-all"
          >
            RETURN TO BASE
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
