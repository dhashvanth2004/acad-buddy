import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ylhdobpnmhazvanvgjxl.lovable.app',
  'https://lovable.dev',
];

const getCorsHeaders = (origin: string | null) => {
  // Check if origin is allowed, otherwise use first allowed origin
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovable.dev')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      console.warn("Invalid request: messages is not an array or is empty");
      return new Response(
        JSON.stringify({ error: "Invalid messages format. Expected non-empty array." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit conversation history to prevent abuse
    if (messages.length > 50) {
      console.warn("Request rejected: too many messages", messages.length);
      return new Response(
        JSON.stringify({ error: "Too many messages. Maximum 50 per request." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each message structure and content
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object') {
        return new Response(
          JSON.stringify({ error: "Invalid message structure" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!msg.role || !msg.content) {
        return new Response(
          JSON.stringify({ error: "Each message must have 'role' and 'content'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!['user', 'assistant'].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Invalid message role. Must be 'user' or 'assistant'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (typeof msg.content !== 'string' || msg.content.length > 10000) {
        return new Response(
          JSON.stringify({ error: "Message content must be a string under 10000 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sanitize messages
    const sanitizedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content.trim().slice(0, 10000)
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing study assistant request with", sanitizedMessages.length, "validated messages");

    const systemPrompt = `You are AcadBuddy's AI Study Assistant - a friendly, knowledgeable tutor designed to help college students learn effectively.

Your capabilities:
- Explain complex concepts in simple terms
- Help with homework and assignments across all subjects
- Provide study tips and learning strategies
- Suggest when a student might benefit from connecting with a human mentor
- Answer questions about various academic subjects

Guidelines:
- Be encouraging and supportive
- Break down complex topics into digestible parts
- Use examples and analogies when helpful
- If a topic requires hands-on guidance or extended tutoring, suggest the student connect with a mentor on AcadBuddy
- Keep responses focused and concise
- Use markdown formatting for better readability

When you sense a student needs more personalized help (complex project work, exam preparation, or ongoing tutoring), mention that AcadBuddy has expert mentors available who can provide one-on-one guidance.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...sanitizedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Study assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
