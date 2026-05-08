import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, TrendingUp, Loader2, Lightbulb } from "lucide-react";

interface CategoryScore {
  score: number;
  reasoning: string;
}

interface ScoreData {
  overall_score: number;
  risk_level: "Low" | "Medium" | "High";
  outlook: "Weak" | "Moderate" | "Strong";
  summary: string;
  improvements: string[];
  categories: {
    audience_targeting: CategoryScore;
    campaign_structure: CategoryScore;
    creative_strategy: CategoryScore;
    budget_allocation: CategoryScore;
    conversion_potential: CategoryScore;
  };
}

const CATEGORY_LABELS: Record<keyof ScoreData["categories"], string> = {
  audience_targeting: "Audience Targeting",
  campaign_structure: "Campaign Structure",
  creative_strategy: "Creative Strategy",
  budget_allocation: "Budget Allocation",
  conversion_potential: "Conversion Potential",
};

const PerformanceScore: React.FC<{ campaignPlan: string }> = ({ campaignPlan }) => {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: res, error: err } = await supabase.functions.invoke("score-campaign", {
          body: { campaignPlan },
        });
        if (cancelled) return;
        if (err || !res?.score) {
          setError(err?.message || "Could not score campaign");
        } else {
          setData(res.score as ScoreData);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignPlan]);

  if (loading) {
    return (
      <Card className="glass-card-elevated mb-8">
        <CardContent className="p-8 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Analyzing campaign performance…</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  const scoreColor =
    data.overall_score >= 80 ? "text-success" : data.overall_score >= 55 ? "text-warning" : "text-destructive";
  const ringColor =
    data.overall_score >= 80
      ? "hsl(var(--success))"
      : data.overall_score >= 55
        ? "hsl(var(--warning))"
        : "hsl(var(--destructive))";

  const riskMeta = {
    Low: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10", border: "border-success/30" },
    Medium: { icon: ShieldAlert, color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
    High: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  }[data.risk_level];

  const RiskIcon = riskMeta.icon;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (data.overall_score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-10"
    >
      <Card className="glass-card-elevated overflow-hidden">
        <div className="border-b border-border/40 px-6 md:px-8 py-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">
            Campaign Performance Score
          </h2>
        </div>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 md:items-center">
            {/* Score ring */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={radius} stroke="hsl(var(--border))" strokeWidth="8" fill="none" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke={ringColor}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - dash }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-extrabold ${scoreColor}`}>{data.overall_score}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    / 100
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${riskMeta.bg} ${riskMeta.border}`}>
                  <RiskIcon className={`h-3.5 w-3.5 ${riskMeta.color}`} />
                  <span className={`text-xs font-bold ${riskMeta.color}`}>{data.risk_level} Risk</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/40">
                  <TrendingUp className="h-3.5 w-3.5 text-foreground/70" />
                  <span className="text-xs font-bold text-foreground/80">{data.outlook} Outlook</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm md:text-[15px] text-foreground/80 leading-relaxed flex-1">{data.summary}</p>
          </div>

          {/* Category breakdown */}
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {(Object.keys(CATEGORY_LABELS) as Array<keyof ScoreData["categories"]>).map((key, i) => {
              const cat = data.categories[key];
              const pct = (cat.score / 20) * 100;
              const barColor =
                cat.score >= 16 ? "bg-success" : cat.score >= 11 ? "bg-warning" : "bg-destructive";
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="p-4 rounded-xl bg-muted/30 border border-border/60"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">{CATEGORY_LABELS[key]}</span>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {cat.score}<span className="text-muted-foreground font-medium">/20</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border/60 overflow-hidden mb-2">
                    <motion.div
                      className={`h-full ${barColor} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.reasoning}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Improvements */}
          <div className="mt-6 p-5 rounded-xl bg-primary/[0.04] border border-primary/15">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Top 3 Improvements</h3>
            </div>
            <ol className="space-y-2">
              {data.improvements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PerformanceScore;
