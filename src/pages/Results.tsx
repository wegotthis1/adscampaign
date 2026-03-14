import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import ResultsHeader from "@/components/results/ResultsHeader";
import ReportHero from "@/components/results/ReportHero";
import TableOfContents from "@/components/results/TableOfContents";
import ReportSection from "@/components/results/ReportSection";
import { parseResult } from "@/components/results/parseResult";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);

  const rawResult = location.state?.result as string | undefined;
  const websiteUrl = location.state?.websiteUrl as string | undefined;

  const getBusinessName = (url: string | undefined): string => {
    if (!url) return "Your Business";
    const domain = url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].split('.')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  };

  const businessName = getBusinessName(websiteUrl);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setScrollProgress(Math.min(progress, 100));

    // Track active section
    const sectionElements = document.querySelectorAll('[id^="section-"]');
    sectionElements.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom > 150) {
        setActiveSection(i);
      }
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!rawResult) {
      navigate("/");
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [rawResult, navigate, handleScroll]);

  if (!rawResult) return null;

  const sections = parseResult(rawResult);
  const totalPoints = sections.reduce((sum, s) => sum + s.content.length, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col print:bg-white">
      <ResultsHeader rawResult={rawResult} scrollProgress={scrollProgress} />

      <main className="flex-1 py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <ReportHero
            businessName={businessName}
            sectionCount={sections.length}
            totalPoints={totalPoints}
          />

          <TableOfContents sections={sections} activeSection={activeSection} />

          {/* Report Sections */}
          <div className="space-y-5">
            {sections.map((section, index) => (
              <ReportSection key={index} section={section} index={index} />
            ))}
          </div>

          {/* Report Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-14 text-center pb-8"
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
