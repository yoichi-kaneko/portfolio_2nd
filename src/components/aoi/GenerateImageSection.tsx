"use client";

import Image from "next/image";
import { useState } from "react";
import { H2, LEAD_P, SECTION, SECTION_LABEL } from "@/config/aoi";
import { useAoiGeneratedImages } from "@/hooks/useAoiGeneratedImages";
import { ImageLightbox } from "./ImageLightbox";

/** 表示枠の枚数（取得件数・ローディング/フォールバックのプレースホルダ枚数） */
const TILE_COUNT = 3;

/** 各画像タイルの共通スタイル */
const TILE =
  "relative aspect-square overflow-hidden rounded-[16px] border border-[rgba(127,212,255,0.22)] bg-[#0c1426]";

/**
 * 画像生成セクション。
 *
 * `/api/cloudinary/images` から生成画像（最新3件）を取得し、プレビュー画像を横並びで表示する。
 * ローディング中・取得失敗時は仮画像（thumbnail.png）にフォールバックする。
 * プレビューをクリックするとオリジナルサイズを Lightbox で拡大表示する。
 */
export function GenerateImageSection() {
  const { images, loading } = useAoiGeneratedImages();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const hasImages = !loading && images !== null && images.length > 0;

  return (
    <section
      id="generate-image"
      className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[60px] pb-[30px]`}
    >
      <div className={SECTION_LABEL}>{"// 07 — GENERATE IMAGE"}</div>
      <h2 className={H2}>画像生成</h2>
      <p className={`${LEAD_P} m-0 mb-[30px] max-w-[620px]`}>
        毎日、その日のアクティビティに応じた情景の画像を生成します。
      </p>
      <div className="grid grid-cols-3 gap-[18px]">
        {hasImages
          ? images.map((image, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightboxSrc(image.originalUrl)}
                aria-label={`生成画像 ${i + 1} を拡大表示`}
                className={`${TILE} block cursor-pointer p-0 transition-transform hover:scale-[1.02]`}
              >
                <Image
                  src={image.previewUrl}
                  alt={`生成画像 ${i + 1}`}
                  fill
                  sizes="380px, 33vw"
                  unoptimized
                  className="object-cover object-center"
                />
              </button>
            ))
          : Array.from({ length: TILE_COUNT }, (_, i) => (
              <div key={i} className={TILE} data-testid="aoi-generate-skeleton">
                <Image
                  src="/aoi/thumbnail.png"
                  alt=""
                  fill
                  sizes="380px, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
      </div>

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt="生成画像（オリジナルサイズ）"
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </section>
  );
}
