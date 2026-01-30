import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Copy, ArrowLeft, Download, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReportHeaderProps {
  businessName: string;
  rawResult: string;
  copied: boolean;
  onCopy: () => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  businessName,
  rawResult,
  copied,
  onCopy,
}) => {
  const navigate = useNavigate();

  const handleDownload = () => {
    const blob = new Blob([rawResult], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessName.toLowerCase()}-campaign-plan.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Campaign plan saved to your device",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${businessName} Campaign Plan`,
          text: rawResult,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          onCopy();
        }
      }
    } else {
      onCopy();
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/generator")}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-4"
        >
          <ArrowLeft className="h-4 w-4" />
          New Campaign
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="default" onClick={onCopy} className="gap-2">
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
      </div>

      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
          Campaign Strategy Report
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          {businessName} Campaign Plan
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          A comprehensive advertising strategy tailored to your business goals
          and target audience.
        </p>
      </div>
    </div>
  );
};

export default ReportHeader;
