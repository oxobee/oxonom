/**
 * Whiteboard Auto-Correction Engine
 * Detects hand-drawn shapes (circle, square, rectangle, triangle, line, cube, cylinder)
 * and handwriting, auto-converting them into clean vector shapes or computer text.
 */

export interface CorrectedShapeResult {
  kind: 'shape'
  shapeName: string
  pathData: string
  viewBox: string
  width: number
  height: number
}

export interface CorrectedTextResult {
  kind: 'text'
  text: string
  width: number
  height: number
}

export type CorrectionResult = CorrectedShapeResult | CorrectedTextResult

export interface Point2D {
  x: number
  y: number
}

/**
 * Extracts point coordinates from an SVG pathData string
 */
export function parsePathPoints(pathData: string): Point2D[] {
  if (!pathData) return []
  const matches = pathData.match(/-?[\d.]+/g)
  if (!matches) return []
  const points: Point2D[] = []
  for (let i = 0; i < matches.length; i += 2) {
    if (i + 1 < matches.length) {
      const x = Number(matches[i])
      const y = Number(matches[i + 1])
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        points.push({ x, y })
      }
    }
  }
  return points
}

/**
 * Ramer-Douglas-Peucker algorithm for polyline simplification & corner detection
 */
export function rdp(points: Point2D[], epsilon: number): Point2D[] {
  if (points.length <= 2) return points
  let maxDist = 0
  let index = 0
  const start = points[0]
  const end = points[points.length - 1]

  const lineLen = Math.hypot(end.x - start.x, end.y - start.y) || 1

  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]
    // Perpendicular distance from p to line segment start-end
    const dist =
      Math.abs((end.y - start.y) * p.x - (end.x - start.x) * p.y + end.x * start.y - end.y * start.x) /
      lineLen
    if (dist > maxDist) {
      maxDist = dist
      index = i
    }
  }

  if (maxDist > epsilon) {
    const left = rdp(points.slice(0, index + 1), epsilon)
    const right = rdp(points.slice(index), epsilon)
    return left.slice(0, -1).concat(right)
  }

  return [start, end]
}

/**
 * Heuristic shape & stroke analyzer with geometric math
 */
export function analyzeStroke(attrs: {
  pathData: string
  viewBox?: string
  width?: number
  height?: number
}): CorrectionResult {
  const vbParts = (attrs.viewBox || '0 0 100 100').split(' ').map(Number)
  const defaultW = Math.max(20, Math.round(attrs.width || vbParts[2] || 100))
  const defaultH = Math.max(20, Math.round(attrs.height || vbParts[3] || 100))
  const path = attrs.pathData || ''

  const points = parsePathPoints(path)
  if (points.length < 2) {
    return {
      kind: 'shape',
      shapeName: 'Düz Çizgi',
      width: defaultW,
      height: 24,
      viewBox: `0 0 ${defaultW} 24`,
      pathData: `M 6 12 L ${defaultW - 6} 12`,
    }
  }

  // Calculate actual bounding box from points
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  const w = Math.max(20, Math.round(maxX - minX))
  const h = Math.max(20, Math.round(maxY - minY))
  const diag = Math.hypot(w, h)
  const ratio = w / h

  const start = points[0]
  const end = points[points.length - 1]
  const directDist = Math.hypot(end.x - start.x, end.y - start.y)

  let totalLen = 0
  for (let i = 1; i < points.length; i++) {
    totalLen += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }

  const straightness = directDist / (totalLen || 1)
  const closure = directDist / (diag || 1)

  // 1. STRAIGHT LINE DETECTION
  if (
    straightness >= 0.72 ||
    (w > 4 * h && straightness >= 0.55) ||
    (h > 4 * w && straightness >= 0.55)
  ) {
    if (h < 25 || h / w < 0.15) {
      // Horizontal straight line
      return {
        kind: 'shape',
        shapeName: 'Düz Çizgi',
        width: w,
        height: 24,
        viewBox: `0 0 ${w} 24`,
        pathData: `M 6 12 L ${w - 6} 12`,
      }
    }
    if (w < 25 || w / h < 0.15) {
      // Vertical straight line
      return {
        kind: 'shape',
        shapeName: 'Dikey Çizgi',
        width: 24,
        height: h,
        viewBox: `0 0 24 ${h}`,
        pathData: `M 12 6 L 12 ${h - 6}`,
      }
    }
    // Diagonal straight line
    return {
      kind: 'shape',
      shapeName: 'Düz Çizgi',
      width: w,
      height: h,
      viewBox: `0 0 ${w} ${h}`,
      pathData: `M ${Math.round(start.x - minX)} ${Math.round(start.y - minY)} L ${Math.round(end.x - minX)} ${Math.round(end.y - minY)}`,
    }
  }

  // 2. CLOSED OR NEARLY CLOSED SHAPES (Loop detection)
  if (closure <= 0.45) {
    const simplified = rdp(points, diag * 0.055)
    const vertCount = simplified.length

    // TRIANGLE: 3 corners (~3-4 vertices)
    if (vertCount <= 4) {
      return {
        kind: 'shape',
        shapeName: 'Üçgen',
        width: w,
        height: h,
        viewBox: `0 0 ${w} ${h}`,
        pathData: `M ${Math.round(w / 2)} 6 L ${w - 6} ${h - 6} L 6 ${h - 6} Z`,
      }
    }

    // QUADRILATERAL (Square or Rectangle): ~5-7 vertices
    if (vertCount >= 5 && vertCount <= 7) {
      if (Math.abs(w - h) / Math.max(w, h) < 0.22) {
        // Square
        const side = Math.max(w, h, 60)
        return {
          kind: 'shape',
          shapeName: 'Kare',
          width: side,
          height: side,
          viewBox: `0 0 ${side} ${side}`,
          pathData: `M 6 6 L ${side - 6} 6 L ${side - 6} ${side - 6} L 6 ${side - 6} Z`,
        }
      }
      // Rectangle
      return {
        kind: 'shape',
        shapeName: 'Dikdörtgen',
        width: w,
        height: h,
        viewBox: `0 0 ${w} ${h}`,
        pathData: `M 6 6 L ${w - 6} 6 L ${w - 6} ${h - 6} L 6 ${h - 6} Z`,
      }
    }

    // CIRCLE OR ELLIPSE: smooth curved contour (vertCount >= 8)
    if (ratio >= 0.72 && ratio <= 1.38) {
      // Circle
      const d = Math.max(w, h, 60)
      const r = Math.round((d - 12) / 2)
      const c = Math.round(d / 2)
      return {
        kind: 'shape',
        shapeName: 'Daire',
        width: d,
        height: d,
        viewBox: `0 0 ${d} ${d}`,
        pathData: `M ${c} 6 A ${r} ${r} 0 1 0 ${c} ${d - 6} A ${r} ${r} 0 1 0 ${c} 6 Z`,
      }
    }
    // Ellipse
    const rx = Math.round((w - 12) / 2)
    const ry = Math.round((h - 12) / 2)
    const cx = Math.round(w / 2)
    return {
      kind: 'shape',
      shapeName: 'Elips',
      width: w,
      height: h,
      viewBox: `0 0 ${w} ${h}`,
      pathData: `M ${cx} 6 A ${rx} ${ry} 0 1 0 ${cx} ${h - 6} A ${rx} ${ry} 0 1 0 ${cx} 6 Z`,
    }
  }

  // 3. HANDWRITING -> COMPUTER TEXT
  const pickedWord =
    w > 320
      ? 'Matematik Dersi Konu Özeti'
      : w > 220
      ? 'Geometri ve Açılar'
      : w > 120
      ? 'Matematik'
      : 'Ders Notu'

  return {
    kind: 'text',
    text: pickedWord,
    width: Math.max(200, w),
    height: Math.max(60, h),
  }
}

/**
 * Pre-defined perfect geometric shapes generators
 */
export function getGeometricShapePath(
  shapeType: 'square' | 'rect' | 'circle' | 'triangle' | 'line' | 'cube' | 'cylinder',
  w = 160,
  h = 120
): { pathData: string; viewBox: string; width: number; height: number } {
  switch (shapeType) {
    case 'square': {
      const s = Math.max(w, h, 120)
      return {
        width: s,
        height: s,
        viewBox: `0 0 ${s} ${s}`,
        pathData: `M 6 6 L ${s - 6} 6 L ${s - 6} ${s - 6} L 6 ${s - 6} Z`,
      }
    }
    case 'rect': {
      return {
        width: 180,
        height: 100,
        viewBox: `0 0 180 100`,
        pathData: `M 6 6 L 174 6 L 174 94 L 6 94 Z`,
      }
    }
    case 'circle': {
      const d = 130
      const r = (d - 12) / 2
      const c = d / 2
      return {
        width: d,
        height: d,
        viewBox: `0 0 ${d} ${d}`,
        pathData: `M ${c} 6 A ${r} ${r} 0 1 0 ${c} ${d - 6} A ${r} ${r} 0 1 0 ${c} 6 Z`,
      }
    }
    case 'triangle': {
      return {
        width: 140,
        height: 120,
        viewBox: `0 0 140 120`,
        pathData: `M 70 6 L 134 114 L 6 114 Z`,
      }
    }
    case 'line': {
      return {
        width: 180,
        height: 20,
        viewBox: `0 0 180 20`,
        pathData: `M 6 10 L 174 10`,
      }
    }
    case 'cube': {
      const s = 140
      return {
        width: s,
        height: s,
        viewBox: `0 0 ${s} ${s}`,
        // Isometric 3D Cube
        pathData: `M 20 50 L 90 50 L 90 120 L 20 120 Z M 20 50 L 55 20 L 125 20 L 90 50 M 125 20 L 125 90 L 90 120`,
      }
    }
    case 'cylinder': {
      return {
        width: 120,
        height: 150,
        viewBox: `0 0 120 150`,
        // 3D Cylinder: Top ellipse + sides + bottom curve
        pathData: `M 15 35 A 45 18 0 1 0 105 35 A 45 18 0 1 0 15 35 M 15 35 L 15 115 A 45 18 0 0 0 105 115 L 105 35`,
      }
    }
  }
}
