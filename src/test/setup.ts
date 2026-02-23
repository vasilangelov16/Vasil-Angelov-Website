import "@testing-library/jest-dom";

function ensureStorage(name: "localStorage" | "sessionStorage") {
  const storage = (globalThis as Record<string, unknown>)[name] as
    | {
        getItem?: (key: string) => string | null;
        setItem?: (key: string, value: string) => void;
        removeItem?: (key: string) => void;
        clear?: () => void;
      }
    | undefined;

  if (
    storage?.getItem &&
    storage?.setItem &&
    storage?.removeItem &&
    storage?.clear
  ) {
    return;
  }

  const map = new Map<string, string>();
  const fallback = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(String(key), String(value));
    },
    removeItem: (key: string) => {
      map.delete(String(key));
    },
    clear: () => {
      map.clear();
    },
  };

  Object.defineProperty(globalThis, name, {
    writable: true,
    value: fallback,
  });
}

ensureStorage("localStorage");
ensureStorage("sessionStorage");

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (!("ResizeObserver" in window)) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: ResizeObserverMock,
  });
}

if (!("IntersectionObserver" in window)) {
  class IntersectionObserverMock {
    root: Element | Document | null = null;
    rootMargin = "0px";
    thresholds: ReadonlyArray<number> = [0];
    constructor(
      _callback: IntersectionObserverCallback,
      _options?: IntersectionObserverInit
    ) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: IntersectionObserverMock,
  });
}

if (!("scrollTo" in window.HTMLElement.prototype)) {
  Object.defineProperty(window.HTMLElement.prototype, "scrollTo", {
    writable: true,
    value: () => {},
  });
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0);
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (id: number) => clearTimeout(id);
}

