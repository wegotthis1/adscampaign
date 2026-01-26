import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    const VELLUM_API_KEY = Deno.env.get("VELLUM_API_KEY");
    if (!VELLUM_API_KEY) {
      throw new Error("VELLUM_API_KEY is not configured");
    }

    const { websiteUrl, objective, skillLevel, budgetRange, currency } = await req.json();

    // Validate inputs with proper type and format checking
    if (!websiteUrl || !objective || !skillLevel || !budgetRange || !currency) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input types
    if (typeof websiteUrl !== "string" || typeof objective !== "string" || 
        typeof skillLevel !== "string" || typeof budgetRange !== "string" || 
        typeof currency !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid input types" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input lengths to prevent abuse
    const maxLength = 500;
    if (websiteUrl.length > maxLength || objective.length > maxLength || 
        skillLevel.length > 100 || budgetRange.length > 50 || currency.length > 10) {
      return new Response(
        JSON.stringify({ error: "Input values exceed maximum allowed length" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid website URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate currency against allowed values
    const allowedCurrencies = ["INR", "USD", "EUR"];
    if (!allowedCurrencies.includes(currency)) {
      return new Response(
        JSON.stringify({ error: "Invalid currency. Allowed: INR, USD, EUR" }),
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
    
    // Extract the result from Vellum response - handle nested structure
    let result = "";
    
    // Vellum returns: { data: { outputs: [...] } } or { outputs: [...] }
    const outputs = vellumData.data?.outputs || vellumData.outputs;
    
    if (outputs && Array.isArray(outputs)) {
      // Look for campaign_strategy output
      const campaignOutput = outputs.find(
        (o: { name: string; value?: string }) => o.name === "campaign_strategy"
      );
      if (campaignOutput?.value) {
        result = campaignOutput.value;
      } else {
        // Fallback: find any STRING output with a value
        for (const output of outputs) {
          if (output.type === "STRING" && output.value && typeof output.value === "string") {
            result = output.value;
            break;
          }
        }
      }
    }
    
    if (!result) {
      console.error("Could not extract result. Full response:", JSON.stringify(vellumData));
      return new Response(
        JSON.stringify({ error: "Failed to parse campaign plan from AI response" }),
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