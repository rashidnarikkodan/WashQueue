import { useMemo, useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface RainDropConfig {
  id: number
  left: number
  headW: number
  headH: number
  tailLen: number
  duration: number
  delay: number
  opacity: number
}

interface AIRainEffectProps {
  active: boolean
}

export function AIRainEffect({ active }: AIRainEffectProps) {
  const [cycleKey, setCycleKey] = useState(0)
  const [isRendered, setIsRendered] = useState(active)

  if (active && !isRendered) {
    setIsRendered(true)
  }

  useEffect(() => {
    if (!active && isRendered) {
      // Keep rendered during the 1s fade-out so drops glide and fade continuously
      const timer = setTimeout(() => {
        setIsRendered(false)
        setCycleKey((k) => k + 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [active, isRendered])

  const drops = useMemo<RainDropConfig[]>(() => {
    return [
      // WAVE 1: Initial Drizzle (starts immediately 0s - 0.5s)
      {
        id: 1,
        left: 22,
        headW: 7,
        headH: 10,
        tailLen: 16,
        duration: 2.8,
        delay: 0.05,
        opacity: 0.36,
      },
      {
        id: 2,
        left: 38,
        headW: 10,
        headH: 14,
        tailLen: 22,
        duration: 2.4,
        delay: 0.12,
        opacity: 0.42,
      },
      {
        id: 3,
        left: 54,
        headW: 5,
        headH: 8,
        tailLen: 12,
        duration: 3.2,
        delay: 0.22,
        opacity: 0.3,
      },
      {
        id: 4,
        left: 68,
        headW: 12,
        headH: 16,
        tailLen: 26,
        duration: 2.2,
        delay: 0.0,
        opacity: 0.44,
      },
      {
        id: 5,
        left: 82,
        headW: 8,
        headH: 11,
        tailLen: 18,
        duration: 2.9,
        delay: 0.18,
        opacity: 0.38,
      },
      {
        id: 6,
        left: 96,
        headW: 11,
        headH: 15,
        tailLen: 24,
        duration: 2.5,
        delay: 0.08,
        opacity: 0.42,
      },
      {
        id: 7,
        left: 110,
        headW: 7,
        headH: 10,
        tailLen: 15,
        duration: 3.1,
        delay: 0.28,
        opacity: 0.34,
      },
      {
        id: 8,
        left: 124,
        headW: 13,
        headH: 17,
        tailLen: 28,
        duration: 2.3,
        delay: 0.04,
        opacity: 0.45,
      },
      {
        id: 9,
        left: 30,
        headW: 6,
        headH: 9,
        tailLen: 14,
        duration: 3.3,
        delay: 0.35,
        opacity: 0.32,
      },
      {
        id: 10,
        left: 76,
        headW: 9,
        headH: 13,
        tailLen: 20,
        duration: 2.7,
        delay: 0.15,
        opacity: 0.39,
      },
      {
        id: 11,
        left: 104,
        headW: 8,
        headH: 11,
        tailLen: 17,
        duration: 3.0,
        delay: 0.3,
        opacity: 0.36,
      },
      {
        id: 12,
        left: 118,
        headW: 12,
        headH: 16,
        tailLen: 25,
        duration: 2.4,
        delay: 0.02,
        opacity: 0.43,
      },

      // WAVE 2: Steady Rain (0.8s - 1.8s)
      {
        id: 13,
        left: 16,
        headW: 6,
        headH: 9,
        tailLen: 13,
        duration: 3.4,
        delay: 0.9,
        opacity: 0.32,
      },
      {
        id: 14,
        left: 26,
        headW: 9,
        headH: 12,
        tailLen: 19,
        duration: 2.8,
        delay: 1.05,
        opacity: 0.4,
      },
      {
        id: 15,
        left: 44,
        headW: 7,
        headH: 10,
        tailLen: 15,
        duration: 3.1,
        delay: 1.25,
        opacity: 0.35,
      },
      {
        id: 16,
        left: 48,
        headW: 11,
        headH: 15,
        tailLen: 23,
        duration: 2.5,
        delay: 0.95,
        opacity: 0.42,
      },
      {
        id: 17,
        left: 62,
        headW: 6,
        headH: 9,
        tailLen: 13,
        duration: 3.5,
        delay: 1.15,
        opacity: 0.32,
      },
      {
        id: 18,
        left: 72,
        headW: 10,
        headH: 14,
        tailLen: 21,
        duration: 2.6,
        delay: 0.85,
        opacity: 0.41,
      },
      {
        id: 19,
        left: 86,
        headW: 5,
        headH: 8,
        tailLen: 11,
        duration: 3.7,
        delay: 1.4,
        opacity: 0.28,
      },
      {
        id: 20,
        left: 90,
        headW: 12,
        headH: 16,
        tailLen: 25,
        duration: 2.4,
        delay: 1.0,
        opacity: 0.44,
      },
      {
        id: 21,
        left: 100,
        headW: 9,
        headH: 13,
        tailLen: 20,
        duration: 2.8,
        delay: 1.2,
        opacity: 0.39,
      },
      {
        id: 22,
        left: 114,
        headW: 11,
        headH: 14,
        tailLen: 22,
        duration: 2.6,
        delay: 1.1,
        opacity: 0.42,
      },
      {
        id: 23,
        left: 128,
        headW: 7,
        headH: 10,
        tailLen: 14,
        duration: 3.3,
        delay: 1.35,
        opacity: 0.34,
      },
      {
        id: 24,
        left: 34,
        headW: 8,
        headH: 11,
        tailLen: 17,
        duration: 2.9,
        delay: 1.2,
        opacity: 0.38,
      },
      {
        id: 25,
        left: 58,
        headW: 13,
        headH: 17,
        tailLen: 27,
        duration: 2.3,
        delay: 0.8,
        opacity: 0.45,
      },
      {
        id: 26,
        left: 80,
        headW: 7,
        headH: 10,
        tailLen: 16,
        duration: 3.2,
        delay: 1.45,
        opacity: 0.35,
      },

      // WAVE 3: Full Shower Downpour (1.8s - 3.2s)
      {
        id: 27,
        left: 12,
        headW: 8,
        headH: 11,
        tailLen: 17,
        duration: 2.9,
        delay: 1.9,
        opacity: 0.37,
      },
      {
        id: 28,
        left: 20,
        headW: 12,
        headH: 16,
        tailLen: 24,
        duration: 2.4,
        delay: 2.1,
        opacity: 0.44,
      },
      {
        id: 29,
        left: 32,
        headW: 6,
        headH: 9,
        tailLen: 13,
        duration: 3.4,
        delay: 2.3,
        opacity: 0.31,
      },
      {
        id: 30,
        left: 40,
        headW: 10,
        headH: 14,
        tailLen: 21,
        duration: 2.7,
        delay: 1.95,
        opacity: 0.4,
      },
      {
        id: 31,
        left: 52,
        headW: 8,
        headH: 15,
        tailLen: 15,
        duration: 3.0,
        delay: 2.15,
        opacity: 0.36,
      },
      {
        id: 32,
        left: 60,
        headW: 11,
        headH: 15,
        tailLen: 23,
        duration: 2.5,
        delay: 2.0,
        opacity: 0.42,
      },
      {
        id: 33,
        left: 66,
        headW: 5,
        headH: 8,
        tailLen: 12,
        duration: 3.6,
        delay: 2.45,
        opacity: 0.28,
      },
      {
        id: 34,
        left: 74,
        headW: 13,
        headH: 17,
        tailLen: 27,
        duration: 2.3,
        delay: 1.85,
        opacity: 0.45,
      },
      {
        id: 35,
        left: 84,
        headW: 8,
        headH: 12,
        tailLen: 18,
        duration: 3.1,
        delay: 2.2,
        opacity: 0.38,
      },
      {
        id: 36,
        left: 92,
        headW: 10,
        headH: 14,
        tailLen: 22,
        duration: 2.6,
        delay: 2.05,
        opacity: 0.41,
      },
      {
        id: 37,
        left: 98,
        headW: 6,
        headH: 9,
        tailLen: 14,
        duration: 3.5,
        delay: 2.4,
        opacity: 0.33,
      },
      {
        id: 38,
        left: 106,
        headW: 12,
        headH: 16,
        tailLen: 25,
        duration: 2.4,
        delay: 1.9,
        opacity: 0.43,
      },
      {
        id: 39,
        left: 112,
        headW: 7,
        headH: 11,
        tailLen: 16,
        duration: 3.3,
        delay: 2.35,
        opacity: 0.35,
      },
      {
        id: 40,
        left: 120,
        headW: 9,
        headH: 13,
        tailLen: 19,
        duration: 2.8,
        delay: 2.1,
        opacity: 0.39,
      },
      {
        id: 41,
        left: 126,
        headW: 11,
        headH: 15,
        tailLen: 23,
        duration: 2.6,
        delay: 2.15,
        opacity: 0.42,
      },
      {
        id: 42,
        left: 18,
        headW: 7,
        headH: 10,
        tailLen: 14,
        duration: 3.3,
        delay: 2.6,
        opacity: 0.34,
      },
      {
        id: 43,
        left: 46,
        headW: 9,
        headH: 13,
        tailLen: 20,
        duration: 2.8,
        delay: 2.5,
        opacity: 0.39,
      },
      {
        id: 44,
        left: 70,
        headW: 11,
        headH: 15,
        tailLen: 24,
        duration: 2.5,
        delay: 2.55,
        opacity: 0.42,
      },
      {
        id: 45,
        left: 88,
        headW: 6,
        headH: 9,
        tailLen: 13,
        duration: 3.6,
        delay: 2.8,
        opacity: 0.31,
      },
      {
        id: 46,
        left: 108,
        headW: 13,
        headH: 17,
        tailLen: 26,
        duration: 2.3,
        delay: 2.65,
        opacity: 0.45,
      },
      {
        id: 47,
        left: 116,
        headW: 8,
        headH: 12,
        tailLen: 17,
        duration: 3.1,
        delay: 2.75,
        opacity: 0.37,
      },
      {
        id: 48,
        left: 130,
        headW: 11,
        headH: 14,
        tailLen: 21,
        duration: 2.7,
        delay: 2.7,
        opacity: 0.41,
      },
    ]
  }, [])

  if (typeof document === "undefined" || (!isRendered && !active)) {
    return null
  }

  return createPortal(
    <div
      key={cycleKey}
      className={`pointer-events-none fixed inset-0 z-30 overflow-hidden select-none transition-opacity duration-1000 ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <style>{`
        /* Authentic diagonal rain falling from top-right to bottom-left */
        @keyframes rainTopRightToBottomLeft {
          0% {
            transform: translate3d(0, -90px, 0) rotate(24deg) scale(0.95);
            opacity: 0;
          }
          4% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            transform: translate3d(-400px, 115vh, 0) rotate(24deg) scale(0.95);
            opacity: 0;
          }
        }
      `}</style>

      {/* SVG Defs for Translucent Liquid Water Refraction and Highlights */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Very Translucent Water Droplet Body Gradient with Soft Tail Fade */}
          <linearGradient id="translucentDropBodyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="35%" stopColor="#d5e8ff" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#89bef5" stopOpacity="0.25" />
            <stop offset="92%" stopColor="#1a4278" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#081730" stopOpacity="0.38" />
          </linearGradient>

          {/* Delicate Meniscus Rim Edge */}
          <linearGradient id="dropMeniscusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#153664" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#051022" stopOpacity="0.35" />
          </linearGradient>

          {/* Primary Curved Specular Glint (Sky Reflection) */}
          <linearGradient id="dropSpecularGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>

      {/* TRANSLUCENT DIAGONAL RAIN DROPS WITH SMALL SLEEK TAILS */}
      {drops.map((drop) => {
        const pad = 4
        const svgW = drop.headW + pad * 2
        const totalDropH = drop.tailLen + drop.headH
        const svgH = totalDropH + pad * 2
        const cx = svgW / 2
        const topY = pad
        const shoulderY = topY + drop.tailLen
        const bottomY = shoulderY + drop.headH
        const r = drop.headW / 2

        // Authentic aerodynamic liquid raindrop with sleek small tail
        const dropWithTailPath = `
          M ${cx} ${topY}
          C ${cx - r * 0.28} ${topY + drop.tailLen * 0.45}, ${cx - r} ${topY + drop.tailLen * 0.8}, ${cx - r} ${shoulderY + drop.headH * 0.35}
          C ${cx - r} ${bottomY}, ${cx + r} ${bottomY}, ${cx + r} ${shoulderY + drop.headH * 0.35}
          C ${cx + r} ${topY + drop.tailLen * 0.8}, ${cx + r * 0.28} ${topY + drop.tailLen * 0.45}, ${cx} ${topY}
          Z
        `

        return (
          <div
            key={drop.id}
            className="absolute top-0 pointer-events-none will-change-transform"
            style={
              {
                left: `${drop.left}%`,
                opacity: drop.opacity,
                animation: `rainTopRightToBottomLeft ${drop.duration}s linear ${drop.delay}s infinite`,
              } as React.CSSProperties
            }
          >
            <svg
              width={svgW}
              height={svgH}
              viewBox={`0 0 ${svgW} ${svgH}`}
              fill="none"
              className="overflow-visible pointer-events-none"
            >
              {/* Translucent Liquid Raindrop Body */}
              <path
                d={dropWithTailPath}
                fill="url(#translucentDropBodyGrad)"
                stroke="url(#dropMeniscusGrad)"
                strokeWidth="0.6"
              />

              {/* Delicate Specular Highlight along the Small Tail Spine */}
              <path
                d={`
                  M ${cx - 0.3} ${topY + 3}
                  Q ${cx - 0.6} ${topY + drop.tailLen * 0.55}, ${cx - r * 0.3} ${shoulderY}
                `}
                stroke="#ffffff"
                strokeWidth={0.6}
                strokeLinecap="round"
                opacity="0.55"
                fill="none"
              />

              {/* Primary Specular Glint on Upper-Left Shoulder of the Head */}
              <ellipse
                cx={cx - r * 0.35}
                cy={shoulderY + drop.headH * 0.35}
                rx={r * 0.35}
                ry={drop.headH * 0.24}
                transform={`rotate(-22 ${cx - r * 0.35} ${shoulderY + drop.headH * 0.35})`}
                fill="url(#dropSpecularGrad)"
              />

              {/* Secondary Specular Glint on Upper-Right Shoulder */}
              <ellipse
                cx={cx + r * 0.38}
                cy={shoulderY + drop.headH * 0.32}
                rx={r * 0.2}
                ry={drop.headH * 0.16}
                transform={`rotate(18 ${cx + r * 0.38} ${shoulderY + drop.headH * 0.32})`}
                fill="#ffffff"
                opacity="0.45"
              />
            </svg>
          </div>
        )
      })}
    </div>,
    document.body
  )
}

export default AIRainEffect
