import { useEffect, useState } from "react";

/**
 * 登山レポート件数を API から取得するカスタムフック。
 *
 * @returns `count`（取得失敗時は null）と `loading` 状態
 */
export function useMountainReportCount() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mountains/report-count")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json: { count: number }) => {
        setCount(json.count);
      })
      .catch(() => {
        setCount(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { count, loading };
}
