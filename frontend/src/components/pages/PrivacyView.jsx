"use client";

import React from 'react';
import { ShieldCheck, Database, Server, Lock, Eye, Mail } from 'lucide-react';

export default function PrivacyView() {
  const policySections = [
    {
      id: 'introduction',
      icon: ShieldCheck,
      title: '1. Introduction',
      content: (
        <>
          <p className="mb-4">
            Welcome to <strong>Sentinel Cloud</strong>. We respect your privacy and are committed to protecting your personal data and IoT infrastructure information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform, APIs, and edge node services.
          </p>
          <p>
            By accessing Sentinel Cloud, you agree to the collection and use of information in accordance with this policy. Last updated: <strong>April 2026</strong>.
          </p>
        </>
      )
    },
    {
      id: 'data-collection',
      icon: Database,
      title: '2. Data We Collect',
      content: (
        <>
          <p className="mb-4">We collect several different types of information for various purposes to provide and improve our IoT routing service to you:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-400">
            <li><strong>Account Data:</strong> Name, email address, company details, and billing information.</li>
            <li><strong>IoT Sensor Data:</strong> The telemetry data, metrics, and logs sent from your connected edge devices to our MQTT brokers.</li>
            <li><strong>Usage Data:</strong> Information on how the platform is accessed and used, including API request volumes and Gemini AI query logs.</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-usage',
      icon: Server,
      title: '3. How We Use Your Data',
      content: (
        <>
          <p className="mb-4">Sentinel Cloud uses the collected data for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-400">
            <li>To provide and maintain our real-time edge computing services.</li>
            <li>To process your data through the <strong>Gemini API</strong> for smart anomaly detection (only if enabled by you).</li>
            <li>To notify you about changes to our platform, system downtimes, or security alerts.</li>
            <li>To provide customer care and technical support.</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-security',
      icon: Lock,
      title: '4. Data Security & Encryption',
      content: (
        <>
          <p className="mb-4">
            The security of your data is our top priority. We implement enterprise-grade security measures, including:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4 text-slate-400">
            <li><strong>TLS/SSL Encryption:</strong> All device-to-cloud and cloud-to-client communication is strictly encrypted.</li>
            <li><strong>API Key Rotation:</strong> We enforce Role-Based Access Control (RBAC) and allow instant revocation of compromised API keys.</li>
          </ul>
          <p>
            However, remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee its absolute security.
          </p>
        </>
      )
    },
    {
      id: 'your-rights',
      icon: Eye,
      title: '5. Your Privacy Rights',
      content: (
        <>
          <p className="mb-4">Depending on your location, you may have the following rights regarding your data:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400">
            <li>The right to access, update, or delete the information we have on you.</li>
            <li>The right of rectification (to correct inaccurate data).</li>
            <li>The right to withdraw consent at any time where Sentinel Cloud relied on your consent to process your personal information.</li>
          </ul>
        </>
      )
    },
    {
      id: 'contact',
      icon: Mail,
      title: '6. Contact Us',
      content: (
        <>
          <p className="mb-4">If you have any questions about this Privacy Policy, please contact our Data Protection Officer:</p>
          <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 text-slate-300">
            <p><strong>Email:</strong> privacy@sentinelcloud.io</p>
            <p><strong>Address:</strong> Sentinel Cloud HQ, Tech Park, Lucknow, India</p>
          </div>
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
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Effective Date: April 2026
          </p>
        </div>

        {/* Policy Content Blocks */}
        <div className="space-y-12">
          {policySections.map((section) => (
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