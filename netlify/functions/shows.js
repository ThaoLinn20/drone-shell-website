import { getStore } from '@netlify/blobs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS
    }
  });
}

function getAuthKey() {
  return process.env.SHOWS_API_KEY || 'deo-co-key-dau-ma-tim';
}

function verifyAuth(req) {
  const authHeader = req.headers.get('authorization') || '';
  const expectedKey = getAuthKey();
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === expectedKey;
}

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async (req, context) => {
  // Pre-flight CORS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  const url = new URL(req.url);
  const showStore = getStore('shows');

  try {
    // 1. GET: Fetch manifest or single show data
    if (req.method === 'GET') {
      const showId = url.searchParams.get('id');

      if (showId) {
        const showData = await showStore.get(`data/${showId}`, { type: 'json' });
        if (!showData) {
          return jsonResponse({ error: `Show with id "${showId}" not found` }, 404);
        }
        return jsonResponse(showData, 200);
      }

      // Return list of shows
      const manifest = (await showStore.get('manifest', { type: 'json' })) || [];
      return jsonResponse({ shows: manifest }, 200);
    }

    // 2. POST: Create or Update a show
    if (req.method === 'POST') {
      if (!verifyAuth(req)) {
        return jsonResponse({ error: 'Unauthorized: Invalid SHOWS_API_KEY' }, 401);
      }

      let payload = null;
      try {
        payload = await req.json();
      } catch (err) {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
      }

      const { title, sub, youtubeId, audioOffset, scriptData } = payload;
      let showId = payload.id || slugify(title) || `show-${Date.now()}`;

      if (!title || !scriptData) {
        return jsonResponse({ error: 'Missing required fields: "title" and "scriptData"' }, 400);
      }

      // Calculate total duration from scriptData events
      let duration = 0;
      if (Array.isArray(scriptData)) {
        scriptData.forEach((evt) => {
          const end = (evt.time || 0) + (evt.duration || 0);
          if (end > duration) duration = end;
        });
      }

      // Save full script data
      await showStore.setJSON(`data/${showId}`, scriptData);

      // Update manifest
      const manifest = (await showStore.get('manifest', { type: 'json' })) || [];
      const existingIndex = manifest.findIndex((item) => item.id === showId);

      const showMeta = {
        id: showId,
        title: title.trim(),
        sub: (sub || '').trim(),
        youtubeId: (youtubeId || '').trim(),
        audioOffset: Math.max(0, Number(audioOffset) || 0),
        duration: Math.round(duration),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        manifest[existingIndex] = showMeta;
      } else {
        manifest.unshift(showMeta);
      }

      await showStore.setJSON('manifest', manifest);

      return jsonResponse({ success: true, show: showMeta }, 201);
    }

    // 3. DELETE: Remove a show
    if (req.method === 'DELETE') {
      if (!verifyAuth(req)) {
        return jsonResponse({ error: 'Unauthorized: Invalid SHOWS_API_KEY' }, 401);
      }

      const showId = url.searchParams.get('id');
      if (!showId) {
        return jsonResponse({ error: 'Missing query parameter "?id="' }, 400);
      }

      try {
        await showStore.delete(`data/${showId}`);
      } catch (_) { }

      const manifest = (await showStore.get('manifest', { type: 'json' })) || [];
      const updatedManifest = manifest.filter((item) => item.id !== showId);
      await showStore.setJSON('manifest', updatedManifest);

      return jsonResponse({ success: true, deletedId: showId }, 200);
    }

    return jsonResponse({ error: `Method ${req.method} not allowed` }, 405);
  } catch (error) {
    console.error('Netlify Blobs shows function error:', error);
    return jsonResponse({ error: error.message || 'Internal server error' }, 500);
  }
};
