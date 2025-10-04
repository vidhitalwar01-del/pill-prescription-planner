import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.5.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    // Get all users with email reminders enabled
    const { data: medications, error: medsError } = await supabase
      .from("medications")
      .select("*, user_id");

    if (medsError) throw medsError;

    // Group by user
    const userMedications = medications?.reduce((acc: any, med: any) => {
      if (!acc[med.user_id]) acc[med.user_id] = [];
      acc[med.user_id].push(med);
      return acc;
    }, {});

    for (const userId in userMedications) {
      try {
        // Check if reminders are enabled for this user
        const emailEnabled = localStorage?.getItem("emailRemindersEnabled") === "true";
        if (!emailEnabled) continue;

        const reminderEmail = localStorage?.getItem("reminderEmail");
        if (!reminderEmail) continue;

        const userMeds = userMedications[userId];

        // Get today's logs
        const { data: logs } = await supabase
          .from("medication_logs")
          .select("*")
          .eq("user_id", userId)
          .eq("log_date", today);

        // Check for missed doses
        const missedMeds = [];
        for (const med of userMeds) {
          for (const timeSlot of med.time_slots || []) {
            const [hour] = timeSlot.split(':').map(Number);
            
            // If it's past the time and not logged
            if (currentHour > hour + 1) {
              const logged = logs?.some(
                l => l.medication_id === med.id && l.taken
              );
              
              if (!logged) {
                missedMeds.push({ ...med, timeSlot });
              }
            }
          }
        }

        if (missedMeds.length > 0) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #ef4444;">⏰ Medication Reminder</h1>
              <p>You have missed the following medications today:</p>
              
              <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${missedMeds.map(med => `
                  <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                    <strong>${med.name}</strong> (${med.dosage})<br/>
                    <span style="color: #6b7280;">Scheduled: ${med.timeSlot}</span>
                  </div>
                `).join('')}
              </div>

              <p style="color: #1f2937;">
                Don't forget to log your medication when you take it!
              </p>

              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Stay consistent with your medication schedule for better health outcomes.
              </p>
            </div>
          `;

          await resend.emails.send({
            from: "MediTrack <onboarding@resend.dev>",
            to: [reminderEmail],
            subject: "⏰ Missed Medication Reminder",
            html: emailHtml,
          });

          console.log(`Missed dose reminder sent to ${reminderEmail}`);
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in smart-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
