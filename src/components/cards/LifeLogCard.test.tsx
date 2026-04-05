import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LifeLogCard } from "./LifeLogCard";

vi.mock("react-tooltip", () => ({
  Tooltip: (props: { id: string }) => (
    <div data-testid={`tooltip-${props.id}`} />
  ),
}));

vi.mock("./MountainMapModal", () => ({
  MountainMapModal: () => null,
}));

vi.mock("@/hooks/useMountainReportCount", () => ({
  useMountainReportCount: () => ({ count: 321, loading: false }),
}));

vi.mock("@/data/modules/mountains", () => ({
  mountains: [
    { name: "山A", date: "2023-01-01" },
    { name: "山B", date: "2024-01-01" },
  ],
}));

describe("LifeLogCard", () => {
  it("未再生時は再生ラベルで、クリック時にonToggleを呼ぶ", () => {
    const onToggle = vi.fn(async () => undefined);
    render(<LifeLogCard isPlaying={false} onToggle={onToggle} />);

    const toggleButton = screen.getByTestId("life-log-audio-toggle");
    expect(toggleButton.getAttribute("aria-label")).toBe("音声を再生");

    fireEvent.click(toggleButton);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("再生中は停止ラベルになる", () => {
    render(<LifeLogCard isPlaying onToggle={vi.fn(async () => undefined)} />);

    const toggleButton = screen.getByTestId("life-log-audio-toggle");
    expect(toggleButton.getAttribute("aria-label")).toBe("音声を停止");
  });

  it("進捗は設定されたゴール値で表示される", () => {
    render(
      <LifeLogCard isPlaying={false} onToggle={vi.fn(async () => undefined)} />,
    );

    expect(screen.getByText("2 / 100")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-audio-tooltip")).toBeInTheDocument();
  });
});
