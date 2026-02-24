import React from 'react';

const Brands = () => {
  // Brand definitions matching the exact hover colors seen in the video
  const coreBrands = [
    {
      name: 'Microsoft',
      icon: (
        <svg className="w-8 h-8 lg:w-10 lg:h-10" viewBox="0 0 24 24" fill="currentColor">
          <path className="group-hover:text-[#f35325] transition-colors duration-300" d="M11.4 11.4H0V0h11.4v11.4z" />
          <path className="group-hover:text-[#81bc06] transition-colors duration-300" d="M24 11.4H12.6V0H24v11.4z" />
          <path className="group-hover:text-[#05a6f0] transition-colors duration-300" d="M11.4 24H0V12.6h11.4V24z" />
          <path className="group-hover:text-[#ffba08] transition-colors duration-300" d="M24 24H12.6V12.6H24V24z" />
        </svg>
      )
    },
    {
      name: 'Adobe',
      icon: (
        <svg className="w-8 h-8 lg:w-10 lg:h-10 group-hover:text-[#FF0000] transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.474 4.028l7.636 15.944h-4.881l-1.996-4.578h-6.19l4.542-11.366h.889zm-4.329 11.366l3.095-7.755 3.095 7.755h-6.19zM1.89 19.972l7.636-15.944h.889l-4.542 11.366h-6.19l1.996 4.578h.211z" />
        </svg>
      )
    },
    {
      name: 'airbnb',
      icon: (
        <svg className="w-8 h-8 lg:w-10 lg:h-10 group-hover:text-[#FF5A5F] transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 13.5l-8.5-9.1a4.62 4.62 0 00-6.12 0L-.56 13.5a1.86 1.86 0 00-.54 1.34A1.94 1.94 0 00.83 16.8a1.9 1.9 0 001.42-.6L11 6.3a1.44 1.44 0 012 0l8.75 9.9a1.9 1.9 0 001.42.6 1.94 1.94 0 001.93-1.96 1.86 1.86 0 00-.54-1.34z" />
        </svg>
      )
    },
    {
      name: 'Stripe',
      icon: null // Stripe uses its wordmark as the logo in the video
    }
  ];

  return (
    <section className="bg-slate-900 py-24 border-b border-slate-800 overflow-hidden">
      
      {/* This is the flawless marquee animation CSS. 
        It uses 100% translation to create a seamless, non-stop loop. 
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scrollMarquee {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
          }
          .animate-marquee {
            display: flex;
            min-width: 100%;
            flex-shrink: 0;
            animation: scrollMarquee 20s linear infinite;
          }
        `
      }} />

      {/* Heading matching the video */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
          Trusted by brands you know
        </h2>
      </div>
      
      {/* Full-width marquee container */}
      <div className="relative w-full flex overflow-hidden">
        
        {/* Edge Fade Effects */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>

        {/* First Marquee Track */}
        <div className="animate-marquee items-center justify-around gap-16 lg:gap-32 pr-16 lg:pr-32">
          {coreBrands.map((brand, index) => (
            <div 
              key={`track1-${index}`}
              className="group flex items-center gap-3 text-slate-500 cursor-pointer transition-all duration-300"
            >
              {brand.icon && (
                <div className="text-slate-500 transition-colors duration-300">
                  {brand.icon}
                </div>
              )}
              {/* Text turns white on hover, except Stripe which turns Blurple */}
              <span className={`text-2xl lg:text-3xl font-bold tracking-tight transition-colors duration-300 ${brand.name === 'Stripe' ? 'group-hover:text-[#635BFF]' : 'group-hover:text-white'}`}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>

        {/* Second Marquee Track (Follows exactly behind the first one to create the infinite loop) */}
        <div className="animate-marquee items-center justify-around gap-16 lg:gap-32 pr-16 lg:pr-32" aria-hidden="true">
          {coreBrands.map((brand, index) => (
            <div 
              key={`track2-${index}`}
              className="group flex items-center gap-3 text-slate-500 cursor-pointer transition-all duration-300"
            >
              {brand.icon && (
                <div className="text-slate-500 transition-colors duration-300">
                  {brand.icon}
                </div>
              )}
              <span className={`text-2xl lg:text-3xl font-bold tracking-tight transition-colors duration-300 ${brand.name === 'Stripe' ? 'group-hover:text-[#635BFF]' : 'group-hover:text-white'}`}>
                {brand.name}
              </span>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default Brands;