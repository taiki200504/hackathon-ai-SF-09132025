/**
 * API Route: /api/caption
 * Generates meme captions based on tags and meme candidates
 */
import { NextRequest, NextResponse } from 'next/server';
import { runZypherPipeline } from '@/lib/zypher';
import { safeRewriteOptions } from '@/lib/safety';
import { rateLimit } from '@/lib/ratelimit';

// Set runtime to edge for better performance
export const runtime = 'edge';

/**
 * POST handler for caption generation
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting based on IP or headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'anonymous';
    const rateLimitResult = rateLimit(ip);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    if (!body || !Array.isArray(body.tags) || !Array.isArray(body.memeCandidates)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected {tags: string[], memeCandidates: string[]}' },
        { status: 400 }
      );
    }
    
    // Generate captions using Zypher pipeline
    const captions = await runZypherPipeline(body.tags, body.memeCandidates);
    
    // Apply safety filters to captions
    const safeCaptions = safeRewriteOptions(captions);
    
    return NextResponse.json({
      ok: true,
      options: safeCaptions
    });
  } catch (error) {
    console.error('Error in caption API:', error);
    return NextResponse.json(
      { error: 'Failed to generate captions' },
      { status: 500 }
    );
  }
}