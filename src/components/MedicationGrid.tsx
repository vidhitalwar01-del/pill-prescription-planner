import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfDay } from "date-fns";
import { Check, X } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

interface MedicationGridProps {
  medications: Medication[];
  userId: string;
}

const MedicationGrid = ({ medications, userId }: MedicationGridProps) => {
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Generate last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return startOfDay(date);
  });

  useEffect(() => {
    loadLogs();
  }, [medications, userId]);

  const loadLogs = async () => {
    if (!userId || medications.length === 0) return;

    const startDate = format(days[0], "yyyy-MM-dd");
    const endDate = format(days[days.length - 1], "yyyy-MM-dd");

    try {
      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", userId)
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
      toast({
        title: "Error loading logs",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleLog = async (medicationId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const key = `${medicationId}-${dateStr}`;
    const currentState = logs[key] || false;
    const newState = !currentState;

    try {
      const { error } = await supabase
        .from("medication_logs")
        .upsert({
          user_id: userId,
          medication_id: medicationId,
          log_date: dateStr,
          taken: newState,
          taken_at: newState ? new Date().toISOString() : null,
        }, {
          onConflict: "medication_id,log_date"
        });

      if (error) throw error;

      setLogs({ ...logs, [key]: newState });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-strong border-border/50 backdrop-blur-sm bg-card/95 overflow-x-auto hover:shadow-glow transition-all">
      <CardHeader>
        <CardTitle>Medication Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-w-max">
          {/* Header Row */}
          <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `200px repeat(${days.length}, 80px)` }}>
            <div className="font-semibold text-sm">Medication</div>
            {days.map((day, index) => (
              <div key={index} className="text-center text-sm font-medium">
                <div>{format(day, "EEE")}</div>
                <div className="text-muted-foreground text-xs">{format(day, "MMM d")}</div>
              </div>
            ))}
          </div>

          {/* Medication Rows */}
          {medications.map((med, medIndex) => (
            <div
              key={med.id}
              className="grid gap-2 mb-3 items-center animate-slide-in"
              style={{
                gridTemplateColumns: `200px repeat(${days.length}, 80px)`,
                animationDelay: `${medIndex * 0.05}s`,
              }}
            >
              <div className="pr-4">
                <div className="font-medium text-sm">{med.name}</div>
                <div className="text-xs text-muted-foreground">{med.dosage}</div>
              </div>
              {days.map((day, dayIndex) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const key = `${med.id}-${dateStr}`;
                const isTaken = logs[key] || false;
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                const isFuture = day > new Date();

                return (
                  <Button
                    key={dayIndex}
                    variant={isTaken ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLog(med.id, day)}
                    disabled={isFuture}
                    className={`h-10 w-full transition-all hover:scale-105 ${
                      isTaken ? "bg-accent hover:bg-accent/80 shadow-glow" : ""
                    } ${isToday ? "ring-2 ring-primary shadow-glow" : ""}`}
                  >
                    {isTaken ? (
                      <Check className="h-4 w-4 animate-scale-in" />
                    ) : isFuture ? (
                      <X className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationGrid;
