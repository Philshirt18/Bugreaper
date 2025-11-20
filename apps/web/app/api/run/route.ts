import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, repository, expectedBehavior } = body;

    const runId = `run-${Date.now()}`;
    
    console.log(`Starting pipeline for: ${title}`);

    fetch(`http://localhost:3001/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        runId, 
        bugReport: { 
          title, 
          description, 
          repository, 
          expectedBehavior,
          language: repository.includes('ts-repo') ? 'typescript' : 'python'
        } 
      }),
    }).catch(console.error);

    return NextResponse.json({
      runId,
      status: 'running',
      message: 'Pipeline started',
    });
  } catch (error) {
    console.error('Error starting pipeline:', error);
    return NextResponse.json({ error: 'Failed to start pipeline' }, { status: 500 });
  }
}
