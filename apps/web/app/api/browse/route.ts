import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || process.env.HOME || '/';

  console.log(`[Browse API] Reading directory: ${path}`);

  try {
    const entries = await readdir(path);
    console.log(`[Browse API] Found ${entries.length} entries`);
    
    const folders: string[] = [];
    const skipped: string[] = [];

    for (const entry of entries) {
      try {
        const fullPath = join(path, entry);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          if (entry.startsWith('.')) {
            skipped.push(`${entry} (hidden)`);
          } else {
            folders.push(entry);
          }
        }
      } catch (err: any) {
        skipped.push(`${entry} (${err.code || 'error'})`);
        continue;
      }
    }

    folders.sort();
    console.log(`[Browse API] Returning ${folders.length} folders, skipped ${skipped.length}`);
    if (skipped.length > 0) {
      console.log(`[Browse API] Skipped:`, skipped.slice(0, 5));
    }

    return NextResponse.json(
      {
        currentPath: path,
        folders,
        debug: {
          totalEntries: entries.length,
          foldersFound: folders.length,
          skipped: skipped.length,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('[Browse API] Error browsing directory:', error);
    return NextResponse.json(
      { error: `Failed to read directory: ${error.message}` },
      { status: 500 }
    );
  }
}
