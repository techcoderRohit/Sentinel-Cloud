"use client";
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Login() {
  const [formData, setFormData] = useState({email : '', password : '',});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({...formData,[e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const res = await fetch("http://localhost:5000/api/auth/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error (data.message||"Something went wrong");
        }

      // ✅ Success: Alert dikhao aur Login page par redirect karo
      localStorage.setItem('token',data.token);
      window.alert("Login successful");
      router.push("/dashboard")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b1120] px-4 py-8">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-cyan-400">Welcome Back </h2>
          <p className="text-slate-500 mt-2">Login to Sentinel Cloud account</p>
        </div>
{/* Error message display */}
{error&&<div className='bg-red-500/10 border border-red-500 text-red-500 p-2 rounded mb-4 text-sm text-center'>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className=" text-slate-300 mb-2">Email</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                <Mail className='text-cyan-500 size={18}'/>
            <input
            name='email' 
              type="email" 
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your Email"
              className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none" 
            />
            </div>
            </div>
          <div>
            <label className=" text-slate-300 mb-2">Password</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200'>
                <Lock className='text-cyan-500 size={18}'/>
                <input 
                name='password'
              type="password" 
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none " 
            />
            </div>
            
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="mr-2 rounded text-blue-600 focus:ring-blue-700" 
              />
              <span className="text-slate-500">Remember me</span>
            </label>
            <Link href="#" className="text-cyan-400 hover:text-cyan-500 hover:underline text-sm">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl disabled:opacity-50">
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? 
          <Link href="/auth/Signup" className="text-cyan-400 ml-2 font-semibold hover:text-cyan-500 hover:underline">Signup</Link>
        </div>
      </div>
    </div>
  );
}