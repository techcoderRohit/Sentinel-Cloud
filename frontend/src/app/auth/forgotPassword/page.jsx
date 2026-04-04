"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';
import API from '@/utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
  //check if email is empty
  if(!email){
    return toast.error("Please enter your email");
    setLoading(true);
  }
  try{
const res = await API.post("/auth/forgotPassword",{email});
//Backend response check (e.g., res.data.success)
toast.success(res.data.message || "Reset link sent to your email")
  }catch(error){
 const errorMsg = error.response?.data?.message || "User not found or server error!";
      toast.error(errorMsg);
     
  }finally{
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-96">
        <h2 className="text-2xl text-cyan-500 font-bold mb-4 text-center">Forgot Password</h2>
        <p className='text-slate-400 text-sm mb-6 text-center'>Enter your email and we'll send you a link to reset your password.</p>
         <div className='space-y-5'>
           <input type="email" placeholder='Enter your registered email' className='w-full p-3 bg-slate-800 text-white rounded-lg outline-none border border-slate-700 focus:border-cyan-600 transition-all'
           onChange={(e)=>{
            setEmail(e.target.value)
           }} required />
        
           <button
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl disabled:opacity-50">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
           </div>
           <div className='mt-4 text-center'>
            <a href='/auth/login' className='text-sm font-semibold text-cyan-500 hover:underline'>Back to Login</a>
           </div>
      </form>
    </div>
  );
}