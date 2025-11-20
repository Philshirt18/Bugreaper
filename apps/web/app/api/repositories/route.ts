import { NextResponse } from 'next/server';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Call the worker to get repository list with cache busting
    const response = await fetch('http://localhost:3001/repositories', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const repos = await response.json();
    
    return NextResponse.json(repos, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    
    // Fallback to default repos
    return NextResponse.json([
      { value: 'toy/ts-repo', label: 'TypeScript Calculator (typescript)', language: 'typescript', isSymlink: false },
      { value: 'toy/py-repo', label: 'Python Math Utils (python)', language: 'python', isSymlink: false },
      { value: 'toy/Notes app', label: 'Notes Calculator (javascript)', language: 'javascript', isSymlink: false }
    ]);
  }
}
