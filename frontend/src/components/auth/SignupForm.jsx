"use client";
import Link from 'next/link';
import { User, Mail, Lock,Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import API from '@/utils/api';

export default function Signup() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');


    // Frontend validation: Passwords match check
    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      return setError("Passwords do not match!");
    }

    try {
      const response = await API.post("/auth/SignupUser",formData);
      if(response.status === 201){
        toast.success ("User registered successfully!");
        router.push('/auth/login');
      }
    }
    // Axios errors ko 'err.response' se handle karta hai
    catch(err){
      const errorMsg = err.response ?.data?.message || "Registration Failed!";
      toast.error(errorMsg);
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b1120] px-4 py-8">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-lg border border-slate-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-cyan-400">Create an Account</h2>
          <p className="text-slate-500 mt-2">Start monitoring and managing your IoT devices</p>
        </div>
        {error && <div className=' text-red-500 p-2 rounded mb-4 text-sm text-center'>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className=" text-slate-300 mb-2">Full Name</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
              <User className='text-cyan-500 size={18}' />
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none "
              />
            </div>
          </div>
          <div>
            <label className=" text-slate-300 mb-2">Email</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
              <Mail className='text-cyan-500 size={18}' />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 text-white placeholder-slate-400 outline-none "
              />
            </div>
          </div>
          <div>
            <label className=" text-slate-300 mb-2">Password</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
              <Lock className='text-cyan-500 size={18}' />
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 text-white placeholder-slate-400 outline-none "
              />
            </div>
          </div>
          <div>
            <label className=" text-slate-300 mb-2">Confirm Password</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-2 px-2 focus-within:ring-1 focus-within:ring-cyan-500 transition duration-200 '>
              <Lock className='text-cyan-500 size={18}' />
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter your confirm password"
                className="w-full px-4 py-2 text-white placeholder-slate-400 outline-none "
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl disabled:opacity-50"
          >{loading ? <Loader2 className='animate-spin mr-2' size={20}/> : "Create Account"}
            
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link href="/auth/login" className="text-cyan-400 font-semibold hover:underline hover:text-cyan-500">  Login</Link>
        </div>
      </div>
    </div>
  );
}