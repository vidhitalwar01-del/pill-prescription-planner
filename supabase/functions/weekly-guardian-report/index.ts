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

    // Get all users with guardian emails
    const { data: users, error: usersError } = await supabase
      .from("user_settings")
      .select("user_id, guardian_email")
      .not("guardian_email", "is", null);

    if (usersError) throw usersError;

    for (const userSettings of users || []) {
      try {
        // Get medications for this user
        const { data: medications } = await supabase
          .from("medications")
          .select("*")
          .eq("user_id", userSettings.user_id);

        // Get logs from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: logs } = await supabase
          .from("medication_logs")
          .select("*")
          .eq("user_id", userSettings.user_id)
          .gte("log_date", sevenDaysAgo.toISOString().split('T')[0]);

        // Calculate statistics
        const totalDoses = (medications?.length || 0) * 7;
        const takenDoses = logs?.filter(l => l.taken).length || 0;
        const adherencePercentage = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

        // Calculate streak
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];
          
          const dayLogs = logs?.filter(l => l.log_date === dateStr) || [];
          const dayMeds = medications?.length || 0;
          const dayTaken = dayLogs.filter(l => l.taken).length;
          
          if (dayTaken === dayMeds && dayMeds > 0) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Calculate stock needed
        const stockNeeded = medications?.map(med => {
          const dosesPerDay = med.time_slots?.length || 1;
          return {
            name: med.name,
            dosage: med.dosage,
            needed: dosesPerDay * 7
          };
        }) || [];

        // Send email
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">📊 Weekly Medication Report</h1>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin-top: 0;">Adherence Summary</h2>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>Doses Taken:</span>
                <strong>${takenDoses} / ${totalDoses}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>Adherence Rate:</span>
                <strong style="color: ${adherencePercentage >= 80 ? '#10b981' : '#ef4444'};">${adherencePercentage}%</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>Current Streak:</span>
                <strong>${currentStreak} days 🔥</strong>
              </div>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin-top: 0;">📦 Stock Needed (Next 7 Days)</h2>
              ${stockNeeded.map(item => `
                <div style="margin: 10px 0;">
                  <strong>${item.name}</strong> (${item.dosage}): ${item.needed} doses
                </div>
              `).join('')}
            </div>

            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; margin-top: 0;">💪 ${adherencePercentage >= 80 ? 'Keep up the great work!' : 'Let\'s improve together!'}</h2>
              <p>${adherencePercentage >= 80 
                ? 'Excellent adherence this week! Your consistency is paying off.' 
                : 'Consider setting up daily reminders to improve medication adherence.'}</p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This is an automated weekly report from MediTrack.
            </p>
          </div>
        `;

        await resend.emails.send({
          from: "MediTrack <onboarding@resend.dev>",
          to: [userSettings.guardian_email],
          subject: `Weekly Medication Report - ${adherencePercentage}% Adherence`,
          html: emailHtml,
        });

        console.log(`Report sent to ${userSettings.guardian_email}`);
      } catch (error) {
        console.error(`Error processing user ${userSettings.user_id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: users?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in weekly-guardian-report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
