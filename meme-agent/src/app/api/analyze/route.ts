/**
 * API Route: /api/analyze
 * Analyzes uploaded images and returns tags and meme candidates
 */
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/ratelimit';

// Set runtime to edge for better performance
export const runtime = 'edge';

/**
 * POST handler for image analysis
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
    
    // Get form data from request
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    
    // Validate image file
    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    // Check file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image must be less than 5MB' },
        { status: 400 }
      );
    }
    
    // TODO: In the future, replace with CLIP/BLIP or CoreSpeed vision
    // For now, return mock data
    
    // Mock analysis result
    const analysisResult = {
      ok: true,
      tags: ['wholesome', 'event'],
      memeCandidates: ['top_bottom', 'tweet_style']
    };
    
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}