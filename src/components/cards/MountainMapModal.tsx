"use client";

import { useEffect } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

interface MountainMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MountainMapModal({ isOpen, onClose }: MountainMapModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        data-testid="mountain-map-modal"
        className="relative w-full max-w-4xl h-[80vh] bg-[#161616] border border-[#262626] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] shrink-0">
          <div>
            <h2 className="text-xl font-bold">Mountain Map</h2>
            <p className="text-xs text-gray-500 mt-0.5">登頂した山々</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-0">
          <APIProvider apiKey={apiKey}>
            <Map
              style={{ width: "100%", height: "100%" }}
              defaultCenter={{ lat: 36.5, lng: 137.5 }}
              defaultZoom={6}
              mapId="mountain-map"
              gestureHandling="greedy"
              disableDefaultUI={false}
            />
          </APIProvider>
        </div>
      </div>
    </div>
  );
}
