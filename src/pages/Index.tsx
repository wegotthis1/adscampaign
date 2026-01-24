import { useState } from "react";
import CampaignForm, { FormData } from "@/components/CampaignForm";
import CampaignResults from "@/components/CampaignResults";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async (formData: FormData) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-campaign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            websiteUrl: `https://${formData.websiteUrl}`,
            objective: formData.objective,
            skillLevel: formData.skillLevel,
            budgetRange: formData.budgetRange,
            currency: formData.currency,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate campaign plan");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error("Error generating campaign:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate campaign plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Meta Ads Campaign Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Create complete, AI-powered campaign plans for your Meta advertising in seconds
          </p>
        </div>

        {/* Form */}
        <CampaignForm onGenerate={handleGenerate} isLoading={isLoading} />

        {/* Results */}
        {result && <CampaignResults result={result} />}
      </div>
    </main>
  );
};

export default Index;