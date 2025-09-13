/**
 * API Route: /api/stats
 * Returns current share count statistics
 */
import { NextRequest, NextResponse } from 'next/server';

// Set runtime to edge for better performance
export const runtime = 'edge';

// Share count is maintained in memory
// This is a simple approach for demo purposes
// In a production app, this would use a database
let shareCount = 0;

/**
 * GET handler for share statistics
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      ok: true,
      shares: shareCount
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}

// Export for other routes to use
export function incrementShareCount() {
  shareCount++;
  return shareCount;
}