import React from 'react';

const BlogSection = () => {
  return (
    <section className="bg-slate-900 py-24 border-t border-slate-800" id="blog">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Read our articles ✨
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl">
              Latest news, tips, and best practices.
            </p>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-indigo-500/50 transition-colors duration-300 group">
              {/* Image Placeholder */}
              <div className="aspect-video bg-slate-700 relative overflow-hidden flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-300"></div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  Article {item}
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab, explicabo! Voluptatem cupiditate.
                </p>
                <a href="#read" className="text-indigo-400 font-medium hover:text-indigo-300 flex items-center gap-1 transition-colors">
                  Learn more 
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default BlogSection;