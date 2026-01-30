import React from "react";
import { Target, Users, Wallet, Monitor, Palette, Clock } from "lucide-react";

export interface Section {
  icon: React.JSX.Element;
  title: string;
  content: string[];
}

const getIconForTitle = (title: string): React.JSX.Element => {
  const lower = title.toLowerCase();
  if (lower.includes("strategy") || lower.includes("overview") || lower.includes("business")) {
    return React.createElement(Target, { className: "h-5 w-5" });
  }
  if (lower.includes("audience") || lower.includes("target")) {
    return React.createElement(Users, { className: "h-5 w-5" });
  }
  if (lower.includes("budget") || lower.includes("allocation") || lower.includes("spend")) {
    return React.createElement(Wallet, { className: "h-5 w-5" });
  }
  if (lower.includes("placement") || lower.includes("platform")) {
    return React.createElement(Monitor, { className: "h-5 w-5" });
  }
  if (lower.includes("creative") || lower.includes("ad") || lower.includes("content")) {
    return React.createElement(Palette, { className: "h-5 w-5" });
  }
  if (lower.includes("timeline") || lower.includes("milestone") || lower.includes("schedule")) {
    return React.createElement(Clock, { className: "h-5 w-5" });
  }
  return React.createElement(Target, { className: "h-5 w-5" });
};

export const parseResultSections = (text: string): Section[] => {
  const sections: Section[] = [];

  // Clean up the text - remove markdown formatting artifacts
  const cleanText = text
    .replace(/\\n/g, "\n")
    .replace(/\*\*/g, "")
    .replace(/#{1,3}\s*/g, "")
    .replace(/---/g, "");

  const lines = cleanText.split("\n").filter((line) => line.trim());

  let currentSection: Section = {
    icon: React.createElement(Target, { className: "h-5 w-5" }),
    title: "Overview",
    content: [],
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Check if this is a section header (ends with emoji + text or is uppercase)
    const isHeader =
      /^[🎯📊💰📱🎨⏰📈🏢👥🔍✅📋💡🚀]/.test(trimmedLine) ||
      (trimmedLine.length < 50 &&
        trimmedLine.toUpperCase() === trimmedLine &&
        trimmedLine.length > 3) ||
      trimmedLine.endsWith(":");

    if (isHeader) {
      if (currentSection.content.length > 0) {
        sections.push({ ...currentSection });
      }
      const title = trimmedLine
        .replace(/[🎯📊💰📱🎨⏰📈🏢👥🔍✅📋💡🚀]/g, "")
        .replace(/:$/, "")
        .trim();
      currentSection = {
        icon: getIconForTitle(title),
        title: title || "Details",
        content: [],
      };
    } else if (
      trimmedLine.startsWith("-") ||
      trimmedLine.startsWith("•") ||
      trimmedLine.startsWith("*")
    ) {
      const content = trimmedLine.replace(/^[-•*]\s*/, "").trim();
      if (content.length > 2) {
        currentSection.content.push(content);
      }
    } else if (/^\d+\./.test(trimmedLine)) {
      const content = trimmedLine.replace(/^\d+\.\s*/, "").trim();
      if (content.length > 2) {
        currentSection.content.push(content);
      }
    } else if (trimmedLine.length > 10) {
      // Regular paragraph text - treat as bullet point
      currentSection.content.push(trimmedLine);
    }
  });

  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return sections;
};
