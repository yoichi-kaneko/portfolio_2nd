import { afterEach, describe, expect, it, vi } from "vitest";
import { isWebGL2Available } from "./webgl";

/** canvas.getContext の戻り値を差し替える（jsdom は WebGL を実装していない）。 */
function stubGetContext(impl: (type: string) => unknown) {
  return vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation(impl as HTMLCanvasElement["getContext"]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isWebGL2Available", () => {
  it("webgl2 のコンテキストを作れれば true を返し、判定に使ったコンテキストを手放す", () => {
    const loseContext = vi.fn();
    const getContext = stubGetContext(() => ({
      getExtension: (name: string) =>
        name === "WEBGL_lose_context" ? { loseContext } : null,
    }));

    expect(isWebGL2Available()).toBe(true);
    expect(getContext).toHaveBeenCalledWith("webgl2");
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it("WEBGL_lose_context が無くても、コンテキストを作れれば true を返す", () => {
    stubGetContext(() => ({ getExtension: () => null }));

    expect(isWebGL2Available()).toBe(true);
  });

  it("webgl2 のコンテキストを作れなければ false を返す", () => {
    stubGetContext(() => null);

    expect(isWebGL2Available()).toBe(false);
  });

  it("コンテキストの取得で例外が起きたら false を返す", () => {
    stubGetContext(() => {
      throw new Error("blocked");
    });

    expect(isWebGL2Available()).toBe(false);
  });
});
