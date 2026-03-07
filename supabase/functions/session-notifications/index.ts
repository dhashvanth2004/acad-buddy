import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
    type: 'booking_request' | 'booking_accepted' | 'booking_declined';
    sessionId: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { type, sessionId }: NotificationPayload = await req.json();

        if (!sessionId || !type) {
            throw new Error("Missing sessionId or type");
        }

        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Fetch session details
        const { data: session, error: sessionError } = await supabaseAdmin
            .from("sessions")
            .select("*, mentor:profiles!mentor_id(*), student:profiles!student_id(*)")
            .eq("id", sessionId)
            .single();

        if (sessionError || !session) {
            throw new Error("Failed to fetch session details");
        }

        let toUserId = "";
        let emailSubject = "";
        let emailHtml = "";

        if (type === 'booking_request') {
            toUserId = session.mentor_id; // Email goes to mentor
            emailSubject = "New Session Request";
            emailHtml = `
        <h2>New Session Request!</h2>
        <p><strong>${session.student.full_name}</strong> has requested a ${session.duration_minutes}-minute session with you on ${new Date(session.scheduled_at).toLocaleString()}.</p>
        <p>Please log in to your dashboard to accept or decline the request.</p>
      `;
        } else if (type === 'booking_accepted') {
            toUserId = session.student_id; // Email goes to student
            emailSubject = "Session Request Accepted";
            emailHtml = `
        <h2>Session Accepted!</h2>
        <p><strong>${session.mentor.full_name}</strong> has accepted your session request for ${new Date(session.scheduled_at).toLocaleString()}.</p>
        <p>You can join the session from your dashboard at the scheduled time once the mentor starts it.</p>
      `;
        } else if (type === 'booking_declined') {
            toUserId = session.student_id;
            emailSubject = "Session Request Declined";
            emailHtml = `
        <h2>Session Declined</h2>
        <p>Unfortunately, <strong>${session.mentor.full_name}</strong> has declined your session request for ${new Date(session.scheduled_at).toLocaleString()}.</p>
        <p>Please check your dashboard to find another mentor.</p>
      `;
        } else {
            throw new Error("Invalid notification type");
        }

        // Get the email address for the user
        // Only possible with SERVICE_ROLE_KEY
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(toUserId);

        if (userError || !userData?.user) {
            console.error("Error fetching user email:", userError);
            throw new Error("Failed to fetch user email");
        }

        const toEmail = userData.user.email;

        if (!toEmail) {
            throw new Error("User has no email address");
        }

        if (!RESEND_API_KEY) {
            console.warn("No RESEND_API_KEY found. Simulating email send:", { toEmail, emailSubject });
            return new Response(
                JSON.stringify({ status: "success", message: "Simulated email send, missing RESEND API key" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Send email using Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "AcadBuddy Notifications <onboarding@resend.dev>",
                to: [toEmail],
                subject: emailSubject,
                html: emailHtml,
            }),
        });

        const resData = await res.json();

        if (!res.ok) {
            console.error("Resend error:", resData);
            throw new Error("Failed to send email");
        }

        return new Response(
            JSON.stringify({ status: "success", data: resData }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error sending notification:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
