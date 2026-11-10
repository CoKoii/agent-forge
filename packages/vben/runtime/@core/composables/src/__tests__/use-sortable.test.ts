import type { SortableOptions } from "sortablejs";

import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useSortable } from "../use-sortable";

vi.mock("sortablejs/modular/sortable.complete.esm.js", () => ({
  default: {
    create: vi.fn(),
  },
}));

describe("useSortable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should call Sortable.create with the correct options", async () => {
    // Create a mock element
    const mockElement = document.createElement("div");

    // Define custom options
    const customOptions: SortableOptions = {
      group: "test-group",
      sort: false,
    };

    // Use the useSortable function
    const { initializeSortable } = useSortable(mockElement, customOptions);

    // Initialize sortable
    await initializeSortable();

    // Import sortablejs to access the mocked create function
    const Sortable =
      // @ts-expect-error - This is a dynamic import
      await import("sortablejs/modular/sortable.complete.esm.js");

    // Verify that Sortable.create was called with the correct parameters
    expect(Sortable.default.create).toHaveBeenCalledTimes(1);
    expect(Sortable.default.create).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        animation: 300,
        delay: 400,
        delayOnTouchOnly: true,
        ...customOptions,
      }),
    );
  });
});
