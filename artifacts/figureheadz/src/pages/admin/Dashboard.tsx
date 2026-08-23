import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  useGetSalesSummary,
  getGetSalesSummaryQueryKey,
  useGetSyncStatus,
  getGetSyncStatusQueryKey,
  useTriggerSync,
  useAdminListAppearances,
  getAdminListAppearancesQueryKey,
  useCreateAppearance,
  useUpdateAppearance,
  useDeleteAppearance,
  type Appearance,
} from "@workspace/api-client-react";
import { getAdminToken, setAdminToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  RefreshCw,
  Box,
  DollarSign,
  ShoppingCart,
  Activity,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  MapPin,
  Link,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type AppearanceForm = {
  name: string;
  date: string;
  endDate: string;
  location: string;
  description: string;
  link: string;
};

const EMPTY_FORM: AppearanceForm = {
  name: "",
  date: "",
  endDate: "",
  location: "",
  description: "",
  link: "",
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Appearance form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AppearanceForm>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!getAdminToken()) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: sales, isLoading: loadingSales, isError: authError } = useGetSalesSummary({
    query: {
      retry: false,
      queryKey: getGetSalesSummaryQueryKey(),
    }
  });

  const { data: syncStatus } = useGetSyncStatus({
    query: {
      queryKey: getGetSyncStatusQueryKey(),
      refetchInterval: (query) => query.state.data?.status === "syncing" ? 2000 : false,
    }
  });

  const { data: appearances, isLoading: loadingAppearances } = useAdminListAppearances({
    query: { queryKey: getAdminListAppearancesQueryKey() },
  });

  const createAppearance = useCreateAppearance();
  const updateAppearance = useUpdateAppearance();
  const deleteAppearance = useDeleteAppearance();

  const triggerSync = useTriggerSync();

  useEffect(() => {
    if (authError) {
      setAdminToken(null);
      setLocation("/admin/login");
    }
  }, [authError, setLocation]);

  const handleLogout = () => {
    setAdminToken(null);
    setLocation("/");
    toast({ title: "Logged Out", description: "Terminal disconnected." });
  };

  const handleSync = async () => {
    try {
      await triggerSync.mutateAsync();
      toast({ title: "Sync Initiated", description: "Catalog is updating from Square..." });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/status"] });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Could not start sync." });
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (a: Appearance) => {
    setEditingId(a.id);
    setForm({
      name: a.name,
      date: a.date,
      endDate: a.endDate ?? "",
      location: a.location,
      description: a.description ?? "",
      link: a.link ?? "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.date || !form.location.trim()) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Name, date, and location are required." });
      return;
    }
    const payload = {
      name: form.name.trim(),
      date: form.date,
      endDate: form.endDate.trim() || null,
      location: form.location.trim(),
      description: form.description.trim() || null,
      link: form.link.trim() || null,
    };
    try {
      if (editingId !== null) {
        await updateAppearance.mutateAsync({ id: editingId, data: payload });
        toast({ title: "Event Updated", description: `"${payload.name}" has been saved.` });
      } else {
        await createAppearance.mutateAsync({ data: payload });
        toast({ title: "Event Created", description: `"${payload.name}" has been added.` });
      }
      queryClient.invalidateQueries({ queryKey: getAdminListAppearancesQueryKey() });
      closeForm();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not save the event." });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    setDeletingId(id);
    try {
      await deleteAppearance.mutateAsync({ id });
      toast({ title: "Event Deleted", description: `"${name}" removed.` });
      queryClient.invalidateQueries({ queryKey: getAdminListAppearancesQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not delete the event." });
    } finally {
      setDeletingId(null);
    }
  };

  if (!getAdminToken()) return null;

  const isSaving = createAppearance.isPending || updateAppearance.isPending;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="font-display text-5xl uppercase drop-shadow-[2px_2px_0_hsl(48_100%_50%)]">Control Panel</h1>
          <p className="font-bold text-muted-foreground mt-2">Manage your multiverse outpost.</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Disconnect
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - System Status */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 comic-border shadow-[6px_6px_0_#000]">
            <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
              <Activity className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl uppercase">System Status</h2>
            </div>
            
            <div className="space-y-4 font-medium mb-8">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mode</span>
                <span className={`px-2 py-1 comic-border text-sm font-bold uppercase ${syncStatus?.mode === 'live' ? 'bg-primary text-white' : 'bg-secondary text-black'}`}>
                  {syncStatus?.mode || 'UNKNOWN'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Catalog Sync</span>
                <span className={`flex items-center gap-2 px-2 py-1 comic-border text-sm font-bold uppercase ${
                  syncStatus?.status === 'syncing' ? 'bg-secondary text-black' : 
                  syncStatus?.status === 'error' ? 'bg-destructive text-white' : 
                  'bg-green-400 text-black'
                }`}>
                  {syncStatus?.status === 'syncing' && <RefreshCw className="h-3 w-3 animate-spin" />}
                  {syncStatus?.status || 'IDLE'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Items Synced</span>
                <span className="font-bold text-xl">{syncStatus?.itemsSynced || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Sync</span>
                <span className="text-sm">
                  {syncStatus?.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : 'Never'}
                </span>
              </div>
            </div>

            {syncStatus?.message && (
              <div className="bg-muted p-3 text-sm border-l-4 border-black mb-6">
                {syncStatus.message}
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleSync}
              disabled={syncStatus?.status === 'syncing' || triggerSync.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${(syncStatus?.status === 'syncing' || triggerSync.isPending) ? 'animate-spin' : ''}`} />
              FORCE SYNC NOW
            </Button>
          </div>
        </div>

        {/* Right Column - Sales Data + Appearances */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-primary text-white p-6 comic-border shadow-[4px_4px_0_#000]">
              <DollarSign className="h-8 w-8 mb-2 opacity-80" />
              <p className="font-bold text-sm uppercase opacity-90">Total Revenue</p>
              <p className="font-display text-4xl mt-1">
                {loadingSales ? "..." : `$${((sales?.totalRevenueCents || 0) / 100).toFixed(2)}`}
              </p>
            </div>
            
            <div className="bg-secondary text-black p-6 comic-border shadow-[4px_4px_0_#000]">
              <ShoppingCart className="h-8 w-8 mb-2 opacity-80" />
              <p className="font-bold text-sm uppercase opacity-90">Total Orders</p>
              <p className="font-display text-4xl mt-1">
                {loadingSales ? "..." : sales?.totalOrders || 0}
              </p>
            </div>
            
            <div className="bg-white text-black p-6 comic-border shadow-[4px_4px_0_#000]">
              <Activity className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="font-bold text-sm uppercase text-muted-foreground">Orders (7 Days)</p>
              <p className="font-display text-4xl mt-1 text-primary">
                {loadingSales ? "..." : sales?.ordersLast7Days || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 comic-border shadow-[6px_6px_0_#000]">
            <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
              <Box className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl uppercase">Top Sellers</h2>
            </div>
            
            {loadingSales ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse comic-border"></div>)}
              </div>
            ) : sales?.topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground font-medium py-8">No sales data recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {sales?.topProducts.map((p, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center bg-muted p-4 comic-border gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-black text-white font-display flex items-center justify-center text-xl shrink-0">
                        {i + 1}
                      </div>
                      <p className="font-bold text-lg leading-tight">{p.productName}</p>
                    </div>
                    <div className="flex items-center gap-6 sm:ml-auto">
                      <div className="text-center">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Units</p>
                        <p className="font-display text-2xl">{p.unitsSold}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Revenue</p>
                        <p className="font-display text-2xl text-primary">${(p.revenueCents / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appearances Management */}
          <div className="bg-white p-6 comic-border shadow-[6px_6px_0_#000]">
            <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-primary" />
                <h2 className="font-display text-3xl uppercase">Appearances</h2>
              </div>
              {!showForm && (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
              )}
            </div>

            {/* Inline form */}
            {showForm && (
              <div className="bg-muted p-5 comic-border mb-6 space-y-4">
                <h3 className="font-display text-xl uppercase">
                  {editingId !== null ? "Edit Event" : "New Event"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase mb-1">Event Name *</label>
                    <input
                      className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. San Diego Comic-Con"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Date *</label>
                    <input
                      type="date"
                      className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.date}
                      min={today}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">End Date <span className="normal-case font-normal">(optional, multi-day)</span></label>
                    <input
                      type="date"
                      className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.endDate}
                      min={form.date || today}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Location *</label>
                    <input
                      className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. San Diego Convention Center"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase mb-1">Description</label>
                    <textarea
                      className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                      placeholder="What's happening at this event?"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase mb-1">Link (optional)</label>
                    <input
                      type="url"
                      className="w-full border-2 border-black px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://..."
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSubmit} disabled={isSaving}>
                    <Check className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : editingId !== null ? "Save Changes" : "Create Event"}
                  </Button>
                  <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Appearances list */}
            {loadingAppearances ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse comic-border" />
                ))}
              </div>
            ) : !appearances || appearances.length === 0 ? (
              <p className="text-center text-muted-foreground font-medium py-8">
                No events yet. Add one above!
              </p>
            ) : (
              <div className="space-y-3">
                {appearances.map((a) => {
                  const isPast = a.date < today;
                  return (
                    <div
                      key={a.id}
                      className={`flex flex-col sm:flex-row sm:items-start gap-4 p-4 comic-border ${isPast ? "opacity-50 bg-muted" : "bg-white"}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-lg leading-tight">{a.name}</span>
                          {isPast && (
                            <span className="text-xs font-bold uppercase bg-muted-foreground/20 px-2 py-0.5 comic-border">
                              Past
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium mt-1 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                            {formatDate(a.date)}
                            {a.endDate && a.endDate !== a.date ? ` – ${formatDate(a.endDate)}` : ""}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {a.location}
                          </div>
                          {a.link && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Link className="h-3.5 w-3.5 shrink-0" />
                              <a
                                href={a.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline truncate hover:text-primary"
                              >
                                {a.link}
                              </a>
                            </div>
                          )}
                        </div>
                        {a.description && (
                          <p className="text-sm mt-1 line-clamp-2 text-foreground/70">{a.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(a)}
                          disabled={showForm}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(a.id, a.name)}
                          disabled={deletingId === a.id}
                        >
                          {deletingId === a.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
