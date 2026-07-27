"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const COUNTRIES = [
  { code: "SN", x: 140, y: 380 },
  { code: "ML", x: 180, y: 340 },
  { code: "BF", x: 220, y: 370 },
  { code: "NE", x: 280, y: 340 },
  { code: "NG", x: 320, y: 400 },
  { code: "BJ", x: 300, y: 410 },
  { code: "TG", x: 280, y: 420 },
  { code: "GH", x: 250, y: 430 },
  { code: "CI", x: 200, y: 420 },
  { code: "GN", x: 150, y: 410 },
  { code: "SL", x: 120, y: 430 },
  { code: "LR", x: 140, y: 450 },
  { code: "GM", x: 125, y: 375 },
  { code: "GW", x: 130, y: 395 },
  { code: "CV", x: 60, y: 360 },
];

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
  [0, 9], [2, 8], [1, 4], [7, 4],
];

export function NetworkMap() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 600"
        className="w-full h-auto max-h-[600px] opacity-70"
      >
        {/* Connections with animated pulses */}
        {CONNECTIONS.map(([from, to], i) => {
          const start = COUNTRIES[from];
          const end = COUNTRIES[to];
          return (
            <g key={i}>
              {/* Base line */}
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#14b8a6"
                strokeWidth="1"
                opacity="0.2"
              />
              {/* Animated pulse */}
              <motion.circle
                r="3"
                fill="#14b8a6"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  offsetDistance: ["0%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
                style={{
                  offsetPath: `path('M ${start.x} ${start.y} L ${end.x} ${end.y}')`,
                }}
              >
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${i * 0.3}s`}
                  path={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                />
              </motion.circle>
            </g>
          );
        })}

        {/* Country nodes */}
        {COUNTRIES.map((country, i) => (
          <motion.g
            key={country.code}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
          >
            <circle
              cx={country.x}
              cy={country.y}
              r="4"
              fill="#0d9488"
              stroke="#14b8a6"
              strokeWidth="2"
            />
            <circle
              cx={country.x}
              cy={country.y}
              r="8"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="1"
              opacity="0.2"
            />
          </motion.g>
        ))}
      </svg>

      {/* Stats overlay */}
      <div className="absolute bottom-8 left-8 text-white/60 font-mono text-sm">
        <div className="space-y-1">
          <div>279 indicators</div>
          <div>15 countries</div>
          <div>One API</div>
        </div>
      </div>
    </div>
  );
}
