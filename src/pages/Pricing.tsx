import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, Loader2, Sparkles, Crown, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGenerationLimit } from "@/hooks/useGenerationLimit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import Footer from "@/components/Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "₹499",
    priceNote: "one-time",
    icon: Sparkles,
    generations: 10,
    features: [
      "10 campaign generations",
      "AI-powered strategy",
      "Audience targeting",
      "Budget allocation",
      "Email support",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹1,499",
    priceNote: "one-time",
    icon: Crown,
    generations: 50,
    features: [
      "50 campaign generations",
      "Advanced AI models",
      "Custom audience insights",
      "Creative direction",
      "Priority support",
      "Export to PDF",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹4,999",
    priceNote: "one-time",
    icon: Building2,
    generations: 999,
    features: [
      "Unlimited generations",
      "Premium AI models",
      "White-label reports",
      "API access",
      "Dedicated support",
      "Team collaboration",
      "Custom integrations",
    ],
    popular: false,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const Pricing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { plan: currentPlan, refresh: refreshLimit } = useGenerationLimit();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (planId: string) => {
    if (!user) {
      navigate("/auth", { state: { returnTo: "/pricing" } });
      return;
    }

    setLoadingPlan(planId);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: "Error", description: "Failed to load payment gateway.", variant: "destructive" });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({ title: "Session Expired", description: "Please sign in again.", variant: "destructive" });
        navigate("/auth", { state: { returnTo: "/pricing" } });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan: planId }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create order");
      }

      const { order_id, amount, currency, key_id } = await response.json();

      const options = {
        key: key_id,
        amount,
        currency,
        name: "Meta Ads AI",
        description: `${plans.find((p) => p.id === planId)?.name} Plan`,
        order_id,
        handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(resp),
              }
            );

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            toast({
              title: "Payment Successful! 🎉",
              description: "Your plan has been upgraded. Start generating campaigns!",
            });
            await refreshLimit();
            setLoadingPlan(null);
            navigate("/generator");
          } catch {
            setLoadingPlan(null);
            toast({
              title: "Verification Failed",
              description: "Payment received but verification failed. We'll reconcile it shortly — please refresh in a minute or contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: { email: user.email },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setLoadingPlan(null);
        toast({ title: "Payment Failed", description: "The payment was not completed.", variant: "destructive" });
      });
      rzp.open();
      // Note: do not clear loadingPlan here — modal handlers manage it
    } catch (error) {
      console.error("Payment error:", error);
      setLoadingPlan(null);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
              <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
              <span className="text-sm font-semibold text-foreground">Pricing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Pricing</p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Choose Your <span className="text-gradient">Growth Plan</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start with 1 free generation. Upgrade to unlock more AI-powered campaign strategies.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  variants={fadeUp}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                >
                  <Card
                    className={`relative h-full glass-card-elevated transition-all duration-300 hover:enterprise-shadow-lg ${
                      plan.popular ? "border-primary enterprise-shadow-lg ring-1 ring-primary/20" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="meta-gradient text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full enterprise-shadow">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardContent className="p-8 flex flex-col h-full">
                      <div className="mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                          <span className="text-sm text-muted-foreground">/{plan.priceNote}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {plan.generations === 999 ? "Unlimited" : plan.generations} campaign generations
                        </p>
                      </div>

                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-foreground/80">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {(() => {
                        const isCurrent = user && currentPlan === plan.id;
                        return (
                          <Button
                            onClick={() => handlePurchase(plan.id)}
                            disabled={loadingPlan !== null || authLoading || !!isCurrent}
                            className={`w-full h-12 text-base ${
                              plan.popular ? "meta-gradient enterprise-shadow" : ""
                            }`}
                            variant={plan.popular ? "default" : "outline"}
                          >
                            {loadingPlan === plan.id ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                            ) : isCurrent ? (
                              "Current Plan"
                            ) : authLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              `Get ${plan.name}`
                            )}
                          </Button>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            className="text-center text-sm text-muted-foreground mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            All plans are one-time payments. No recurring charges. Secure payments via Razorpay.
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
