import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, ShoppingBag, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export function SiteHeader() {
  const { signOut, profile } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 glass-strong backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full glass">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="font-display text-lg tracking-wide">
            Royal Stay <span className="text-gradient-gold">Concierge</span>
          </div>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {profile?.room_number && (
            <span className="hidden rounded-full glass px-3 py-1.5 text-xs text-muted-foreground sm:inline-flex">
              Suite {profile.room_number}
            </span>
          )}
          <Link to="/cart" className="relative rounded-full glass p-2.5 hover:border-primary">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link to="/profile" className="rounded-full glass p-2.5 hover:border-primary">
            <UserIcon className="h-4 w-4" />
          </Link>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/", replace: true });
            }}
            className="rounded-full glass p-2.5 hover:border-primary"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        Loading your suite…
      </div>
    );
  }
  if (!user) {
    if (typeof window !== "undefined") navigate({ to: "/login", replace: true });
    return null;
  }
  return <>{children}</>;
}