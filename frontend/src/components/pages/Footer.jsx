import React from 'react';
import Link from 'next/link'; // 👈 Naya Import

// --- Footer Section ---
// 👈 YAHAN CHANGE HAI: Ab har link ke paas apna 'name' aur 'url' hai
const footerLinks = [
  { 
    title: 'Product', 
    links: [
      { name: 'Features', url: '/#features' }, 
      { name: 'Pricing', url: '/#pricing' }, 
      { name: 'Dashboard', url: '/dashboard' }, // Aapka dashboard
      { name: 'Devices', url: '/dashboard/devices' } // Devices page
    ] 
  },
  { 
    title: 'Resources', 
    links: [
      { name: 'Documentation', url: '/docs' }, 
      { name: 'API Reference', url: '/api-reference' }, 
      { name: 'Blog', url: '/NavBar/blog' }, // 👈 Aapka naya banaya hua Blog page
      { name: 'Community Forum', url: '/forum' }
    ] 
  },
  { 
    title: 'Company', 
    links: [
      { name: 'About Us', url: '/NavBar/about' }, // 👈 Aapka naya banaya hua About page
      { name: 'Contact', url: '/#Contact' }, 
      { name: 'Privacy Policy', url: '/Footer/privacyview' }, 
      { name: 'Terms of Service', url: '/#Footer/terms' }
    ] 
  },
];

const Footer = () => {
  return (
    <footer id="company" className="py-16 bg-[#0b0f1a] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 mb-12">

          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-2 shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
                <span className="text-white text-md lg:text-2xl tracking-tighter font-bold">SC</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                Sentinel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Cloud</span>
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
                  <li key={link.name}>
                    {/* 👈 YAHAN CHANGE HAI: <a> ki jagah <Link href={...}> lagaya hai */}
                    <Link href={link.url} className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                      {link.name}
                    </Link>
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
            {/* Social Links (Inhe bhi external websites par link kar sakte hain) */}
            {[
              { name: 'GitHub', url: 'https://github.com' }, 
              { name: 'Twitter', url: 'https://twitter.com' }, 
              { name: 'LinkedIn', url: 'https://linkedin.com' }
            ].map(social => (
              <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm">
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;