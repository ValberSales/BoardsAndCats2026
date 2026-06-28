import React, { useMemo } from 'react';

interface CategoryIconProps {
  iconHtml?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const processSvg = (svgString: string): string => {
  if (!svgString) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = doc.querySelector("svg");
    
    if (!svgElement) return svgString;

    // Helper to process an element and replace hardcoded colors with currentColor
    const cleanElement = (el: Element) => {
      // 1. Process fill attribute
      const fill = el.getAttribute("fill");
      if (fill && fill !== "none" && fill !== "transparent") {
        el.setAttribute("fill", "currentColor");
      }

      // 2. Process stroke attribute
      const stroke = el.getAttribute("stroke");
      if (stroke && stroke !== "none" && stroke !== "transparent") {
        el.setAttribute("stroke", "currentColor");
      }

      // 3. Process style attribute
      const styleAttr = el.getAttribute("style");
      if (styleAttr) {
        let newStyle = styleAttr;
        // Replace fill: <color> but not fill: none or fill: transparent
        newStyle = newStyle.replace(/fill\s*:\s*(?!(none|transparent|currentColor))\s*[^;]+/gi, "fill: currentColor");
        // Replace stroke: <color> but not stroke: none or stroke: transparent
        newStyle = newStyle.replace(/stroke\s*:\s*(?!(none|transparent|currentColor))\s*[^;]+/gi, "stroke: currentColor");
        el.setAttribute("style", newStyle);
      }
    };

    // Clean the root svg element
    cleanElement(svgElement);

    // Clean all child elements
    const allElements = svgElement.getElementsByTagName("*");
    for (let i = 0; i < allElements.length; i++) {
      cleanElement(allElements[i]);
    }

    return svgElement.outerHTML;
  } catch (e) {
    console.error("Error processing SVG:", e);
    return svgString;
  }
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconHtml, 
  size = 24, 
  className = "", 
  style 
}) => {
  const processedHtml = useMemo(() => {
    return iconHtml ? processSvg(iconHtml) : "";
  }, [iconHtml]);

  if (!iconHtml) {
    return (
      <i 
        className={`pi pi-tag ${className}`} 
        style={{ fontSize: `${size}px`, ...style }} 
      />
    );
  }

  return (
    <div
      className={`category-icon-wrapper flex align-items-center justify-content-center ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        color: "inherit",
        display: "inline-flex",
        ...style 
      }}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};
