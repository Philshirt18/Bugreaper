import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { projectPath } = await request.json();

    if (!projectPath) {
      return NextResponse.json(
        { error: 'Project path is required' },
        { status: 400 }
      );
    }

    // Call worker to scan project
    const response = await fetch('http://localhost:3001/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath }),
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
