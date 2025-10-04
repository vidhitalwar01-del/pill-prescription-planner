import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MedCoinsDisplayProps {
  userId: string;
  refreshTrigger: number;
}

export const MedCoinsDisplay = ({ userId, refreshTrigger }: MedCoinsDisplayProps) => {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    loadCoins();
  }, [userId, refreshTrigger]);

  const loadCoins = async () => {
    const { data } = await supabase
      .from("user_settings")
      .select("med_coins")
      .eq("user_id", userId)
      .single();

    setCoins(data?.med_coins || 0);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 animate-scale-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <Coins className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your MedCoins</p>
            <p className="text-4xl font-bold">{coins} 🪙</p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="transition-all duration-300 hover:scale-105">
              Redeem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redeem Your MedCoins</DialogTitle>
              <DialogDescription>
                Use your MedCoins for exclusive rewards!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="font-semibold">10% Off Next Order</div>
                <div className="text-sm text-muted-foreground">Cost: 100 🪙</div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="font-semibold">Free Medicine Delivery</div>
                <div className="text-sm text-muted-foreground">Cost: 150 🪙</div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="font-semibold">Health Consultation</div>
                <div className="text-sm text-muted-foreground">Cost: 250 🪙</div>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="font-semibold">Premium App Features</div>
                <div className="text-sm text-muted-foreground">Cost: 500 🪙</div>
              </div>
              <p className="text-sm text-muted-foreground text-center italic">
                * Rewards are placeholder features for demonstration
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
