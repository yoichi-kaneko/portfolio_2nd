"use client";

import { useEffect, type RefObject } from "react";

/** モーダルの初期フォーカス、Tab 循環、スクロールロックと開閉時の復元。 */
export function useModalFocus(
  open: boolean,
  dialogRef: RefObject<HTMLDivElement | null>,
  closeRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], [tabindex="0"]',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (
        !dialog.contains(document.activeElement) ||
        (event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open, dialogRef, closeRef]);
}
