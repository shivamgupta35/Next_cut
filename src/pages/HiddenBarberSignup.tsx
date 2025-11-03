import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";
import LoginForm from "../components/auth/LoginForm";
import { motion } from "framer-motion";
import { Lock, Mail, Scissors } from "lucide-react";

const HiddenBarberSignup: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 dark:from-[#030617] dark:via-[#020b2a] dark:to-[#001233] transition-colors duration-700 text-gray-800 dark:text-white">
      {/* Floating Glows */}
      <motion.div
        className="absolute -top-20 -left-10 w-[400px] h-[400px] bg-blue-400/30 dark:bg-cyan-700/40 blur-3xl rounded-full"
        animate={{ y: [0, 25, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-400/30 dark:bg-blue-800/40 blur-3xl rounded-full"
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-20 w-full max-w-md bg-white/70 dark:bg-[#0b1730]/70 backdrop-blur-2xl rounded-3xl border border-blue-200/40 dark:border-cyan-600/40 shadow-[0_0_40px_rgba(0,150,255,0.15)] p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-500 dark:from-cyan-500 dark:to-blue-700 flex items-center justify-center shadow-lg">
              <Scissors size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-cyan-300 dark:via-blue-400 dark:to-indigo-500 bg-clip-text text-transparent mb-2">
            NextCut Barber
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-sm flex justify-center items-center gap-2">
            <Lock size={16} className="text-blue-600 dark:text-cyan-400" />
            Private Registration Portal
          </p>
        </div>

        {/* Access Warning */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-yellow-50/70 dark:bg-yellow-900/20 border border-yellow-300/40 rounded-xl p-4 mb-6 shadow-sm"
        >
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
            ⚠️ Restricted Access
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Only verified barber shop owners are allowed to register here.
            Unauthorized attempts will be monitored and removed.
          </p>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50/70 dark:bg-cyan-900/20 border border-blue-200/40 dark:border-cyan-700/40 rounded-xl p-5 mb-6"
        >
          <h3 className="font-semibold text-blue-800 dark:text-cyan-300 mb-2">
            📧 Need Access?
          </h3>
          <p className="text-sm text-blue-700 dark:text-cyan-400 mb-2">
            Email our admin team with the following:
          </p>
          <ul className="text-sm text-blue-700 dark:text-cyan-400 space-y-1 ml-4 mb-2">
            <li>• Shop name & address</li>
            <li>• Business license or proof</li>
            <li>• Owner contact info</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-cyan-700/30 text-sm">
            <p className="flex items-center gap-2 text-blue-800 dark:text-cyan-300 font-medium">
              <Mail size={16} />{" "}
              <a
                href="mailto:barbers@nextcut.app"
                className="underline hover:text-blue-600 dark:hover:text-cyan-200 transition"
              >
                barbers@nextcut.app
              </a>
            </p>
          </div>
        </motion.div>

        {/* Auth Forms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isLogin ? (
            <LoginForm
              role="BARBER"
              onSwitchToSignup={() => setIsLogin(false)}
            />
          ) : (
            <SignupForm
              role="BARBER"
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </motion.div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-blue-600 dark:text-cyan-400 hover:underline hover:text-blue-800 dark:hover:text-cyan-200 transition"
          >
            ← Back to Homepage
          </button>
        </div>

        {/* Final Warning */}
        <div className="mt-8 p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-300/40 dark:border-red-700/30 rounded-lg">
          <p className="text-xs text-red-700 dark:text-red-300 text-center leading-relaxed">
            🚨 This page is monitored. Only use it if you’ve received a direct
            invitation from the NextCut team. Unauthorized accounts will be
            disabled.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default HiddenBarberSignup;
