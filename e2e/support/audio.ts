import type { Page } from "@playwright/test";

export type AudioMockState = {
  playCalls: number;
  pauseCalls: number;
  srcValues: string[];
};

export async function installAudioPlaybackStub(
  page: Page,
  failFirstPlay = false,
): Promise<void> {
  await page.addInitScript(
    ({ failFirstPlay }) => {
      const globalWindow = window as unknown as Window & {
        __audioMockState?: AudioMockState;
        __audioElement?: HTMLAudioElement;
      };

      globalWindow.__audioMockState = {
        playCalls: 0,
        pauseCalls: 0,
        srcValues: [] as string[],
      };

      const AudioMock = function AudioMock(this: HTMLAudioElement) {
        const element = document.createElement("audio");
        const mockState = globalWindow.__audioMockState as AudioMockState;
        let pausedState = true;
        let srcValue = "";

        Object.defineProperty(element, "paused", {
          configurable: true,
          get: () => pausedState,
        });
        Object.defineProperty(element, "src", {
          configurable: true,
          get: () => srcValue,
          set: (value: string) => {
            srcValue = value;
            mockState.srcValues.push(value);
          },
        });

        element.play = async () => {
          mockState.playCalls += 1;
          if (failFirstPlay && mockState.playCalls === 1)
            throw new DOMException("Playback denied", "NotAllowedError");
          pausedState = false;
          element.dispatchEvent(new Event("play"));
        };
        element.pause = () => {
          pausedState = true;
          mockState.pauseCalls += 1;
          element.dispatchEvent(new Event("pause"));
        };

        globalWindow.__audioElement = element;
        element.addEventListener("ended", () => {
          pausedState = true;
        });
        return element as HTMLAudioElement;
      };
      window.Audio = AudioMock as unknown as typeof Audio;
    },
    { failFirstPlay },
  );
}
