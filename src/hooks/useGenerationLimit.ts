import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GenerationLimitState {
  generationsUsed: number;
  generationsLimit: number;
  plan: string;
  canGenerate: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useGenerationLimit(): GenerationLimitState {
  const { user } = useAuth();
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [generationsLimit, setGenerationsLimit] = useState(1);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: genData } = await supabase
        .from("user_generations")
        .select("generation_count")
        .eq("user_id", user.id)
        .maybeSingle();

      setGenerationsUsed(genData?.generation_count ?? 0);

      const { data: planData } = await supabase
        .from("user_plans")
        .select("plan, generations_limit")
        .eq("user_id", user.id)
        .maybeSingle();

      if (planData) {
        setPlan(planData.plan);
        setGenerationsLimit(planData.generations_limit);
      } else {
        setPlan("free");
        setGenerationsLimit(1);
      }
    } catch (error) {
      console.error("Error fetching generation limit:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    generationsUsed,
    generationsLimit,
    plan,
    canGenerate: generationsUsed < generationsLimit,
    loading,
    refresh: fetchData,
  };
}
