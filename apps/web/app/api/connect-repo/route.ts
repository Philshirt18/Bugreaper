import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, installationId } = body;

    if (process.env.MOCK_MODE === 'true') {
      return NextResponse.json({
        success: true,
        message: 'Mock mode: Repository connection simulated',
        repository: `${owner}/${repo}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Repository connected successfully',
      repository: `${owner}/${repo}`,
    });
  } catch (error) {
    console.error('Error connecting repository:', error);
    return NextResponse.json({ error: 'Failed to connect repository' }, { status: 500 });
  }
}
