import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Demo mode: handle code analysis requests
    if (body.code && body.language) {
      const { code, bugDescription, language } = body;
      
      return NextResponse.json({
        success: true,
        fixedCode: code,
        explanation: '🎃 Demo Mode Active: This is a preview of BugReaper\'s interface. To see the full power of AI-powered bug detection and automatic fixes in action, watch the demo video or follow the setup instructions in the README to configure your Gemini API key. It\'s free and takes just 5 minutes!',
        changes: [{
          type: 'info',
          description: 'Demo mode - showing interface only. Watch the demo video or enable AI features via README setup guide.'
        }],
        message: 'Demo mode: Watch video or setup for AI features'
      });
    }
    
    // Worker mode: handle fix requests
    const { issueId, projectPath, file, description, expected } = body;

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
