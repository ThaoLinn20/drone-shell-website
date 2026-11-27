import { getStore } from '@netlify/blobs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders
    }
  });
}

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;

  const envKey = (process.env.SHOWS_API_KEY || '').trim();
  if (!envKey) {
    console.error('SHOWS_API_KEY is not configured on Netlify environment variables.');
    return false;
  }
  return token === envKey;
}

function isSafeHttpUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function normalizeYouTubeEmbedUrl(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return (
      `https://www.youtube-nocookie.com/embed/${trimmed}` +
      `?autoplay=1&mute=1&loop=1&playlist=${trimmed}&playsinline=1&controls=1&rel=0&modestbranding=1`
    );
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) {
    const id = match[1];
    return (
      `https://www.youtube-nocookie.com/embed/${id}` +
      `?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&controls=1&rel=0&modestbranding=1`
    );
  }
  return trimmed;
}

function sanitizeChannel(raw) {
  if (!raw || typeof raw !== 'object') {
    return { url: '', enabled: true };
  }
  return {
    url: String(raw.url || '').trim(),
    enabled: raw.enabled !== false
  };
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  const url = new URL(req.url);
  const store = getStore('shows');

  try {
    if (req.method === 'GET') {
      const noCache = url.searchParams.get('nocache') === '1';
      const config = (await store.get('site-config', { type: 'json' })) || {};
      const cacheHeader = noCache
        ? 'no-store'
        : 'public, max-age=60, stale-while-revalidate=300';
      return jsonResponse(config, 200, {
        'Cache-Control': cacheHeader
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      if (!verifyAuth(req)) {
        return jsonResponse(
          { error: 'Unauthorized: Invalid SHOWS_API_KEY' },
          401
        );
      }

      let payload = null;
      try {
        payload = await req.json();
      } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
      }

      const introVideoUrl = normalizeYouTubeEmbedUrl(
        payload?.media?.introVideoUrl || ''
      );
      const downloadUrl = String(payload?.downloads?.windowsUrl || '').trim();
      const social = {
        github: sanitizeChannel(payload?.social?.github),
        youtube: sanitizeChannel(payload?.social?.youtube),
        facebook: sanitizeChannel(payload?.social?.facebook),
        tiktok: sanitizeChannel(payload?.social?.tiktok)
      };

      const urlsToCheck = [
        ['media.introVideoUrl', introVideoUrl],
        ['downloads.windowsUrl', downloadUrl],
        ['social.github', social.github.url],
        ['social.youtube', social.youtube.url],
        ['social.facebook', social.facebook.url],
        ['social.tiktok', social.tiktok.url]
      ];
      const invalidFields = urlsToCheck
        .filter(([, val]) => !isSafeHttpUrl(val))
        .map(([field]) => field);

      if (invalidFields.length > 0) {
        return jsonResponse(
          {
            error: `Invalid URL protocol or format: ${invalidFields.join(', ')}`,
            invalidFields
          },
          400
        );
      }

      const nextConfig = {
        version: 1,
        updatedAt: new Date().toISOString(),
        media: {
          introVideoUrl
        },
        downloads: {
          windowsUrl: downloadUrl
        },
        social
      };

      await store.setJSON('site-config', nextConfig);
      return jsonResponse(
        {
          success: true,
          config: nextConfig
        },
        200,
        { 'Cache-Control': 'no-store' }
      );
    }

    return jsonResponse({ error: 'Method Not Allowed' }, 405);
  } catch (err) {
    return jsonResponse(
      { error: err.message || 'Internal Server Error' },
      500
    );
  }
};
