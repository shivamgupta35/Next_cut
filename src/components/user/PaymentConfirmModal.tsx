import React from "react";
import type { Service, Barber } from "../../types";

type Props = {
  barber: Barber;
  service: Service;
  onCancel: () => void;
  onCash: () => void;
  onOnline: () => void;
};

const PaymentConfirmModal: React.FC<Props> = ({
  barber,
  service,
  onCancel,
  onCash,
  onOnline,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
        <h2 className="text-lg font-bold mb-4 text-center">Confirm Payment</h2>

        <div className="mb-4">
          <p>
            <span className="font-medium">Barber:</span> {barber.name}
          </p>
          <p>
            <span className="font-medium">Service:</span> {service.name}
          </p>
          <p>
            <span className="font-medium">Total:</span> ₹{service.price} • ~
            {service.duration} min
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onCash}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
          >
            Pay in Cash
          </button>
          <button
            onClick={onOnline}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Pay Online
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmModal;
