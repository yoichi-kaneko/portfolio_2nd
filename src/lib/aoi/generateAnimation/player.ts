import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CAMERA_FOV, fitDistance, pointScaleFor } from "./layout";
import { Background } from "./objects/background";
import { pixelRatio, pointScale } from "./objects/particles";
import { Story } from "./story";
import { FONTS } from "./textures";
import { formatTimelineStatus, LOOP_DURATION } from "./timeline";

/*
 * 碧衣の画像生成プロセスを表すアニメーションの再生器。
 * レンダラー・ブルーム・カメラ・描画ループを持ち、再生と一時停止を外から操作する。
 *
 * 描画ループが回るのは「再生中」かつ「キャンバスが画面内にある」間だけ。
 * 一時停止中や画面外にある間は描画を止め、最後に描いた絵をそのまま残す。
 */

export interface GenerateAnimationFonts {
  /** カードやラベルに使うフォントの font-family。 */
  label: string;
  /** コマンド名やプロンプトの本文に使う等幅フォントの font-family。 */
  mono: string;
}

export interface GenerateAnimationOptions {
  canvas: HTMLCanvasElement;
  fonts: GenerateAnimationFonts;
  /** 渡すと、ループ内の時刻と場面名をここへ書き込む（デバッグ表示）。 */
  timeline?: HTMLElement | null;
}

export interface GenerateAnimationPlayer {
  play(): void;
  pause(): void;
  /** 描画ループを止め、GPU の資源を解放する。以後は使えない。 */
  dispose(): void;
}

/** 1 フレームで進める時間の上限（秒）。タブの切り替えなどで間が空いても、一度に飛ばさない。 */
const MAX_FRAME_STEP = 0.1;

/** キャンバスに文字を描く前に、ラベル用のフォントを読み込んでおく。 */
async function loadFonts(): Promise<void> {
  const faces = [
    `500 40px ${FONTS.label}`,
    `600 40px ${FONTS.label}`,
    `500 40px ${FONTS.mono}`,
  ];
  try {
    await Promise.all(faces.map((face) => document.fonts.load(face)));
  } catch {
    // 読み込めなくても、代替フォントで描画を続ける
  }
}

/** 場面の中の geometry・material・texture を解放する。 */
function disposeScene(scene: THREE.Scene): void {
  const disposeValue = (value: unknown): void => {
    if (value instanceof THREE.Texture) value.dispose();
  };
  scene.traverse((object) => {
    if (
      !(object instanceof THREE.Mesh) &&
      !(object instanceof THREE.Points) &&
      !(object instanceof THREE.Line)
    ) {
      return;
    }
    object.geometry.dispose();
    const materials: THREE.Material[] = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of materials) {
      if (material instanceof THREE.ShaderMaterial) {
        for (const uniform of Object.values(material.uniforms)) {
          disposeValue(uniform.value);
        }
      } else if ("map" in material) {
        disposeValue(material.map);
      }
      material.dispose();
    }
  });
}

export async function createGenerateAnimationPlayer(
  options: GenerateAnimationOptions,
): Promise<GenerateAnimationPlayer> {
  const { canvas, timeline = null } = options;
  FONTS.label = options.fonts.label;
  FONTS.mono = options.fonts.mono;
  await loadFonts();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#02040b");
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 200);

  const composer = new EffectComposer(renderer);
  const passes = [
    new RenderPass(scene, camera),
    new UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.45, 0.62),
    new OutputPass(),
  ];
  for (const pass of passes) composer.addPass(pass);

  const background = new Background();
  scene.add(background.group);
  const story = new Story(scene);

  /** ループ内の時刻（秒）。 */
  let loopTime = 0;
  /** 再生していた時間の累計（秒）。背景の粒を漂わせるのに使い、一時停止中は進めない。 */
  let elapsed = 0;
  // 背景を流す量。ループの切れ目で移動量が巻き戻っても、背景は巻き戻さず進んだぶんだけ足していく
  let travel = 0;
  let lastScroll = 0;
  let cameraDistance = fitDistance(16 / 9);

  let playing = false;
  let visible = true;
  let running = false;
  let lastFrame: number | null = null;

  const writeTimeline = (): void => {
    if (timeline)
      timeline.textContent = formatTimelineStatus(loopTime, !playing);
  };

  const render = (): void => {
    // ループ1周でちょうど元に戻る、ごく小さなカメラの揺れ
    const sway = (loopTime / LOOP_DURATION) * Math.PI * 2;
    camera.position.set(
      Math.sin(sway) * 0.12,
      Math.sin(sway * 2) * 0.06,
      cameraDistance,
    );
    camera.lookAt(0, 0, 0);

    story.update(loopTime);
    const delta = story.scroll - lastScroll;
    if (delta > 0 && delta < 1) travel += delta;
    lastScroll = story.scroll;
    background.update(elapsed, travel);
    composer.render();
    writeTimeline();
  };

  const tick = (now: number): void => {
    const step =
      lastFrame === null
        ? 0
        : Math.min(Math.max((now - lastFrame) / 1000, 0), MAX_FRAME_STEP);
    lastFrame = now;
    loopTime = (loopTime + step) % LOOP_DURATION;
    elapsed += step;
    render();
  };

  const syncLoop = (): void => {
    const shouldRun = playing && visible;
    if (shouldRun === running) return;
    running = shouldRun;
    // 止まっていた間の経過時間を、再開直後の 1 フレームで進めない
    lastFrame = null;
    renderer.setAnimationLoop(shouldRun ? tick : null);
  };

  const resize = (): void => {
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(dpr);
    composer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    cameraDistance = fitDistance(camera.aspect);
    pointScale.value = pointScaleFor(height);
    pixelRatio.value = dpr;
    // 大きさを変えるとキャンバスが消えるため、描画ループが止まっている間もその場で描き直す
    if (!running) render();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1];
    if (!entry) return;
    visible = entry.isIntersecting;
    syncLoop();
  });
  intersectionObserver.observe(canvas);

  let disposed = false;
  return {
    play() {
      if (disposed) return;
      playing = true;
      syncLoop();
      writeTimeline();
    },
    pause() {
      if (disposed) return;
      playing = false;
      syncLoop();
      writeTimeline();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      playing = false;
      syncLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      disposeScene(scene);
      // EffectComposer.dispose() は自前のレンダーターゲットだけを解放し、各パスは解放しない
      for (const pass of passes) pass.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
