import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Calendar, Check } from "lucide-react";
import { toast } from "sonner";

type ServiceItem = {
  id: string;
  name: string;
  description: string;
  duration_min: number;
  type: "housekeeping" | "laundry" | "spa";
};

export function ServicePage({
  type, title, tagline, heroImage, hideDuration,
}: {
  type: "housekeeping" | "laundry" | "spa";
  title: string;
  tagline: string;
  heroImage: string;
  hideDuration?: boolean;
}) {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<ServiceItem[] | null>(null);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("service_items").select("*").eq("type", type).eq("is_active", true).order("name")
      .then(({ data }) => setItems((data as ServiceItem[]) ?? []));
  }, [type]);

  async function submit() {
    if (!user || !selected) return;
    setSubmitting(true);
    const { error } = await supabase.from("service_requests").insert({
      user_id: user.id,
      type,
      service_item_id: selected.id,
      item_name: selected.name,
      room_number: profile?.room_number ?? "",
      notes,
      scheduled_at: when ? new Date(when).toISOString() : null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Request submitted — our team is on it");
    setSelected(null); setWhen(""); setNotes("");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="relative h-56 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url('${heroImage}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto flex h-full max-w-6xl items-end px-6 pb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">{tagline}</div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h1>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <div className="font-display text-base text-primary">Complimentary Services Included With Your Stay</div>
            <div className="text-xs text-muted-foreground">Enjoy every comfort, on the house.</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!items
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
            : items.map((it) => (
                <button key={it.id} onClick={() => setSelected(it)}
                  className="glass rounded-2xl p-5 text-left transition hover-lift hover:border-primary">
                  <div className="flex items-start justify-between">
                    <div className="font-display text-lg">{it.name}</div>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                      Included
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{it.description}</p>
                  {!hideDuration && (
                    <div className="mt-3 text-xs text-muted-foreground">~{it.duration_min} min</div>
                  )}
                </button>
              ))}
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur" onClick={() => setSelected(null)}>
          <div className="glass-strong w-full max-w-md rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-primary">Schedule</div>
                <h2 className="mt-1 font-display text-2xl">{selected.name}</h2>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-medium text-emerald-400">Included with stay</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{selected.description}</p>

            <label className="mt-5 block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Preferred date & time</span>
              <div className="relative mt-1">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/40 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary" />
              </div>
            </label>

            <label className="mt-4 block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Notes (optional)</span>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </label>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 rounded-full glass py-3 text-sm">Cancel</button>
              <button onClick={submit} disabled={submitting}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {submitting ? "Submitting…" : (<span className="inline-flex items-center justify-center gap-2"><Check className="h-4 w-4" /> Confirm request</span>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}