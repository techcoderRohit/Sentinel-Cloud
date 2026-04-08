"use client";

import React from 'react';
import { Target, Zap, Shield, Code, Cpu, Server, Github, Linkedin, Twitter } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-[#03060D] text-slate-300 font-sans overflow-x-hidden">
      
      {/* ========================================= */}
      {/* 1. HERO SECTION (Main Heading)            */}
      {/* ========================================= */}
      <div className="relative pt-32 pb-20 px-6 lg:px-8 border-b border-slate-800/50">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs md:text-sm mb-4 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full inline-block">
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Building the Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Connected Edge IoT</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Sentinel Cloud was born out of a simple idea: Industrial IoT shouldn't be complicated. 
            We are building a platform that makes sensor data routing, management, and analysis 
            seamless, secure, and lightning fast.
          </p>
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. OUR VISION & VALUES (3 Cards)          */}
      {/* ========================================= */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why We Built Sentinel</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Focusing on performance, security, and next-gen AI integration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-[#0F172A] border border-slate-800 p-8 rounded-2xl hover:border-cyan-500/50 transition-all group">
            <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="text-cyan-400 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We optimized our MQTT brokers to handle thousands of requests per second with zero latency.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0F172A] border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all group relative overflow-hidden">
             {/* Highlight effect for the middle card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px]"></div>
            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="text-blue-400 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Powered by Gemini AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upgraded from traditional TensorFlow models to the Gemini API for highly intelligent and instant anomaly detection.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0F172A] border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-all group">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="text-emerald-400 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Role-Based Access Control (RBAC) and rotating API keys ensure your node data is never compromised.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. THE FOUNDERS SECTION (Team)            */}
      {/* ========================================= */}
      <div className="bg-[#0B1120] border-y border-slate-800/50 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet the Brains Behind Sentinel</h2>
            <p className="text-slate-400 max-w-xl mx-auto">A small but highly passionate team of developers.</p>
          </div>

          {/* Team Grid (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            
            {/* Founder 1: Samir Ansari */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 mb-6 flex items-center justify-center border-4 border-[#03060D] shadow-xl">
                 <span className="text-4xl font-black text-white">SA</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Samir Ansari</h3>
              <p className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-4">Co-Founder & DevOps Engineer</p>
              <p className="text-slate-400 text-sm mb-6 px-4">
                BCA Student with a strong passion for DevOps and the MERN stack. Samir focuses on the system architecture, routing logic, and ensuring cloud operations run flawlessly.
              </p>
              {/* Social Icons */}
              <div className="flex gap-4 mt-auto">
                <button className="text-slate-500 hover:text-white transition-colors"><Github size={20} /></button>
                <button className="text-slate-500 hover:text-[#0A66C2] transition-colors"><Linkedin size={20} /></button>
              </div>
            </div>

            {/* Founder 2: Rohit Modi */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 mb-6 flex items-center justify-center border-4 border-[#03060D] shadow-xl">
                 <span className="text-4xl font-black text-white">RM</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Rohit Modi</h3>
              <p className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-4">Co-Founder & IoT Lead</p>
              <p className="text-slate-400 text-sm mb-6 px-4">
                Driving the hardware-to-cloud communication. Rohit specializes in edge nodes, IoT sensor arrays, and product vision for the Sentinel platform.
              </p>
              {/* Social Icons */}
              <div className="flex gap-4 mt-auto">
                <button className="text-slate-500 hover:text-white transition-colors"><Github size={20} /></button>
                <button className="text-slate-500 hover:text-[#0A66C2] transition-colors"><Linkedin size={20} /></button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 4. TECH STACK SECTION                     */}
      {/* ========================================= */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Powered by Modern Technology</h2>
        
        {/* Tech Badges */}
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Gemini API', 'Next.js', 'Tailwind CSS', 'MQTT Protocol'].map((tech, index) => (
            <div key={index} className="px-5 py-2.5 bg-[#0F172A] border border-slate-700 rounded-xl flex items-center gap-2 text-slate-300 font-medium hover:border-cyan-500 transition-colors cursor-default">
              <Code size={16} className="text-cyan-500" /> {tech}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}