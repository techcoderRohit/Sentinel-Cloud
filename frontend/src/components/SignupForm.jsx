import Link from 'next/link';
import { User, Mail , Lock } from 'lucide-react';
export default function Signup() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-lg border border-slate-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-cyan-400">Create an Account</h2>
          <p className="text-slate-500 mt-2">Start monitoring and managing your IoT devices</p>
        </div>
        
        <form className="space-y-5">
          <div>
            <label className=" text-slate-300 mb-2">Full Name</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                <User className='text-cyan-500 size={18}'/>
            <input 
              type="text" 
              placeholder="Enter your name"
              className="w-full px-4 py-2 text-white placeholder-slate-400 outline-none " 
            />
            </div>
            </div>
            <div>
            <label className=" text-slate-300 mb-2">Email</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                <Mail className='text-cyan-500 size={18}'/>
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full px-4 py-2 text-white placeholder-slate-400 outline-none " 
            />
            </div>
            </div>
            <div>
            <label className=" text-slate-300 mb-2">Password</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                <Lock className='text-cyan-500 size={18}'/>
            <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full px-4 py-2 text-white placeholder-slate-400 outline-none " 
            />
            </div>
            </div>
            <div>
            <label className=" text-slate-300 mb-2">Confirm Password</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-2 px-2 focus-within:ring-1 focus-within:ring-cyan-500 transition duration-200 '>
                <Lock className='text-cyan-500 size={18}'/>
            <input 
              type="password" 
              placeholder="Enter your confirm password"
              className="w-full px-4 py-2 text-white placeholder-slate-400 outline-none " 
            />
            </div>
            </div>
          <div className="flex items-start">
            <input 
              type="checkbox" 
              id="terms" 
              className="mt-1 mr-2 rounded text-indigo-600 focus:ring-indigo-500" 
            />
            <label htmlFor="terms" className="text-sm text-slate-500">
              I agree to the <Link href="/" className="text-cyan-400 hover:text-cyan-500 hover:underline">Terms of Service</Link> and <Link href="/" className="text-cyan-400 hover:text-cyan-500 hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <button 
            type="submit"
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-cyan-400 font-semibold hover:underline hover:text-cyan-500">  Login</Link>
        </div>
      </div>
    </div>
  );
}