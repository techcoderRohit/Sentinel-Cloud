"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-slate-950/95 backdrop-blur-md shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className="px-6 md:px-20 h-18 md:h-22 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-2">
          {/*<img className='w-14 h-14 rounded-full ' src="/images/logo.jpeg" alt="logo"  />*/}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-2">
            <span className="text-white font-bold">SC</span>
          </div>
          <Link href="/" className="text-2xl font-bold text-white">
            Sentinel <span className=" text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Cloud</span>
          </Link>
        </div>
        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-slate-300 hover:text-cyan-500 hover:underline hover:underline-offset-10 transition">
            Features
          </Link>
          <Link href="/dashboard" className=" text-slate-300 hover:text-cyan-500 hover:underline hover:underline-offset-10 transition">
            Dashboard
          </Link>
          <Link href="#alerts" className=" text-slate-300 hover:text-cyan-500 hover:underline hover:underline-offset-10 transition">
            Alerts
          </Link>
          <Link href="#Contact" className=" text-slate-300 hover:text-cyan-500 hover:underline hover:underline-offset-10 transition">
            Contact
          </Link>
        </div>

        {/* DESKTOP BUTTONS */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/login">
            <button className="px-5 py-2 hover:border hover:text-cyan-500 hover:border-cyan-500 rounded-lg transition">
              Login</button>
          </Link>
          <Link
            href="/auth/Signup"
            className="px-5 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition"
          >
            Get Started
          </Link>
        </div>

        {/* MOBILE MENU ICON */}
        <div className="md:hidden text-white">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-md shadow-lg px-6 pb-6 pt-4 space-y-4 ">

          <Link href="#features" className="block text-slate-300 hover:text-cyan-500">
            Home
          </Link>
          <Link href="#features" className="block text-slate-300 hover:text-cyan-500">
            Features
          </Link>
          <Link href="#monitoring" className="block text-slate-300 hover:text-cyan-500">
            Monitoring
          </Link>
          <Link href="#alerts" className="block text-slate-300 hover:text-cyan-500">
            Alerts
          </Link>
          <Link href="#Contact" className="block text-slate-300 hover:text-cyan-500">
            Contact
          </Link>

          <div className="pt-4 flex flex-col gap-3">
            <Link href="/auth/login"
              className="px-5 py-2 border border-slate-300 hover:border-cyan-500 hover:text-cyan-500 rounded-lg text-center">
              Login

            </Link>
            <Link
              href="/auth/Signup"
              className="px-5 py-2 bg-linear-to-r from-cyan-500 to-blue-500 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}