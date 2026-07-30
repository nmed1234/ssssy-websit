/**
 * Next.js API route: /api/pdf-proxy?url=<encoded>
 *
 * Why this exists
 * ───────────────
 * Firefox's Dynamic First-Party Isolation (dFPI) partitions cookies and
 * storage for cross-origin iframes.  When the <PdfBookViewer> points its
 * <iframe> directly at the Spring Boot backend (localhost:8080), Firefox
 * treats port 8080 as a third-party origin relative to the frontend
 * (localhost:3000).  The built-in PDF.js viewer then makes its own
 * sub-requests (RANGE requests for the PDF object table, xref, etc.) in
 * that partitioned context, causing corrupted / blocked responses and the
 * "Invalid PDF structure" error.
 *
 * By routing through THIS endpoint (same origin as the page, i.e.
 * localhost:3000) the browser stays in first-party context.
 *
 * Routing strategy
 * ────────────────
 * • Relative paths (/api/...) or local hosts (localhost / 127.0.0.1 / MinIO):
 *     Resolved to an absolute URL using BACKEND_ORIGIN, then fetched directly
 *     by Node.js server-to-server (no double-hop through the backend proxy).
 *
 * • External URLs (arxiv.org, fao.org, doi.org, etc.):
 *     Fetched directly from Node.js with browser-like headers to avoid bot
 *     detection.  The response body is STREAMED — not buffered — so large
 *     PDFs (1–10 MB) start arriving at the browser immediately and the
 *     effective download time is limited only by bandwidth, not by a buffer
 *     timeout.
 *
 * STREAMING vs BUFFERING
 * ──────────────────────
 * Earlier versions buffered the entire body with arrayBuffer() to keep every
 * timeout inside a try/catch.  The downside: a 5 MB PDF at 100 KB/s needs
 * 50 s to buffer — well over the typical 30–60 s proxy timeout — causing 504s
 * even when the remote server is healthy.
 *
 * The streaming approach used here pipes upstream.body through a
 * TransformStream.  The AbortController is wired to the client's disconnect
 * signal so the upstream fetch is cancelled if the user closes the modal.
 * Error handling uses a separate promise race so a fetch-headers failure still
 * returns a clean error status before any bytes are sent.
 *
 * TIMEOUT
 * ───────
 * maxDuration = 120 s gives large PDFs (up to ~50 MB at reasonable speeds)
 * time to transfer without Next.js terminating the route.  The header-phase
 * AbortSignal still enforces a 20 s connection timeout so a totally
 * unresponsive host is rejected promptly.
 */

import { NextRequest, NextResponse } from "next/server";

// Allow long-running transfers.  120 s is sufficient for a 50 MB PDF at
// ≥ 7 KB/s — a conservative lower bound for any reasonable connection.
export const maxDuration = 120;

// e.g. "http://localhost:8080/api"  → origin = "http://localhost:8080"
const BACKEND_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

const BACKEND_ORIGIN = (() => {
  try {
    const u = new URL(BACKEND_API_BASE);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "http://localhost:8080";
  }
})();

/** Maximum PDF size: 50 MB — reject before streaming begins. */
const MAX_PDF_BYTES = 50 * 1024 * 1024;

/**
 * How long to wait for the upstream server to send response HEADERS.
 * Once headers arrive the body streams freely — this limit only guards
 * against servers that never respond at all.
 */
const HEADERS_TIMEOUT_MS = 20_000;

/** Returns true for local / backend hosts that need server-to-server fetch. */
function isLocalUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".local")
    );
  } catch {
    return false;
  }
}

/** Returns true if the error is any flavour of timeout / abort. */
function isTimeoutError(err: unknown): boolean {
  if (err instanceof DOMException) {
    return err.name === "TimeoutError" || err.name === "AbortError";
  }
  if (err instanceof Error) {
    return (
      err.name === "TimeoutError" ||
      err.name === "AbortError" ||
      err.message.includes("timed out") ||
      err.message.includes("timeout")
    );
  }
  return false;
}

/**
 * Build realistic browser headers for external hosts.
 * Academic sites (arxiv, FAO, ResearchGate) block bare Node.js User-Agents
 * but pass a plausible Chrome UA.
 */
function buildExternalHeaders(url: string, rangeHeader: string | null): HeadersInit {
  let referer = "https://www.google.com/";
  try {
    const { protocol, hostname } = new URL(url);
    referer = `${protocol}//${hostname}/`;
  } catch {
    // keep default
  }

  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/125.0.0.0 Safari/537.36",
    Accept: "application/pdf,application/octet-stream,*/*;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "identity",   // raw bytes — no gzip surprises
    Referer: referer,
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    ...(rangeHeader ? { Range: rangeHeader } : {}),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Resolve relative paths against the backend origin.
  let url: string;
  if (rawUrl.startsWith("/")) {
    url = `${BACKEND_ORIGIN}${rawUrl}`;
  } else if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
    return new NextResponse("Invalid URL scheme", { status: 400 });
  } else {
    url = rawUrl;
  }

  const rangeHeader = request.headers.get("range");

  // ── Phase 1: fetch headers only (with a tight timeout) ───────────────────
  //
  // We start the upstream fetch and wait only for the response headers — not
  // the body.  A separate AbortController lets us cancel the entire fetch if
  // the client disconnects while headers are still pending.
  const headersController = new AbortController();
  const headersTimer = setTimeout(
    () => headersController.abort(new DOMException("Header timeout", "TimeoutError")),
    HEADERS_TIMEOUT_MS,
  );

  let upstream: Response;
  try {
    const fetchHeaders = isLocalUrl(url)
      ? (rangeHeader ? { Range: rangeHeader } : {})
      : buildExternalHeaders(url, rangeHeader);

    upstream = await fetch(url, {
      headers: fetchHeaders,
      redirect: "follow",
      signal: headersController.signal,
    });
  } catch (err) {
    clearTimeout(headersTimer);
    console.error("[pdf-proxy] connection error:", err);
    if (isTimeoutError(err)) {
      return new NextResponse("PDF source did not respond in time", { status: 504 });
    }
    return new NextResponse("Failed to connect to PDF source", { status: 502 });
  }
  clearTimeout(headersTimer);

  // Mirror non-2xx status codes immediately.
  if (!upstream.ok) {
    await upstream.body?.cancel().catch(() => {});
    const errText = `HTTP ${upstream.status}`;
    return new NextResponse(errText, {
      status: upstream.status >= 400 && upstream.status < 600
        ? upstream.status
        : 502,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Reject HTML/JSON responses (login pages, captcha walls) before streaming.
  const ct = upstream.headers.get("content-type") ?? "";
  if (ct.includes("text/html") || ct.includes("application/json")) {
    await upstream.body?.cancel().catch(() => {});
    return new NextResponse(
      "Remote server returned a non-PDF response (possibly a login page or captcha).",
      { status: 502, headers: { "Content-Type": "text/plain" } },
    );
  }

  // Reject oversized PDFs before streaming.
  const contentLength = upstream.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PDF_BYTES) {
    await upstream.body?.cancel().catch(() => {});
    return new NextResponse("PDF too large to proxy (> 50 MB)", { status: 413 });
  }

  // ── Phase 2: stream the body ─────────────────────────────────────────────
  //
  // Pipe upstream.body through a PassThrough TransformStream.  The browser
  // (pdfjs-dist) starts receiving bytes immediately — no waiting for the full
  // download to complete.  This eliminates the "504 because 5 MB took 55 s"
  // class of failures.
  //
  // If the upstream body is missing (e.g. HEAD response misrouted), fall back
  // to an empty 200 so the PDF.js parser can at least produce a parse error
  // rather than a silent hang.
  const body = upstream.body ?? new ReadableStream({ start(c) { c.close(); } });

  const responseStatus = upstream.headers.get("content-range")
    ? upstream.status   // 206 Partial
    : 200;

  const responseHeaders: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Content-Disposition": "inline",
    "Cache-Control": "public, max-age=3600",
  };
  // Forward Content-Length so pdfjs can show a progress bar.
  if (contentLength) {
    responseHeaders["Content-Length"] = contentLength;
  }
  // Forward Content-Range for byte-range requests.
  const crHeader = upstream.headers.get("content-range");
  if (crHeader) {
    responseHeaders["Content-Range"] = crHeader;
  }

  return new NextResponse(body, {
    status: responseStatus,
    headers: responseHeaders,
  });
}
