import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignForm, { FormData } from "@/components/CampaignForm";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, LogIn, Crown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.png";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const handleGenerate = async (formData: FormData) => {
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
      navigate("/results", { state: { result: data.result, websiteUrl: formData.websiteUrl } });
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
              <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
              <span className="text-sm font-semibold text-foreground">Campaign Generator</span>
            </div>
          </div>
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
      </header>

      <main className="flex-1 py-12 lg:py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              <span className="text-gradient">Build Your Campaign</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fill in the details below and our AI will generate a comprehensive campaign strategy for your business.
            </p>
          </motion.div>

          <motion.div
            className="w-full flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CampaignForm onGenerate={handleGenerate} isLoading={isLoading} />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
