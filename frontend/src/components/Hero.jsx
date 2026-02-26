import React from 'react';

const Hero = () => {
  return (
    <section className="bg-slate-950 text-white pt-28 pb-20 overflow-hidden text-center relative">
      
      {/* Custom CSS for the glowing orb animation moving left and right */}
      <style>
        {`
          @keyframes panGlow {
            0% { transform: translate(-80%, -50%); }
            50% { transform: translate(-20%, -50%); }
            100% { transform: translate(-80%, -50%); }
          }
          .animate-pan-glow {
            animation: panGlow 8s ease-in-out infinite;
          }
        `}
      </style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Headline */}
        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight uppercase">
          Connect more <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            with Sentinel Cloud
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit.<br className="hidden sm:block" />
          Lorem ipsum dolor sit amet.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-20">
          <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 hover:scale-95 text-slate-900 px-6 py-3 rounded-lg font-bold text-lg transition-all">
            Get started
          </button>
          
          <button className="flex items-center gap-3 text-white hover:text-cyan-400 hover:border-1 hover:scale-95 px-6 py-3 rounded-lg hover:border-white font-medium text-lg transition-all">
            {/* The small circle icon next to Learn More */}
            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-cyan-500">
               <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            Live Demo
          </button>
        </div>

        {/* Desktop Dashboard Mockup Container */}
        <div className="relative mx-auto w-full max-w-5xl">

          {/* Animated Glow Effect Behind Dashboard (Reverted to Cyan) */}
          <div className="absolute top-1/2 left-1/2 w-[60%] h-[70%] bg-cyan-500/20 blur-[120px] rounded-full z-0 animate-pan-glow pointer-events-none"></div>

          {/* Dashboard Image Box */}
          <div className="rounded-xl border border-slate-700 bg-slate-800 shadow-2xl overflow-hidden aspect-[16/9] flex flex-col relative z-10">
            <div className="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
               
               {/* NOTE: Replace the src below with your actual dashboard image from the public folder */}
               <img
                 src="/dashboard-image.png" 
                 alt="Dashboard Interface"
                 className="w-full h-full object-cover"
               />
               
            
               
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;