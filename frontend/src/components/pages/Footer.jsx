import React from 'react';
import { motion } from 'framer-motion';

// --- Footer Section ---
const footerLinks = [
  { title: 'Product', links: ['Features', 'Pricing', 'Hardware Compatibility', 'Changelog'] },
  { title: 'Resources', links: ['Documentation', 'API Reference', 'Community Forum', 'Status'] },
  { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'] },
];

const Footer = () => {
  return (
    <footer id="company" className="py-16 bg-[#0b0f1a] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 mb-12">

          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">

              {/*<img className='w-15 h-15 rounded-full bg-transparent' src="/images/logo.jpeg" alt="logo" />*/}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-2">
                <span className="text-white font-bold">SC</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                Sentinel <span className=" text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Cloud</span>
              </h1>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-xs">
              Powering the connected world with secure, scalable IoT infrastructure. Build fast, deploy globally.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-5">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <p className="text-slate-600 text-sm">
            &copy; 2026 Sentinel Cloud. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-slate-500">
            {['GitHub', 'Twitter', 'LinkedIn'].map(social => (
              <a key={social} href="#" className="hover:text-white transition-colors text-sm">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;