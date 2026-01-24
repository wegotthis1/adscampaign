import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, Target, Users, Wallet, Monitor, Palette, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface CampaignResultsProps {
  result: string;
}

const CampaignResults = ({ result }: CampaignResultsProps) => {
  const [copied, setCopied] = useState(false);

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

  // Parse the result into sections
  const parseResult = (text: string) => {
    const sections: { icon: React.JSX.Element; title: string; content: string[] }[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection: { icon: React.JSX.Element; title: string; content: string[] } = { icon: <Target className="h-5 w-5" />, title: "Campaign Overview", content: [] };
    
    const sectionIcons: Record<string, React.JSX.Element> = {
      "strategy": <Target className="h-5 w-5" />,
      "target": <Users className="h-5 w-5" />,
      "audience": <Users className="h-5 w-5" />,
      "budget": <Wallet className="h-5 w-5" />,
      "allocation": <Wallet className="h-5 w-5" />,
      "placement": <Monitor className="h-5 w-5" />,
      "creative": <Palette className="h-5 w-5" />,
      "timeline": <Clock className="h-5 w-5" />,
      "milestone": <Clock className="h-5 w-5" />,
    };
    
    lines.forEach(line => {
      // Check if line is a header (starts with # or **)
      const headerMatch = line.match(/^(?:#{1,3}|\*\*)\s*(.+?)(?:\*\*)?$/);
      if (headerMatch || line.endsWith(':')) {
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        const title = headerMatch ? headerMatch[1].replace(/\*\*/g, '').trim() : line.replace(':', '').trim();
        const lowerTitle = title.toLowerCase();
        let icon = <Target className="h-5 w-5" />;
        
        for (const [key, iconNode] of Object.entries(sectionIcons)) {
          if (lowerTitle.includes(key)) {
            icon = iconNode;
            break;
          }
        }
        
        currentSection = { icon, title, content: [] };
      } else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
        currentSection.content.push(line.replace(/^[-•*]\s*/, '').trim());
      } else if (line.match(/^\d+\./)) {
        currentSection.content.push(line.replace(/^\d+\.\s*/, '').trim());
      } else if (line.trim()) {
        currentSection.content.push(line.trim());
      }
    });
    
    if (currentSection.content.length > 0 || sections.length === 0) {
      sections.push(currentSection);
    }
    
    return sections.length > 0 ? sections : [{ icon: <Target className="h-5 w-5" />, title: "Campaign Plan", content: lines }];
  };

  const sections = parseResult(result);

  return (
    <Card className="w-full max-w-2xl border-border/50 bg-card/80 backdrop-blur-sm mt-8 glow-effect animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-2xl font-bold">Your Campaign Plan</CardTitle>
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
              Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {section.icon}
              </div>
              <h3 className="text-lg font-semibold">{section.title}</h3>
            </div>
            <ul className="space-y-2 pl-12">
              {section.content.map((item, itemIndex) => (
                <li 
                  key={itemIndex} 
                  className="text-muted-foreground flex items-start gap-2"
                >
                  <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CampaignResults;