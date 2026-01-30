import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  index: number;
  icon: React.JSX.Element;
  title: string;
  content: string[];
  completedItems: Set<string>;
  onToggleItem: (itemId: string) => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  index,
  icon,
  title,
  content,
  completedItems,
  onToggleItem,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopySection = async () => {
    const sectionText = `${title}\n\n${content.map((item, i) => `${i + 1}. ${item}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(sectionText);
      setCopied(true);
      toast({
        title: "Section copied!",
        description: `${title} copied to clipboard`,
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

  const completedInSection = content.filter((_, i) =>
    completedItems.has(`${index}-${i}`)
  ).length;

  return (
    <article
      id={`section-${index}`}
      className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Section Header */}
      <div
        className="bg-gradient-to-r from-primary/10 to-transparent px-8 py-6 border-b border-border/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary font-bold text-xl">
              {index + 1}
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/50 text-primary">
                {React.cloneElement(icon, { className: "h-5 w-5" })}
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedInSection} / {content.length} completed
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCopySection();
              }}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Copy</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-8">
          <ul className="space-y-4">
            {content.map((item, itemIndex) => {
              const itemId = `${index}-${itemIndex}`;
              const isCompleted = completedItems.has(itemId);

              return (
                <li
                  key={itemIndex}
                  className={cn(
                    "flex items-start gap-4 group p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/30",
                    isCompleted && "bg-primary/5"
                  )}
                  onClick={() => onToggleItem(itemId)}
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => onToggleItem(itemId)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <p
                    className={cn(
                      "text-foreground/90 text-base md:text-lg leading-relaxed flex-1 transition-all",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {item}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
};

export default SectionCard;
