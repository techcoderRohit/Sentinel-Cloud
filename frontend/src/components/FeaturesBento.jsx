import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Real-Time Data Monitoring',
    description: 'Monitor Temperature, humidity, and gas sensor data live from connected IoT devices with instant cloud synchronization.',
    icon: '📡', // You can replace these with actual SVG icons later
    
  },
  {
    title: 'Secure Cloud Storage',
    description: 'All sensor data is securely stored in cloud database using encrypted communication and authenticated APIs.',
    icon: '☁',
    
  },
  {
    title: 'Intelligent Alert System',
    description: 'Set threshold values and receive automatic alerts when environmental conditions exceed safe limits',
    icon: '🚨',
    
  },
  {
    title: 'Custom Dashboards',
    description: 'Drag-and-drop widgets to create beautiful data visualizations. Turn raw telemetry into actionable intelligence.',
    icon: '📊',

  },
  {
    title: 'Device Management',
    description: 'Add, remove and manage multiple IoT devices with real-time online/offline status tracking.',
    icon: '📟',

  },
  {
    title :'Scalable Architechture',
    description: 'Designed with secure authentication and cloud-ready architechture to support multiple users and devices.',
    icon: '🔐',

  }
];

const FeaturesBento = () => {
  return (
    <section id="features" className="py-24 bg-[#0B1120] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powerful Features Built for Smart Monitoring
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From prototype to production, Sentinel Cloud provides the infrastructure so you can focus on your product.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`p-8 rounded-2xl bg-slate-800/40 border border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group ${feature.colSpan}`}
            >
              <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl mb-6 group-hover:border-cyan-500/50 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesBento;