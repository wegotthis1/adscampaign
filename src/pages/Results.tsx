import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, ArrowLeft, Target, Users, Wallet, Monitor, Palette, Clock, Download, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.png";

interface Section {
  icon: React.JSX.Element;
  title: string;
  content: string[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const }
  }),
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const rawResult = location.state?.result as string | undefined;
  const websiteUrl = location.state?.websiteUrl as string | undefined;
  
  const getBusinessName = (url: string | undefined): string => {
    if (!url) return "Your Business";
    const domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('.')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  };
  
  const businessName = getBusinessName(websiteUrl);

  useEffect(() => {
    window.scrollTo(0, 0);
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
      toast({ title: "Copied!", description: "Campaign plan copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", description: "Please try again", variant: "destructive" });
    }
  };

  const parseResult = (text: string): Section[] => {
    const sections: Section[] = [];
    const cleanText = text.replace(/\\n/g, '\n').replace(/\*\*/g, '').replace(/#{1,3}\s*/g, '').replace(/---/g, '');
    const lines = cleanText.split('\n').filter(line => line.trim());
    
    let currentSection: Section = { icon: <Target className="h-5 w-5" />, title: "Overview", content: [] };
    
    const getIconForTitle = (title: string): React.JSX.Element => {
      const lower = title.toLowerCase();
      if (lower.includes('strategy') || lower.includes('overview') || lower.includes('business')) return <Target className="h-5 w-5" />;
      if (lower.includes('audience') || lower.includes('target')) return <Users className="h-5 w-5" />;
      if (lower.includes('budget') || lower.includes('allocation') || lower.includes('spend')) return <Wallet className="h-5 w-5" />;
      if (lower.includes('placement') || lower.includes('platform')) return <Monitor className="h-5 w-5" />;
      if (lower.includes('creative') || lower.includes('ad') || lower.includes('content')) return <Palette className="h-5 w-5" />;
      if (lower.includes('timeline') || lower.includes('milestone') || lower.includes('schedule')) return <Clock className="h-5 w-5" />;
      return <Target className="h-5 w-5" />;
    };
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      const isHeader = 
        /^[🎯📊💰📱🎨⏰📈🏢👥🔍✅📋💡🚀]/.test(trimmedLine) ||
        (trimmedLine.length < 50 && trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length > 3) ||
        trimmedLine.endsWith(':');
      
      if (isHeader) {
        if (currentSection.content.length > 0) sections.push({ ...currentSection });
        const title = trimmedLine.replace(/[🎯📊💰📱🎨⏰📈🏢👥🔍✅📋💡🚀]/g, '').replace(/:$/, '').trim();
        currentSection = { icon: getIconForTitle(title), title: title || "Details", content: [] };
      } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
        const content = trimmedLine.replace(/^[-•*]\s*/, '').trim();
        if (content.length > 2) currentSection.content.push(content);
      } else if (/^\d+\./.test(trimmedLine)) {
        const content = trimmedLine.replace(/^\d+\.\s*/, '').trim();
        if (content.length > 2) currentSection.content.push(content);
      } else if (trimmedLine.length > 10) {
        currentSection.content.push(trimmedLine);
      }
    });
    
    if (currentSection.content.length > 0) sections.push(currentSection);
    return sections;
  };

  const sections = parseResult(rawResult);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/generator")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
              <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
              <span className="text-sm font-semibold text-foreground">Campaign Report</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy All"}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Report Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Campaign Strategy Report</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
              {businessName} <span className="text-gradient">Campaign Plan</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive advertising strategy tailored to your business goals and target audience.
            </p>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass-card mb-8">
              <CardContent className="p-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Contents</h3>
                <div className="flex flex-wrap gap-2">
                  {sections.map((section, index) => (
                    <a
                      key={index}
                      href={`#section-${index}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-primary/5 hover:text-primary transition-colors text-sm font-medium"
                    >
                      <span className="text-primary font-bold text-xs">{index + 1}</span>
                      {section.title}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Report Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.article
                key={index}
                id={`section-${index}`}
                variants={fadeUp}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <Card className="glass-card-elevated overflow-hidden">
                  <div className="border-b border-border/60 px-6 md:px-8 py-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl meta-gradient flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        {React.cloneElement(section.icon, { className: "h-4 w-4" })}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">{section.title}</h2>
                    </div>
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3 group">
                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2.5" />
                          <p className="text-foreground/85 leading-relaxed">
                            {item}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.article>
            ))}
          </div>

          {/* Report Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center pb-8"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/50 text-muted-foreground text-sm border border-border/60">
              <Check className="h-4 w-4 text-success" />
              Report generated successfully
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
