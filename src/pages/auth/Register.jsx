// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// import useAuthStore from "../../store/auth.store";

// export default function Register() {
//   const navigate = useNavigate();

//   const { register, loading, error } = useAuthStore();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "staff",
//   });

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       await register(form);

//       navigate("/login");
//     } catch (error) {
//       // Error handled by Zustand
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
//       <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
//         <h1 className="text-3xl font-bold text-slate-900">
//           Create Account
//         </h1>

//         <p className="mt-2 text-sm text-slate-500">
//           Register your account
//         </p>

//         {error && (
//           <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
//             {error}
//           </div>
//         )}

//         <form
//           onSubmit={handleSubmit}
//           className="mt-7 space-y-5"
//         >
//           <div>
//             <label className="mb-2 block text-sm font-medium">
//               Name
//             </label>

//             <input
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               placeholder="Your name"
//               className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium">
//               Email
//             </label>

//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               placeholder="you@example.com"
//               className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium">
//               Password
//             </label>

//             <input
//               type="password"
//               name="password"
//               value={form.password}
//               onChange={handleChange}
//               placeholder="Create password"
//               className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium">
//               Role
//             </label>

//             <select
//               name="role"
//               value={form.role}
//               onChange={handleChange}
//               className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
//             >
//               <option value="staff">Staff</option>
//               <option value="owner">Owner</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
//           >
//             {loading ? "Creating..." : "Create Account"}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-slate-500">
//           Already have an account?{" "}
//           <Link
//             to="/login"
//             className="font-semibold text-indigo-600"
//           >
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


import React from 'react'

function Register() {
  return (
    <div>Register</div>
  )
}

export default Register