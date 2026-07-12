"use client";

import { useEffect } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  /** 表示するオリジナル画像の URL */
  src: string;
  /** 画像の代替テキスト */
  alt: string;
  /** 閉じるコールバック */
  onClose: () => void;
}

/**
 * 生成画像をオリジナルサイズで拡大表示する Lightbox。
 *
 * 画像の外側（暗い背景）クリック・`Escape` キー・✕ ボタンで閉じる。
 * Cloudinary 側で配信最適化済みのため next/image の最適化は無効化（`unoptimized`）し、
 * 画像自身の縦横比を保ったままビューポートに収まるよう表示する。
 */
export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      data-testid="aoi-lightbox-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      {/* 画像枠は中身（画像）にフィットし、外側クリックは背景へ届く */}
      <div
        data-testid="aoi-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="生成画像の拡大表示"
        className="relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="90vw"
          unoptimized
          className="h-auto max-h-[90vh] w-auto max-w-[90vw] rounded-[12px]"
        />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-[10px] right-[10px] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[rgba(127,212,255,0.3)] bg-[rgba(8,14,28,0.82)] text-[16px] text-gray-300 backdrop-blur-[6px] transition-colors hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
