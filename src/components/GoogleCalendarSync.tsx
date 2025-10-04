import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Download } from "lucide-react";

interface GoogleCalendarSyncProps {
  medications: any[];
}

const GoogleCalendarSync = ({ medications }: GoogleCalendarSyncProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateICSFile = () => {
    setIsGenerating(true);
    
    try {
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MediTrack//Medication Reminders//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:MediTrack Medications',
        'X-WR-TIMEZONE:UTC',
      ];

      medications.forEach(med => {
        if (med.time_slots && med.time_slots.length > 0) {
          med.time_slots.forEach((time: string) => {
            const [hours, minutes] = time.split(':');
            const now = new Date();
            const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
            
            const formatDate = (date: Date) => {
              return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            icsContent.push(
              'BEGIN:VEVENT',
              `UID:${med.id}-${time}@meditrack.com`,
              `DTSTAMP:${formatDate(now)}`,
              `DTSTART:${formatDate(eventDate)}`,
              `SUMMARY:Take ${med.name} - ${med.dosage}`,
              `DESCRIPTION:Medication reminder for ${med.name}\\nDosage: ${med.dosage}\\nFrequency: ${med.frequency}`,
              'STATUS:CONFIRMED',
              'SEQUENCE:0',
              'RRULE:FREQ=DAILY',
              'BEGIN:VALARM',
              'TRIGGER:-PT15M',
              'ACTION:DISPLAY',
              `DESCRIPTION:Reminder: Take ${med.name}`,
              'END:VALARM',
              'END:VEVENT'
            );
          });
        }
      });

      icsContent.push('END:VCALENDAR');

      const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'meditrack-schedule.ics';
      link.click();

      toast({
        title: "Calendar file generated!",
        description: "Import the .ics file into Google Calendar to sync your medication schedule.",
      });
    } catch (error) {
      toast({
        title: "Error generating calendar",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-strong border-border/50 backdrop-blur-sm bg-card/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
          Google Calendar Sync
        </CardTitle>
        <CardDescription>
          Download your medication schedule and import it into Google Calendar for automatic reminders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-secondary/50 p-4 rounded-lg border border-border/30">
            <h4 className="font-semibold mb-2">How to sync:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click "Download Calendar File" below</li>
              <li>Open Google Calendar in your browser</li>
              <li>Click the "+" next to "Other calendars"</li>
              <li>Select "Import" and choose the downloaded file</li>
              <li>Your medication reminders will appear in your calendar!</li>
            </ol>
          </div>
          
          <Button 
            onClick={generateICSFile}
            disabled={isGenerating || medications.length === 0}
            className="w-full shadow-glow hover:scale-105 transition-all"
            aria-label="Download calendar file for Google Calendar"
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            {isGenerating ? "Generating..." : "Download Calendar File"}
          </Button>

          {medications.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Add medications with time slots to generate a calendar
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarSync;
