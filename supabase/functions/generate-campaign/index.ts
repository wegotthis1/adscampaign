import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VELLUM_API_KEY = Deno.env.get("VELLUM_API_KEY");
    if (!VELLUM_API_KEY) {
      throw new Error("VELLUM_API_KEY is not configured");
    }

    const { websiteUrl, objective, skillLevel, budgetRange, currency } = await req.json();

    // Validate inputs
    if (!websiteUrl || !objective || !skillLevel || !budgetRange || !currency) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map currency codes to symbols
    const currencySymbols: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EUR: "€",
    };

    // Format budget range with currency
    const budgetWithCurrency = `${currencySymbols[currency] || currency}${budgetRange}`;

    // Call Vellum AI API
    const vellumResponse = await fetch("https://predict.vellum.ai/v1/execute-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": VELLUM_API_KEY,
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
      return new Response(
        JSON.stringify({ error: "Failed to generate campaign plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vellumData = await vellumResponse.json();
    
    // Extract the result from Vellum response
    let result = "";
    if (vellumData.outputs && Array.isArray(vellumData.outputs)) {
      // Find the first output with a string value
      const outputValue = vellumData.outputs.find(
        (o: { name: string; type: string; value: string }) => 
          o.type === "STRING" && o.value
      );
      result = outputValue?.value || "";
      
      // Fallback: try known output names
      if (!result) {
        const knownNames = ["campaign_strategy", "output", "result", "campaign_plan"];
        for (const name of knownNames) {
          const found = vellumData.outputs.find((o: { name: string }) => o.name === name);
          if (found?.value) {
            result = found.value;
            break;
          }
        }
      }
    } else if (vellumData.result) {
      result = vellumData.result;
    }
    
    if (!result) {
      console.error("Could not extract result from Vellum response:", JSON.stringify(vellumData));
      return new Response(
        JSON.stringify({ error: "Failed to parse campaign plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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