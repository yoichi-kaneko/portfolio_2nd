import { useEffect, useRef, useState } from "react";
import { mountains } from "@/data/modules/mountains";

interface UseMountainMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function useMountainMapModal({ isOpen, onClose }: UseMountainMapModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") setSelectedIndex(Math.max(0, selectedIndex - 1));
      if (e.key === "ArrowRight") setSelectedIndex(Math.min(mountains.length - 1, selectedIndex + 1));
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null || !listRef.current) return;
    const item = listRef.current.children[selectedIndex] as HTMLElement;
    if (item) item.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(Math.max(0, selectedIndex - 1));
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(Math.min(mountains.length - 1, selectedIndex + 1));
  };

  const selected = selectedIndex !== null ? mountains[selectedIndex] : null;

  return {
    selectedIndex,
    setSelectedIndex,
    listRef,
    handlePrev,
    handleNext,
    selected,
  };
}
