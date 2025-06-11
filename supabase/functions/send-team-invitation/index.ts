
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TeamInvitationRequest {
  email: string;
  role: string;
  teamOwnerName: string;
  invitationToken: string;
  appUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, teamOwnerName, invitationToken, appUrl }: TeamInvitationRequest = await req.json();

    const acceptUrl = `${appUrl}/team/accept-invitation?token=${invitationToken}`;

    const emailResponse = await resend.emails.send({
      from: "Team Invitation <onboarding@resend.dev>",
      to: [email],
      subject: `You've been invited to join ${teamOwnerName}'s team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Team Invitation</h1>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0;">You're Invited!</h2>
            <p style="margin: 0; font-size: 18px;">${teamOwnerName} has invited you to join their team</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Invitation Details:</h3>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Invited by:</strong> ${teamOwnerName}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;">
              Accept Invitation
            </a>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
            <p>This invitation will expire in 7 days.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    console.log("Team invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-team-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
