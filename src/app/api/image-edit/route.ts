import { NextRequest, NextResponse } from 'next/server';
import { aiImageService } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, operation, parameters } = body;

    // Validate required fields
    if (!image || !operation) {
      return NextResponse.json(
        { error: 'Missing required fields: image and operation' },
        { status: 400 }
      );
    }

    // Validate image format (should be base64)
    if (typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Image must be a base64 string' },
        { status: 400 }
      );
    }

    // Process image based on operation
    let result;
    
    switch (operation) {
      case 'background-removal':
        result = await aiImageService.removeBackground(image);
        break;
      
      case 'style-transfer':
        const style = parameters?.style || 'artistic';
        result = await aiImageService.applyStyleTransfer(image, style);
        break;
      
      case 'enhance':
        result = await aiImageService.enhanceImage(image);
        break;
      
      case 'object-removal':
        const objectDescription = parameters?.prompt || '';
        if (!objectDescription) {
          return NextResponse.json(
            { error: 'Object description is required for object removal' },
            { status: 400 }
          );
        }
        result = await aiImageService.removeObject(image, objectDescription);
        break;
      
      case 'artistic-filter':
        const filterStyle = parameters?.style || 'watercolor';
        result = await aiImageService.applyArtisticFilter(image, filterStyle);
        break;
      
      default:
        // Custom edit or generic processing
        result = await aiImageService.processImage({
          image,
          operation: 'enhance',
          parameters
        });
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        imageUrl: result.data,
        processingTime: result.processingTime,
        operation
      });
    } else {
      return NextResponse.json(
        { 
          error: result.error || 'Processing failed',
          operation 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Image processing API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to process image request'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Image Processing API',
    version: '1.0.0',
    supportedOperations: [
      'background-removal',
      'style-transfer', 
      'enhance',
      'object-removal',
      'artistic-filter'
    ],
    usage: {
      method: 'POST',
      contentType: 'application/json',
      body: {
        image: 'base64 encoded image string',
        operation: 'one of the supported operations',
        parameters: 'optional parameters object'
      }
    }
  });
}