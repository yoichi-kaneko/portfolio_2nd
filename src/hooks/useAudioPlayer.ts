"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseAudioPlayerOptions = {
  audioUrl: string;
};

type UseAudioPlayerReturn = {
  isPlaying: boolean;
  onToggle: () => Promise<void>;
  analyserNode: AnalyserNode | null;
};

/**
 * 音声の再生/停止と AnalyserNode を管理するカスタムフック。
 */
export function useAudioPlayer({
  audioUrl,
}: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initialize = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = audioUrl;
      audio.preload = "auto";
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }

    if (!audioContextRef.current) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audioRef.current);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;

      source.connect(analyser);
      analyser.connect(context.destination);

      audioContextRef.current = context;
      analyserRef.current = analyser;
      mediaSourceRef.current = source;
      setAnalyserNode(analyser);
    }

    return {
      audio: audioRef.current,
      context: audioContextRef.current,
    };
  }, [audioUrl]);

  const onToggle = useCallback(async () => {
    const { audio, context } = initialize();
    if (!audio || !context) return;

    if (audio.paused) {
      if (context.state === "suspended") {
        await context.resume();
      }
      try {
        await audio.play();
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        throw error;
      }
      return;
    }

    audio.pause();
  }, [initialize]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.onplay = null;
        audioRef.current.onpause = null;
        audioRef.current.onended = null;
        audioRef.current.pause();
      }
      if (mediaSourceRef.current) {
        mediaSourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isPlaying,
    onToggle,
    analyserNode,
  };
}
