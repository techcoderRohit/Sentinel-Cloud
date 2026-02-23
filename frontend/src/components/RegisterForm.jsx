
import { Mail, Lock, User } from "lucide-react";

export default function RegisterForm() {
    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
            <div className="bg-white rounded-2xl shadow-2xl w-[420px] p-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-700">Sentinel Cloud</h1>
                    <p className="text-gray-500 text-sm">Create Your Account</p>
                </div>
                <div className="mb-4">
                    <label className="text-sm text-gray-600">Full Name</label>
                    <div className="flex items-center border rounded-lg px-3 mt-1">
                        <User size={18} className="text-gray-400" />
                        <input type="text" placeholder="Enter your name" className="w-full p-2 outline-none" />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="text-sm text-gray-600">Email Address</label>
                    <div className="flex items-center border rounded-lg px-3 mt-1">
                        <Mail size={18} className="text-gray-400" />
                        <input type="email" placeholder="Enter your email" className="w-full p-2 outline-none" />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="text-sm text-gray-600">Password</label>
                    <div className="flex items-center border rounded-lg px-3 mt-1">
                        <Lock size={18} className="text-gray-400" />
                        <input type='password' placeholder="Create password" className="w-full p-2 outline-none" />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="text-sm text-gray-600">Confirm Password</label>
                    <div className="flex items-center border rounded-lg px-3 mt-1">
                        <Lock size={18} className="text-gray-400" />
                        <input type="password" placeholder="Confirm password" className="w-full p-2 outline-none" />
                    </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">
                    Create Account
                </button>
                <div className="text-center mt-4 text-sm">
                    Already have account?
                    <a href="/login" className="text-blue-600 ml-1 hover:underline">Login</a>
                </div>
            </div>
        </div>
    );
}