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
      console.error("Vellum API error:", vellumResponse.status, await vellumResponse.text());
      return null;
    }

    const vellumData = await vellumResponse.json();
    const state = vellumData.data?.state || vellumData.state;
    if (state === "REJECTED") {
      console.error("Vellum workflow rejected:", vellumData.data?.error?.message);
      return null;
    }

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
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const userPrompt = `Generate a Meta Ads campaign plan for:
- Website: ${websiteUrl}
- Campaign Objective: ${objective}
- Skill Level: ${skillLevel}
- Budget Range: ${budgetWithCurrency}
- Currency: ${currency}

Provide a comprehensive, actionable campaign strategy.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
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
    if (response.status === 429) throw new Error("AI service is rate limited. Please try again in a moment.");
    if (response.status === 402) throw new Error("AI service requires additional credits. Please try again later.");
    throw new Error("Failed to generate campaign plan. Please try again.");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Failed to parse campaign plan from AI response.");
  return content;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const { websiteUrl, objective, skillLevel, budgetRange, currency } = await req.json();

    if (!websiteUrl || !objective || !skillLevel || !budgetRange || !currency) {
      return json({ error: "All fields are required" }, 400);
    }
    if ([websiteUrl, objective, skillLevel, budgetRange, currency].some((v) => typeof v !== "string")) {
      return json({ error: "Invalid input types" }, 400);
    }
    if (websiteUrl.length > 500 || objective.length > 500 || skillLevel.length > 100 || budgetRange.length > 50 || currency.length > 10) {
      return json({ error: "Input values exceed maximum allowed length" }, 400);
    }
    try { new URL(websiteUrl); } catch { return json({ error: "Invalid website URL format" }, 400); }
    const allowedCurrencies = ["INR", "USD", "EUR"];
    if (!allowedCurrencies.includes(currency)) return json({ error: "Invalid currency" }, 400);

    // Server-side limit check + atomic increment via service role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: consumed, error: consumeError } = await adminClient.rpc("consume_generation", { p_user_id: user.id });
    if (consumeError) {
      console.error("consume_generation error:", consumeError);
      return json({ error: "Could not verify quota. Please try again." }, 500);
    }
    if (!consumed) return json({ error: "Generation limit reached. Please upgrade to continue.", code: "limit_reached" }, 402);

    const symbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€" };
    const budgetWithCurrency = `${symbols[currency]}${budgetRange}`;

    let result: string | null = null;
    try {
      const VELLUM_API_KEY = Deno.env.get("VELLUM_API_KEY");
      if (VELLUM_API_KEY) {
        result = await generateWithVellum(VELLUM_API_KEY, websiteUrl, objective, skillLevel, budgetWithCurrency, currency);
      }
      if (!result) {
        result = await generateWithLovableAI(websiteUrl, objective, skillLevel, budgetWithCurrency, currency);
      }
    } catch (genError) {
      // Refund the consumed generation on failure
      await adminClient.rpc("refund_generation", { p_user_id: user.id });
      throw genError;
    }

    if (!result) {
      await adminClient.rpc("refund_generation", { p_user_id: user.id });
      return json({ error: "AI returned no result. Please try again." }, 500);
    }

    return json({ result });
  } catch (error) {
    console.error("generate-campaign error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
