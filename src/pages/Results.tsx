import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Copy, ArrowLeft, Target, Users, Wallet, Monitor, Palette, Clock } from "lucide-react";
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
  
  const rawResult = location.state?.result as string | undefined;

  useEffect(() => {
    if (!rawResult) {
      navigate("/");
    }
  }, [rawResult, navigate]);

  if (!rawResult) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawResult);
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
    
    // Clean up the text - remove markdown formatting artifacts
    const cleanText = text
      .replace(/\\n/g, '\n')
      .replace(/\*\*/g, '')
      .replace(/#{1,3}\s*/g, '')
      .replace(/---/g, '');
    
    const lines = cleanText.split('\n').filter(line => line.trim());
    
    let currentSection: Section = { 
      icon: <Target className="h-5 w-5" />, 
      title: "Overview", 
      content: [] 
    };
    
    const getIconForTitle = (title: string): React.JSX.Element => {
      const lower = title.toLowerCase();
      if (lower.includes('strategy') || lower.includes('overview') || lower.includes('business')) {
        return <Target className="h-5 w-5" />;
      }
      if (lower.includes('audience') || lower.includes('target')) {
        return <Users className="h-5 w-5" />;
      }
      if (lower.includes('budget') || lower.includes('allocation') || lower.includes('spend')) {
        return <Wallet className="h-5 w-5" />;
      }
      if (lower.includes('placement') || lower.includes('platform')) {
        return <Monitor className="h-5 w-5" />;
      }
      if (lower.includes('creative') || lower.includes('ad') || lower.includes('content')) {
        return <Palette className="h-5 w-5" />;
      }
      if (lower.includes('timeline') || lower.includes('milestone') || lower.includes('schedule')) {
        return <Clock className="h-5 w-5" />;
      }
      return <Target className="h-5 w-5" />;
    };
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this is a section header (ends with emoji + text or is uppercase)
      const isHeader = 
        /^[🎯📊💰📱🎨⏰📈🏢👥🔍✅📋💡🚀]/.test(trimmedLine) ||
        (trimmedLine.length < 50 && trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length > 3) ||
        trimmedLine.endsWith(':');
      
      if (isHeader) {
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        const title = trimmedLine.replace(/[🎯📊💰📱🎨⏰📈🏢👥🔍✅📋💡🚀]/g, '').replace(/:$/, '').trim();
        currentSection = { 
          icon: getIconForTitle(title), 
          title: title || "Details", 
          content: [] 
        };
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        const content = trimmedLine.replace(/^[-•*]\s*/, '').trim();
        if (content.length > 2) {
          currentSection.content.push(content);
        }
      } else if (/^\d+\./.test(trimmedLine)) {
        const content = trimmedLine.replace(/^\d+\.\s*/, '').trim();
        if (content.length > 2) {
          currentSection.content.push(content);
        }
      } else if (trimmedLine.length > 10) {
        // Regular paragraph text - treat as bullet point
        currentSection.content.push(trimmedLine);
      }
    });
    
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const sections = parseResult(rawResult);

  return (
    <main className="min-h-screen gradient-bg py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Campaign Plan
          </h1>
        </div>

        {/* Full-width sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <section 
              key={index} 
              className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border/50">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  {React.cloneElement(section.icon, { className: "h-6 w-6" })}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">{section.title}</h2>
              </div>
              
              <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {section.content.map((item, itemIndex) => (
                  <li 
                    key={itemIndex} 
                    className="flex items-start gap-3 text-muted-foreground p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-primary mt-0.5 flex-shrink-0 text-lg">•</span>
                    <span className="text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Results;
