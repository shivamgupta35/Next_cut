import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/auth";
import { userQueueService } from "../../services/userQueueService";
import LoadingSpinner from "../common/LoadingSpinner";
import toast from "react-hot-toast";
import type { Service } from "../../types";

interface AddWalkinModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SERVICES: Service[] = [
  {
    name: "Scissor Cut (Traditional)", price: 3080, duration: 25,
    id: "",
    description: "",
    category: ""
  },
  {
    name: "Gentleman’s Package", price: 5740, duration: 60,
    id: "",
    description: "",
    category: ""
  },
  {
    name: "Royal Shave Package", price: 7180, duration: 75,
    id: "",
    description: "",
    category: ""
  },
  {
    name: "Haircut Only", price: 2500, duration: 30,
    id: "",
    description: "",
    category: ""
  },
  {
    name: "Beard Trim Only", price: 1500, duration: 15,
    id: "",
    description: "",
    category: ""
  },
  {
    name: "Haircut + Beard", price: 3500, duration: 45,
    id: "",
    description: "",
    category: ""
  },
];

const AddWalkinModal: React.FC<AddWalkinModalProps> = ({ onClose, onSuccess }) => {
  const { barber } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    service: SERVICES[0], // default first service
  });
  const [isLoading, setIsLoading] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barber) {
      toast.error("Barber authentication required");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, "");

      // Step 1: Sign in or Sign up customer
      let userToken: string;
      try {
        const loginResponse = await authService.login(cleanPhone, undefined, "USER");
        userToken = loginResponse.token;
        toast.success(`Found existing customer: ${formData.name}`);
      } catch {
        try {
          const signupResponse = await authService.signup(
            { name: formData.name.trim(), phoneNumber: cleanPhone },
            "USER"
          );
          userToken = signupResponse.token;
          toast.success(`Created new customer: ${formData.name}`);
        } catch (signupError: any) {
          if (signupError.response?.data?.msg?.includes("already exists")) {
            const loginResponse = await authService.login(cleanPhone, undefined, "USER");
            userToken = loginResponse.token;
            toast.success("Customer found with this phone number");
          } else {
            throw signupError;
          }
        }
      }

      // Step 2: Temporarily act as this user to join queue
      const originalToken = localStorage.getItem("token");
      const originalRole = localStorage.getItem("role");

      localStorage.setItem("token", userToken);
      localStorage.setItem("role", "USER");

      try {
        await userQueueService.joinQueue(barber.id, formData.service.name);
        toast.success(`${formData.name} added to queue successfully!`);
        onSuccess();
      } finally {
        if (originalToken) localStorage.setItem("token", originalToken);
        if (originalRole) localStorage.setItem("role", originalRole);
      }
    } catch (error: any) {
      console.error("Error adding walk-in customer:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        error.message ||
        "Failed to add customer to queue";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-title">Add Walk-in Customer</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer's full name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-50 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Enter 10-digit phone number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-50 text-gray-900 dark:text-gray-100"
                disabled={isLoading}
                maxLength={10}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                10 digits starting with 6, 7, 8, or 9
              </p>
            </div>

            {/* Service Selection (same as user side) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Required
              </label>
              <div className="space-y-2">
                {SERVICES.map((service) => (
                  <label
                    key={service.name}
                    className="flex items-center p-3 border border-gray-200 dark:border-dark-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="service"
                      value={service.name}
                      checked={formData.service.name === service.name}
                      onChange={() => setFormData({ ...formData, service })}
                      className="mr-3 text-primary-600 focus:ring-primary-500"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{service.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ₹{service.price} • ~{service.duration} min
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add to Queue"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWalkinModal;
