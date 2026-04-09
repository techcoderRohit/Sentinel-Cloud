"use client";

import React, { useState } from 'react';
import { Calendar, User, ArrowRight, Search, Tag } from 'lucide-react'; // PlusCircle hata diya

export default function BlogView() {
  // 1. STATE MANAGEMENT
  const [inputValue, setInputValue] = useState(''); // Jo box mein type ho raha hai
  const [searchQuery, setSearchQuery] = useState(''); // Jab button click ho tab filter karne ke liye

  const blogPosts = [
    {
      id: 1,
      title: "The Future of Edge Computing in Industrial IoT",
      excerpt: "Discover how edge computing is reducing latency and saving bandwidth in modern smart factories and Sentinel Cloud nodes.",
      category: "Technology",
      author: "Rohit Modi",
      date: "April 15, 2026",
      readTime: "5 min read",
      imageGrad: "from-cyan-500 to-blue-600",
      imageUrl: null,
      featured: true
    },
    {
      id: 2,
      title: "Gemini API Integration: A Complete Guide",
      excerpt: "Learn how we replaced TensorFlow with Gemini API to make our IoT sensor data analysis 10x faster and smarter.",
      category: "Engineering",
      author: "Samir Ansari",
      date: "April 10, 2026",
      readTime: "8 min read",
      imageGrad: "from-purple-500 to-indigo-600",
      imageUrl: null,
      featured: false
    },
    {
      id: 3,
      title: "Securing MQTT Protocols against Cyber Threats",
      excerpt: "Security is paramount in IoT. Here are 5 best practices to secure your device-to-cloud communication.",
      category: "Security",
      author: "Sentinel Team",
      date: "April 02, 2026",
      readTime: "4 min read",
      imageGrad: "from-emerald-400 to-teal-600",
      imageUrl: null,
      featured: false
    },
    {
      id: 4,
      title: "Sentinel Cloud v2.0 is Now Live!",
      excerpt: "We are thrilled to announce the launch of our new Free-form control board and advanced device routing.",
      category: "Product Updates",
      author: "Rohit Modi",
      date: "March 28, 2026",
      readTime: "3 min read",
      imageGrad: "from-orange-500 to-rose-500",
      imageUrl: null,
      featured: false
    },
    {
      id: 5,
      title: "Sentinel Cloud v3.0 in Production!",
      excerpt: "We are thrilled to announce the launch of our new Free-form control board and advanced device routing.",
      category: "Product Updates",
      author: "Samir Ansari",
      date: "March 28, 2026",
      readTime: "3 min read",
      imageGrad: "from-orange-500 to-rose-500",
      imageUrl: null,
      featured: false
    },
  ];

  // Button click hone par ye function chalega
  const handleSearchClick = () => {
    setSearchQuery(inputValue);
  };

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full text-slate-300 font-sans pb-10 md:pb-20 overflow-x-hidden">
      
      {/* ---------------- HERO SECTION ---------------- */}
      <div className="relative pt-24 md:pt-32 lg:pt-40 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/50">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-40 md:h-64 bg-cyan-500/10 blur-[80px] md:blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <span className="text-cyan-400 font-bold tracking-widest uppercase text-[10px] md:text-xs lg:text-sm mb-3 md:mb-4 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            Sentinel Insights
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 md:mb-6 leading-tight">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Tech & IoT</span> Blog
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mb-8 md:mb-10 px-2">
            Stay updated with the latest news in Edge Computing, Cloud Security, and Sentinel Cloud product updates.
          </p>

          {/* Search Box & Search Button */}
          <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3 md:gap-4 items-center px-2 sm:px-0">
            <div className="relative w-full flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 md:w-5 md:h-5" />
              <input 
                type="text" 
                placeholder="Search articles, topics..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()} // Enter dabane par bhi search hoga
                className="w-full bg-[#0F172A] border border-slate-700 text-white text-sm md:text-base rounded-xl pl-10 md:pl-12 pr-4 py-3 md:py-3.5 outline-none focus:border-cyan-500 transition-colors shadow-inner"
              />
            </div>
            
            {/* Search Button */}
            <button 
              onClick={handleSearchClick}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 md:py-3.5 rounded-xl text-sm md:text-base font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- BLOG CONTENT SECTION ---------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12 lg:mt-16">
        
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 md:py-20 border border-dashed border-slate-800 rounded-2xl bg-[#0F172A]/50 mx-2 sm:mx-0">
            <p className="text-base md:text-lg lg:text-xl text-slate-500 font-medium px-4">No articles found matching "{searchQuery}"</p>
            <button 
              onClick={() => { setInputValue(''); setSearchQuery(''); }} 
              className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-bold transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
            
            {filteredPosts.map((post) => (
              <article 
                key={post.id} 
                className={`bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 group flex flex-col shadow-lg ${post.featured ? 'sm:col-span-2 lg:col-span-2' : ''}`}
              >
                <div className={`w-full ${post.featured ? 'h-48 sm:h-64 md:h-72 lg:h-80' : 'h-40 sm:h-48'} bg-gradient-to-br ${post.imageGrad} relative overflow-hidden`}>
                   <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                   <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-[#0B1120]/80 backdrop-blur-md px-2 md:px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1 md:gap-1.5 shadow-sm">
                     <Tag size={12} className="text-cyan-400 md:w-3.5 md:h-3.5" />
                     <span className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-wider">{post.category}</span>
                   </div>
                </div>

                <div className="p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col flex-1">
                  <h2 className={`font-bold text-white mb-2 md:mb-3 group-hover:text-cyan-400 transition-colors cursor-pointer leading-snug ${post.featured ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl' : 'text-base sm:text-lg md:text-xl'}`}>
                    {post.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-slate-400 mb-4 md:mb-6 line-clamp-2 md:line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800 pt-3 md:pt-4 mt-auto">
                    <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <User size={12} className="text-slate-400 md:w-3.5 md:h-3.5" /> 
                        <span className="truncate max-w-[80px] sm:max-w-none">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-1.5">
                        <Calendar size={12} className="text-slate-400 md:w-3.5 md:h-3.5" /> {post.date}
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-bold text-cyan-500 hover:text-cyan-400 transition-colors w-max">
                      Read More <ArrowRight size={14} className="md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}

          </div>
        )}
      </div>

    </div>
  );
}