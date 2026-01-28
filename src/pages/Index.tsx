import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignForm, { FormData } from "@/components/CampaignForm";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const handleGenerate = async (formData: FormData) => {
    // Check auth before generating
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to generate your campaign plan.",
      });
      navigate("/auth", { state: { returnTo: "/generator" } });
      return;
    }

    setIsLoading(true);

    try {
      // Get the current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate("/auth", { state: { returnTo: "/generator" } });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-campaign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
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
      navigate("/results", { state: { result: data.result } });
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
    <div className="min-h-screen gradient-bg flex flex-col">
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex justify-between items-center mb-8">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
              ) : user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth", { state: { returnTo: "/generator" } })}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>

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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
