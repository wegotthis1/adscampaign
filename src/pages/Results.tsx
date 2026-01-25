import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, ArrowLeft, Target, Users, Wallet, Monitor, Palette, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Section {
  icon: React.JSX.Element;
  title: string;
  content: string[];
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const result = location.state?.result as string | undefined;

  if (!result) {
    navigate("/");
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Campaign plan copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const parseResult = (text: string): Section[] => {
    const sections: Section[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection: Section = { 
      icon: <Target className="h-5 w-5" />, 
      title: "Overview", 
      content: [] 
    };
    
    const sectionConfig: Record<string, { icon: React.JSX.Element; title: string }> = {
      "strategy": { icon: <Target className="h-5 w-5" />, title: "Strategy" },
      "overview": { icon: <Target className="h-5 w-5" />, title: "Overview" },
      "target": { icon: <Users className="h-5 w-5" />, title: "Target Audience" },
      "audience": { icon: <Users className="h-5 w-5" />, title: "Target Audience" },
      "budget": { icon: <Wallet className="h-5 w-5" />, title: "Budget" },
      "allocation": { icon: <Wallet className="h-5 w-5" />, title: "Budget Allocation" },
      "placement": { icon: <Monitor className="h-5 w-5" />, title: "Ad Placements" },
      "creative": { icon: <Palette className="h-5 w-5" />, title: "Creatives" },
      "timeline": { icon: <Clock className="h-5 w-5" />, title: "Timeline" },
      "milestone": { icon: <Clock className="h-5 w-5" />, title: "Milestones" },
    };
    
    lines.forEach(line => {
      const headerMatch = line.match(/^(?:#{1,3}|\*\*)\s*(.+?)(?:\*\*)?$/);
      if (headerMatch || line.endsWith(':')) {
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        const rawTitle = headerMatch ? headerMatch[1].replace(/\*\*/g, '').trim() : line.replace(':', '').trim();
        const lowerTitle = rawTitle.toLowerCase();
        
        let config: { icon: React.JSX.Element; title: string } = { icon: <Target className="h-5 w-5" />, title: rawTitle };
        for (const [key, cfg] of Object.entries(sectionConfig)) {
          if (lowerTitle.includes(key)) {
            config = cfg;
            break;
          }
        }
        
        currentSection = { icon: config.icon, title: config.title, content: [] };
      } else {
        const cleanLine = line
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/\*\*/g, '')
          .trim();
        
        if (cleanLine && cleanLine.length > 2) {
          currentSection.content.push(cleanLine);
        }
      }
    });
    
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    // Filter to keep only essential sections (max 6)
    const priorityOrder = ["Strategy", "Overview", "Target Audience", "Budget", "Budget Allocation", "Ad Placements", "Creatives", "Timeline", "Milestones"];
    const sortedSections = sections.sort((a, b) => {
      const aIndex = priorityOrder.findIndex(p => a.title.includes(p));
      const bIndex = priorityOrder.findIndex(p => b.title.includes(p));
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
    
    return sortedSections.slice(0, 6);
  };

  const sections = parseResult(result);

  return (
    <main className="min-h-screen gradient-bg py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            New Campaign
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy All
              </>
            )}
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Campaign Plan
          </h1>
          <p className="text-muted-foreground">
            AI-generated Meta Ads strategy
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {section.icon}
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.slice(0, 5).map((item, itemIndex) => (
                    <li 
                      key={itemIndex} 
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Results;

