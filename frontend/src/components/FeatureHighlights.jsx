const FeatureHighlights = () => {
  return (
    <section className="bg-slate-900 py-32 overflow-hidden border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-40">
        
        {/* Row 1: Text Left, Image Right */}
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">Simple to use plugins</h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Integrate powerful AI and automation tools directly into your workflow with zero configuration.
            </p>
            <ul className="space-y-6">
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400">✓</div>
                <span className="text-lg text-white font-medium">AI powered code generation</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400">✓</div>
                <span className="text-lg text-white font-medium">Locally run models for privacy</span>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 aspect-video flex items-center justify-center shadow-2xl relative">
              <span className="text-slate-500">App Interface Placeholder</span>
              <div className="absolute -z-10 w-full h-full bg-cyan-400/20 blur-[100px] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Row 2: Image Left, Text Right */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 aspect-video flex items-center justify-center shadow-2xl relative">
              <span className="text-slate-500">Analytics Dashboard Placeholder</span>
               <div className="absolute -z-10 w-full h-full bg-blue-500/20 blur-[100px] rounded-full"></div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">Powerful Insights</h2>
            <div className="space-y-10 mt-10">
              <div>
                <h4 className="text-2xl font-bold text-white mb-3">Easy to use</h4>
                <p className="text-slate-400 text-lg">Detailed analytics tracking to help you understand your users and grow your business.</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-3">All in one panel</h4>
                <p className="text-slate-400 text-lg">Monitor everything from a single, centralized dashboard without switching tools.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeatureHighlights;