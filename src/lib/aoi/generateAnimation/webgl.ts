/**
 * この環境で WebGL 2 を使えるかを調べる。three.js（r163 以降）は WebGL 2 にだけ対応している。
 *
 * 使えない環境で WebGLRenderer を作ると、three.js がコンソールにエラーを出してから例外を投げる。
 * 使えないのは想定内の環境の制約なので、three.js を読み込む前にここで判定し、エラーとしては扱わない。
 *
 * 判定には描画先とは別の canvas を使い、作ったコンテキストはすぐに手放す
 * （描画先の canvas で取得すると、three.js が指定する属性でコンテキストを作れなくなる）。
 */
export function isWebGL2Available(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
