import { useState, useEffect } from "react";

/**
 * Custom React hook for managing light/dark theme state.
 * Toggles the 'dark' and 'light' classes on the document root element.
 *
 * @returns An object containing the `isDark` boolean and a `setIsDark` setter.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return !document.documentElement.classList.contains("light");
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [isDark]);

  return { isDark, setIsDark };
}
