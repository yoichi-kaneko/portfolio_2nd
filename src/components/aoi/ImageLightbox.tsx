"use client";

import { useEffect, useRef } from "react";
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
 *
 * WAI-ARIA ダイアログとして、開閉時のフォーカス移動・Tab トラップ・背景スクロールロックを行う。
 */
export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeBtnRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, []);

  return (
    <div
      data-testid="aoi-lightbox-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      {/* 画像枠は中身（画像）にフィットし、外側クリックは背景へ届く */}
      <div
        ref={dialogRef}
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
          ref={closeBtnRef}
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
