"use client";

import { useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MOUNTAIN_MAP_OPTIONS, MOUNTAIN_MARKER_ZOOM } from "@/config/maps";
import { useMountainMapModal } from "@/hooks/useMountainMapModal";
import { mountains } from "@/data/modules/mountains";

/** 選択中の山に合わせて地図の中心とズームを更新する内部コンポーネント。 */
function MapController({ selectedIndex }: { selectedIndex: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || selectedIndex === null) return;
    const m = mountains[selectedIndex];
    map.panTo({ lat: m.latitude, lng: m.longitude });
    map.setZoom(MOUNTAIN_MARKER_ZOOM);
  }, [map, selectedIndex]);

  return null;
}

interface MountainMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 百名山の位置を Google マップ上で一覧・詳細表示するモーダル。E2E 時は外部マップを無効化できる。 */
export function MountainMapModal({ isOpen, onClose }: MountainMapModalProps) {
  const { selectedIndex, setSelectedIndex, listRef, handlePrev, handleNext, selected } =
    useMountainMapModal({ isOpen, onClose });

  if (!isOpen) return null;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const disableExternalMapsForE2E = process.env.NEXT_PUBLIC_DISABLE_EXTERNAL_MAPS === "1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        data-testid="mountain-map-backdrop"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        data-testid="mountain-map-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mountain-map-title"
        className="relative w-full max-w-6xl h-[85vh] bg-[#161616] border border-[#262626] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] shrink-0">
          <div>
            <h2 id="mountain-map-title" className="text-xl font-bold">
              Mountain Map
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">登頂した百名山 — {mountains.length}座</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Map */}
          <div className="flex-1 min-w-0">
            {disableExternalMapsForE2E ? (
              <div className="h-full w-full grid place-items-center bg-[#111] text-sm text-gray-500">
                Map is disabled in E2E environment
              </div>
            ) : (
              <APIProvider apiKey={apiKey}>
                <Map
                  style={{ width: "100%", height: "100%" }}
                  defaultCenter={MOUNTAIN_MAP_OPTIONS.center}
                  defaultZoom={MOUNTAIN_MAP_OPTIONS.zoom}
                  mapTypeId={MOUNTAIN_MAP_OPTIONS.mapTypeId}
                  mapTypeControl={MOUNTAIN_MAP_OPTIONS.mapTypeControl}
                  scaleControl={MOUNTAIN_MAP_OPTIONS.scaleControl}
                  zoomControlOptions={MOUNTAIN_MAP_OPTIONS.zoomControlOptions}
                  streetViewControl={MOUNTAIN_MAP_OPTIONS.streetViewControl}
                  fullscreenControl={MOUNTAIN_MAP_OPTIONS.fullscreenControl}
                  mapId={MOUNTAIN_MAP_OPTIONS.mapId}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                >
                  <MapController selectedIndex={selectedIndex} />
                  {mountains.map((mountain, index) => (
                    <AdvancedMarker
                      key={mountain.name}
                      position={{ lat: mountain.latitude, lng: mountain.longitude }}
                      onClick={() => setSelectedIndex(index)}
                      title={mountain.name}
                    >
                      <div
                        className={`rounded-full border-2 border-white transition-all duration-150 cursor-pointer ${
                          selectedIndex === index
                            ? "w-4 h-4 bg-sky-400 shadow-lg shadow-sky-400/60 scale-125"
                            : "w-3 h-3 bg-sky-500 opacity-80 hover:opacity-100 hover:scale-110"
                        }`}
                      />
                    </AdvancedMarker>
                  ))}
                </Map>
              </APIProvider>
            )}
          </div>

          {/* Right panel */}
          <div className="w-36 sm:w-56 md:w-72 border-l border-[#262626] flex flex-col shrink-0 bg-[#161616]">
            {/* Detail */}
            <div className="p-5 border-b border-[#262626] shrink-0 min-h-[160px] flex flex-col justify-center">
              {selected ? (
                <>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    {selectedIndex! + 1} / {mountains.length}
                  </p>
                  <h3 className="text-lg font-bold mb-1 leading-tight">{selected.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{selected.date}</p>
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline transition-colors"
                  >
                    YAMAPで詳細を見る
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  {/* Prev / Next */}
                  <div className="flex items-center justify-between mt-5">
                    <button
                      onClick={handlePrev}
                      disabled={selectedIndex === 0}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ← 前へ
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={selectedIndex === mountains.length - 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      次へ →
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  ピンをクリックして<br />詳細を表示
                </p>
              )}
            </div>

            {/* Mountain list */}
            <div ref={listRef} className="flex-1 overflow-y-auto">
              {mountains.map((mountain, index) => (
                <button
                  key={mountain.name}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-white/5 border-b border-[#1e1e1e] ${
                    selectedIndex === index ? "bg-white/10" : ""
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                      selectedIndex === index ? "bg-sky-400" : "bg-sky-700"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${selectedIndex === index ? "text-white" : "text-gray-300"}`}>
                      {mountain.name}
                    </p>
                    <p className="text-xs text-gray-500">{mountain.date}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
