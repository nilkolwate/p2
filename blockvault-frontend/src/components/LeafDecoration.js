import React from 'react';

const LeafDecoration = ({ position = 'top-left', className = '' }) => {
  const isTopLeft = position === 'top-left';

  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute w-48 h-48 md:w-64 md:h-64 pointer-events-none opacity-20 text-brand-gold ${
        isTopLeft ? 'top-0 left-0 -translate-x-8 -translate-y-8' : 'bottom-0 right-0 translate-x-8 translate-y-8 rotate-180'
      } ${className}`}
    >
      {/* Main branch stem */}
      <path
        d="M20 220 Q80 140 140 100 Q180 70 220 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Leaves branching off */}
      <path
        d="M80 140 C60 120 40 130 50 150 C60 160 80 150 80 140 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M110 120 C130 100 140 110 130 130 C120 140 110 130 110 120 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M140 100 C120 80 110 90 120 110 C130 120 140 110 140 100 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M170 70 C190 50 200 60 190 80 C180 90 170 80 170 70 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M195 45 C180 30 170 40 180 55 C190 65 200 55 195 45 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M220 20 C215 10 205 15 210 25 C215 30 220 25 220 20 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
};

export default LeafDecoration;
