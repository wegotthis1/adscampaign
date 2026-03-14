import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Section {
  icon: React.JSX.Element;
  title: string;
  content: string[];
}

interface ReportSectionProps {
  section: Section;
  index: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const ReportSection: React.FC<ReportSectionProps> = ({ section, index }) => {
  return (
    <motion.article
      id={`section-${index}`}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="scroll-mt-20"
    >
      <Card className="glass-card-elevated overflow-hidden group hover:shadow-lg transition-shadow duration-300">
        {/* Section header */}
        <div className="border-b border-border/40 px-6 md:px-8 py-5 flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl meta-gradient flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 shadow-sm">
              {String(index + 1).padStart(2, '0')}
            </div>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/8 text-primary group-hover:bg-primary/15 transition-colors">
              {React.cloneElement(section.icon, { className: "h-4 w-4" })}
            </div>
            <h2 className="text-lg md:text-xl font-bold text-foreground truncate">{section.title}</h2>
          </div>
        </div>

        {/* Section content */}
        <CardContent className="p-6 md:p-8">
          <div className="space-y-3">
            {section.content.map((item, itemIndex) => {
              // Detect if this looks like a key-value pair (e.g., "Budget: $5000")
              const colonIndex = item.indexOf(':');
              const hasKeyValue = colonIndex > 0 && colonIndex < 40 && colonIndex < item.length - 1;

              return (
                <motion.div
                  key={itemIndex}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: itemIndex * 0.03, duration: 0.3 }}
                  className="flex items-start gap-3 group/item"
                >
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60 mt-2.5 group-hover/item:bg-primary transition-colors" />
                  <p className="text-foreground/80 leading-relaxed text-[15px]">
                    {hasKeyValue ? (
                      <>
                        <span className="font-semibold text-foreground">{item.slice(0, colonIndex)}:</span>
                        {item.slice(colonIndex + 1)}
                      </>
                    ) : (
                      item
                    )}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
};

export default ReportSection;
