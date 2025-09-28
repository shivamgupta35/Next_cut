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

  // Location hook
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

  // Queue hook
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

  // Select barber
  const handleBarberSelect = (barber: Barber) => {
    setSelectedBarber(barber);
    setShowServiceSelection(true);
  };

  // Select service → open payment modal
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

  // ✅ Cash flow
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

  // ✅ Online payment with Razorpay
  const handleJoinQueueOnline = async () => {
    if (!selectedService || !selectedBarber) return;

    try {
      // 1️⃣ Create Razorpay order
      const order = await userQueueService.createOrder(selectedService.price);

      // 2️⃣ Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "NextCut",
        description: selectedService.name,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 3️⃣ Verify & join queue on backend
            const verify = await userQueueService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              selectedBarber.id,       // ✅ send barberId
              selectedService.name     // ✅ send service
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
        theme: { color: "#3399cc" },
      };

      // 4️⃣ Open Razorpay popup
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error("❌ Online payment error:", err);
      alert("❌ Payment failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 transition-all duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-title">NextCut</h1>
              <div className="text-subtitle">Welcome back, {user?.name || "User"}!</div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button onClick={logout} className="btn-secondary text-sm">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {queueStatus?.inQueue && (
            <div className="mb-8">
              <QueueStatusComponent
                queueStatus={queueStatus}
                isLoading={isQueueLoading}
                isLeaving={isLeaving}
                onLeaveQueue={leaveQueue}
                onRefresh={refreshStatus}
                estimatedWaitTime={getEstimatedWaitTime()}
              />
            </div>
          )}

          {!queueStatus?.inQueue && (
            <>
              {!hasLocationPermission && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Find Nearby Barbers
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300 mb-4">
                        To show you the closest barber shops, we need access to your location.
                      </p>
                      <LocationPicker
                        isLoading={isLoadingLocation}
                        error={locationError}
                        onRequestLocation={requestLocation}
                        onClearError={clearLocationError} locationError={null} isLoadingLocation={false}                      />
                    </div>
                  </div>
                </div>
              )}

              {location && (
                <div id="barber-list">
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
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Service Selection */}
      {showServiceSelection && selectedBarber && (
        <ServiceSelection onSelect={handleServiceSelect} onCancel={handleServiceCancel} />
      )}

      {/* Payment Modal */}
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
