"use client"; // Required for Framer Motion animations

import React from 'react';
import Navbar from '@/components/pages/Navbar';
import Hero from '@/components/pages/Hero';
import FeaturesBento from '@/components/pages/FeaturesBento';
import DeveloperSection from '@/components/pages/DeveloperSection';
import Testimonials from '@/components/pages/Testimonials';
import Contact from '@/components/pages/Contact';
import CTA from '@/components/pages/CTA';
import Footer from '@/components/pages/Footer';

export default function SentinelLandingPage() {
  return (
    
    <div className="bg-[#0B1120] min-h-screen antialiased text-slate-300">
      <Navbar />
      <main className="flex flex-col">
        <Hero />
        <FeaturesBento />
        <DeveloperSection />
        <Testimonials/>
        <Contact/>
        <CTA/>
        
      </main>
      <Footer/>

    </div>
  );
}