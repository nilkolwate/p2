import React from 'react';

/**
 * Official BlockVault Brand Logo
 * Combines a cryptographic shield, secure vault core, and immutable blockchain nodes.
 */
export default function BlockVaultLogo({ className = "w-8 h-8", withText = false, textClassName = "text-xl" }) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Outer Shield Container */}
          <path
            d="M24 4L7 11V23.5C7 33.8 14.3 43.1 24 45.5C33.7 43.1 41 33.8 41 23.5V11L24 4Z"
            fill="#1F3D2B"
          />
          {/* Inner Accent Contour */}
          <path
            d="M24 7L10 13V23.5C10 32.2 16.1 40.1 24 42.4C31.9 40.1 38 32.2 38 23.5V13L24 7Z"
            stroke="#4E8752"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          
          {/* Blockchain Interconnected Cube / Vault Icon */}
          {/* Top Cube Face */}
          <polygon
            points="24,14 31,18 24,22 17,18"
            fill="#80ED99"
          />
          {/* Left Cube Face */}
          <polygon
            points="17,19 23,22.5 23,31 17,27.5"
            fill="#57CC99"
          />
          {/* Right Cube Face */}
          <polygon
            points="31,19 25,22.5 25,31 31,27.5"
            fill="#38A3A5"
          />

          {/* Central Vault Keyhole / Ledger Core */}
          <circle cx="24" cy="25" r="2.2" fill="#1F3D2B" />
          <path d="M23 25L22.5 28.5H25.5L25 25H23Z" fill="#1F3D2B" />

          {/* Small Linked Blockchain Dots */}
          <circle cx="24" cy="11.5" r="1.2" fill="#C7F9CC" />
          <circle cx="14" cy="22" r="1.2" fill="#C7F9CC" />
          <circle cx="34" cy="22" r="1.2" fill="#C7F9CC" />
          <circle cx="24" cy="35" r="1.2" fill="#C7F9CC" />
        </svg>
      </div>

      {withText && (
        <span
          className={`font-bold tracking-tight text-[#1F3D2B] ${textClassName}`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Block<span className="text-[#38A3A5]">Vault</span>
        </span>
      )}
    </div>
  );
}
