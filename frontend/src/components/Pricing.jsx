import React from 'react';

const Pricing = () => {
  return (
    <section className="bg-slate-900 py-24 border-t border-slate-800" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple pricing
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your project. No hidden fees.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          
          {/* Tier 1: Basic */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col h-full">
            <h3 className="text-xl font-semibold text-white mb-2">Basic</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-white">$9</span>
              <span className="text-slate-400">/mo</span>
            </div>
            <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-700">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab, explicabo!
            </p>
            <ul className="space-y-4 mb-8 flex-1">
              {['Lorem ipsum dolor sit amet.', 'Lorem, ipsum.', 'Lorem, ipsum dolor.'].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors mt-auto">
              Get now
            </button>
          </div>

          {/* Tier 2: Pro (Highlighted) */}
          <div className="bg-slate-800 rounded-2xl p-8 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 flex flex-col h-full relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-white">$19</span>
              <span className="text-slate-400">/mo</span>
            </div>
             <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-700">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab, explicabo!
            </p>
            <ul className="space-y-4 mb-8 flex-1">
               {['Lorem ipsum dolor sit amet.', 'Lorem, ipsum.', 'Lorem, ipsum dolor.', 'Lorem ipsum dolor sit.'].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors mt-auto">
              Get now
            </button>
          </div>

          {/* Tier 3: Enterprise */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col h-full">
            <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-white">$49</span>
              <span className="text-slate-400">/mo</span>
            </div>
            <p className="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-700">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab, explicabo!
            </p>
            <ul className="space-y-4 mb-8 flex-1">
              {['Lorem ipsum dolor sit amet.', 'Lorem, ipsum.', 'Lorem, ipsum dolor.', 'Lorem ipsum dolor sit.'].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors mt-auto">
              Get now
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;