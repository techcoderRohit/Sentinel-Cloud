"use client";
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import API from '@/utils/api';

export default function VerifyOTP() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email'); // URL se email nikal rahe hain
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/auth/resetPassword", { email, otp, password });
            toast.success("Password Reset Successful!");
            router.push("/auth/login");
        } catch (error) {
    
            toast.error(error.response?.data?.message || "Invalid or Expired OTP!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-4">
            <form onSubmit={handleReset} className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-96 shadow-2xl">
                <h2 className="text-2xl text-cyan-500 font-bold mb-2 text-center">Verify OTP</h2>
                <p className='text-slate-400 text-xs mb-6 text-center italic'>OTP sent to: {email}</p>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder='6-Digit OTP'
                        maxLength="6"
                        className='w-full p-3 bg-slate-800 text-white rounded-lg outline-none border border-slate-700 focus:border-cyan-600'
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder='Set New Password'
                        className='w-full p-3 bg-slate-800 text-white rounded-lg outline-none border border-slate-700 focus:border-cyan-600'
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl disabled:opacity-50">
                        {loading ? "Resetting..." : "Confirm Reset"}
                    </button>
                </div>
                <div className='mt-4 text-center'>
                    <a href='/auth/forgotPassword' className='text-sm font-semibold text-cyan-500 hover:underline'>Back to ForgotPassword</a>
                </div>

            </form>
        </div>
    );
}
export default function VerifyOtp1(){
return(
<Suspense fallback = {<div className='min-h-screen bg-[#0b0f1a] flex items-center justify-center text-white text-xl'>
    Loading...
</div>}>
VerifyOTP</Suspense>
);
}