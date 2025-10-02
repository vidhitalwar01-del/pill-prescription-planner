import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Activity } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import MedicationGrid from "@/components/MedicationGrid";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadMedications();
    }
  }, [user]);

  const loadMedications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMedications(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading medications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">MediTrack</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Track your medications and stay healthy</p>
        </div>

        {/* Add Medication Button */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Button onClick={() => navigate("/add-medication")} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Medication
          </Button>
        </div>

        {/* Medication Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your medications...</p>
          </div>
        ) : medications.length === 0 ? (
          <Card className="animate-scale-in">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No medications added yet. Start tracking your wellness journey!
              </p>
              <Button onClick={() => navigate("/add-medication")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Medication
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <MedicationGrid medications={medications} userId={user?.id || ""} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
