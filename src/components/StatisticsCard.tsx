import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp, Target } from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";

interface StatisticsCardProps {
  medications: any[];
  logs: Record<string, boolean>;
}

const StatisticsCard = ({ medications, logs }: StatisticsCardProps) => {
  // Calculate current streak
  const calculateStreak = () => {
    if (medications.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check backwards from today
    while (true) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      let allTaken = true;
      
      // Check if all medications were taken on this day
      for (const med of medications) {
        const key = `${med.id}-${dateStr}`;
        if (!logs[key]) {
          allTaken = false;
          break;
        }
      }
      
      if (!allTaken) break;
      
      streak++;
      currentDate = subDays(currentDate, 1);
      
      // Don't check before the earliest medication
      const oldestMed = medications.reduce((oldest, med) => {
        const medDate = new Date(med.start_date);
        return medDate < oldest ? medDate : oldest;
      }, new Date());
      
      if (currentDate < oldestMed) break;
      if (streak > 365) break; // Sanity check
    }
    
    return streak;
  };

  // Calculate adherence rate for last 30 days
  const calculateAdherence = () => {
    if (medications.length === 0) return 0;
    
    const days = 30;
    let totalExpected = 0;
    let totalTaken = 0;
    
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      for (const med of medications) {
        const medStartDate = new Date(med.start_date);
        if (date >= medStartDate) {
          totalExpected++;
          const key = `${med.id}-${dateStr}`;
          if (logs[key]) {
            totalTaken++;
          }
        }
      }
    }
    
    return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
  };

  const streak = calculateStreak();
  const adherence = calculateAdherence();

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/50 shadow-glow animate-scale-in backdrop-blur-sm hover:scale-105 transition-transform">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20 shadow-glow">
              <Flame className="h-4 w-4 text-primary animate-pulse" />
            </div>
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary animate-fade-in">{streak}</span>
            <span className="text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {streak > 0 ? "Keep it up! 🔥" : "Start your streak today!"}
          </p>
        </CardContent>
      </Card>

      {/* Adherence Rate */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/50 shadow-glow animate-scale-in backdrop-blur-sm hover:scale-105 transition-transform" style={{ animationDelay: "0.1s" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20 shadow-glow">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            30-Day Adherence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-accent animate-fade-in">{adherence}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-accent to-primary h-2 rounded-full transition-all duration-1000 shadow-glow"
              style={{ width: `${adherence}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Total Medications */}
      <Card className="bg-gradient-to-br from-primary-glow/10 to-primary-glow/5 border-primary-glow/50 shadow-glow animate-scale-in backdrop-blur-sm hover:scale-105 transition-transform" style={{ animationDelay: "0.2s" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary-glow/20 shadow-glow">
              <Target className="h-4 w-4 text-primary" />
            </div>
            Active Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold animate-fade-in">{medications.length}</span>
            <span className="text-muted-foreground">meds</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {medications.length > 0 ? "Tracking your wellness 💊" : "Add your first medication"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCard;
