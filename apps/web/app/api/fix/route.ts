import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { issueId, projectPath, file, description, expected } = await request.json();

    if (!issueId || !projectPath || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call worker to apply fix
    const response = await fetch('http://localhost:3001/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issueId,
        projectPath,
        file,
        description,
        expected
      }),
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Fix error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
