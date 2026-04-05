"use client";

import { useCallback, useEffect, useState } from "react";

type ElementSize = {
  width: number;
  height: number;
};

type UseElementSizeReturn<T extends HTMLElement> = {
  ref: (node: T | null) => void;
  size: ElementSize;
};

export function useElementSize<
  T extends HTMLElement,
>(): UseElementSizeReturn<T> {
  const [element, setElement] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const updateSize = () => {
      setSize({
        width: Math.max(1, Math.round(element.clientWidth)),
        height: Math.max(1, Math.round(element.clientHeight)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return { ref, size };
}
