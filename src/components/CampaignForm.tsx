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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
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

const CampaignForm = ({ onGenerate, isLoading }: CampaignFormProps) => {
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

  const isFormValid = 
    formData.websiteUrl.trim() !== "" &&
    formData.objective !== "" &&
    formData.skillLevel !== "" &&
    formData.budgetRange !== "" &&
    formData.currency !== "";

  return (
    <Card className="w-full max-w-2xl border-border/50 bg-card/80 backdrop-blur-sm glow-effect">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={logo} alt="Meta Ads AI Logo" className="h-12 w-auto object-contain" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">
          Meta Ads Campaign Generator
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base mt-2">
          Generate complete campaign plans powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="text-sm font-medium">
              Website URL
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                https://
              </span>
              <Input
                id="websiteUrl"
                placeholder="yourwebsite.com"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
                className="rounded-l-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Campaign Objective */}
          <div className="space-y-2">
            <Label htmlFor="objective" className="text-sm font-medium">
              Campaign Objective
            </Label>
            <Select
              value={formData.objective}
              onValueChange={(value) =>
                setFormData({ ...formData, objective: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select objective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="traffic">Traffic</SelectItem>
                <SelectItem value="awareness">Awareness</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Skill Level */}
          <div className="space-y-2">
            <Label htmlFor="skillLevel" className="text-sm font-medium">
              Skill Level
            </Label>
            <Select
              value={formData.skillLevel}
              onValueChange={(value) =>
                setFormData({ ...formData, skillLevel: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select skill level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <Label htmlFor="budgetRange" className="text-sm font-medium">
              Budget Range
            </Label>
            <Select
              value={formData.budgetRange}
              onValueChange={(value) =>
                setFormData({ ...formData, budgetRange: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500-10k">500 to 10k</SelectItem>
                <SelectItem value="10k-50k">10k to 50k</SelectItem>
                <SelectItem value="50k+">50k and above</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">
              Currency
            </Label>
            <Select
              value={formData.currency}
              onValueChange={(value) =>
                setFormData({ ...formData, currency: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">Rupees (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full h-12 text-base font-semibold meta-gradient hover:opacity-90 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Campaign Plan...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Campaign Plan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;