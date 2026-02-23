import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 px-4 py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Login to your Sentinel Cloud account</p>
        </div>
        
        <form className="space-y-5">
          <div>
            <label className=" text-slate-700 mb-2">Email</label>
            <div className='flex items-center border border-slate-300 rounded-lg mt-2 px-2 focus-within:ring-1 focus-within:ring-teal-400 transition duration-200 '>
                <Mail className='text-slate-400 size={18}'/>
            <input 
              type="email" 
              placeholder="Enter your Email"
              className="w-full px-4 py-2 text-slate-900 outline-none " 
            />
            </div>
            </div>
          <div>
            <label className="block text-slate-700 mb-2">Password</label>
            <div className='flex items-center border border-slate-300 rounded-lg mt-2 px-2 focus-within:ring-1 focus-within:ring-teal-400 transition duration-200'>
                <Lock className='text-slate-400 size={18}'/>
                <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full px-4 py-2 text-slate-900 outline-none " 
            />
            </div>
            
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2 rounded text-blue-600 focus:ring-blue-700" 
              />
              <span className="text-slate-600">Remember me</span>
            </label>
            <Link href="#" className="text-indigo-500 hover:text-indigo-800 hover:underline text-sm">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit"
            className="w-full px-4 py-2 bg-teal-600 text-white font-bold rounded-md hover:bg-teal-800 transition shadow-sm">
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Don't have an account? 
          <Link href="/Signup" className="text-indigo-600 font-medium hover:text-indigo-800 hover:underline">  Signup</Link>
        </div>
      </div>
    </div>
  );
}