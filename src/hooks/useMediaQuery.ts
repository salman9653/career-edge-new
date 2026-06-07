"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value asynchronously to avoid react-hooks/set-state-in-effect warning
    const timer = setTimeout(() => {
      setMatches(media.matches);
    }, 0);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    
    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}
