import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Hash, Zap, Lock, CheckCircle, FileCheck, Database, QrCode, Sparkles, Layers, ArrowRight } from 'lucide-react';
import BlockVaultLogo from '../components/BlockVaultLogo';

const features = [
  {
    icon: Shield,
    title: 'Blockchain Security',
    description: 'Every certificate is anchored to an immutable blockchain ledger for maximum trust.',
  },
  {
    icon: Hash,
    title: 'SHA-256 Hashing',
    description: 'Cryptographic hashing ensures document integrity from the moment of issuance.',
  },
  {
    icon: Zap,
    title: 'Instant Verification',
    description: 'Verify any certificate in seconds with a simple upload or certificate ID.',
  },
  {
    icon: Lock,
    title: 'Tamper-Proof',
    description: 'Any modification to a certificate is immediately detectable and flagged.',
  },
  {
    icon: Database,
    title: 'Consensus Proof',
    description: 'Cryptographically linked blocks ensure transactions cannot be modified or deleted.',
  },
  {
    icon: QrCode,
    title: 'Dynamic QR Verification',
    description: 'Instantly verifiable QR codes embedded into every issued academic document.',
  },
  {
    icon: Layers,
    title: 'Dual-Layer Audit Trail',
    description: 'Complete auditability for institutions, students, employers, and authorized auditors.',
  },
  {
    icon: Sparkles,
    title: 'Institutional Grade',
    description: 'Built for universities, polytechnics, and certification boards worldwide.',
  },
];

const howItWorksSteps = [
  {
    step: '01',
    title: 'Issue & Digitalize',
    desc: 'Authorized university administrators create or upload academic certificates with student credentials.',
    icon: FileCheck,
  },
  {
    step: '02',
    title: 'SHA-256 Hashing',
    desc: 'BlockVault computes an immutable 256-bit cryptographic digest uniquely identifying the document.',
    icon: Hash,
  },
  {
    step: '03',
    title: 'Blockchain Anchoring',
    desc: 'The hash, timestamp, and metadata are cryptographically chained and mined into an immutable block.',
    icon: Database,
  },
  {
    step: '04',
    title: 'Universal Verification',
    desc: 'Students and employers verify credentials in seconds using a certificate ID or scanning the QR code.',
    icon: QrCode,
  },
];

const checklist = [
  'Issue Certificates Digitally',
  'Store on Immutable Blockchain',
  'Generate Dynamic QR Codes',
  'Verify Anytime, Anywhere Worldwide',
];

export default function HomePage() {
  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section className="leaf-decoration bg-brand-cream">
        <div className="max-w-[1280px] mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div>
            <p className="text-sm tracking-[0.25em] font-semibold text-brand-olive mb-4 uppercase">
              Secure · Transparent · Trusted
            </p>
            <h1
              className="text-5xl lg:text-6xl font-bold leading-tight text-brand-charcoal mb-6"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Certificates You Can{' '}
              <em className="italic">Trust</em>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-4 max-w-lg">
              BlockVault uses blockchain technology and SHA-256 cryptographic hashing
              to guarantee the authenticity of every academic certificate — making
              fraud impossible and verification instant.
            </p>
          </div>

          {/* Right column — circular design + floating badge */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-full shadow-2xl ring-4 ring-white/90 bg-gradient-to-br from-[#F5F1E9] via-[#EDE7DA] to-[#D5C6AF] flex items-center justify-center border-4 border-[#1F3D2B]/15 relative overflow-hidden group">
                {/* Subtle decorative concentric rings */}
                <div className="absolute inset-4 rounded-full border border-[#1F3D2B]/10 pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-dashed border-[#1F3D2B]/15 pointer-events-none" />
                {/* Centered BlockVault Logo matching the colour scheme */}
                <BlockVaultLogo className="w-40 h-40 lg:w-56 lg:h-56 transform group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How BlockVault Works Section (#how-it-works) ─── */}
      <section id="how-it-works" className="py-20 bg-white border-b border-gray-100 scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-[#6B8F71] uppercase mb-2 block">
              Four-Step Architecture
            </span>
            <h2
              className="text-3xl lg:text-4xl font-bold text-brand-charcoal mb-4"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              How BlockVault Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Learn how cryptographic SHA-256 digests and distributed blockchain consensus
              permanently secure academic credentials from tampering.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {howItWorksSteps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="bg-brand-cream/50 rounded-2xl p-6 border border-brand-beige/70 hover:shadow-lg transition-all relative flex flex-col group hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-[#1F3D2B]/30 group-hover:text-[#1F3D2B] transition-colors font-mono">
                      {s.step}
                    </span>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#1F3D2B] group-hover:bg-[#1F3D2B] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-brand-charcoal mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Why BlockVault? (#features) ─── */}
      <section id="features" className="py-20 bg-brand-cream/30 scroll-mt-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-[#6B8F71] uppercase mb-2 block">
              Enterprise Features
            </span>
            <h2
              className="text-3xl lg:text-4xl font-bold text-brand-charcoal mb-4"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Why Choose BlockVault?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A modern, trustworthy platform built on proven cryptographic
              principles and decentralized verification.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-[16px] shadow-sm p-6 flex flex-col items-start hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4 text-[#1F3D2B]">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-brand-charcoal mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── A Smarter Way to Manage Certificates ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          {/* Left — circular photo */}
          <div className="flex justify-center">
            <div className="w-72 h-72 lg:w-[380px] lg:h-[380px] rounded-full overflow-hidden shadow-xl ring-4 ring-white">
              <img
                src="https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=600&fit=crop"
                alt="Modern workspace"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right — content */}
          <div>
            <h2
              className="text-3xl lg:text-4xl font-bold text-brand-charcoal mb-4"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              A Smarter Way to Manage Certificates
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              From issuance to verification, BlockVault digitizes and secures
              the entire certificate lifecycle — so institutions and employers
              can trust every document, every time.
            </p>

            <ul className="space-y-4 mb-8">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-[#1F3D2B] flex-shrink-0" />
                  <span className="text-brand-charcoal font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#1F3D2B] text-white px-7 py-3 rounded-full font-medium hover:bg-[#16281C] transition-colors shadow-sm"
            >
              Get In Touch <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div
            className="rounded-[16px] overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #1F3D2B 0%, #16281C 100%)',
            }}
          >
            {/* Subtle background photo overlay */}
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop')",
              }}
            />
            <div className="relative z-10 text-center py-16 px-6">
              <h2
                className="text-3xl lg:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
              >
                Ready to Get Started?
              </h2>
              <p className="text-green-200 text-lg max-w-xl mx-auto">
                Join institutions that trust BlockVault for tamper-proof,
                blockchain-backed certificate management.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
