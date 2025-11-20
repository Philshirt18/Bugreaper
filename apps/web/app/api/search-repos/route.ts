import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchPath } = await request.json();

    // Call the worker to search for repositories
    const response = await fetch('http://localhost:3001/search-repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchPath }),
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error searching repositories:', error);
    return NextResponse.json(
      { error: 'Failed to search repositories' },
      { status: 500 }
    );
  }
}
