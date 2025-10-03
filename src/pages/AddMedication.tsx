import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ClipboardPlus, Loader2, ArrowLeft, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@supabase/supabase-js";

const AddMedication = () => {
  const [searchParams] = useSearchParams();
  const medicationId = searchParams.get("id");
  const isEditMode = !!medicationId;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    timeSlots: ["09:00"],
    notes: "",
  });
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
    if (isEditMode && medicationId && user) {
      loadMedication();
    }
  }, [isEditMode, medicationId, user]);

  const loadMedication = async () => {
    if (!medicationId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("id", medicationId)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        timeSlots: data.time_slots || ["09:00"],
        notes: data.notes || "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      if (isEditMode && medicationId) {
        const { error } = await supabase
          .from("medications")
          .update({
            name: formData.name,
            dosage: formData.dosage,
            frequency: formData.frequency,
            time_slots: formData.timeSlots,
            notes: formData.notes,
          })
          .eq("id", medicationId);

        if (error) throw error;

        toast({
          title: "Medication updated!",
          description: "Your medication has been updated successfully.",
        });
      } else {
        const { error } = await supabase.from("medications").insert({
          user_id: user.id,
          name: formData.name,
          dosage: formData.dosage,
          frequency: formData.frequency,
          time_slots: formData.timeSlots,
          notes: formData.notes,
        });

        if (error) throw error;

        toast({
          title: "Medication added!",
          description: "Your medication has been added successfully.",
        });
      }

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newTimeSlots = [...formData.timeSlots];
    newTimeSlots[index] = value;
    setFormData({ ...formData, timeSlots: newTimeSlots });
  };

  const addTimeSlot = () => {
    setFormData({ ...formData, timeSlots: [...formData.timeSlots, "09:00"] });
  };

  const removeTimeSlot = (index: number) => {
    const newTimeSlots = formData.timeSlots.filter((_, i) => i !== index);
    setFormData({ ...formData, timeSlots: newTimeSlots });
  };

  return (
    <div className="min-h-screen bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none"></div>
      <div className="container mx-auto max-w-2xl py-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:scale-105 transition-transform"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-strong border-border/50 backdrop-blur-sm bg-card/95 animate-scale-in">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              {isEditMode ? (
                <Edit className="w-8 h-8 text-primary-foreground" />
              ) : (
                <ClipboardPlus className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <CardTitle className="text-3xl">{isEditMode ? "Edit Medication" : "New Prescription"}</CardTitle>
            <CardDescription>{isEditMode ? "Update your medication details" : "Enter your medication details below"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Aspirin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 100mg"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice-daily">Twice Daily</SelectItem>
                    <SelectItem value="three-times-daily">Three Times Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="as-needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <Label>Time Slots</Label>
                <div className="space-y-3">
                  {formData.timeSlots.map((time, index) => (
                    <div key={index} className="flex gap-2 animate-slide-in">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        disabled={loading}
                      />
                      {formData.timeSlots.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeTimeSlot(index)}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTimeSlot}
                  disabled={loading}
                  className="w-full"
                >
                  Add Time Slot
                </Button>
              </div>

              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full shadow-glow hover:shadow-glow hover:scale-105 transition-all" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  isEditMode ? "Update Medication" : "Add Medication"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddMedication;
