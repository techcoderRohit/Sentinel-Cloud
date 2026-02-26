const Footer = () => {
  return (
    <footer className="bg-slate-950 pt-24 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Desktop 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center font-bold text-slate-900 text-2xl">S</div>
              <span className="font-bold text-2xl text-white">Sentinel Cloud</span>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed mb-6 max-w-sm">
              Building the future of IoT development with powerful, easy-to-use cloud.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500">© 2026 SaaSy Inc. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;