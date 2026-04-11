import React from 'react';
import AboutView from '@/components/pages/AboutView';
import Navbar from '@/components/pages/Navbar';
import Footer from '@/components/pages/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#03060D]">
      
        <Navbar/>
        <AboutView/>
        <Footer/>
    </div>
  );
}