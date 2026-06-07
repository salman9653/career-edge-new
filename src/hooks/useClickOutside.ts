import { useEffect, RefObject } from "react"

/**
 * Reusable hook to trigger a callback when clicking or touching outside of the specified elements.
 * Accepts either a single React RefObject or an array of RefObjects.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T | null> | RefObject<T | null>[],
  callback: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const refArray = Array.isArray(refs) ? refs : [refs]
      
      // Check if click/touch target is inside any of the registered refs
      const isInside = refArray.some((ref) => {
        return ref.current && ref.current.contains(event.target as Node)
      })

      if (!isInside) {
        callback(event)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [refs, callback])
}
