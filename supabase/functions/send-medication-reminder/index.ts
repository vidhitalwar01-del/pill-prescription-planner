import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.5.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  userEmail: string;
  missedMedications: Array<{
    name: string;
    dosage: string;
    timeSlots: string[];
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, missedMedications }: ReminderRequest = await req.json();

    console.log("Sending reminder to:", userEmail);
    console.log("Missed medications:", missedMedications);

    // Generate HTML for missed medications
    const medicationsHTML = missedMedications
      .map(
        (med) => `
        <div style="background: #f0f9ff; border-left: 4px solid #2E7D8A; padding: 12px; margin: 8px 0; border-radius: 4px;">
          <h3 style="margin: 0; color: #2E7D8A; font-size: 16px;">${med.name}</h3>
          <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">
            ${med.dosage} - Scheduled: ${med.timeSlots.join(", ")}
          </p>
        </div>
      `
      )
      .join("");

    const emailResponse = await resend.emails.send({
      from: "MediTrack Wellness <onboarding@resend.dev>",
      to: [userEmail],
      subject: "🔔 Medication Reminder - Don't forget your wellness!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2E7D8A 0%, #14B8A6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">💊 MediTrack Wellness</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Your Health Reminder</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <h2 style="color: #2E7D8A; margin-top: 0;">Missed Medication Alert</h2>
              <p style="color: #666; font-size: 16px;">
                You haven't logged the following medications for today:
              </p>
              
              ${medicationsHTML}
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>💡 Remember:</strong> Consistency is key to your wellness journey. Take a moment to log your medications now!
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app") || "https://your-app.lovable.app"}/dashboard" 
                   style="background: linear-gradient(135deg, #2E7D8A 0%, #14B8A6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Update Your Tracker
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                You're receiving this because you enabled medication reminders.<br>
                Stay on track with your wellness goals! 💪
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-medication-reminder function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
