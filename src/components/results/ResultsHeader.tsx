import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Copy, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface ResultsHeaderProps {
  rawResult: string;
  scrollProgress: number;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({ rawResult, scrollProgress }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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

  const handleDownload = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      {/* Reading progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] meta-gradient transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/generator")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Campaign</span>
          </Button>
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
            <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Report</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-2 text-muted-foreground hover:text-foreground">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ResultsHeader;
