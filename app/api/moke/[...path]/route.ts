import { NextRequest, NextResponse } from 'next/server';

import { getMockResponseForPath, normalizeProxyPath } from '../../../../src/lib/moke/mock-data';
import { buildProxyHeaders, buildUpstreamUrl, shouldUseMockData } from '../../../../src/lib/moke/proxy';

const BASE_URL = process.env.MOKE_BASE_URL ?? 'http://data.mokfitness.cn';

async function handleProxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const normalizedPath = normalizeProxyPath(path);
  const authorization = process.env.MOKE_AUTHORIZATION;

  if (shouldUseMockData(authorization)) {
    const mock = getMockResponseForPath(normalizedPath);

    if (mock) {
      return NextResponse.json(mock);
    }

    return NextResponse.json(
      {
        code: 404,
        message: `No mock payload configured for ${normalizedPath}`,
      },
      { status: 404 },
    );
  }

  const upstreamUrl = buildUpstreamUrl(BASE_URL, path, request.nextUrl.searchParams);
  const contentType = request.headers.get('content-type') ?? undefined;
  const headers = buildProxyHeaders({ authorization, contentType });
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  });

  const responseText = await upstreamResponse.text();
  const responseType = upstreamResponse.headers.get('content-type') ?? 'application/json; charset=utf-8';

  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: {
      'content-type': responseType,
    },
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

