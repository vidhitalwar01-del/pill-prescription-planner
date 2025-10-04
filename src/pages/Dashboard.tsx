import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Activity, Edit, Trash2, Pill } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import MedicationGrid from "@/components/MedicationGrid";
import StatisticsCard from "@/components/StatisticsCard";
import AdherenceChart from "@/components/AdherenceChart";
import EmailReminderSettings from "@/components/EmailReminderSettings";
import MedicationChatbot from "@/components/MedicationChatbot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WellnessGoals } from "@/components/WellnessGoals";
import { MedCoinsDisplay } from "@/components/MedCoinsDisplay";
import { format, subDays } from "date-fns";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [coinsRefresh, setCoinsRefresh] = useState(0);
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
      loadLogs();
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

  const loadLogs = async () => {
    if (!user) return;

    const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const endDate = format(new Date(), "yyyy-MM-dd");

    try {
      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("log_date", startDate)
        .lte("log_date", endDate);

      if (error) throw error;

      const logsMap: Record<string, boolean> = {};
      data?.forEach((log) => {
        const key = `${log.medication_id}-${log.log_date}`;
        logsMap[key] = log.taken;
      });

      setLogs(logsMap);
    } catch (error: any) {
      console.error("Error loading logs:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Medication deleted",
        description: "Your medication has been removed.",
      });

      loadMedications();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-20 pointer-events-none"></div>
      
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-20 shadow-medium">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-pulse">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">MediTrack</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={handleSignOut} className="hover:scale-105 transition-transform">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
            Welcome back!
          </h2>
          <p className="text-muted-foreground text-lg">Track your medications and stay healthy</p>
        </div>

        {/* Add Medication Button */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Button 
            onClick={() => navigate("/add-medication")} 
            size="lg"
            className="shadow-glow hover:shadow-glow hover:scale-105 transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Medication
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your medications...</p>
          </div>
        ) : medications.length === 0 ? (
          <Card className="animate-scale-in shadow-strong border-border/50 backdrop-blur-sm bg-card/95">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No medications added yet. Start tracking your wellness journey!
              </p>
              <Button 
                onClick={() => navigate("/add-medication")}
                className="shadow-glow hover:shadow-glow hover:scale-105 transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Medication
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* MedCoins Display */}
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <MedCoinsDisplay userId={user.id} refreshTrigger={coinsRefresh} />
            </div>

            {/* Wellness Goals */}
            <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <WellnessGoals 
                userId={user.id} 
                onCoinsUpdate={() => setCoinsRefresh(prev => prev + 1)}
              />
            </div>

            {/* Medications List with Edit/Delete */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <Card className="shadow-strong border-border/50 backdrop-blur-sm bg-card/95">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Your Medications</h3>
                  <div className="space-y-3">
                    {medications.map((med, idx) => (
                      <div
                        key={med.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/30 hover:border-primary/50 transition-all hover:scale-[1.02] animate-slide-in"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{med.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {med.dosage} • {med.frequency}
                          </p>
                          {med.time_slots && med.time_slots.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Times: {med.time_slots.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/add-medication?id=${med.id}`)}
                            className="hover:scale-110 transition-transform"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteMedication(med.id)}
                            className="hover:scale-110 transition-transform hover:border-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
            <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <StatisticsCard medications={medications} logs={logs} />
            </div>

            {/* Charts */}
            <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <AdherenceChart medications={medications} logs={logs} />
            </div>

            {/* Email Reminder Settings */}
            <div className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <EmailReminderSettings userEmail={user?.email || ""} userId={user.id} />
            </div>

            {/* Medication Grid */}
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <MedicationGrid medications={medications} userId={user?.id || ""} />
            </div>
          </div>
        )}
      </div>

      {/* Chatbot */}
      {medications.length > 0 && <MedicationChatbot medications={medications} />}
    </div>
  );
};

export default Dashboard;
