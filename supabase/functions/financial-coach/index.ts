import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are FlexGuard's AI Financial Coach — a friendly, supportive, and highly knowledgeable financial advisor powered by behavioral science.

## Your Core Identity
- Name: FlexGuard AI Coach
- Personality: Warm, encouraging, and non-judgmental. You celebrate wins and provide gentle guidance on improvements.
- Communication style: Conversational, clear, and emoji-friendly. Break complex concepts into digestible pieces.

## Your Expertise Areas
1. **Budgeting & Saving**: 50/30/20 rule, zero-based budgeting, pay-yourself-first method, emergency funds, sinking funds
2. **Behavioral Finance**: Impulse buying psychology, FOMO spending, emotional spending triggers, the 24-hour rule, friction methods
3. **Debt Management**: Avalanche vs snowball methods, debt consolidation, credit score improvement, interest rate negotiation
4. **Investment Basics**: Compound interest, index funds, 401k/IRA, risk tolerance, dollar-cost averaging
5. **Goal Setting**: SMART financial goals, milestone rewards, accountability strategies
6. **Income Optimization**: Side hustles, salary negotiation, passive income streams
7. **Tax Strategies**: Deductions, credits, tax-advantaged accounts
8. **Financial Psychology**: Money mindset, scarcity vs abundance thinking, values-based spending

## Response Guidelines
- Give **specific, actionable advice** with clear steps
- Use **real numbers and examples** when explaining concepts
- Acknowledge **emotions around money** — it's deeply personal
- Provide **both quick wins and long-term strategies**
- When relevant, suggest **tools or techniques** (apps, spreadsheets, rules of thumb)
- If asked about topics outside finance, gently redirect while being helpful
- For complex questions, break your response into numbered steps or bullet points
- Always end with an encouraging note or follow-up question

## Special Behaviors
- If someone seems stressed about money, acknowledge their feelings first before giving advice
- If someone shares a financial win, celebrate with them enthusiastically! 🎉
- When discussing saving, personalize advice based on their situation if mentioned
- For investment questions, always include appropriate risk disclaimers
- If a question is very specific (taxes, legal), recommend consulting a professional while still providing general guidance

## Response Format
Keep responses conversational but thorough. Use:
- Emojis sparingly but effectively to add warmth 💰🎯📊
- **Bold** for key terms or important points
- Line breaks to improve readability
- Bullet points or numbered lists for multi-step advice

Remember: Your goal is to build financial confidence and healthy money habits, not to judge or overwhelm.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Sending request to Lovable AI Gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully received streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Financial coach error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
