import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert Meta Ads strategist and performance analyst.

Your task is to analyze a generated Meta Ads campaign strategy and produce a Campaign Performance Score from 0 to 100.

Evaluate the campaign across these five categories (each 0-20):
1. Audience Targeting Quality
2. Campaign Structure
3. Creative Strategy
4. Budget Allocation Logic
5. Conversion Potential

Be honest and analytical, not overly optimistic. Penalize vagueness, generic advice, weak segmentation, unrealistic budgets, and weak conversion logic. Reward specificity, clear segmentation, audience psychology, and realistic testing/scaling logic.

Risk Level rules:
- Low: overall >= 80
- Medium: overall 55-79
- High: overall < 55

Performance Outlook rules:
- Strong: overall >= 80
- Moderate: overall 55-79
- Weak: overall < 55

Return ONLY via the score_campaign tool. Reasoning fields must be 1-2 short sentences each. Improvements must be concrete and actionable.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { campaignPlan } = await req.json();
    if (!campaignPlan || typeof campaignPlan !== "string") {
      return new Response(JSON.stringify({ error: "campaignPlan is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncated = campaignPlan.slice(0, 12000);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze and score this Meta Ads campaign strategy:\n\n${truncated}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_campaign",
              description: "Return the structured performance score for a Meta Ads campaign.",
              parameters: {
                type: "object",
                properties: {
                  overall_score: { type: "number", description: "0-100" },
                  risk_level: { type: "string", enum: ["Low", "Medium", "High"] },
                  outlook: { type: "string", enum: ["Weak", "Moderate", "Strong"] },
                  categories: {
                    type: "object",
                    properties: {
                      audience_targeting: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          reasoning: { type: "string" },
                        },
                        required: ["score", "reasoning"],
                      },
                      campaign_structure: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          reasoning: { type: "string" },
                        },
                        required: ["score", "reasoning"],
                      },
                      creative_strategy: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          reasoning: { type: "string" },
                        },
                        required: ["score", "reasoning"],
                      },
                      budget_allocation: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          reasoning: { type: "string" },
                        },
                        required: ["score", "reasoning"],
                      },
                      conversion_potential: {
                        type: "object",
                        properties: {
                          score: { type: "number" },
                          reasoning: { type: "string" },
                        },
                        required: ["score", "reasoning"],
                      },
                    },
                    required: [
                      "audience_targeting",
                      "campaign_structure",
                      "creative_strategy",
                      "budget_allocation",
                      "conversion_potential",
                    ],
                  },
                  improvements: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3,
                  },
                  summary: { type: "string", description: "Brief 1-2 sentence overall reasoning." },
                },
                required: ["overall_score", "risk_level", "outlook", "categories", "improvements", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "score_campaign" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to score campaign" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Invalid AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const score = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ score }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("score-campaign error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
