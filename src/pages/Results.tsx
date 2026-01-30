import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import Footer from "@/components/Footer";
import ReportHeader from "@/components/results/ReportHeader";
import ProgressTracker from "@/components/results/ProgressTracker";
import TableOfContents from "@/components/results/TableOfContents";
import SectionCard from "@/components/results/SectionCard";
import { parseResultSections } from "@/components/results/parseResultSections";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const rawResult = location.state?.result as string | undefined;
  const websiteUrl = location.state?.websiteUrl as string | undefined;

  // Extract business name from URL (e.g., "example.com" -> "Example")
  const getBusinessName = (url: string | undefined): string => {
    if (!url) return "Your Business";
    const domain = url
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .split("/")[0]
      .split(".")[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  };

  const businessName = getBusinessName(websiteUrl);

  const sections = useMemo(() => {
    if (!rawResult) return [];
    return parseResultSections(rawResult);
  }, [rawResult]);

  const totalItems = useMemo(() => {
    return sections.reduce((acc, section) => acc + section.content.length, 0);
  }, [sections]);

  useEffect(() => {
    // Scroll to top when component mounts
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

  const handleToggleItem = (itemId: string) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <main className="flex-1 py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Report Header */}
          <ReportHeader
            businessName={businessName}
            rawResult={rawResult}
            copied={copied}
            onCopy={handleCopy}
          />

          {/* Progress Tracker */}
          <ProgressTracker
            completedItems={completedItems}
            totalItems={totalItems}
          />

          {/* Table of Contents */}
          <TableOfContents sections={sections} />

          {/* Report Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <SectionCard
                key={index}
                index={index}
                icon={section.icon}
                title={section.title}
                content={section.content}
                completedItems={completedItems}
                onToggleItem={handleToggleItem}
              />
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
