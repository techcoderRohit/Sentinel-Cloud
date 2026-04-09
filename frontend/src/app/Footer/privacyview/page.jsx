import React from 'react';
import PrivacyView from '@/components/pages/PrivacyView'; // Path check kar lena
import Navbar from '@/components/pages/Navbar';
import Footer from '@/components/pages/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#03060D]">
      
      <Navbar/>
      <PrivacyView />
      <Footer/>

    </div>
  );
}