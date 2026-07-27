"use client";

import { useState, useEffect } from "react";

const CODE_LINES = [
  'curl https://ecowas-api.onrender.com/v1/economy/SN \\',
  '  -H "Authorization: Bearer waa_live_..."',
  '',
  '→ 200 OK',
  '{',
  '  "country_code": "SN",',
  '  "indicator": "gdp_current_usd",',
  '  "value": 27.63,',
  '  "year": 2023,',
  '  "unit": "USD_billion",',
  '  "source": "World Bank WDI"',
  '}',
];

export function TerminalBlock() {
  const [displayedText, setDisplayedText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= CODE_LINES.length) return;

    const currentLine = CODE_LINES[lineIndex];

    if (charIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + currentLine[charIndex]);
        setCharIndex(charIndex + 1);
      }, 30);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + "\n");
        setLineIndex(lineIndex + 1);
        setCharIndex(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [charIndex, lineIndex]);

  return (
    <div className="absolute top-8 right-8 w-[380px]">
      <div className="rounded-lg bg-black/40 backdrop-blur-sm border border-teal-500/20 p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-white/40 font-mono">terminal</span>
        </div>
        <pre className="font-mono text-xs text-teal-300 whitespace-pre-wrap">
          {displayedText}
          <span className="inline-block w-1.5 h-3.5 bg-teal-400 ml-0.5 animate-pulse" />
        </pre>
      </div>
    </div>
  );
}
