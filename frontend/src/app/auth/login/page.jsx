// "use client";
// import Link from 'next/link';
// import { Mail, Lock, Loader2 } from 'lucide-react';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';
// import API from '@/utils/api';

// export default function Login() {
//   const [formData, setFormData] = useState({ email: '', password: '', });
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState(false);
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       //Axios post request
//       //Axios automatically JSON.stringify kar deta hai
//       const response = await API.post("/auth/login", formData);
//       console.log(response.data);
      

//       //Axios mein backend ka data 'response.data' mein deta hai
//       const data = response.data;
//       if (response.status === 200) {
//         //1. Token aur Role save kareein
//         localStorage.setItem('token', data.token);
//         localStorage.setItem("userRole", data.role); // Role check ke liye
// localStorage.setItem("user", JSON.stringify(data));
// setUser(data);
//         toast.success('Login Successful!');
//         //Dashboard par redirect karein
//         router.push("/dashboard");
//       }
//     }
//     // Axios errors ko 'error.response' se handle karta hai
//     catch (error) {
//       const errorMsg = error.response?.data?.message || "Invalid Credentials!";
//       toast.error(errorMsg);
      
//     }
//     finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="flex justify-center items-center min-h-screen bg-[#0b1120] px-4 py-8">
//       <div className="w-full max-w-md p-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
//         <div className="text-center mb-8">
//           <div className='flex justify-center mb-4'>
//           <div className="w-14 h-14 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
//             <span className="text-white text-2xl font-bold tracking-tighter">SC</span>
//           </div>
//           </div>
//           <h2 className="text-3xl font-bold text-cyan-500">Welcome Back </h2>
//           <p className="text-slate-500 mt-2">Login to Sentinel Cloud account</p>
//         </div>
//         {/* Error message display 
//         {error && <div className='text-red-500 p-2 rounded mb-4 text-sm text-center'>{error}</div>}*/}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className=" text-slate-300 mb-2">Email</label>
//             <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
//               <Mail className='text-cyan-500 size={18}' />
//               <input
//                 name='email'
//                 type="email"
//                 required
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter your Email"
//                 className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
//               />
//             </div>
//           </div>
//           <div>
//             <label className=" text-slate-300 mb-2">Password</label>
//             <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200'>
//               <Lock className='text-cyan-500 size={18}' />
//               <input
//                 name='password'
//                 type="password"
//                 required
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Enter your password"
//                 className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none "
//               />
//             </div>

//           </div>

//           <div className="flex items-center justify-between text-sm">
//             <label className="flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 className="mr-2 rounded text-blue-600 focus:ring-blue-700"
//               />
//               <span className="text-slate-500">Remember me</span>
//             </label>
//             <Link href="/auth/forgotPassword" className="text-cyan-400 hover:text-cyan-500 hover:underline text-sm">
//               Forgot password?
//             </Link>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex items-center justify-center px-4 py-2 bg-linear-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition duration-300 shadow-2xl disabled:opacity-50">
//             {loading ? <Loader2 className='animate-spin mr-2' size={20} /> : "Login"}
//           </button>
//         </form>

//         <div className="mt-6 text-center text-sm text-slate-500">
//           Don't have an account?
//           <Link href="/auth/Signup" className="text-cyan-400 ml-2 font-semibold hover:text-cyan-500 hover:underline">Signup</Link>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import API from '@/utils/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loginType, setLoginType] = useState('user'); // 'user', 'admin', 'guest'
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      //Axios post request
      //Axios automatically JSON.stringify kar deta hai
      const payload = { ...formData, loginType: loginType === 'user' ? 'owner' : loginType };
      const response = await API.post("/auth/login", payload);
      console.log(response.data);
      

      //Axios mein backend ka data 'response.data' mein deta hai
      const data = response.data;
      if (response.status === 200) {
        //1. Token aur Role save kareein
        localStorage.setItem('token', data.token);
        localStorage.setItem("userRole", data.role); // Role check ke liye
localStorage.setItem("user", JSON.stringify(data));
setUser(data);
        toast.success('Login Successful!');
        //Dashboard par redirect karein
        router.push(data.role === "admin" ? "/admin" : "/dashboard");
      }
    }
    // Axios errors ko 'error.response' se handle karta hai
    catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid Credentials!";
      toast.error(errorMsg);
      
    }
    finally {
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
        {/* Error message display 
        {error && <div className='text-red-500 p-2 rounded mb-4 text-sm text-center'>{error}</div>}*/}
        
        {/* Login Type Tabs */}
        <div className="flex p-1 bg-slate-800 rounded-lg mb-6">
          {['user', 'admin', 'guest'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setLoginType(type)}
              className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                loginType === type 
                  ? type === 'admin' ? 'bg-red-500/20 text-red-400 shadow-md border border-red-500/20' 
                    : type === 'guest' ? 'bg-amber-500/20 text-amber-400 shadow-md border border-amber-500/20'
                    : 'bg-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {loginType === 'guest' && (
            <div>
              <label className=" text-slate-300 mb-2">Guest Assigned Name</label>
              <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
                <input
                  name='name'
                  type="text"
                  required={loginType === 'guest'}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter assigned name"
                  className="w-full px-4 py-2 text-white bg-transparent placeholder-slate-400 outline-none"
                />
              </div>
            </div>
          )}
          <div>
            <label className=" text-slate-300 mb-2">Email</label>
            <div className='flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1 mb-2 px-2 focus-within:ring-2 focus-within:ring-cyan-500 transition duration-200 '>
              <Mail className='text-cyan-500 size={18}' />
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
              <Lock className='text-cyan-500 size={18}' />
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