import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Target, Cpu, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Eye,
    title: 'Our Vision',
    description:
      'To create a world where every academic credential is instantly verifiable, eliminating fraud and building universal trust in educational achievements.',
  },
  {
    icon: Target,
    title: 'Our Mission',
    description:
      'To empower institutions and students with blockchain-powered certificate verification that is secure, transparent, and accessible to everyone.',
  },
  {
    icon: Cpu,
    title: 'Our Technology',
    description:
      'Built on SHA-256 hashing and a tamper-proof blockchain ledger, BlockVault ensures every certificate is cryptographically secured and permanently recorded.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#F5F1E9]">
      {/* Hero Section */}
      <section className="leaf-decoration py-20 px-6">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <h1
              className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              About <span className="italic text-[#1F3D2B]">BlockVault</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              BlockVault is a blockchain-based academic certificate verification
              platform built to eliminate certificate fraud and restore trust in
              educational credentials. By leveraging SHA-256 hashing and an
              immutable blockchain ledger, we ensure that every certificate
              issued is tamper-proof, instantly verifiable, and permanently
              secured.
            </p>
            <p className="mt-4 text-gray-500 leading-relaxed max-w-xl">
              Our platform bridges the gap between institutions, employers, and
              students — providing a single source of truth for academic
              achievements in a digital-first world.
            </p>
          </div>

          {/* Right: Circular Photo Placeholder */}
          <div className="flex justify-center">
            <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden shadow-xl border-4 border-white">
              <div className="w-full h-full bg-gradient-to-br from-[#1F3D2B] via-[#3A5A40] to-[#6B8F71] flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21v-8.25M15.276 5.924a4.5 4.5 0 11-6.552 0M6.228 6.228A7.5 7.5 0 1117.772 6.228"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium opacity-80">
                    Campus Building
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Column Features */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F5F1E9] flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-[#1F3D2B]" />
              </div>
              <h3
                className="text-xl font-semibold text-[#1A1A1A] mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Dark Green CTA Banner */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto bg-[#1F3D2B] rounded-[16px] overflow-hidden relative">
          {/* Subtle overlay pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
              }}
            />
          </div>
          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Building a Trustworthy Digital Future
            </h2>
            <p className="text-[#6B8F71] text-lg font-medium tracking-wide mb-8">
              Secure. Verify. Believe.
            </p>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-[#1F3D2B] font-semibold hover:bg-green-50 transition-colors shadow-sm"
            >
              Verify a Certificate <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
