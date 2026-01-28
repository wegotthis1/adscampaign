import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Copy, ArrowLeft, Target, Users, Wallet, Monitor, Palette, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen gradient-bg flex flex-col">
      <main className="flex-1 py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Report Header */}
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="gap-2 text-muted-foreground hover:text-foreground -ml-4"
              >
                <ArrowLeft className="h-4 w-4" />
                New Campaign
              </Button>
              <Button
                variant="outline"
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

            <div className="text-center">
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Campaign Strategy Report</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Your Campaign Plan
              </h1>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                A comprehensive advertising strategy tailored to your business goals and target audience.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <nav className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contents</h3>
            <div className="flex flex-wrap gap-3">
              {sections.map((section, index) => (
                <a
                  key={index}
                  href={`#section-${index}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
                >
                  <span className="text-primary font-bold">{index + 1}.</span>
                  {section.title}
                </a>
              ))}
            </div>
          </nav>

          {/* Report Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <article 
                key={index}
                id={`section-${index}`}
                className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Section Header */}
                <div className="bg-gradient-to-r from-primary/10 to-transparent px-8 py-6 border-b border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary font-bold text-xl">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background/50 text-primary">
                        {React.cloneElement(section.icon, { className: "h-5 w-5" })}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{section.title}</h2>
                    </div>
                  </div>
                </div>
                
                {/* Section Content */}
                <div className="p-8">
                  <ul className="space-y-4">
                    {section.content.map((item, itemIndex) => (
                      <li 
                        key={itemIndex} 
                        className="flex items-start gap-4 group"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                          {itemIndex + 1}
                        </span>
                        <p className="text-foreground/90 text-base md:text-lg leading-relaxed flex-1">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          {/* Report Footer */}
          <div className="mt-12 text-center pb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted/50 text-muted-foreground text-sm">
              <Check className="h-4 w-4 text-primary" />
              Report generated successfully
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
