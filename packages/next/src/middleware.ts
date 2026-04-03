import { NextResponse, type NextRequest } from 'next/server';

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

function prune(ts: number[], windowMs: number, now: number): void {
  const cutoff = now - windowMs;
  while (ts.length > 0 && ts[0]! <= cutoff) ts.shift();
}

function isAllowed(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { timestamps: [] };
    buckets.set(key, b);
  }
  prune(b.timestamps, windowMs, now);
  if (b.timestamps.length < max) {
    b.timestamps.push(now);
    return { allowed: true, retryAfterSec: 0 };
  }
  const oldest = b.timestamps[0]!;
  const retryAfterMs = oldest + windowMs - now;
  return { allowed: false, retryAfterSec: Math.ceil(retryAfterMs / 1000) };
}

export interface DrivePhotosMiddlewareConfig {
  /** Max requests per minute for `GET /api/photos` (default 30). */
  listPerMinute?: number;
  /** Max requests per minute for `GET /api/photos/[id]` (default 120). */
  idPerMinute?: number;
}

function clientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri;
  return 'unknown';
}

/**
 * Next.js middleware factory: rate limits Drive photo routes and adds security headers.
 *
 * @param config - Optional limits
 * @returns Middleware compatible with `middleware.ts` default export
 */
export function drivePhotosMiddleware(config?: DrivePhotosMiddlewareConfig) {
  const listLimit = config?.listPerMinute ?? 30;
  const idLimit = config?.idPerMinute ?? 120;
  const windowMs = 60_000;

  return function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    if (!pathname.startsWith('/api/photos')) {
      return NextResponse.next();
    }

    const ip = clientIp(request);
    const isList = pathname === '/api/photos' || pathname.endsWith('/api/photos');
    const isId = /\/api\/photos\/[^/]+$/.test(pathname) && pathname !== '/api/photos';

    if (isList) {
      const { allowed, retryAfterSec } = isAllowed(`list:${ip}`, listLimit, windowMs);
      if (!allowed) {
        return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSec),
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        });
      }
    } else if (isId) {
      const { allowed, retryAfterSec } = isAllowed(`id:${ip}`, idLimit, windowMs);
      if (!allowed) {
        return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSec),
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        });
      }
    }

    const res = NextResponse.next();
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return res;
  };
}
