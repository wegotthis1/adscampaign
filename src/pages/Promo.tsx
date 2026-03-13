import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Zap, TrendingUp, ArrowRight, LogIn, UserPlus, Sparkles, Shield, BarChart3, Globe, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const Promo = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Strategy",
      description: "Enterprise-grade AI analyzes your business and generates optimized campaign strategies instantly.",
      gradient: "from-blue-500/10 to-indigo-500/10",
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Data-driven audience segmentation with demographics, interests, and behavioral targeting.",
      gradient: "from-emerald-500/10 to-teal-500/10",
    },
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Complete campaign blueprints generated in under 2 minutes — no agency wait times.",
      gradient: "from-amber-500/10 to-orange-500/10",
    },
    {
      icon: TrendingUp,
      title: "ROI Optimized",
      description: "Smart budget allocation recommendations designed to maximize every dollar of ad spend.",
      gradient: "from-violet-500/10 to-purple-500/10",
    },
  ];

  const stats = [
    { value: "10K+", label: "Campaigns Generated" },
    { value: "3.2x", label: "Avg. ROAS Improvement" },
    { value: "< 2 min", label: "Generation Time" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  const trustPoints = [
    "No credit card required",
    "Enterprise-grade AI models",
    "SOC 2 compliant infrastructure",
  ];

  const handleGetStarted = () => {
    navigate("/generator");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Meta Ads AI Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-foreground tracking-tight">Meta Ads AI</span>
          </div>
          
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="hidden sm:flex"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")} className="meta-gradient">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/15 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Campaign Intelligence</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
              Create High-Converting{" "}
              <span className="text-gradient">
                Meta Ad Campaigns
              </span>{" "}
              in Minutes
            </motion.h1>
            
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop guessing. Let AI analyze your business and generate professional-grade 
              Meta Ads strategies — complete with audience targeting, budget allocation, and creative direction.
            </motion.p>
            
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="meta-gradient text-base px-8 py-6 h-auto group enterprise-shadow-lg hover:enterprise-shadow-lg transition-all duration-300"
              >
                {user ? "Go to Generator" : "Start Free — No Credit Card"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-base px-8 py-6 h-auto"
              >
                See How It Works
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {trustPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={fadeUp} custom={index} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Platform Features
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Everything You Need to Succeed
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our AI platform handles the complexity of Meta Ads so you can focus on growing your business.
            </motion.p>
          </motion.div>
          
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeUp} custom={index}>
                <Card className="glass-card-elevated hover:enterprise-shadow-lg transition-all duration-300 group h-full">
                  <CardContent className="pt-8 pb-8 px-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-card/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Simple Process
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Three Steps to Your Campaign
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto">
              No marketing expertise required. Our AI does the heavy lifting.
            </motion.p>
          </motion.div>
          
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { step: "01", title: "Enter Your Website", description: "Provide your URL so our AI can analyze your business, industry, and audience.", icon: Globe },
              { step: "02", title: "Configure Your Goals", description: "Select your campaign objective, budget range, and preferred currency.", icon: BarChart3 },
              { step: "03", title: "Get Your Strategy", description: "Receive a comprehensive, actionable campaign plan you can implement immediately.", icon: Shield },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeUp} custom={index}>
                <Card className="glass-card-elevated hover:enterprise-shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-6 p-6 md:p-8">
                      <div className="flex-shrink-0 w-16 h-16 rounded-2xl meta-gradient flex items-center justify-center enterprise-shadow">
                        <item.icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold text-primary uppercase tracking-widest">Step {item.step}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1 text-foreground">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Trusted by Marketers
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              What Our Users Say
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { quote: "This tool replaced hours of manual research. The campaign suggestions are spot-on and saved us thousands in wasted ad spend.", name: "Sarah K.", role: "Marketing Director", company: "TechStart Inc." },
              { quote: "As a small business owner, I had no idea how to run Meta Ads. This AI gave me a professional strategy I could implement right away.", name: "James R.", role: "Founder", company: "Local Brew Co." },
              { quote: "The audience targeting recommendations alone are worth it. We saw a 3x improvement in our ROAS within the first month.", name: "Priya M.", role: "Performance Manager", company: "GrowthLab Agency" },
            ].map((testimonial, index) => (
              <motion.div key={index} variants={fadeUp} custom={index}>
                <Card className="glass-card-elevated h-full">
                  <CardContent className="pt-8 pb-8 px-6 flex flex-col h-full">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-warning fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-foreground/90 leading-relaxed mb-6 flex-1">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-10 h-10 rounded-full meta-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card-elevated overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <CardContent className="relative py-16 px-8 md:px-12 text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight text-foreground">
                  Ready to Transform Your Advertising?
                </h2>
                <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                  Join thousands of marketers using AI to create high-converting Meta Ads campaigns — completely free to start.
                </p>
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="meta-gradient text-base px-10 py-6 h-auto group enterprise-shadow-lg hover:enterprise-shadow-lg transition-all duration-300"
                >
                  {user ? "Generate Your Campaign" : "Get Started Free"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Promo;
