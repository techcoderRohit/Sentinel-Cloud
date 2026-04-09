import React from 'react';
import TermsView from '@/components/pages/TermsView'; // Path check kar lena
import Navbar from '@/components/pages/Navbar';
import Footer from '@/components/pages/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#03060D]">
      <Navbar/>
      <TermsView />
      <Footer/>
    </div>
  );
}