const Hero = () => {
  return (
    <section className="bg-slate-900 text-white pt-28 pb-20 overflow-hidden text-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="inline-block bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 mb-8">
          <span className="text-sm font-medium text-slate-300">✨ Cloud Servises for IoT</span>
        </div>

        <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
          Connect more <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            with Sentinel Cloud
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12">
          Build your next project faster with our beautiful, responsive, and customizable Dashboard. Designed for modern startups.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
          <button className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            Get started for free
          </button>
          <button className="bg-transparent border-2 border-slate-700 hover:border-cyan-400 hover:text-cyan-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all">
            Explore more
          </button>
        </div>

        {/* Desktop Dashboard Mockup */}
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl overflow-hidden aspect-video flex flex-col relative z-10">
            {/* Window bar */}
            <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            {/* Dashboard Content Placeholder */}
            <div className="flex-1 flex items-center justify-center bg-slate-800">
              <span className="text-slate-500 font-mono text-xl">Dashboard Interface Placeholder</span>
            </div>
          </div>
          {/* Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-cyan-500/20 blur-[120px] rounded-full z-0"></div>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;