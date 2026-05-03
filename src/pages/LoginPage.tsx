/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { LogIn, ParkingCircle, Chrome, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-900/20 mb-4">
            <ParkingCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">ParkirPintar</h1>
          <p className="text-slate-400 mt-2">Manless Management System</p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Secure Access</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Please sign in with your company Google account to access the management dashboard.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full h-14 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Chrome className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <span>Sign in with Google</span>
          </button>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-loose">
              By continuing, you agree to the internal security policy and data usage guidelines.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-slate-500 text-xs">
             Restricted Area — Authorized Personnel Only
           </p>
        </div>
      </motion.div>
    </div>
  );
}
