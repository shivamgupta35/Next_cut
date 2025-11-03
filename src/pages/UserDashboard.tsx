// src/pages/UserDashboard.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../hooks/useLocation";
import { useUserQueue } from "../hooks/useUserQueue";
import LocationPicker from "../components/user/LocationPicker";
import NearbyBarbers from "../components/user/NearbyBarbers";
import QueueStatusComponent from "../components/user/QueueStatus";
import ServiceSelection from "../components/user/ServiceSelection";
import PaymentConfirmModal from "../components/user/PaymentConfirmModal";
import ThemeToggle from "../components/common/ThemeToggle";
import type { Barber, Service } from "../types";
import { userQueueService } from "../services/userQueueService";
import { motion } from "framer-motion";
import { MapPin, Scissors, User } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const {
    location,
    locationError,
    isLoadingLocation,
    hasLocationPermission,
    nearbyBarbers,
    isLoadingBarbers,
    barbersError,
    requestLocation,
    refreshBarbers,
    clearLocationError,
    forceRefreshBarbers,
  } = useLocation();

  const {
    queueStatus,
    isLoading: isQueueLoading,
    isJoining,
    isLeaving,
    joinQueue,
    leaveQueue,
    refreshStatus,
    getEstimatedWaitTime,
  } = useUserQueue(async () => {
    await forceRefreshBarbers();
    setTimeout(() => {
      const barberListElement = document.getElementById("barber-list");
      if (barberListElement) {
        barberListElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 1000);
  });

  const handleBarberSelect = (barber: Barber) => {
    setSelectedBarber(barber);
    setShowServiceSelection(true);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowServiceSelection(false);
    setShowPaymentModal(true);
  };

  const handleServiceCancel = () => {
    setShowServiceSelection(false);
    setSelectedBarber(null);
  };

  const handleCancelPayment = () => {
    setSelectedService(null);
    setShowPaymentModal(false);
  };

  const handleJoinQueueCash = async () => {
    if (!selectedService || !selectedBarber) return;
    try {
      await joinQueue(selectedBarber.id, selectedService.name);
      alert("✅ Joined queue with Cash!");
      setShowPaymentModal(false);
      setSelectedService(null);
      setSelectedBarber(null);
    } catch (err: any) {
      alert("❌ Failed to join queue: " + err.message);
    }
  };

  const handleJoinQueueOnline = async () => {
    if (!selectedService || !selectedBarber) return;
    try {
      const order = await userQueueService.createOrder(selectedService.price);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "NextCut",
        description: selectedService.name,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verify = await userQueueService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              selectedBarber.id,
              selectedService.name
            );
            alert("✅ " + verify.msg);
            setShowPaymentModal(false);
            setSelectedService(null);
            setSelectedBarber(null);
            refreshStatus();
          } catch (err: any) {
            alert("❌ Payment verification failed: " + err.message);
          }
        },
        prefill: {
          name: user?.name || "NextCut User",
          email: "user@example.com",
          contact: user?.phoneNumber || "9999999999",
        },
        theme: { color: "#1e40af" },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error("❌ Online payment error:", err);
      alert("❌ Payment failed: " + err.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 dark:from-[#030617] dark:via-[#020b2a] dark:to-[#001233] text-gray-800 dark:text-white transition-all duration-700">
      {/* Floating glow */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 dark:bg-cyan-700/40 blur-3xl rounded-full"
        animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-300/30 dark:bg-blue-800/30 blur-3xl rounded-full"
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      {/* HEADER */}
      <div className="relative z-20 bg-white/40 dark:bg-[#0b1730]/50 backdrop-blur-xl border-b border-blue-200/40 dark:border-cyan-700/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Scissors className="text-blue-600 dark:text-cyan-400" />
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-400 dark:from-cyan-300 dark:to-blue-500 bg-clip-text text-transparent">
              NextCut
            </h1>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Welcome, {user?.name || "User"} 👋
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={logout}
              className="px-3 py-1 rounded-lg border border-blue-400/40 dark:border-cyan-500/40 text-sm hover:bg-blue-100 dark:hover:bg-cyan-900/30 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {queueStatus?.inQueue ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <QueueStatusComponent
              queueStatus={queueStatus}
              isLoading={isQueueLoading}
              isLeaving={isLeaving}
              onLeaveQueue={leaveQueue}
              onRefresh={refreshStatus}
              estimatedWaitTime={getEstimatedWaitTime()}
            />
          </motion.div>
        ) : (
          <div className="space-y-10">
            {!hasLocationPermission && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white/60 dark:bg-[#0b1730]/60 backdrop-blur-2xl border border-blue-200/30 dark:border-cyan-600/30 shadow-lg"
              >
                <div className="flex items-start">
                  <MapPin
                    className="text-blue-600 dark:text-cyan-400 mt-1 mr-3"
                    size={26}
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-blue-800 dark:text-cyan-300 mb-2">
                      Find Nearby Barbers
                    </h3>
                    <p className="text-gray-700 dark:text-gray-400 mb-4">
                      Allow location access to discover top barbers near you.
                    </p>
                    <LocationPicker
                      isLoading={isLoadingLocation}
                      error={locationError}
                      onRequestLocation={requestLocation}
                      onClearError={clearLocationError}
                      locationError={null}
                      isLoadingLocation={false}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {location && (
              <motion.div
                id="barber-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <NearbyBarbers
                  barbers={nearbyBarbers}
                  isLoading={isLoadingBarbers}
                  error={barbersError}
                  onRefresh={refreshBarbers}
                  onJoinQueue={handleBarberSelect}
                  isJoining={isJoining}
                  userLocation={location}
                  userInQueue={queueStatus?.inQueue || false}
                />
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showServiceSelection && selectedBarber && (
        <ServiceSelection
          onSelect={handleServiceSelect}
          onCancel={handleServiceCancel}
        />
      )}
      {showPaymentModal && selectedBarber && selectedService && (
        <PaymentConfirmModal
          barber={selectedBarber}
          service={selectedService}
          onCancel={handleCancelPayment}
          onCash={handleJoinQueueCash}
          onOnline={handleJoinQueueOnline}
        />
      )}
    </div>
  );
};

export default UserDashboard;
