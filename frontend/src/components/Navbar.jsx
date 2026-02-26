import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-slate-950 text-white w-full border-b border-slate-800 top-0 z-50 sticky">
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-slate-900 text-2xl">
              SC
            </div>
            <span className="font-bold text-2xl">Sentinel Cloud</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-10">
            <Link href="#about" className="text-slate-300 hover:text-cyan-400 hover:underline cursor-pointer ">About us</Link>
            {/* <a href="#pricing" className="text-slate-300 hover:text-cyan-400 hover:underline cursor-pointer ">Pricing</a> */}
            <Link href="#solutions" className="text-slate-300 hover:text-cyan-400 hover:underline cursor-pointer ">Solutions</Link>
            <Link href="#features" className="text-slate-300 hover:text-cyan-400 hover:underline hover:underline-offset-0 cursor-pointer ">Features</Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="text-slate-300 hover:text-white font-medium">Log in</button>
            <button className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Get started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;