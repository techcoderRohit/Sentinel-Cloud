"use client";
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {Eye,EyeOff} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '@/utils/api';

export function VerifyOTP() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email'); // URL se email nikal rahe hain
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    // Timer Logic: Har second ghat-ta rahega
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true); // Jab timer 0 ho jaye, button enable kar do
            clearInterval(interval);
        }
        return () => clearInterval(interval); // Cleanup
    }, [timer]);
    const handleResendOTP = async () => {
        try {
            setLoading(true);
            // Aapka backend endpoint yahan aayega
            await API.post("/auth/forgotPassword", { email });
            toast.success("New OTP sent to your email!");
            setTimer(60); // Timer reset karein
            setCanResend(false);
        } catch (error) {
            toast.error("Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

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
        <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-4">
            <form onSubmit={handleReset} className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-96 shadow-2xl">
                <h2 className="text-2xl text-cyan-500 font-bold mb-2 text-center">Verify OTP</h2>
                <p className='text-slate-400 text-xs mb-6 text-center italic'>OTP sent to: {email}</p>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder='Enter OTP'
                        maxLength="6"
                        className='w-full p-3 bg-slate-800 text-white rounded-lg outline-none border border-slate-700 focus:border-cyan-600'
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                   
                    {/* Password Input with Show/Hide */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"} // Type toggle logic
                            placeholder='Set New Password'
                            className='w-full p-3 bg-slate-800 text-white rounded-lg outline-none border border-slate-700 focus:border-cyan-600 pr-10'
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                   
                    {/* Timer Display */}
                    <div className="text-center text-sm">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                className="text-cyan-500 hover:underline font-medium"
                            >
                                Resend OTP
                            </button>
                        ) : (
                            <p className="text-slate-500">Resend OTP in <span className="text-cyan-500 font-bold">{timer}s</span></p>
                        )}
                    </div>
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
export default function VerifyOtpPageWrapper() {
    return (
        <Suspense fallback={<div className='min-h-screen bg-[#0b0f1a] flex items-center justify-center text-white text-xl'>
            Loading...
        </div>}>
            <VerifyOTP />
        </Suspense>
    );
}