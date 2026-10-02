/**
 * Elastic Fly-to-Trail Animation
 * Animates a favorited star badge flying in a playful parabolic arc
 * from the clicked card directly to the "Akademik Durum & Dersler"
 * icon in the top navigation bar with elastic physics and particle sparkles.
 */

export function flyStarToAcademicTrail(
  source?: HTMLElement | { x: number; y: number } | React.MouseEvent | MouseEvent | null
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  // 1. Calculate source coordinates
  let startX = window.innerWidth / 2
  let startY = window.innerHeight / 2

  if (source) {
    if ('clientX' in source && typeof source.clientX === 'number') {
      startX = source.clientX
      startY = source.clientY
    } else if ('getBoundingClientRect' in source && typeof source.getBoundingClientRect === 'function') {
      const rect = source.getBoundingClientRect()
      startX = rect.left + rect.width / 2
      startY = rect.top + rect.height / 2
    } else if ('x' in source && 'y' in source && typeof source.x === 'number') {
      startX = source.x
      startY = source.y
    }
  }

  // 2. Locate target element in header
  const targetEl =
    document.getElementById('nav-academic-trail-btn') ||
    document.querySelector('[data-academic-trail-nav="true"]') ||
    document.querySelector('a[href*="/trail"]')

  let targetX = window.innerWidth - 75
  let targetY = 32

  if (targetEl) {
    const targetRect = targetEl.getBoundingClientRect()
    targetX = targetRect.left + targetRect.width / 2
    targetY = targetRect.top + targetRect.height / 2
  }

  // 3. Create the flying star badge
  const starEl = document.createElement('div')
  starEl.setAttribute('aria-hidden', 'true')
  starEl.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 34px;
    height: 34px;
    pointer-events: none;
    z-index: 999999;
    will-change: transform, opacity;
    transform: translate3d(${startX - 17}px, ${startY - 17}px, 0) scale(0.8);
    opacity: 1;
  `

  starEl.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(135deg, #fde047 0%, #fbbf24 45%, #f59e0b 100%);
      box-shadow: 0 0 18px rgba(245, 158, 11, 0.75), 0 0 36px rgba(251, 191, 36, 0.45), 0 4px 12px rgba(0, 0, 0, 0.18);
      border: 2px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    </div>
  `

  document.body.appendChild(starEl)

  // Sparkle generator
  const createSparkle = (x: number, y: number) => {
    try {
      const sparkle = document.createElement('div')
      const size = Math.floor(Math.random() * 5) + 6 // 6 - 10px
      const colors = ['#fde047', '#fbbf24', '#ffffff', '#f59e0b']
      const color = colors[Math.floor(Math.random() * colors.length)]

      sparkle.style.cssText = `
        position: fixed;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        background: radial-gradient(circle, #ffffff 25%, ${color} 75%);
        box-shadow: 0 0 8px ${color};
        pointer-events: none;
        z-index: 999998;
        transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s ease-out;
        transform: scale(1);
        opacity: 0.95;
      `
      document.body.appendChild(sparkle)

      requestAnimationFrame(() => {
        const driftX = (Math.random() - 0.5) * 16
        const driftY = (Math.random() - 0.5) * 16 - 6
        sparkle.style.transform = `translate3d(${driftX}px, ${driftY}px, 0) scale(0)`
        sparkle.style.opacity = '0'
      })

      setTimeout(() => {
        if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle)
      }, 480)
    } catch {
      // Ignore particle failure if DOM is unmounted
    }
  }

  // 4. Parabolic trajectory parameters
  const duration = 780 // ms
  const startTime = performance.now()

  // Control point for quadratic curve (curves high upwards)
  const controlX = (startX + targetX) / 2 + (targetX - startX) * 0.05
  const controlY = Math.min(startY, targetY) - Math.max(100, Math.abs(startX - targetX) * 0.22)

  let frameCount = 0

  function step(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(1, elapsed / duration)
    frameCount++

    // Quadratic Bezier Formula
    const t = progress
    const currX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * targetX
    const currY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * targetY

    // Elastic Scale
    let scale = 1.0
    if (progress <= 0.18) {
      // Elastic pop expansion
      const p = progress / 0.18
      scale = 0.8 + 0.65 * Math.sin(p * (Math.PI / 2)) // 0.8 -> 1.45
    } else if (progress <= 0.75) {
      // Smooth cruising
      const p = (progress - 0.18) / (0.75 - 0.18)
      scale = 1.45 - 0.3 * p // 1.45 -> 1.15
    } else {
      // Snapping suction into the target icon
      const p = (progress - 0.75) / 0.25
      scale = 1.15 * (1 - p) + 0.2 * p // 1.15 -> 0.2
    }

    // 360-degree joyful spin
    const rot = progress * 450

    // Fade out at the very end
    const opacity = progress > 0.92 ? Math.max(0, (1 - progress) / 0.08) : 1

    starEl.style.transform = `translate3d(${currX - 17}px, ${currY - 17}px, 0) scale(${scale}) rotate(${rot}deg)`
    starEl.style.opacity = String(opacity)

    // Emit golden trail sparkles periodically
    if (frameCount % 3 === 0 && progress < 0.88) {
      createSparkle(currX, currY)
    }

    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      // Cleanup star
      if (starEl.parentNode) {
        starEl.parentNode.removeChild(starEl)
      }

      // 5. Trigger arrival bounce on the Academic Trail navigation icon!
      try {
        window.dispatchEvent(
          new CustomEvent('academic-trail-bounce', {
            detail: {
              targetX,
              targetY,
            },
          })
        )
      } catch (err) {
        console.error('Failed to dispatch bounce event', err)
      }
    }
  }

  requestAnimationFrame(step)
}
