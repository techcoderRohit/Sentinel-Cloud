"use client";
import Link from 'next/link';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
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
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

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
    const errors = { name: '', email: '', password: '', confirmPassword: '' };

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
      isValid = false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      const payload = { ...formData, role: 'user' };
      const response = await API.post("/auth/Signup", payload);
      if (response.status === 201) {
        toast.success("User registered successfully! 🎉");
        router.push('/auth/login');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration Failed!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0b1120] px-4 py-8">
      <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-lg border border-slate-800">
        <div className="text-center mb-8">
          <div className='flex justify-center mb-4'>
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <span className="text-white text-2xl font-bold tracking-tighter">SC</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-cyan-500">Create an Account</h2>
          <p className="text-slate-500 mt-2">Start monitoring and managing your IoT devices</p>
        </div>
        


        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="text-slate-300 mb-2 block">Full Name</label>
            <div className={`flex items-center bg-slate-800 border ${fieldErrors.name ? 'border-red-500' : 'border-slate-700'} rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200`}>
              <User className='text-cyan-500' size={18} />
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
              />
            </div>
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-slate-300 mb-2 block">Email</label>
            <div className={`flex items-center bg-slate-800 border ${fieldErrors.email ? 'border-red-500' : 'border-slate-700'} rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200`}>
              <Mail className='text-cyan-500' size={18} />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
              />
            </div>
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-slate-300 mb-2 block">Password</label>
            <div className={`flex items-center bg-slate-800 border ${fieldErrors.password ? 'border-red-500' : 'border-slate-700'} rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200`}>
              <Lock className='text-cyan-500' size={18} />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
              />
            </div>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-slate-300 mb-2 block">Confirm Password</label>
            <div className={`flex items-center bg-slate-800 border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-700'} rounded-lg mt-1 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200`}>
              <Lock className='text-cyan-500' size={18} />
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
              />
            </div>
            {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl disabled:opacity-50"
          >
            {loading ? <Loader2 className='animate-spin mr-2' size={20} /> : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link href="/auth/login" className="text-cyan-400 font-semibold hover:underline hover:text-cyan-500">Login</Link>
        </div>
      </div>
    </div>
  );
}