const Testimonials = () => {
  return (
    <section className="bg-slate-950 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
            You're in good hands
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            See what other developers and founders are saying about SaaSy.
          </p>
        </div>

        {/* PC Masonry-style Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          
          {[
            { name: "Trich B", role: "CEO at AMI", quote: "This template saved us weeks of development time. The code is incredibly clean and easy to customize." },
            { name: "John Doe", role: "CTO at TechCorp", quote: "The integration with Next.js is flawless. Highly recommend to anyone building a modern SaaS." },
            { name: "Sarah L", role: "Founder", quote: "Absolutely beautiful design. The dark mode implementation is spot on and my users love it." },
            { name: "Mike R", role: "Lead Engineer", quote: "I was skeptical at first, but the component structure is exactly how I would have built it myself." },
            { name: "Elena V", role: "Product Manager", quote: "Allowed us to launch our MVP in record time. Best investment we made this year." },
            { name: "David K", role: "Freelancer", quote: "I use this as the base for all my client projects now. The cyan highlights really make the UI pop." }
          ].map((testimonial, idx) => (
            <div key={idx} className="break-inside-avoid bg-slate-800/50 rounded-3xl p-8 border border-slate-700 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-cyan-400 flex items-center justify-center text-slate-900 font-bold text-xl">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-cyan-400 text-sm font-medium">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed italic">
                "{testimonial.quote}"
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Testimonials;