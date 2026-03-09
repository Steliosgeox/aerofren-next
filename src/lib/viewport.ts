"use client";

import { useEffect } from "react";

export const VIEWPORT_HEIGHT_CSS_VAR = "--app-viewport-height";

type ViewportLike = {
  innerHeight: number;
  visualViewport?:
    | {
        height: number;
        addEventListener?: (
          type: "resize" | "scroll",
          listener: () => void,
          options?: AddEventListenerOptions,
        ) => void;
        removeEventListener?: (
          type: "resize" | "scroll",
          listener: () => void,
        ) => void;
      }
    | null;
};

export function getDynamicViewportHeight(
  viewport: ViewportLike = window,
): number {
  return Math.max(
    1,
    Math.round(viewport.visualViewport?.height ?? viewport.innerHeight),
  );
}

export function useViewportHeightCssVar(
  cssVarName: string = VIEWPORT_HEIGHT_CSS_VAR,
) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rootStyle = document.documentElement.style;
    let rafId = 0;

    const updateViewportVar = () => {
      rafId = 0;
      rootStyle.setProperty(
        cssVarName,
        `${getDynamicViewportHeight(window)}px`,
      );
    };

    const scheduleViewportVarUpdate = () => {
      if (rafId !== 0) {
        return;
      }

      rafId = window.requestAnimationFrame(updateViewportVar);
    };

    scheduleViewportVarUpdate();

    window.addEventListener("resize", scheduleViewportVarUpdate, {
      passive: true,
    });
    window.addEventListener("orientationchange", scheduleViewportVarUpdate, {
      passive: true,
    });

    window.visualViewport?.addEventListener?.(
      "resize",
      scheduleViewportVarUpdate,
      {
        passive: true,
      },
    );
    window.visualViewport?.addEventListener?.(
      "scroll",
      scheduleViewportVarUpdate,
      {
        passive: true,
      },
    );

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("resize", scheduleViewportVarUpdate);
      window.removeEventListener(
        "orientationchange",
        scheduleViewportVarUpdate,
      );

      window.visualViewport?.removeEventListener?.(
        "resize",
        scheduleViewportVarUpdate,
      );
      window.visualViewport?.removeEventListener?.(
        "scroll",
        scheduleViewportVarUpdate,
      );
    };
  }, [cssVarName]);
}
