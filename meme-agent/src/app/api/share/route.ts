/**
 * API Route: /api/share
 * Shares a GIF to Discord via webhook and tracks share count
 */
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/ratelimit';

// Use Node.js runtime for Discord webhook
export const runtime = 'nodejs';

// Import share counter function from stats API
import { incrementShareCount } from '../stats/route';

/**
 * POST handler for sharing GIFs to Discord
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
    
    // Get Discord webhook URL from environment variables
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Discord webhook URL not configured', shares: 0 },
        { status: 400 }
      );
    }
    
    // Get form data from request
    const formData = await request.formData();
    const gifFile = formData.get('gif') as File | null;
    
    // Validate GIF file
    if (!gifFile) {
      return NextResponse.json(
        { error: 'No GIF file provided' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (gifFile.type !== 'image/gif') {
      return NextResponse.json(
        { error: 'File must be a GIF' },
        { status: 400 }
      );
    }
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await gifFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create form data for Discord webhook
    const discordFormData = new FormData();
    
    // Add message content
    discordFormData.append('content', 'New meme shared from Meme Agent!');
    
    // Add file
    const file = new Blob([buffer], { type: 'image/gif' });
    discordFormData.append('file', file, 'meme.gif');
    
    // Send to Discord webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: discordFormData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook error:', errorText);
      return NextResponse.json(
        { error: 'Failed to share to Discord', shares: 0 },
        { status: 500 }
      );
    }
    
    // Increment share count
    const newShareCount = incrementShareCount();
    
    return NextResponse.json({
      ok: true,
      shares: newShareCount
    });
  } catch (error) {
    console.error('Error in share API:', error);
    return NextResponse.json(
      { error: 'Failed to share GIF', shares: 0 },
      { status: 500 }
    );
  }
}