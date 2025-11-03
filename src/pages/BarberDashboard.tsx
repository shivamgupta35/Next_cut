import React from "react";
import { motion } from "framer-motion";
import { Scissors, Users, RefreshCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBarberQueue } from "../hooks/useBarberQueue";
import QueueManagement from "../components/barber/QueueManagement";
import ThemeToggle from "../components/common/ThemeToggle";

const BarberDashboard: React.FC = () => {
  const { barber, logout } = useAuth();
  const { queue, isLoading, error, refreshQueue, removeUser, removingUserId } =
    useBarberQueue();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 dark:from-[#030617] dark:via-[#020b2a] dark:to-[#001233] text-gray-800 dark:text-white transition-all duration-700">
      {/* Floating glowing orbs */}
      <motion.div
        className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/20 dark:bg-cyan-800/30 blur-3xl rounded-full"
        animate={{ y: [0, 25, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-indigo-400/30 dark:bg-blue-800/40 blur-3xl rounded-full"
        animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* HEADER */}
      <div className="relative z-20 bg-white/40 dark:bg-[#0b1730]/50 backdrop-blur-2xl border-b border-blue-200/40 dark:border-cyan-700/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Scissors className="text-blue-600 dark:text-cyan-400" />
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-400 dark:from-cyan-300 dark:to-blue-500 bg-clip-text text-transparent">
              NextCut
            </h1>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Barber Dashboard
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline text-gray-700 dark:text-gray-300 text-sm">
              Welcome, {barber?.name || "Barber"} 💈
            </span>
            <ThemeToggle />
            <button
              onClick={logout}
              className="px-3 py-1 rounded-lg border border-blue-400/40 dark:border-cyan-500/40 text-sm hover:bg-blue-100 dark:hover:bg-cyan-900/30 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-cyan-300 dark:via-blue-400 dark:to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              Manage Your Queue
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Track live users, remove entries, and keep your shop organized.
            </p>
          </div>
          <button
            onClick={refreshQueue}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-600 dark:to-blue-500 rounded-xl text-white text-sm font-medium hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        </motion.div>

        {/* QUEUE MANAGEMENT SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 dark:bg-[#0b1730]/70 backdrop-blur-2xl border border-blue-200/40 dark:border-cyan-700/40 rounded-3xl p-6 shadow-[0_0_25px_rgba(0,150,255,0.15)]"
        >
          <QueueManagement
            queue={queue}
            isLoading={isLoading}
            error={error}
            onRefresh={refreshQueue}
            onRemoveUser={removeUser}
            removingUserId={removingUserId}
          />
        </motion.div>

        {/* ANALYTICS PREVIEW CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-10 grid md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: <Users className="text-blue-600 dark:text-cyan-400" size={30} />,
              title: "Active Users",
              value: queue?.length || 0,
            },
            {
              icon: <Scissors className="text-blue-600 dark:text-cyan-400" size={30} />,
              title: "Total Served",
              value: Math.floor((queue?.length || 0) * 2.3),
            },
            {
              icon: <RefreshCcw className="text-blue-600 dark:text-cyan-400" size={30} />,
              title: "Queue Refreshes",
              value: Math.floor(Math.random() * 20 + 5),
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(0,150,255,0.3)",
              }}
              className="bg-white/60 dark:bg-[#0b1730]/60 backdrop-blur-2xl border border-blue-200/30 dark:border-cyan-700/30 rounded-2xl p-5 flex flex-col items-center justify-center"
            >
              {stat.icon}
              <h4 className="text-lg font-semibold mt-2">{stat.title}</h4>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BarberDashboard;
