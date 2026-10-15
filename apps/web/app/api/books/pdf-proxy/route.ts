import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Secure Streaming PDF Proxy for MEB TYMM Textbooks
 * Prevents SSRF: Only forwards requests to official meb.gov.tr hosts.
 * Supports HTTP 206 Range requests so PDF.js can load pages on demand without downloading the full document.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(targetUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // SSRF Protection: strictly allow only official meb.gov.tr domains and meb.ai URL shortener
  const allowedHosts = ['tymm.meb.gov.tr', 'meb.gov.tr', 'meb.ai', 'ogmmateryal.eba.gov.tr', 'eba.gov.tr']
  const isAllowed = allowedHosts.some(
    (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
  )

  if (!isAllowed) {
    return NextResponse.json(
      { error: 'Forbidden target host. Only official MEB sources are permitted.' },
      { status: 403 }
    )
  }

  // Forward Range header if client requested byte range
  const rangeHeader = request.headers.get('range')
  const fetchHeaders: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    Accept: 'application/pdf,*/*',
  }
  if (rangeHeader) {
    fetchHeaders['Range'] = rangeHeader
  }

  try {
    const upstreamRes = await fetch(parsed.toString(), {
      headers: fetchHeaders,
      redirect: 'follow',
    })

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return NextResponse.json(
        { error: `Upstream error: ${upstreamRes.status} ${upstreamRes.statusText}` },
        { status: upstreamRes.status }
      )
    }

    const responseHeaders = new Headers()
    responseHeaders.set('Content-Type', upstreamRes.headers.get('content-type') || 'application/pdf')
    responseHeaders.set('Accept-Ranges', 'bytes')
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept')
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges')

    const contentRange = upstreamRes.headers.get('content-range')
    if (contentRange) responseHeaders.set('Content-Range', contentRange)

    const contentLength = upstreamRes.headers.get('content-length')
    if (contentLength) responseHeaders.set('Content-Length', contentLength)

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch PDF from upstream', details: err?.message },
      { status: 502 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
    },
  })
}
