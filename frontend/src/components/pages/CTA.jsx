import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// --- CTA Section ---
const CTA = () => {
  return (
    <section className="py-16 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full p-12 md:p-16 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Deploy Your <br className="hidden md:block" /> Next IoT Project?
            </h2>
            <p className="text-cyan-100/90 text-lg max-w-lg">
              Join the developers and innovative teams building the future of connected devices on Sentinel Cloud.
            </p>
          </div>
          <Link href='/Signup'>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 px-8 py-4 rounded-xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-all shadow-xl"
          >
            Create Your Free Account
          </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// We export both in one file for CTA/Footer management, or you can split them.
export default CTA;