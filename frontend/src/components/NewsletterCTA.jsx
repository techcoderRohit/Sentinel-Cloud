'use client'
import React from 'react';

const NewsletterCTA = () => {
  return (
    <section className="bg-slate-950 py-16 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-3xl p-8 md:p-12 border border-indigo-500/20 text-center relative overflow-hidden">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Join our newsletter
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum, voluptatibus.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-slate-800 border border-slate-700 text-white px-5 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500"
                required
              />
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                Signup
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA;