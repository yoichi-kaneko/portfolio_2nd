import { useEffect, useState } from "react";

export type AoiGeneratedImage = {
  // 画像オリジナルサイズの公開 URL
  originalUrl: string;
  // 縦幅を縮小したプレビュー用の公開 URL
  previewUrl: string;
};

/**
 * Cloudinary の生成画像（最新3件）を API から取得するカスタムフック。
 *
 * @returns `images`（取得失敗時は null）と `loading` 状態
 */
export function useAoiGeneratedImages() {
  const [images, setImages] = useState<AoiGeneratedImage[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cloudinary/images")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json: { images: AoiGeneratedImage[] }) => {
        setImages(json.images);
      })
      .catch(() => {
        setImages(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { images, loading };
}
