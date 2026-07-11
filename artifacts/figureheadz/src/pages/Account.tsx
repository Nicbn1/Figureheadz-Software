import { Link } from "wouter";
import { useUser, useClerk, Show } from "@clerk/react";
import { Button } from "@/components/ui/button";

export default function Account() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  if (!isLoaded) {
    return <div className="p-12 text-center font-display text-2xl">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="font-display text-6xl uppercase mb-8 drop-shadow-[2px_2px_0_hsl(48_100%_50%)]">
        My Account
      </h1>

      <Show when="signed-in">
        <div className="bg-white p-8 comic-border shadow-[8px_8px_0_#000] mb-8">
          <p className="text-sm font-bold uppercase text-muted-foreground mb-1">Signed in as</p>
          <p className="text-2xl font-bold mb-6">
            {user?.primaryEmailAddress?.emailAddress ?? user?.fullName ?? "Collector"}
          </p>
          <Button
            variant="outline"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
          >
            Log Out
          </Button>
        </div>

        <div className="bg-muted p-8 comic-border">
          <h2 className="font-display text-3xl uppercase mb-4 border-b-4 border-black pb-3">
            Order History
          </h2>
          <p className="text-lg font-medium mb-4">
            Look up any order placed with your account email.
          </p>
          <Button asChild size="lg">
            <Link href="/orders">Track My Orders</Link>
          </Button>
        </div>
      </Show>

      <Show when="signed-out">
        <div className="bg-white p-8 comic-border shadow-[8px_8px_0_#000] text-center">
          <p className="text-xl font-bold mb-6">You're not signed in yet.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </Show>
    </div>
  );
}
