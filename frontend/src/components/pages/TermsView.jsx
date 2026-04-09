"use client";

import React from 'react';
import { FileText, UserCheck, AlertTriangle, Scale, Clock, Terminal } from 'lucide-react';

export default function TermsView() {
  const termsSections = [
    {
      id: 'acceptance',
      icon: UserCheck,
      title: '1. Acceptance of Terms',
      content: (
        <>
          <p className="mb-4">
            By accessing and using <strong>Sentinel Cloud</strong>, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our platform or APIs.
          </p>
          <p>
            These Terms apply to all visitors, users, and others who access or use the Service.
          </p>
        </>
      )
    },
    {
      id: 'user-responsibilities',
      icon: Terminal,
      title: '2. User Responsibilities & API Usage',
      content: (
        <>
          <p className="mb-4">As a user of Sentinel Cloud, you agree to:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-400">
            <li>Maintain the security of your API keys and account credentials.</li>
            <li>Not use the service for any illegal or unauthorized purpose, including launching DDoS attacks or distributing malware through our IoT nodes.</li>
            <li>Respect the rate limits associated with your billing plan. Excessive API calls beyond your quota may result in temporary suspension.</li>
          </ul>
        </>
      )
    },
    {
      id: 'service-availability',
      icon: Clock,
      title: '3. Service Availability & SLA',
      content: (
        <>
          <p className="mb-4">
            While we strive for 99.9% uptime, Sentinel Cloud is provided on an "AS IS" and "AS AVAILABLE" basis. We reserve the right to perform scheduled maintenance, which may result in temporary service interruptions.
          </p>
          <p>
            We are not liable for any data loss, delayed sensor readings, or operational impact caused by platform downtime.
          </p>
        </>
      )
    },
    {
      id: 'liability',
      icon: AlertTriangle,
      title: '4. Limitation of Liability',
      content: (
        <>
          <p className="mb-4">
            In no event shall Sentinel Cloud, nor its directors, employees, partners, or agents, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </p>
          <p>
            Our infrastructure is designed to route IoT data, but any decisions made by automated machinery based on that data are solely your responsibility.
          </p>
        </>
      )
    },
    {
      id: 'governing-law',
      icon: Scale,
      title: '5. Governing Law',
      content: (
        <>
          <p className="mb-4">
            These Terms shall be governed and construed in accordance with the laws of India, specifically under the jurisdiction of the courts in Lucknow, Uttar Pradesh.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>
        </>
      )
    },
    {
      id: 'changes',
      icon: FileText,
      title: '6. Changes to Terms',
      content: (
        <>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="w-full min-h-screen text-slate-300 font-sans pb-20 pt-32 lg:pt-40 bg-[#03060D] flex justify-center px-4 sm:px-6">
      
      {/* ========================================= */}
      {/* SIMPLE DOCUMENT CONTAINER                 */}
      {/* ========================================= */}
      <div className="w-full max-w-4xl bg-[#0F172A] border border-slate-800 rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl">
        
        {/* Simple Header */}
        <div className="mb-12 border-b border-slate-800/60 pb-8 text-center sm:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Effective Date: April 2026
          </p>
        </div>

        {/* Policy Content Blocks */}
        <div className="space-y-12">
          {termsSections.map((section) => (
            <div key={section.id} id={section.id}>
              
              {/* Section Title */}
              <div className="flex items-center gap-3 mb-5">
                <section.icon size={20} className="text-cyan-500 shrink-0" />
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {section.title}
                </h2>
              </div>
              
              {/* Section Text */}
              <div className="text-slate-300 text-sm md:text-base leading-relaxed tracking-wide">
                {section.content}
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}