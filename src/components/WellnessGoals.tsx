import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  coin_reward: number;
  goal_type: string;
}

interface WellnessGoalsProps {
  userId: string;
  onCoinsUpdate: () => void;
}

export const WellnessGoals = ({ userId, onCoinsUpdate }: WellnessGoalsProps) => {
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
    loadCompletions();
  }, [userId]);

  const loadGoals = async () => {
    const { data, error } = await supabase
      .from("wellness_goals")
      .select("*");

    if (error) {
      console.error("Error loading goals:", error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const loadCompletions = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from("user_wellness_completions")
      .select("goal_id")
      .eq("user_id", userId)
      .eq("completed_date", today);

    if (error) {
      console.error("Error loading completions:", error);
    } else {
      setCompletedGoals(new Set(data?.map(c => c.goal_id) || []));
    }
  };

  const handleToggleGoal = async (goal: WellnessGoal) => {
    const isCompleted = completedGoals.has(goal.id);

    if (isCompleted) {
      // Remove completion
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from("user_wellness_completions")
        .delete()
        .eq("user_id", userId)
        .eq("goal_id", goal.id)
        .eq("completed_date", today);

      if (error) {
        toast.error("Failed to update goal");
        return;
      }

      // Update coins
      const { data: settings } = await supabase
        .from("user_settings")
        .select("med_coins")
        .eq("user_id", userId)
        .single();

      const currentCoins = settings?.med_coins || 0;
      await supabase
        .from("user_settings")
        .upsert({ 
          user_id: userId, 
          med_coins: Math.max(0, currentCoins - goal.coin_reward)
        }, { onConflict: "user_id" });

      setCompletedGoals(prev => {
        const next = new Set(prev);
        next.delete(goal.id);
        return next;
      });

      toast.success(`Removed ${goal.title}`);
    } else {
      // Add completion
      const { error } = await supabase
        .from("user_wellness_completions")
        .insert({
          user_id: userId,
          goal_id: goal.id,
          coins_earned: goal.coin_reward
        });

      if (error) {
        toast.error("Failed to complete goal");
        return;
      }

      // Update coins
      const { data: settings } = await supabase
        .from("user_settings")
        .select("med_coins")
        .eq("user_id", userId)
        .single();

      const currentCoins = settings?.med_coins || 0;
      await supabase
        .from("user_settings")
        .upsert({ 
          user_id: userId, 
          med_coins: currentCoins + goal.coin_reward 
        }, { onConflict: "user_id" });

      setCompletedGoals(prev => new Set([...prev, goal.id]));
      toast.success(`🎉 +${goal.coin_reward} MedCoins!`);
    }

    onCoinsUpdate();
  };

  if (loading) return null;

  return (
    <Card className="p-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">🌿 Daily Wellness Goals</h2>
      <div className="space-y-3">
        {goals.map((goal) => {
          const isCompleted = completedGoals.has(goal.id);
          return (
            <Button
              key={goal.id}
              variant={isCompleted ? "default" : "outline"}
              className="w-full justify-start h-auto p-4 transition-all duration-300 hover:scale-[1.02]"
              onClick={() => handleToggleGoal(goal)}
            >
              <div className="flex items-center gap-3 w-full">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
                <span className="text-2xl">{goal.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{goal.title}</div>
                  <div className="text-sm opacity-80">{goal.description}</div>
                </div>
                <div className="text-sm font-bold">+{goal.coin_reward} 🪙</div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};
