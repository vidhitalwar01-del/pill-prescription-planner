import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Mail, Bell, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EmailReminderSettingsProps {
  userEmail: string;
  userId: string;
}

const EmailReminderSettings = ({ userEmail, userId }: EmailReminderSettingsProps) => {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [reminderEmail, setReminderEmail] = useState(userEmail);
  const [guardianEmail, setGuardianEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("user_settings")
      .select("guardian_email")
      .eq("user_id", userId)
      .single();

    if (data?.guardian_email) {
      setGuardianEmail(data.guardian_email);
    }

    const saved = localStorage.getItem("emailRemindersEnabled");
    setEmailEnabled(saved === "true");
  };

  const handleSave = async () => {
    localStorage.setItem("emailRemindersEnabled", emailEnabled.toString());
    localStorage.setItem("reminderEmail", reminderEmail);

    const { error } = await supabase
      .from("user_settings")
      .upsert({ 
        user_id: userId, 
        guardian_email: guardianEmail 
      }, { onConflict: "user_id" });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings saved!",
        description: emailEnabled
          ? "You'll receive email reminders for medications."
          : "Email reminders have been disabled.",
      });
    }
  };

  return (
    <Card className="animate-scale-in shadow-strong border-border/50 backdrop-blur-sm bg-card/95 hover:shadow-glow transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/20 shadow-glow">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          Email Reminders
        </CardTitle>
        <CardDescription>
          Get notified and keep guardians informed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-reminders" className="text-base">
              Enable Reminders
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive daily reminders and missed dose alerts
            </p>
          </div>
          <Switch
            id="email-reminders"
            checked={emailEnabled}
            onCheckedChange={setEmailEnabled}
          />
        </div>

        {emailEnabled && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="reminder-email">Your Email Address</Label>
              <Input
                id="reminder-email"
                type="email"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="guardian-email" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Guardian Email (Optional)
              </Label>
              <Input
                id="guardian-email"
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="guardian@email.com"
              />
              <p className="text-sm text-muted-foreground">
                Guardian will receive weekly medication reports with adherence stats
              </p>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full shadow-glow hover:shadow-glow hover:scale-105 transition-all">
          <Bell className="mr-2 h-4 w-4" />
          Save Settings
        </Button>

        {emailEnabled && (
          <div className="bg-accent/10 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="text-accent">💡</span>
              <span>
                Daily reminders at 8 PM • Missed dose alerts • Weekly guardian reports
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailReminderSettings;
