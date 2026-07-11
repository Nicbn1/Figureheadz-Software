import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  useGetSalesSummary,
  getGetSalesSummaryQueryKey,
  useGetSyncStatus,
  getGetSyncStatusQueryKey,
  useTriggerSync,
} from "@workspace/api-client-react";
import { getAdminToken, setAdminToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, RefreshCw, Box, DollarSign, ShoppingCart, Activity } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const triggerSync = useTriggerSync();

  // Handle unauthorized gracefully by redirecting
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

  if (!getAdminToken()) return null;

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

        {/* Right Column - Sales Data */}
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
        </div>
      </div>
    </div>
  );
}
