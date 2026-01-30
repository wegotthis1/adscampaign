import React from "react";

interface Section {
  icon: React.JSX.Element;
  title: string;
  content: string[];
}

interface TableOfContentsProps {
  sections: Section[];
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections }) => {
  return (
    <nav className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Contents
      </h3>
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
  );
};

export default TableOfContents;
