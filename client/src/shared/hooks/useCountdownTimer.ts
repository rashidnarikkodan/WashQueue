import { useState, useEffect } from "react"

export function useCountdownTimer(initialSeconds: number = 60) {
  const [timerCount, setTimerCount] = useState(initialSeconds)
  const [isResendActive, setIsResendActive] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (timerCount > 0) {
      interval = setInterval(() => {
        setTimerCount((prev) => prev - 1)
      }, 1000)
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsResendActive(true)
    }
    return () => clearInterval(interval)
  }, [timerCount])

  const resetTimer = (seconds: number = initialSeconds) => {
    setTimerCount(seconds)
    setIsResendActive(false)
  }

  const formatTimer = () => {
    const min = Math.floor(timerCount / 60)
    const s = timerCount % 60
    return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return {
    timerCount,
    isResendActive,
    resetTimer,
    formatTimer: formatTimer(),
  }
}
