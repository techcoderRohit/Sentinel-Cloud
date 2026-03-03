"use client"; // Required for Framer Motion animations

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturesBento from '@/components/FeaturesBento';
import DeveloperSection from '@/components/DeveloperSection';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

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