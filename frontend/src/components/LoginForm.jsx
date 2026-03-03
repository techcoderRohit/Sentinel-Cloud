import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b1120] px-4 py-8">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-cyan-400">Welcome Back </h2>
          <p className="text-slate-500 mt-2">Login to Sentinal Cloud account</p>
        </div>

        <form className="space-y-5">
          <div>
            <label className=" text-slate-300 mb-2">Email</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                <Mail className='text-cyan-500 size={18}'/>
            <input 
              type="email" 
              placeholder="Enter your Email"
              className="w-full px-4 py-2 text-white placeholder-slate-400 outline-none" 
            />
            </div>
            </div>
          <div>
            <label className=" text-slate-300 mb-2">Password</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200'>
                <Lock className='text-cyan-500 size={18}'/>
                <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full px-4 py-2 text-white placeholder-slate-400 outline-none " 
            />
            </div>
            
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2 rounded text-indigo-600 focus:ring-indigo-700" 
              />
              <span className="text-slate-500">Remember me</span>
            </label>
            <Link href="#" className="text-cyan-400 hover:text-cyan-500 hover:underline text-sm">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit"
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl">
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? 
          <Link href="/Signup" className="text-cyan-400 ml-2 font-semibold hover:text-cyan-500 hover:underline">Signup</Link>
        </div>
      </div>
    </div>
  );
}