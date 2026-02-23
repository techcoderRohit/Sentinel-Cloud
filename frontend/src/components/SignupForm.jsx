import Link from 'next/link';
import { User, Mail , Lock } from 'lucide-react';
export default function Signup() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900 px-4 py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Create an Account</h2>
          <p className="text-slate-500 mt-2">Start monitoring and managing your IoT devices</p>
        </div>
        
        <form className="space-y-5">
          <div>
            <label className=" text-slate-700 mb-2">Full Name</label>
            <div className='flex items-center border border-slate-300 rounded-lg mt-2 px-2 focus-within:ring-1 focus-within:ring-teal-400 transition duration-200 '>
                <User className='text-slate-400 size={18}'/>
            <input 
              type="text" 
              placeholder="Enter your name"
              className="w-full px-4 py-2 text-slate-900 outline-none " 
            />
            </div>
            </div>
            <div>
            <label className=" text-slate-700 mb-2">Email</label>
            <div className='flex items-center border border-slate-300 rounded-lg mt-2 px-2 focus-within:ring-1 focus-within:ring-teal-400 transition duration-200 '>
                <Mail className='text-slate-400 size={18}'/>
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full px-4 py-2 text-slate-900 outline-none " 
            />
            </div>
            </div>
            <div>
            <label className=" text-slate-700 mb-2">Password</label>
            <div className='flex items-center border border-slate-300 rounded-lg mt-2 px-2 focus-within:ring-1 focus-within:ring-teal-400 transition duration-200 '>
                <Lock className='text-slate-400 size={18}'/>
            <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full px-4 py-2 text-slate-900 outline-none " 
            />
            </div>
            </div>
            <div>
            <label className=" text-slate-700 mb-2">Confirm Password</label>
            <div className='flex items-center border border-slate-300 rounded-lg mt-2 px-2 focus-within:ring-1 focus-within:ring-teal-400 transition duration-200 '>
                <Lock className='text-slate-400 size={18}'/>
            <input 
              type="password" 
              placeholder="Enter your confirm password"
              className="w-full px-4 py-2 text-slate-900 outline-none " 
            />
            </div>
            </div>
          <div className="flex items-start">
            <input 
              type="checkbox" 
              id="terms" 
              className="mt-1 mr-2 rounded text-blue-600 focus:ring-blue-500" 
            />
            <label htmlFor="terms" className="text-sm text-slate-600">
              I agree to the <Link href="/" className="text-indigo-500 hover:text-indigo-800 hover:underline">Terms of Service</Link> and <Link href="/" className="text-indigo-600 hover:text-indigo-500 hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <button 
            type="submit"
            className="w-full px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-800 transition shadow-sm"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="text-indigo-600 font-medium hover:underline hover:text-indigo-800">  Login</Link>
        </div>
      </div>
    </div>
  );
}