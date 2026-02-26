import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-slate-900 text-white w-full border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center font-bold text-slate-900 text-2xl">
              SC
            </div>
            <span className="font-bold text-2xl tracking-tight">Sentinel Cloud</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-10">
            <Link href="#about" className="text-slate-300 hover:text-cyan-400 transition-colors text-base font-medium">About us</Link>
            {/* <a href="#pricing" className="text-slate-300 hover:text-cyan-400 transition-colors text-base font-medium">Pricing</a> */}
            <Link href="#solutions" className="text-slate-300 hover:text-cyan-400 transition-colors text-base font-medium">Solutions</Link>
            <Link href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors text-base font-medium">Features</Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/login"
              button className="text-slate-300 hover:text-white font-medium">Log in</Link>
            <Link href="/Signup"
              button className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Get started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;