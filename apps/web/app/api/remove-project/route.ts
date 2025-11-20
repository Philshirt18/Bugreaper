import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();

    // Call the worker to remove the project
    const response = await fetch('http://localhost:3001/remove-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error removing project:', error);
    return NextResponse.json(
      { error: 'Failed to remove project' },
      { status: 500 }
    );
  }
}
