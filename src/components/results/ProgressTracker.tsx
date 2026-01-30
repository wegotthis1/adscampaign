import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface ProgressTrackerProps {
  completedItems: Set<string>;
  totalItems: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completedItems,
  totalItems,
}) => {
  const completedCount = completedItems.size;
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Implementation Progress
          </h3>
        </div>
        <span className="text-sm font-medium text-foreground">
          {completedCount} / {totalItems} tasks
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2">
        Click on action items below to mark them as complete
      </p>
    </div>
  );
};

export default ProgressTracker;
