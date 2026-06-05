import { useEffect, useRef } from "react"

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
]

export const useAutoLock = (timeoutMs: number, onLock: () => void): void => {
  const onLockRef = useRef(onLock)

  useEffect(() => {
    onLockRef.current = onLock
  }, [onLock])

  useEffect(() => {
    if (timeoutMs <= 0) return

    let timerId: ReturnType<typeof setTimeout> | null = null

    const fire = () => {
      onLockRef.current()
    }

    const reset = () => {
      if (timerId) clearTimeout(timerId)
      timerId = setTimeout(fire, timeoutMs)
    }

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, reset, { passive: true })
    )
    reset()

    return () => {
      if (timerId) clearTimeout(timerId)
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, reset)
      )
    }
  }, [timeoutMs])
}
