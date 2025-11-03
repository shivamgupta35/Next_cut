import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import ThemeToggle from "../components/common/ThemeToggle";
import { User, Scissors, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AuthMode = "role-selection" | "user-auth" | "barber-auth";
type UserAuthMode = "login" | "signup";

const HomePage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("role-selection");
  const [userAuthMode, setUserAuthMode] = useState<UserAuthMode>("login");

  if (isAuthenticated) {
    if (role === "USER") return <Navigate to="/user/dashboard" replace />;
    if (role === "BARBER") return <Navigate to="/barber/dashboard" replace />;
  }

  const handleRoleSelection = (selectedRole: UserRole) => {
    setAuthMode(selectedRole === "USER" ? "user-auth" : "barber-auth");
  };

  const back = () => setAuthMode("role-selection");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 dark:from-[#030617] dark:via-[#020b2a] dark:to-[#001233] text-gray-800 dark:text-white">
      {/* Floating glowing elements */}
      <motion.div
        className="absolute -top-20 -left-10 w-96 h-96 bg-blue-500/20 dark:bg-blue-800/40 blur-3xl rounded-full"
        animate={{ y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/30 dark:bg-cyan-700/40 blur-3xl rounded-full"
        animate={{ y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10 z-20"
      >
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-cyan-300 dark:via-blue-400 dark:to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.7)]">
          NextCut ✂️
        </h1>
        <p className="text-lg mt-3 text-gray-600 dark:text-gray-300 font-light tracking-wide">
          Where Style Meets Speed — Manage queues in real time.
        </p>
      </motion.div>

      {/* Main Auth Selection */}
      <AnimatePresence mode="wait">
        {authMode === "role-selection" && (
          <motion.div
            key="role-select"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-10 z-20"
          >
            {/* USER */}
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 40px rgba(0,150,255,0.4)",
              }}
              onClick={() => handleRoleSelection("USER")}
              className="group cursor-pointer bg-white/60 dark:bg-[#0b1730]/60 backdrop-blur-2xl border border-blue-300/40 dark:border-cyan-600/40 rounded-3xl p-8 text-center transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-500 dark:from-cyan-500 dark:to-blue-700 flex items-center justify-center shadow-lg">
                  <User size={40} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-700 to-cyan-500 dark:from-cyan-400 dark:to-blue-400 text-transparent bg-clip-text">
                I'm a Customer
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Book barbers, track queues, and save time.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 text-left inline-block space-y-1">
                <li>💎 Instant queue entry</li>
                <li>📍 Find top-rated barbers nearby</li>
                <li>🚀 Get notified when it's your turn</li>
              </ul>
            </motion.div>

            {/* BARBER */}
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 40px rgba(0,220,255,0.4)",
              }}
              onClick={() => handleRoleSelection("BARBER")}
              className="group cursor-pointer bg-white/60 dark:bg-[#081429]/60 backdrop-blur-2xl border border-blue-300/40 dark:border-cyan-600/40 rounded-3xl p-8 text-center transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 dark:from-blue-400 dark:to-cyan-600 flex items-center justify-center shadow-lg">
                  <Scissors size={40} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-cyan-600 to-blue-500 dark:from-blue-400 dark:to-cyan-300 text-transparent bg-clip-text">
                I'm a Barber
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Manage your queue & clients effortlessly.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 text-left inline-block space-y-1">
                <li>✂️ Manage customers in real-time</li>
                <li>💬 Notify users instantly</li>
                <li>📊 View queue analytics</li>
              </ul>
            </motion.div>
          </motion.div>
        )}

        {/* USER AUTH */}
        {authMode === "user-auth" && (
          <motion.div
            key="user-auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white/70 dark:bg-[#0b1730]/70 backdrop-blur-xl border border-blue-300/30 dark:border-cyan-600/30 rounded-2xl shadow-2xl p-6 z-20"
          >
            <button
              onClick={back}
              className="text-blue-600 dark:text-cyan-400 mb-4 flex items-center hover:underline"
            >
              <ArrowLeft size={18} className="mr-2" /> Back
            </button>

            {userAuthMode === "login" ? (
              <LoginForm
                role="USER"
                onSwitchToSignup={() => setUserAuthMode("signup")}
              />
            ) : (
              <SignupForm
                role="USER"
                onSwitchToLogin={() => setUserAuthMode("login")}
              />
            )}
          </motion.div>
        )}

        {/* BARBER AUTH */}
        {authMode === "barber-auth" && (
          <motion.div
            key="barber-auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white/70 dark:bg-[#0b1730]/70 backdrop-blur-xl border border-blue-300/30 dark:border-cyan-600/30 rounded-2xl shadow-2xl p-6 z-20"
          >
            <button
              onClick={back}
              className="text-blue-600 dark:text-cyan-400 mb-4 flex items-center hover:underline"
            >
              <ArrowLeft size={18} className="mr-2" /> Back
            </button>

            <LoginForm role="BARBER" onSwitchToSignup={() => {}} />

            <div className="mt-6 p-4 bg-blue-50 dark:bg-cyan-900/20 border border-blue-200/40 dark:border-cyan-700/30 rounded-lg text-sm text-blue-700 dark:text-cyan-300">
              <strong>New barber shop?</strong> Email us at{" "}
              <a
                href="mailto:nextcut.barber.register@gmail.com"
                className="underline font-semibold hover:text-blue-500 dark:hover:text-cyan-200"
              >
                nextcut.barber.register@gmail.com
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
