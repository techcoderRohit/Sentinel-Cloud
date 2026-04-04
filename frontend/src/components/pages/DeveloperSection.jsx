import React from 'react';
import { motion } from 'framer-motion';

const codeSnippet = `
// Initialize Sentinel Cloud Client
import { SentinelClient } from '@sentinel/sdk';

const client = new SentinelClient({
  apiKey: process.env.SENTINEL_API_KEY,
  deviceId: 'factory-pump-001',
  region: 'us-east-1'
});

// Establish secure MQTT connection
await client.connect();

// Publish telemetry data
client.publish('sensors/temperature', {
  value: 24.5,
  unit: 'C',
  timestamp: Date.now()
});

console.log('Telemetry sent successfully.');
`;

const DeveloperSection = () => {
  return (
    <section id="developers" className="py-24 bg-[#0b0f1a] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text Content */}
          <motion.div className='text-center lg:text-left'
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Loved by Developers. <br /><span className="text-cyan-500"> Built for Speed.</span> 
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-lg">
              We handle the backend complexity—MQTT brokers, security, OTA updates, and data persistence—so you can focus on building your actual product. SDKs available for Python, Node.js, C++, and Go.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button className="px-6 py-2.5 w-full sm:w-auto rounded-lg border border-slate-700 text-white font-medium hover:border-cyan-500 hover:bg-slate-800 transition-all">
                View API Docs
              </button>
              <button className="px-6 py-2.5 w-full sm:w-auto rounded-lg border border-slate-700 text-white font-medium hover:border-blue-500 hover:bg-slate-800 transition-all">
                Example Projects
              </button>
            </div>
          </motion.div>

          {/* Right: Mock Terminal Window */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-full bg-[#0F172A] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-sm"
          >
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#111827] border-b border-slate-800">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]"></div> {/* Close */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]"></div> {/* Minimize */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F]"></div> {/* Maximize */}
              <span className="text-slate-500 text-xs ml-4">sentinel-connection.js</span>
            </div>
            
            {/* Terminal Body with Code */}
            <div className="p-4 md:p-6 text-slate-300 overflow-x-auto">
              <pre>
                <code>
                  {codeSnippet.split('\n').map((line, i) => (
                    <div key={i} className="table-row">
                      <span className="table-cell text-slate-600 text-right pr-4 select-none w-8">{i + 1}</span>
                      <span className="table-cell whitespace-pre">
                        {/* Basic manual syntax highlighting */}
                        {line.startsWith('//') ? <span className="text-slate-500">{line}</span> : 
                         line.startsWith('import') ? <span className="text-purple-400">{line}</span> :
                         line.includes('apiKey') ? <span className="text-emerald-400">{line}</span> :
                         line.includes('console.log') ? <span className="text-cyan-400">{line}</span> :
                         line}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;