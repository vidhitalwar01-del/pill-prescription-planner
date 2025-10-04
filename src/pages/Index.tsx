import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pill, Calendar, CheckCircle2, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none"></div>
      
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-20 shadow-medium" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-vibrant flex items-center justify-center shadow-glow">
              <Pill className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MediTrack
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-4 pt-20 pb-16 relative z-10" aria-label="Hero section">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-glow animate-pulse" aria-hidden="true">
              <Activity className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent animate-fade-in">
              MediTrack Wellness
            </h2>
            
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Your personal medication companion. Track prescriptions, set reminders, and maintain your wellness journey with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="text-lg px-8 shadow-glow hover:shadow-glow hover:scale-105 transition-all focus:ring-2 focus:ring-ring"
                aria-label="Get started with MediTrack"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 hover:scale-105 transition-all focus:ring-2 focus:ring-ring"
                aria-label="Sign in to your account"
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 relative z-10" aria-label="Features">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <article className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-strong border border-border/50 hover:shadow-glow hover:scale-105 transition-all animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 shadow-glow" aria-hidden="true">
                <Pill className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Prescription Management</h3>
              <p className="text-muted-foreground">
                Add and organize all your medications with detailed prescription information.
              </p>
            </article>

            <article className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-strong border border-border/50 hover:shadow-glow hover:scale-105 transition-all animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 shadow-glow" aria-hidden="true">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Set custom frequencies and times for each medication to never miss a dose.
              </p>
            </article>

            <article className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-strong border border-border/50 hover:shadow-glow hover:scale-105 transition-all animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 shadow-glow" aria-hidden="true">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Habit Tracking</h3>
              <p className="text-muted-foreground">
                Visual dashboard to track your medication adherence and build healthy habits.
              </p>
            </article>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
