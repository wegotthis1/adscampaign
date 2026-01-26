import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, Zap, TrendingUp, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Promo = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Strategy",
      description: "Get intelligent campaign recommendations tailored to your business goals",
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Reach the right audience with data-driven targeting suggestions",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Generate complete campaign plans in seconds, not hours",
    },
    {
      icon: TrendingUp,
      title: "Optimized for ROI",
      description: "Budget recommendations designed to maximize your return on investment",
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate("/generator");
    } else {
      navigate("/auth");
    }
  };

  return (
    <main className="min-h-screen gradient-bg">
      {/* Header with Auth Buttons */}
      <header className="py-4 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">Meta Ads AI</span>
          </div>
          
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/auth")}
                  className="hidden sm:flex"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Campaign Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Create Winning
            </span>
            <br />
            <span className="text-foreground">Meta Ads Campaigns</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Transform your advertising with AI-generated campaign strategies. 
            Get professional-grade Meta Ads plans tailored to your business in seconds.
          </p>
          
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="meta-gradient text-lg px-8 py-6 h-auto group"
          >
            {user ? "Go to Generator" : "Start Creating"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Everything You Need to Succeed
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            How It Works
          </h2>
          
          <div className="space-y-8">
            {[
              { step: "1", title: "Enter Your Website", description: "Provide your website URL so our AI can understand your business" },
              { step: "2", title: "Set Your Goals", description: "Choose your campaign objective and budget preferences" },
              { step: "3", title: "Get Your Plan", description: "Receive a complete, actionable campaign strategy instantly" },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full meta-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Ready to Supercharge Your Ads?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of marketers using AI to create high-converting Meta Ads campaigns.
              </p>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="meta-gradient text-lg px-8 py-6 h-auto group"
              >
                {user ? "Generate Your Campaign" : "Sign Up Free"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Promo;
