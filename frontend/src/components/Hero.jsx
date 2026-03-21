import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';


const Hero = () => {
  // Animation variants for staggered loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative min-h-screen bg-[#0B1120] flex items-center justify-center overflow-hidden pt-16">
      
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <motion.div 
        className="relative z-10 max-w-6xl mx-auto py-12 px-4 sm:px-8 md:px-16 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Beta Badge */}
        <motion.div variants={itemVariants} className="mb-8 flex justify-center">
          <span className="px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-500 text-sm md:text-md font-medium flex items-center gap-2 backdrop-blur-sm">
            🚀 Now in Beta: The Next Generation of IoT Infrastructure
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Smart IoT Monitoring <br className="hidden md:block" />
          <span className="text-transparent lg:text-6xl bg-clip-text bg-linear-to-r from-cyan-500 to-blue-500">
           with Secure Cloud Intelligence
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p variants={itemVariants} className="mt-4 text-sm sm:text-base md:text-lg text-slate-300 max-w-4xl mx-auto mb-10 leading-relaxed">
          Monitor your IoT devices in real-time with Sentinel Cloud. Track Temperature, humidity and gas levels securely from anywhere using our scalable cloud-based platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center mt-6">
        <Link href='/auth/Signup'>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-lg transition-all"
            
          >
            Get Started
          </motion.button>
          </Link>
          
          {/* <Link href= '/dashboard'> */}
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(30, 41, 59, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className=" w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-600 text-white font-medium text-lg hover:border-cyan-500 transition-all backdrop-blur-sm"
          >
            Live Dashboard
          </motion.button>
          {/* </Link> */}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;