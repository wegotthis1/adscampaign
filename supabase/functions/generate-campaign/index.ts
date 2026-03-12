import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CAMPAIGN_SYSTEM_PROMPT = `You are an expert Meta Ads campaign strategist. Generate a comprehensive, actionable Meta Ads campaign plan based on the user's inputs.

Your response should be a detailed campaign strategy in markdown format that includes:

1. **Campaign Overview** - Summary of the strategy tailored to the business
2. **Campaign Structure** - Campaign, ad set, and ad level organization
3. **Target Audience** - Detailed audience targeting recommendations (demographics, interests, behaviors, custom audiences, lookalike audiences)
4. **Ad Creative Recommendations** - Types of creatives (image, video, carousel), messaging angles, CTAs
5. **Budget Allocation** - How to split the budget across campaigns/ad sets, daily vs lifetime budget recommendations
6. **Bidding Strategy** - Recommended bid strategy based on objective and budget
7. **Campaign Timeline** - Phases (testing, optimization, scaling) with timeframes
8. **Key Metrics to Track** - KPIs relevant to the campaign objective
9. **Optimization Tips** - Best practices and tips for the given skill level
10. **Common Mistakes to Avoid** - Pitfalls specific to the objective and budget range

Tailor the complexity and language to the user's skill level. Be specific with numbers, percentages, and actionable steps.`;

async function generateWithVellum(
  vellumApiKey: string,
  websiteUrl: string,
  objective: string,
  skillLevel: string,
  budgetWithCurrency: string,
  currency: string
): Promise<string | null> {
  try {
    const vellumResponse = await fetch("https://predict.vellum.ai/v1/execute-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": vellumApiKey,
      },
      body: JSON.stringify({
        workflow_deployment_name: "meta-ads-campaign-generator",
        inputs: [
          { name: "website_url", type: "STRING", value: websiteUrl },
          { name: "campaign_objective", type: "STRING", value: objective },
          { name: "skill_level", type: "STRING", value: skillLevel },
          { name: "budget_range", type: "STRING", value: budgetWithCurrency },
          { name: "currency", type: "STRING", value: currency },
        ],
      }),
    });

    if (!vellumResponse.ok) {
      const errorText = await vellumResponse.text();
      console.error("Vellum API error:", vellumResponse.status, errorText);
      return null;
    }

    const vellumData = await vellumResponse.json();

    // Check if the workflow was rejected
    const state = vellumData.data?.state || vellumData.state;
    if (state === "REJECTED") {
      const errorMsg = vellumData.data?.error?.message || "Vellum workflow rejected";
      console.error("Vellum workflow rejected:", errorMsg);
      return null;
    }

    // Extract result
    const outputs = vellumData.data?.outputs || vellumData.outputs;
    if (outputs && Array.isArray(outputs)) {
      const campaignOutput = outputs.find(
        (o: { name: string; value?: string }) => o.name === "campaign_strategy"
      );
      if (campaignOutput?.value) return campaignOutput.value;

      for (const output of outputs) {
        if (output.type === "STRING" && output.value && typeof output.value === "string") {
          return output.value;
        }
      }
    }

    console.error("Could not extract Vellum result:", JSON.stringify(vellumData));
    return null;
  } catch (error) {
    console.error("Vellum call failed:", error);
    return null;
  }
}

async function generateWithLovableAI(
  websiteUrl: string,
  objective: string,
  skillLevel: string,
  budgetWithCurrency: string,
  currency: string
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const userPrompt = `Generate a Meta Ads campaign plan for:
- Website: ${websiteUrl}
- Campaign Objective: ${objective}
- Skill Level: ${skillLevel}
- Budget Range: ${budgetWithCurrency}
- Currency: ${currency}

Provide a comprehensive, actionable campaign strategy.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: CAMPAIGN_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("AI service is rate limited. Please try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("AI service requires additional credits. Please try again later.");
    }
    throw new Error("Failed to generate campaign plan. Please try again.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    console.error("No content in Lovable AI response:", JSON.stringify(data));
    throw new Error("Failed to parse campaign plan from AI response.");
  }

  return content;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { websiteUrl, objective, skillLevel, budgetRange, currency } = await req.json();

    // Validate inputs
    if (!websiteUrl || !objective || !skillLevel || !budgetRange || !currency) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof websiteUrl !== "string" || typeof objective !== "string" || 
        typeof skillLevel !== "string" || typeof budgetRange !== "string" || 
        typeof currency !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid input types" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const maxLength = 500;
    if (websiteUrl.length > maxLength || objective.length > maxLength || 
        skillLevel.length > 100 || budgetRange.length > 50 || currency.length > 10) {
      return new Response(
        JSON.stringify({ error: "Input values exceed maximum allowed length" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      new URL(websiteUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid website URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allowedCurrencies = ["INR", "USD", "EUR"];
    if (!allowedCurrencies.includes(currency)) {
      return new Response(
        JSON.stringify({ error: "Invalid currency. Allowed: INR, USD, EUR" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currencySymbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€" };
    const budgetWithCurrency = `${currencySymbols[currency] || currency}${budgetRange}`;

    // Try Vellum first, fall back to Lovable AI
    let result: string | null = null;

    const VELLUM_API_KEY = Deno.env.get("VELLUM_API_KEY");
    if (VELLUM_API_KEY) {
      console.log("Attempting Vellum AI...");
      result = await generateWithVellum(VELLUM_API_KEY, websiteUrl, objective, skillLevel, budgetWithCurrency, currency);
    }

    if (!result) {
      console.log("Falling back to Lovable AI...");
      result = await generateWithLovableAI(websiteUrl, objective, skillLevel, budgetWithCurrency, currency);
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-campaign:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
