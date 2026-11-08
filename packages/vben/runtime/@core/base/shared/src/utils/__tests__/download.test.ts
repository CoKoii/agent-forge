import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { downloadFileFromImageUrl, downloadFileFromUrl } from "../download";

describe("downloadFileFromUrl", () => {
  let clicked: string[] = [];
  const originalUserAgent = window.navigator.userAgent;

  function useChromeUserAgent() {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
  }

  beforeEach(() => {
    clicked = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function mockClick(
      this: HTMLAnchorElement,
    ) {
      clicked.push(this.download);
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: originalUserAgent,
    });
  });

  it("derives a decoded file name without the query string", async () => {
    useChromeUserAgent();

    await downloadFileFromUrl({
      source: "https://cdn.example.com/files/%E6%8A%A5%E5%91%8A.pdf?token=abc",
    });

    expect(clicked).toEqual(["报告.pdf"]);
  });

  it("keeps a plain file name and honours an explicit one", async () => {
    useChromeUserAgent();

    await downloadFileFromUrl({
      source: "https://cdn.example.com/files/report.pdf",
    });
    await downloadFileFromUrl({
      fileName: "custom.pdf",
      source: "https://cdn.example.com/files/report.pdf?v=2",
    });

    expect(clicked).toEqual(["report.pdf", "custom.pdf"]);
  });
});

describe("downloadFileFromImageUrl", () => {
  let clicked: string[] = [];

  function stubImagePipeline(dataUrl = "data:image/png;base64,AAAA") {
    class FakeImage {
      crossOrigin = "";
      height = 10;
      source = "";
      width = 10;
      private listeners: Record<string, () => void> = {};

      get src() {
        return this.source;
      }

      set src(value: string) {
        this.source = value;
        setTimeout(() => this.listeners.load?.(), 0);
      }

      addEventListener(type: string, callback: () => void) {
        this.listeners[type] = callback;
      }
    }

    vi.stubGlobal("Image", FakeImage);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: () => {},
    } as unknown as CanvasRenderingContext2D);
    Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
      configurable: true,
      value: () => dataUrl,
    });
  }

  beforeEach(() => {
    clicked = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function mockClick(
      this: HTMLAnchorElement,
    ) {
      clicked.push(this.download);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLCanvasElement.prototype, "toDataURL");
  });

  it("uses the encoded image extension for the downloaded file", async () => {
    stubImagePipeline();
    await downloadFileFromImageUrl({ source: "https://cdn.example.com/imgs/logo-v1.webp" });
    expect(clicked).toEqual(["logo-v1.png"]);
  });

  it("uses a default name when the URL has no file name", async () => {
    stubImagePipeline();
    await downloadFileFromImageUrl({ source: "https://cdn.example.com/imgs/" });
    expect(clicked).toEqual(["downloaded_file.png"]);
  });

  it("honours an explicit file name", async () => {
    stubImagePipeline();
    await downloadFileFromImageUrl({
      fileName: "vben-logo.png",
      source: "https://cdn.example.com/imgs/logo-v1.webp",
    });
    expect(clicked).toEqual(["vben-logo.png"]);
  });

  it("does not derive a file name from a data URL", async () => {
    stubImagePipeline();
    await downloadFileFromImageUrl({ source: "data:image/png;base64,iVBORw0KGgoAAA" });
    expect(clicked).toEqual(["downloaded_file.png"]);
  });
});
