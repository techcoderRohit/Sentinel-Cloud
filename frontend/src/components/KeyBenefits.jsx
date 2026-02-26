const KeyBenefits = () => {
  return (
    <section className="bg-slate-950 py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">Key benefits</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Everything you need to launch faster.
          </p>
        </div>

        {/* PC 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div className="bg-slate-900/50 rounded-3xl p-10 border border-slate-700 hover:border-cyan-400/50 transition-all">
            <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center mb-8">
              <span className="text-cyan-400 text-2xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Minimize hours spent</h3>
            <p className="text-slate-400 text-lg leading-relaxed">Stop building from scratch. Use our pre-built components to get your app running in days.</p>
          </div>

          <div className="bg-slate-900/50 rounded-3xl p-10 border border-slate-700 hover:border-cyan-400/50 transition-all">
            <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center mb-8">
              <span className="text-cyan-400 text-2xl">⚡</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Simple to use</h3>
            <p className="text-slate-400 text-lg leading-relaxed">Clean code, comprehensive documentation, and modern tooling make customization a breeze.</p>
          </div>

          <div className="bg-slate-900/50 rounded-3xl p-10 border border-slate-700 hover:border-cyan-400/50 transition-all">
            <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center mb-8">
              <span className="text-cyan-400 text-2xl">📈</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Speed up development</h3>
            <p className="text-slate-400 text-lg leading-relaxed">Focus on your business logic while we handle the foundation and UI components.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default KeyBenefits;