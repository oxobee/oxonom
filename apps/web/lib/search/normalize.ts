/**
 * Shared client-side helpers for substring search/filter.
 * Supports Turkish character folding (İ/I/ı/i, ş/s, ç/c, ğ/g, ü/u, ö/o),
 * diacritic normalization, and clean substring search.
 */

export function normalizeForSearch(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim()
}

/**
 * Does `haystack` contain `needle`? Both sides are normalized and
 * lowercased with Turkish/accent folding. Also matches raw digits for phone/TC numbers.
 */
export function searchMatches(
  haystack: unknown,
  needle: unknown,
): boolean {
  const n = normalizeForSearch(needle)
  if (!n) return true
  const h = normalizeForSearch(haystack)
  if (h.includes(n)) return true

  // Digits fallback for phone numbers, student numbers, and TC numbers
  const needleDigits = String(needle || '').replace(/\D/g, '')
  if (needleDigits.length >= 2) {
    const haystackDigits = String(haystack || '').replace(/\D/g, '')
    if (haystackDigits.includes(needleDigits)) return true
  }

  return false
}

/**
 * Convenience: true if any of the haystacks contains the needle.
 */
export function searchMatchesAny(
  haystacks: Array<unknown>,
  needle: unknown,
): boolean {
  const n = normalizeForSearch(needle)
  if (!n) return true
  return haystacks.some((h) => searchMatches(h, needle))
}

