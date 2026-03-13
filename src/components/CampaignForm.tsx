import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Globe, Target, BarChart3, Wallet, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

interface CampaignFormProps {
  onGenerate: (data: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  websiteUrl: string;
  objective: string;
  skillLevel: string;
  budgetRange: string;
  currency: string;
}

const steps = [
  { id: 0, label: "Website", icon: Globe, description: "Your business URL" },
  { id: 1, label: "Objective", icon: Target, description: "Campaign goal" },
  { id: 2, label: "Experience", icon: BarChart3, description: "Your skill level" },
  { id: 3, label: "Budget", icon: Wallet, description: "Budget & currency" },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
};

const CampaignForm = ({ onGenerate, isLoading }: CampaignFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    websiteUrl: "",
    objective: "",
    skillLevel: "",
    budgetRange: "",
    currency: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: return formData.websiteUrl.trim() !== "";
      case 1: return formData.objective !== "";
      case 2: return formData.skillLevel !== "";
      case 3: return formData.budgetRange !== "" && formData.currency !== "";
      default: return false;
    }
  };

  const isFormValid = steps.every((_, i) => isStepValid(i));

  const goNext = () => {
    if (currentStep < steps.length - 1 && isStepValid(currentStep)) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="w-full max-w-2xl glass-card-elevated enterprise-shadow-lg">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 md:p-8 pb-0">
          <div className="flex items-center gap-3 mb-6">
            <img src={logo} alt="Meta Ads AI Logo" className="h-10 w-auto object-contain" />
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Campaign Generator</h2>
              <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>

          {/* Progress */}
          <Progress value={progress} className="h-1.5 mb-6" />

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const completed = index < currentStep;
              const active = index === currentStep;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (index < currentStep || (index === currentStep + 1 && isStepValid(currentStep))) {
                      setDirection(index > currentStep ? 1 : -1);
                      setCurrentStep(index);
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${
                    active ? 'opacity-100' : completed ? 'opacity-80 cursor-pointer' : 'opacity-40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    active ? 'meta-gradient enterprise-shadow text-primary-foreground' : 
                    completed ? 'bg-primary/10 text-primary' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {completed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Steps */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 pt-6">
          <div className="min-h-[200px] flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {currentStep === 0 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">What's your website?</h3>
                      <p className="text-sm text-muted-foreground mb-4">We'll analyze your business to create a tailored strategy.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl" className="text-sm font-medium">Website URL</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          https://
                        </span>
                        <Input
                          id="websiteUrl"
                          placeholder="yourwebsite.com"
                          value={formData.websiteUrl}
                          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                          className="rounded-l-none"
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">What's your campaign objective?</h3>
                      <p className="text-sm text-muted-foreground mb-4">This determines how Meta optimizes your ads delivery.</p>
                    </div>
                    <div className="grid gap-3">
                      {[
                        { value: "sales", label: "Sales & Conversions", desc: "Drive purchases and sign-ups" },
                        { value: "traffic", label: "Website Traffic", desc: "Send visitors to your website" },
                        { value: "awareness", label: "Brand Awareness", desc: "Reach new audiences at scale" },
                      ].map((obj) => (
                        <button
                          key={obj.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, objective: obj.value })}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                            formData.objective === obj.value
                              ? 'border-primary bg-primary/5 enterprise-shadow'
                              : 'border-border hover:border-primary/30 hover:bg-muted/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            formData.objective === obj.value ? 'border-primary' : 'border-muted-foreground/30'
                          }`}>
                            {formData.objective === obj.value && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{obj.label}</p>
                            <p className="text-xs text-muted-foreground">{obj.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">What's your experience level?</h3>
                      <p className="text-sm text-muted-foreground mb-4">We'll adjust the strategy complexity accordingly.</p>
                    </div>
                    <div className="grid gap-3">
                      {[
                        { value: "beginner", label: "Beginner", desc: "New to Meta Ads, need step-by-step guidance" },
                        { value: "intermediate", label: "Intermediate", desc: "Ran a few campaigns, comfortable with basics" },
                        { value: "professional", label: "Professional", desc: "Experienced advertiser, want advanced tactics" },
                      ].map((skill) => (
                        <button
                          key={skill.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, skillLevel: skill.value })}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                            formData.skillLevel === skill.value
                              ? 'border-primary bg-primary/5 enterprise-shadow'
                              : 'border-border hover:border-primary/30 hover:bg-muted/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            formData.skillLevel === skill.value ? 'border-primary' : 'border-muted-foreground/30'
                          }`}>
                            {formData.skillLevel === skill.value && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{skill.label}</p>
                            <p className="text-xs text-muted-foreground">{skill.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Set your budget</h3>
                      <p className="text-sm text-muted-foreground mb-4">Choose your monthly ad spend range and preferred currency.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Budget Range</Label>
                        <Select
                          value={formData.budgetRange}
                          onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="500-10k">500 to 10K</SelectItem>
                            <SelectItem value="10k-50k">10K to 50K</SelectItem>
                            <SelectItem value="50k+">50K and above</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData({ ...formData, currency: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={!isStepValid(currentStep)}
                className="meta-gradient gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="meta-gradient gap-2 min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Campaign
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Loading Message */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 rounded-xl bg-primary/5 border border-primary/15 mt-4"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
              <p className="text-sm text-muted-foreground">
                AI is analyzing your business and building your strategy. This takes up to 2 minutes.
              </p>
            </motion.div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;
