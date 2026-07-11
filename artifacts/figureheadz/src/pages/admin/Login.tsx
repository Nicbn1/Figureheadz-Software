import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { setAdminToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const login = useAdminLogin();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await login.mutateAsync({
        data: { password }
      });
      setAdminToken(session.token);
      toast({
        title: "Access Granted",
        description: "Welcome to the control room.",
      });
      setLocation("/admin");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Incorrect password. Intruder alert!",
      });
      setPassword("");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 comic-border shadow-[12px_12px_0_hsl(213_100%_50%)]">
        <div className="flex justify-center mb-6">
          <div className="bg-destructive text-white p-4 rounded-full comic-border">
            <ShieldAlert className="h-10 w-10" />
          </div>
        </div>
        
        <h1 className="font-display text-5xl uppercase text-center mb-2">Restricted Area</h1>
        <p className="text-center font-bold text-muted-foreground mb-8">Admin Access Only</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="font-bold uppercase tracking-wider text-sm">Password Override</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="text-center text-2xl h-14"
              autoFocus
            />
          </div>
          
          <Button type="submit" size="lg" className="w-full h-14 text-2xl" disabled={login.isPending || !password}>
            {login.isPending ? "DECRYPTING..." : "ENTER"}
          </Button>
        </form>
      </div>
    </div>
  );
}
