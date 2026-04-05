import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUDIO_ANALYSER_FFT_SIZE } from "@/config/audio";
import { useAudioPlayer } from "./useAudioPlayer";

type MockAudioElement = {
  crossOrigin: string;
  src: string;
  preload: string;
  onplay: null | (() => void);
  onpause: null | (() => void);
  onended: null | (() => void);
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  paused: boolean;
};

describe("useAudioPlayer", () => {
  let audioElement: MockAudioElement;
  let analyserNode: {
    fftSize: number;
    frequencyBinCount: number;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };
  let sourceNode: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };
  let audioContextInstance: {
    state: AudioContextState;
    destination: AudioNode;
    resume: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    createMediaElementSource: ReturnType<typeof vi.fn>;
    createAnalyser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    analyserNode = {
      fftSize: 0,
      frequencyBinCount: 128,
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    sourceNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    audioElement = {
      crossOrigin: "",
      src: "",
      preload: "",
      onplay: null,
      onpause: null,
      onended: null,
      paused: true,
      play: vi.fn(async () => {
        audioElement.paused = false;
        audioElement.onplay?.();
      }),
      pause: vi.fn(() => {
        audioElement.paused = true;
        audioElement.onpause?.();
      }),
    };

    audioContextInstance = {
      state: "suspended",
      destination: {} as AudioNode,
      resume: vi.fn(async () => {
        audioContextInstance.state = "running";
      }),
      close: vi.fn(async () => undefined),
      createMediaElementSource: vi.fn(() => sourceNode),
      createAnalyser: vi.fn(() => analyserNode),
    };

    function AudioMock(): MockAudioElement {
      return audioElement;
    }
    function AudioContextMock() {
      return audioContextInstance;
    }

    Object.defineProperty(window, "Audio", {
      writable: true,
      value: AudioMock,
    });
    Object.defineProperty(globalThis, "Audio", {
      writable: true,
      value: AudioMock,
    });
    Object.defineProperty(window, "AudioContext", {
      writable: true,
      value: AudioContextMock,
    });
    Object.defineProperty(globalThis, "AudioContext", {
      writable: true,
      value: AudioContextMock,
    });
  });

  it("初期状態は未再生でanalyserNodeはnull", () => {
    const { result } = renderHook(() =>
      useAudioPlayer({ audioUrl: "https://example.com/sample.mp3" }),
    );

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.analyserNode).toBeNull();
  });

  it("onToggleで初期化後に再生し、2回目で停止する", async () => {
    const { result } = renderHook(() =>
      useAudioPlayer({ audioUrl: "https://example.com/sample.mp3" }),
    );

    await act(async () => {
      await result.current.onToggle();
    });

    await waitFor(() => {
      expect(result.current.isPlaying).toBe(true);
    });
    expect(audioContextInstance.resume).toHaveBeenCalledOnce();
    expect(analyserNode.fftSize).toBe(AUDIO_ANALYSER_FFT_SIZE);
    expect(result.current.analyserNode).not.toBeNull();

    await act(async () => {
      await result.current.onToggle();
    });

    expect(audioElement.pause).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(result.current.isPlaying).toBe(false);
    });
  });

  it("playがAbortErrorを投げた場合は例外を握りつぶす", async () => {
    audioElement.play = vi.fn(async () => {
      throw new DOMException("aborted", "AbortError");
    });

    const { result } = renderHook(() =>
      useAudioPlayer({ audioUrl: "https://example.com/sample.mp3" }),
    );

    await expect(result.current.onToggle()).resolves.toBeUndefined();
    expect(result.current.isPlaying).toBe(false);
  });

  it("unmount時に音声ノードとAudioContextをクリーンアップする", async () => {
    const { result, unmount } = renderHook(() =>
      useAudioPlayer({ audioUrl: "https://example.com/sample.mp3" }),
    );

    await act(async () => {
      await result.current.onToggle();
    });

    unmount();

    expect(audioElement.pause).toHaveBeenCalled();
    expect(sourceNode.disconnect).toHaveBeenCalled();
    expect(analyserNode.disconnect).toHaveBeenCalled();
    expect(audioContextInstance.close).toHaveBeenCalled();
  });
});
