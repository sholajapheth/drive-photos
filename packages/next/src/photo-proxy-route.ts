import {
  buildFallbackUrls,
  DrivePhotosError,
  fallbackIndexToLevel,
  fetchUrlWithSsrfGuard,
  validateFallbackUrl,
  validateFileId,
  validateSize,
} from '@sholajapheth/drive-photos-core';
import { NextResponse, type NextRequest } from 'next/server';

export interface PhotoProxyRouteConfig {
  apiKey: string;
}

/**
 * Validates that a URL uses an allowed hostname (SSRF protection).
 *
 * @deprecated Prefer {@link validateFallbackUrl} from `@sholajapheth/drive-photos-core`.
 */
export function assertAllowedImageUrl(rawUrl: string): URL {
  validateFallbackUrl(rawUrl);
  return new URL(rawUrl);
}

function buildServerFetchOrder(fileId: string, size: number, apiKey: string): string[] {
  const media = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&key=${encodeURIComponent(apiKey)}`;
  const httpsFallbacks = buildFallbackUrls(fileId, size).filter((u) => u.startsWith('https://'));
  return [media, ...httpsFallbacks];
}

function levelLabelForIndex(index: number): string {
  if (index === 0) return 'api-media';
  return fallbackIndexToLevel(index);
}

function isSvgContentType(ct: string): boolean {
  const lower = ct.toLowerCase();
  return lower.includes('svg') || lower.includes('image/svg');
}

/**
 * Creates a Next.js App Router `GET` handler that proxies image bytes from Google endpoints.
 *
 * @param config - Must include API key used only server-side
 * @returns Route exports `{ GET }`
 * @security Validates file ids and URL hosts before fetching; manual redirect handling; SVG blocked.
 */
export function createPhotoProxyRoute(config: PhotoProxyRouteConfig) {
  async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } }
  ) {
    const params = await Promise.resolve(context.params);
    const fileId = params.id;
    try {
      validateFileId(fileId);
    } catch (e) {
      const err =
        e instanceof DrivePhotosError
          ? e
          : new DrivePhotosError('INVALID_FILE_ID', 'Invalid file id');
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 400 }
      );
    }

    const sizeParam = request.nextUrl.searchParams.get('size');
    const size = validateSize(sizeParam ? Number(sizeParam) : 800);

    const apiKey =
      config.apiKey ||
      (typeof process !== 'undefined' ? process.env.GOOGLE_DRIVE_API_KEY : undefined) ||
      '';

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: 'CONFIGURATION_ERROR', message: 'Server API key is not configured' } },
        { status: 500 }
      );
    }

    const urls = buildServerFetchOrder(fileId, size, apiKey);
    const deadline = Date.now() + 10_000;

    for (let i = 0; i < urls.length; i++) {
      const raw = urls[i]!;
      const msLeft = deadline - Date.now();
      if (msLeft <= 0) break;

      try {
        const res = await fetchUrlWithSsrfGuard(raw, {
          timeoutMs: Math.min(msLeft, 8000),
        });

        if (!res.ok || !res.body) {
          continue;
        }

        const ct = res.headers.get('content-type') ?? '';
        if (isSvgContentType(ct)) {
          continue;
        }

        const headers = new Headers();
        if (ct) headers.set('Content-Type', ct);
        headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('Content-Security-Policy', "default-src 'none'");
        headers.set('X-Frame-Options', 'DENY');
        headers.set('X-Drive-Photos-Fallback-Level', levelLabelForIndex(i));

        return new NextResponse(res.body, { status: 200, headers });
      } catch {
        // try next
      }
    }

    return NextResponse.json(
      {
        error: {
          code: 'IMAGE_NOT_FOUND',
          message: 'Image could not be loaded or format is not supported',
        },
      },
      { status: 404 }
    );
  }

  return { GET };
}
