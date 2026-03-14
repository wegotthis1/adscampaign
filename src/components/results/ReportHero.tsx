import React from "react";
import { motion } from "framer-motion";
import { FileText, BarChart3, Layers } from "lucide-react";

interface ReportHeroProps {
  businessName: string;
  sectionCount: number;
  totalPoints: number;
}

const ReportHero: React.FC<ReportHeroProps> = ({ businessName, sectionCount, totalPoints }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="mb-10"
    >
      {/* Decorative background */}
      <div className="relative overflow-hidden rounded-2xl meta-gradient p-[1px]">
        <div className="rounded-[calc(1rem-1px)] bg-card px-6 py-8 md:px-10 md:py-12">
          {/* Dot pattern overlay */}
          <div className="absolute inset-0 dot-pattern opacity-[0.03] pointer-events-none" />
          
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4">
              Campaign Strategy Report
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2 leading-[1.1]">
              {businessName}
            </h1>
            <p className="text-lg md:text-xl font-medium text-gradient mb-8">
              Advertising Campaign Plan
            </p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-border/60">
              <Stat icon={<Layers className="h-4 w-4" />} label="Sections" value={sectionCount} />
              <Stat icon={<BarChart3 className="h-4 w-4" />} label="Key Points" value={totalPoints} />
              <Stat icon={<FileText className="h-4 w-4" />} label="Format" value="Strategic" isText />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Stat = ({ icon, label, value, isText }: { icon: React.ReactNode; label: string; value: number | string; isText?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
    <div>
      <p className="text-xl font-bold text-foreground">{isText ? value : value}</p>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

export default ReportHero;
