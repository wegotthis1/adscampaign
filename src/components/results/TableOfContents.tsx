import React from "react";
import { motion } from "framer-motion";

interface Section {
  icon: React.JSX.Element;
  title: string;
  content: string[];
}

interface TableOfContentsProps {
  sections: Section[];
  activeSection: number;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, activeSection }) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mb-8"
    >
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Contents</h3>
        <div className="flex flex-wrap gap-1.5">
          {sections.map((section, index) => (
            <a
              key={index}
              href={`#section-${index}`}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeSection === index
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 hover:bg-primary/10 hover:text-primary text-muted-foreground"
                }`}
            >
              <span className="font-bold text-[10px] opacity-60">{String(index + 1).padStart(2, '0')}</span>
              <span className="truncate max-w-[120px]">{section.title}</span>
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default TableOfContents;
