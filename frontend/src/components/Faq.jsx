import React from 'react';

const Faq = () => {
  return (
    <section className="bg-slate-900 py-24 border-t border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Faq</h2>
          <p className="text-lg text-slate-400">Common questions about the template.</p>
        </div>

        {/* Native HTML5 Accordion using details/summary */}
        <div className="space-y-4">
          
          <details className="group bg-slate-800 rounded-xl border border-slate-700 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-white font-medium">
              <h3 className="text-lg">What license are the source code?</h3>
              <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-slate-400">
              <p>All the templates are under MIT license.</p>
            </div>
          </details>

          <details className="group bg-slate-800 rounded-xl border border-slate-700 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-white font-medium">
              <h3 className="text-lg">Can I request new templates?</h3>
              <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-slate-400">
              <p>You can request a generic template from Github template request. If you are looking for Custom design you should contact here.</p>
            </div>
          </details>

          <details className="group bg-slate-800 rounded-xl border border-slate-700 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-white font-medium">
              <h3 className="text-lg">I need a custom template?</h3>
              <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-slate-400">
              <p>If you are looking for Custom design you can contact here.</p>
            </div>
          </details>

          <details className="group bg-slate-800 rounded-xl border border-slate-700 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-white font-medium">
              <h3 className="text-lg">Will you add new templates?</h3>
              <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-slate-400">
              <p>New templates are added every Friday. So star ⭐️ Github.</p>
            </div>
          </details>

        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-2">Still have questions?</h3>
          <p className="text-slate-400 mb-6">We're here to help you out.</p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Contact
          </button>
        </div>

      </div>
    </section>
  );
};

export default Faq;