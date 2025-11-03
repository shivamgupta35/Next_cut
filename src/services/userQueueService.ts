// src/services/userQueueService.ts
import api from "./api";

export const userQueueService = {
  // ✅ Join queue
  async joinQueue(barberId: number, service: string) {
    try {
      const response = await api.post("/user/joinqueue", { barberId, service });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.msg ||
          "Failed to join queue"
      );
    }
  },

  async leaveQueue() {
    try {
      const response = await api.post("/user/leavequeue");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.msg ||
          "Failed to leave queue"
      );
    }
  },

  async getQueueStatus() {
    try {
      const response = await api.get("/user/queue-status");
      return response.data.queueStatus;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          inQueue: false,
          queuePosition: null,
          barber: null,
          enteredAt: null,
          service: null,
          estimatedWaitTime: null,
        };
      }
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.msg ||
          error.message ||
          "Failed to get queue status"
      );
    }
  },

  async getNearbyBarbers(lat: number, long: number, radius: number = 4) {
    try {
      const response = await api.post("/user/barbers", { lat, long, radius });
      return response.data.barbers || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.msg ||
          error.message ||
          "Failed to get nearby barbers"
      );
    }
  },

  // ✅ Razorpay Integration
  async createOrder(amount: number) {
    try {
      const response = await api.post("/payment/create-order", { amount });
      return response.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.msg || "Failed to create order");
    }
  },

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    barberId: number,
    service: string
  ) {
    try {
      const response = await api.post("/payment/verify-payment", {
        order_id: orderId,
        payment_id: paymentId,
        signature,
        barberId,   // ✅ now sending barberId
        service,    // ✅ now sending service
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.msg || "Failed to verify Razorpay payment"
      );
    }
  },
};
