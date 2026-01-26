import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CampaignForm, { FormData } from "@/components/CampaignForm";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleGenerate = async (formData: FormData) => {
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
        navigate("/auth");
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

  // Show loading state while checking auth
  if (loading) {
    return (
      <main className="min-h-screen gradient-bg py-12 px-4 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen gradient-bg py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
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
  );
};

export default Index;
