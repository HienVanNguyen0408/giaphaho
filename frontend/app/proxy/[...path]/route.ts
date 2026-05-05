import { NextRequest } from 'next/server';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

function buildTargetUrl(pathnameParts: string[], search: string): URL {
  const upstreamPath = pathnameParts.join('/');
  const targetUrl = new URL(upstreamPath, `${BACKEND_URL}/`);
  targetUrl.search = search;
  return targetUrl;
}

function buildForwardHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);

  for (const header of [
    'accept-encoding',
    'connection',
    'content-length',
    'host',
    'origin',
    'referer',
    'x-forwarded-host',
    'x-forwarded-port',
    'x-forwarded-proto',
  ]) {
    headers.delete(header);
  }

  headers.set('x-forwarded-host', request.nextUrl.host);
  headers.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''));

  return headers;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path = [] } = await context.params;
  const method = request.method.toUpperCase();
  const targetUrl = buildTargetUrl(path, request.nextUrl.search);
  const headers = buildForwardHeaders(request);

  const init: RequestInit = {
    method,
    headers,
    redirect: 'manual',
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(method)) {
    init.body = Buffer.from(await request.arrayBuffer());
  }

  const upstreamRes = await fetch(targetUrl, init);
  const responseHeaders = new Headers(upstreamRes.headers);

  responseHeaders.delete('content-encoding');
  responseHeaders.delete('transfer-encoding');

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
  proxy as HEAD,
};
