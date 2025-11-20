import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();
    
    console.log('[Read File API] Request for:', filePath);
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      console.error('[Read File API] File not found:', filePath);
      return NextResponse.json(
        { error: `File not found: ${filePath}` },
        { status: 404 }
      );
    }

    const content = readFileSync(filePath, 'utf-8');
    console.log('[Read File API] Successfully read file, length:', content.length);
    
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('[Read File API] Error reading file:', error);
    return NextResponse.json(
      { error: `Failed to read file: ${error.message}` },
      { status: 500 }
    );
  }
}
