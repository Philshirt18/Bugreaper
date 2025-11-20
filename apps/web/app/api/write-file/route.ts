import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filePath, content } = await request.json();
    
    console.log('[Write File API] Request for:', filePath);
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    if (content === undefined) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create backup before writing
    if (existsSync(filePath)) {
      const backupPath = `${filePath}.backup`;
      try {
        copyFileSync(filePath, backupPath);
        console.log('[Write File API] Backup created:', backupPath);
      } catch (backupError) {
        console.error('[Write File API] Failed to create backup:', backupError);
        // Continue anyway - backup is optional
      }
    }

    // Write the new content
    writeFileSync(filePath, content, 'utf-8');
    console.log('[Write File API] Successfully wrote file, length:', content.length);
    
    return NextResponse.json({ 
      success: true,
      message: 'File saved successfully',
      backupCreated: existsSync(`${filePath}.backup`)
    });
  } catch (error: any) {
    console.error('[Write File API] Error writing file:', error);
    return NextResponse.json(
      { error: `Failed to write file: ${error.message}` },
      { status: 500 }
    );
  }
}
