import React from 'react';
import BlogView from '@/components/pages/BlogView';
import Navbar from '@/components/pages/Navbar';
import Footer from '@/components/pages/Footer';


export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0B1120]">
        
        <Navbar/>
        <BlogView/>
        <Footer/>

  
    </div>
  );
}