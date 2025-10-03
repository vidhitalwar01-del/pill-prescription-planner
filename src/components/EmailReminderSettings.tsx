import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Mail, Bell } from "lucide-react";

interface EmailReminderSettingsProps {
  userEmail: string;
}

const EmailReminderSettings = ({ userEmail }: EmailReminderSettingsProps) => {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [reminderEmail, setReminderEmail] = useState(userEmail);
  const { toast } = useToast();

  const handleSave = () => {
    // Store settings in localStorage for now
    localStorage.setItem("emailRemindersEnabled", emailEnabled.toString());
    localStorage.setItem("reminderEmail", reminderEmail);

    toast({
      title: "Settings saved!",
      description: emailEnabled
        ? "You'll receive email reminders for missed medications."
        : "Email reminders have been disabled.",
    });
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
          Get notified when you miss your medications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-reminders" className="text-base">
              Enable Reminders
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive daily reminders at 8 PM
            </p>
          </div>
          <Switch
            id="email-reminders"
            checked={emailEnabled}
            onCheckedChange={setEmailEnabled}
          />
        </div>

        {emailEnabled && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="reminder-email">Email Address</Label>
            <Input
              id="reminder-email"
              type="email"
              value={reminderEmail}
              onChange={(e) => setReminderEmail(e.target.value)}
              placeholder="your@email.com"
            />
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
                You'll receive a reminder email each evening if you've missed any medications that day.
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailReminderSettings;
