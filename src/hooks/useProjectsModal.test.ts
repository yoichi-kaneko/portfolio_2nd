import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProjectsModal } from "./useProjectsModal";

vi.mock("@/data/modules/projects", () => ({
  projects: [
    {
      id: "contract-app",
      name: "contract-app",
      period: "2024",
      type: "contract",
      recent: true,
      description: "contract desc",
      detail: "contract detail",
      tags: ["TypeScript"],
    },
    {
      id: "employee-app",
      name: "employee-app",
      period: "2023",
      type: "employee",
      recent: false,
      description: "employee desc",
      detail: "employee detail",
      tags: ["React"],
    },
    {
      id: "personal-app",
      name: "personal-app",
      period: "2025",
      type: "personal",
      recent: true,
      description: "personal desc",
      detail: "personal detail",
      tags: ["Next.js"],
    },
  ],
}));

describe("useProjectsModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
  });

  it("初期状態は all タブで、全プロジェクトを返す", () => {
    const { result } = renderHook(() => useProjectsModal({ onClose }));

    expect(result.current.activeTab).toBe("all");
    expect(result.current.selectedProject).toBeNull();
    expect(result.current.filteredProjects).toHaveLength(3);
  });

  it("handleTabChange でタブと filteredProjects が更新される", () => {
    const { result } = renderHook(() => useProjectsModal({ onClose }));

    act(() => {
      result.current.handleTabChange("contract");
    });

    expect(result.current.activeTab).toBe("contract");
    expect(result.current.filteredProjects).toHaveLength(1);
    expect(result.current.filteredProjects[0].name).toBe("contract-app");
  });

  it("handleTabChange で selectedProject がリセットされる", () => {
    const { result } = renderHook(() => useProjectsModal({ onClose }));

    act(() => {
      result.current.setSelectedProject(result.current.filteredProjects[0]);
    });
    expect(result.current.selectedProject?.name).toBe("contract-app");

    act(() => {
      result.current.handleTabChange("employee");
    });
    expect(result.current.selectedProject).toBeNull();
  });

  it("handleClose で状態を初期化し onClose を呼ぶ", () => {
    const { result } = renderHook(() => useProjectsModal({ onClose }));

    act(() => {
      result.current.handleTabChange("personal");
      result.current.setSelectedProject(result.current.filteredProjects[0]);
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.activeTab).toBe("all");
    expect(result.current.selectedProject).toBeNull();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("Escape キーで handleClose 相当の処理が走る", () => {
    const { result } = renderHook(() => useProjectsModal({ onClose }));

    act(() => {
      result.current.handleTabChange("employee");
      result.current.setSelectedProject(result.current.filteredProjects[0]);
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(result.current.activeTab).toBe("all");
    expect(result.current.selectedProject).toBeNull();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
