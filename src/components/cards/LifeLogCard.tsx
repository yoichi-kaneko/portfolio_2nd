"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCirclePlay,
  faCircleStop,
  faMapLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useCallback, useRef, useState } from "react";
import { Tooltip } from "react-tooltip";
import { MountainMapModal } from "./MountainMapModal";
import { mountains } from "@/data/modules/mountains";
import { useMountainReportCount } from "@/hooks/useMountainReportCount";

/** 登山の進捗・直近の登頂・YAMAP レポート総件数（API）をまとめて表示するカード。 */
export function LifeLogCard() {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const handleCloseMap = useCallback(() => setIsMapOpen(false), []);
  const latestMountain = mountains.reduce((a, b) => (a.date > b.date ? a : b));
  const { count: reportCount, loading: reportCountLoading } =
    useMountainReportCount();

  const AUDIO_URL =
    "https://res.cloudinary.com/damehnlii/video/upload/v1775359579/readout_u5ksqf.mp3";
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioToggle = useCallback(() => {
    if (!isPlaying) {
      if (!audioRef.current) {
        const audio = new Audio(AUDIO_URL);
        audio.addEventListener("ended", () => setIsPlaying(false));
        audioRef.current = audio;
      }
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return (
    <>
      <MountainMapModal isOpen={isMapOpen} onClose={handleCloseMap} />

      <Tooltip id="audio-tooltip" place="bottom" />
      <div data-testid="life-log-card">
        <div className="relative z-10">
          {/* Header row */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
                Life Log
              </h3>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                Mountaineering
              </p>
            </div>
            {/* 音声リンク: 目立たせず右上に小さく配置 */}
            <button
              className="text-gray-600 hover:text-gray-400 transition-colors mt-1"
              data-tooltip-id="audio-tooltip"
              data-tooltip-content="なぜポートフォリオに登山？（2:26 音声で聞く）"
              onClick={handleAudioToggle}
            >
              {isPlaying ? (
                <FontAwesomeIcon icon={faCircleStop} className="w-4 h-4" />
              ) : (
                <FontAwesomeIcon icon={faCirclePlay} className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* 最近の登頂 */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-700 uppercase tracking-widest mb-1">
                最近の登頂（百名山）
              </p>
              <p className="text-sm text-gray-700 font-semibold">
                {latestMountain.name}
              </p>
            </div>
            {/* レポート件数 */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
              <p className="text-[10px] text-gray-700 uppercase tracking-widest mb-1">
                登山レポート（総計）
              </p>
              <p
                className="text-sm text-gray-700 font-semibold"
                aria-live="polite"
                aria-atomic="true"
              >
                {reportCountLoading ? (
                  <span
                    className="inline-block h-6 w-12 bg-gray-800 rounded animate-pulse align-middle"
                    data-testid="report-count-skeleton"
                    aria-hidden="true"
                  />
                ) : (
                  <>
                    <span className="text-xl font-bold text-gray-700">
                      {reportCount !== null ? reportCount : "???"}
                    </span>
                    <span className="text-gray-700 ml-1">件</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Progress bar + Map link */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-gray-200">
                Goal to 100 Famous Mountains
              </p>
              <button
                className="text-[12px] text-blue-500 hover:text-blue-400 hover:underline transition-colors"
                onClick={() => setIsMapOpen(true)}
              >
                Map
                <FontAwesomeIcon
                  icon={faMapLocationDot}
                  className="w-4 h-4 inline-block mr-1 ml-1"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${mountains.length}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-right text-gray-200">
              {mountains.length} / 100
            </p>
          </div>
        </div>
        {/* /relative z-10 */}
      </div>
      {/* /data-testid="life-log-card" */}
    </>
  );
}
