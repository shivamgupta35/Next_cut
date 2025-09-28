import React, { useState } from "react";
import { type Service, SERVICES } from "../../types";

type Props = {
  onSelect: (service: Service) => void;
  onCancel: () => void;
};

const ServiceSelection: React.FC<Props> = ({ onSelect, onCancel }) => {
  const [selected, setSelected] = useState<Service | null>(null);

  const handleSelect = (service: Service) => {
    setSelected(service);
  };

  const handleJoinQueue = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[400px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Choose Your Service</h2>

        {SERVICES.map((service) => (
          <div
            key={service.id}
            onClick={() => handleSelect(service)}
            className={`border rounded-lg p-4 mb-3 cursor-pointer transition ${
              selected?.id === service.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{service.name}</h3>
              <span className="text-sm text-gray-700">₹{service.price}</span>
            </div>
            <p className="text-sm text-gray-500">{service.description}</p>
            <div className="text-xs text-gray-400 mt-1">
              ~{service.duration} min • {service.category}
            </div>
          </div>
        ))}

        {/* Footer: Total + Buttons */}
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium">Total:</span>
            <span className="font-bold">
              {selected ? `₹${selected.price} • ~${selected.duration} min` : "—"}
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleJoinQueue}
              disabled={!selected}
              className={`px-4 py-2 rounded-lg text-white ${
                selected
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Join Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelection;
