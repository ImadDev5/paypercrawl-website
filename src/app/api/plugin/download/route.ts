import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { PassThrough } from 'stream';

// Ensure this route runs on Node and always reflects latest plugin contents
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache the zip file in memory to speed up downloads
let cachedZip: Buffer | null = null;
let cacheTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

async function buildZipBuffer(): Promise<Buffer> {
  const pluginDir = path.join(process.cwd(), 'crawlguard-wp-main', 'crawlguard-wp');
  if (!fs.existsSync(pluginDir)) {
    throw new Error(`Plugin folder missing at ${pluginDir}`);
  }

  const archive = archiver('zip', { zlib: { level: 6 } });
  const out = new PassThrough();

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    out.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    out.on('end', () => resolve(Buffer.concat(chunks)));
    out.on('error', (err) => reject(err));
    archive.on('warning', (err) => console.warn('archiver warning:', (err as any)?.message || err));
    archive.on('error', (err) => reject(err));
  });

  archive.pipe(out);
  // Place files inside a stable folder name in the zip
  archive.directory(pluginDir, 'paypercrawl-wp');
  await archive.finalize();
  return done;
}

export async function GET(req: NextRequest) {
  try {
    const pluginDir = path.join(process.cwd(), 'crawlguard-wp-main', 'crawlguard-wp');
    if (!fs.existsSync(pluginDir)) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    // Optional: bypass cache with ?refresh=1
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get('refresh');
    if (refresh === '1') {
      cachedZip = null;
    }

    const now = Date.now();
    if (!cachedZip || (now - cacheTime) > CACHE_DURATION_MS) {
      cachedZip = await buildZipBuffer();
      cacheTime = now;
    }

    const headers = new Headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="crawlguard-wp-paypercrawl.zip"',
      'Content-Length': String(cachedZip.length),
      'Cache-Control': 'public, max-age=300',
    });
    // NextResponse supports passing a Buffer directly
    return new NextResponse(cachedZip as any, { headers });
  } catch (err) {
    console.error('Error creating plugin download:', err);
    return NextResponse.json({ error: 'Failed to create plugin download' }, { status: 500 });
  }
}
