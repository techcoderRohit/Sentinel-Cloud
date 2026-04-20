"use client";
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import API from '@/utils/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { email: '', password: '' };

    // Robust Email Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com)';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await API.post("/auth/login", formData);
      const data = response.data;

      if (response.status === 200) {
        localStorage.setItem('token', data.token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("user", JSON.stringify(data));
        toast.success('Login Successful!');
        
        // Role based redirection
        if (data.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid Credentials!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b1120] px-4 py-8">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
        <div className="text-center mb-8">
          <div className='flex justify-center mb-4'>
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <span className="text-white text-2xl font-bold tracking-tighter">SC</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-cyan-500">Welcome Back </h2>
          <p className="text-slate-500 mt-2">Login to Sentinel Cloud account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-slate-300 mb-2">Email</label>
            <div className={`flex items-center bg-slate-800 border ${fieldErrors.email ? 'border-red-500' : 'border-slate-700'} rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200`}>
              <Mail className='text-cyan-500' size={18} />
              <input
                name='email'
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your Email"
                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
              />
            </div>
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-slate-300 mb-2">Password</label>
            <div className={`flex items-center bg-slate-800 border ${fieldErrors.password ? 'border-red-500' : 'border-slate-700'} rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200`}>
              <Lock className='text-cyan-500' size={18} />
              <input
                name='password'
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
              />
            </div>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="mr-2 rounded text-blue-600 focus:ring-blue-700"
              />
              <span className="text-slate-500">Remember me</span>
            </label>
            <Link href="/auth/forgotPassword" className="text-cyan-400 hover:text-cyan-500 hover:underline text-sm">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl disabled:opacity-50">
            {loading ? <Loader2 className='animate-spin mr-2' size={20} /> : "Login"}
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
