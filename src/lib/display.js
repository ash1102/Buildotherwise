import { useEffect } from "react";
import { useStore } from "./store";

/** Display choices live on this device only, like the rest of the workbook. */
export const DISPLAY_KEY = "display";
// New users follow their device's light or dark setting. A saved choice always wins.
export const DEFAULT_DISPLAY = { textSize: "normal", theme: "system" };

export const TEXT_SIZES = [
  { value: "normal", label: "Normal", zoom: 1 },
  { value: "large", label: "Large", zoom: 1.12 },
  { value: "larger", label: "Larger", zoom: 1.25 },
];

export const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match my device" },
];

export function useDisplay() {
  return useStore(DISPLAY_KEY, DEFAULT_DISPLAY);
}

/** Applies the saved text size and theme to the whole page, and follows the device when asked to. */
export function useApplyDisplay() {
  const [display] = useDisplay();
  const textSize = (display && display.textSize) || DEFAULT_DISPLAY.textSize;
  const theme = (display && display.theme) || DEFAULT_DISPLAY.theme;

  useEffect(() => {
    const size = TEXT_SIZES.find((item) => item.value === textSize) || TEXT_SIZES[0];
    document.documentElement.style.zoom = size.zoom === 1 ? "" : String(size.zoom);
  }, [textSize]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && Boolean(media && media.matches));
      root.classList.toggle("dark", dark);
    };
    apply();
    if (theme !== "system" || !media) return undefined;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}
