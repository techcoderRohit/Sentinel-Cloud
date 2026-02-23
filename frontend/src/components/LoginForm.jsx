import { Mail, Lock } from "lucide-react";

export default function LoginForm() {
    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative">
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] p-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-700">
                        Sentinel Cloud
                    </h1>
                </div>
                <h2 className="text-center text-xl font-semibold mb-6 text-gray-700">
                    Sign In to Your Account
                </h2>
                <div className="mb-4">
                    <label className="text-gray-600 text-sm">
                        Email Address
                    </label>
                    <div className="flex items-center border rounded-lg mt-1 px-3">
                        <Mail className="text-gray-400" size={18} />
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full p-2 outline-none"
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="text-gray-600 text-sm">
                        Password
                    </label>
                    <div className="flex items-center border rounded-lg mt-1 px-3">
                        <Lock className="text-gray-400" size={18} />
                        <input
                            type='password'
                            placeholder="Enter your password"
                            className="w-full p-2 outline-none"
                        />
                    
                    </div>
                </div>
                <div className="flex items-center mb-4">
                    <input type="checkbox" className="mr-2" />
                    <label className="text-gray-600 text-sm">
                        Remember Me
                    </label>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-300">
                    Login
                </button>
                <div className="flex justify-between mt-4 text-sm">
                    <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
                    <a href="/register" className="text-blue-600 hover:underline">Create Account</a>
                </div>
            </div>
        </div>
    );
}