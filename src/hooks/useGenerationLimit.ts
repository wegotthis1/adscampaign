import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GenerationLimitState {
  generationsUsed: number;
  generationsLimit: number;
  plan: string;
  canGenerate: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  incrementCount: () => Promise<void>;
}

export function useGenerationLimit(): GenerationLimitState {
  const { user } = useAuth();
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const [generationsLimit, setGenerationsLimit] = useState(1);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch generation count
      const { data: genData } = await supabase
        .from("user_generations")
        .select("generation_count")
        .eq("user_id", user.id)
        .single();

      setGenerationsUsed(genData?.generation_count ?? 0);

      // Fetch plan
      const { data: planData } = await supabase
        .from("user_plans")
        .select("plan, generations_limit")
        .eq("user_id", user.id)
        .single();

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
  };

  const incrementCount = async () => {
    if (!user) return;

    const newCount = generationsUsed + 1;

    const { error } = await supabase
      .from("user_generations")
      .upsert(
        {
          user_id: user.id,
          generation_count: newCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (!error) {
      setGenerationsUsed(newCount);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    generationsUsed,
    generationsLimit,
    plan,
    canGenerate: generationsUsed < generationsLimit,
    loading,
    refresh: fetchData,
    incrementCount,
  };
}
