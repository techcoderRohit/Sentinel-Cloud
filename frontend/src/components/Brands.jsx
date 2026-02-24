import React from 'react';

const Brands = () => {
  return (
    <section className="bg-slate-900 py-12 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">
          Trusted by brands you know
        </p>
        
        {/* Brand Logos Grid */}
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
          {/* Google Placeholder */}
          <div className="text-slate-500 opacity-60 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 cursor-pointer">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            <span className="text-xl font-bold tracking-tight">Google</span>
          </div>

          {/* Microsoft Placeholder */}
          <div className="text-slate-500 opacity-60 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 cursor-pointer">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
            </svg>
            <span className="text-xl font-bold tracking-tight">Microsoft</span>
          </div>

          {/* Adobe Placeholder 1 */}
          <div className="text-slate-500 opacity-60 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 cursor-pointer">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.474 4.028l7.636 15.944h-4.881l-1.996-4.578h-6.19l4.542-11.366h.889zm-4.329 11.366l3.095-7.755 3.095 7.755h-6.19zM1.89 19.972l7.636-15.944h.889l-4.542 11.366h-6.19l1.996 4.578h.211z" />
            </svg>
            <span className="text-xl font-bold tracking-tight">Adobe</span>
          </div>

          {/* Adobe Placeholder 2 (Repeated per instructions) */}
          <div className="text-slate-500 opacity-60 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 cursor-pointer hidden sm:flex">
             <span className="text-xl font-bold tracking-tight">Adobe</span>
          </div>
          
          {/* Adobe Placeholder 3 */}
          <div className="text-slate-500 opacity-60 hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 cursor-pointer hidden md:flex">
             <span className="text-xl font-bold tracking-tight">Adobe</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Brands;