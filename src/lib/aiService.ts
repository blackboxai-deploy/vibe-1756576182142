// AI Service for Image Processing
// Using custom OpenRouter endpoint for AI-powered image editing

interface AIServiceResponse {
  success: boolean;
  data?: string; // Base64 encoded image or URL
  error?: string;
  processingTime?: number;
}

interface AIImageEditRequest {
  image: string; // Base64 encoded image
  operation: 'background-removal' | 'style-transfer' | 'enhance' | 'object-removal' | 'artistic-filter';
  parameters?: {
    style?: string;
    intensity?: number;
    prompt?: string;
    mask?: string; // For object removal
  };
}

class AIImageService {
  private readonly endpoint = 'https://oi-server.onrender.com/chat/completions';
  private readonly headers = {
    'customerId': 'sijanbastola1@gmail.com',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer xxx'
  };
  private readonly model = 'replicate/black-forest-labs/flux-1.1-pro';

  async processImage(request: AIImageEditRequest): Promise<AIServiceResponse> {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildPromptForOperation(request);
      
      const payload = {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:image/jpeg;base64,${request.image}`
                } 
              }
            ]
          }
        ]
      };

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      // Extract image URL from response
      const imageUrl = this.extractImageFromResponse(result);
      
      return {
        success: true,
        data: imageUrl,
        processingTime
      };

    } catch (error) {
      console.error('AI service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime
      };
    }
  }

  private buildPromptForOperation(request: AIImageEditRequest): string {
    switch (request.operation) {
      case 'background-removal':
        return 'Remove the background from this image, making it transparent while keeping the main subject intact and sharp. Output a high-quality image with clean edges.';
      
      case 'style-transfer':
        const style = request.parameters?.style || 'artistic';
        return `Transform this image into ${style} style. Apply the artistic transformation while maintaining the core composition and subject matter. Make it visually appealing and high quality.`;
      
      case 'enhance':
        return 'Enhance this image by improving clarity, sharpness, color saturation, and overall quality. Upscale if necessary while maintaining natural appearance and removing any noise or artifacts.';
      
      case 'object-removal':
        const objectPrompt = request.parameters?.prompt || 'unwanted object';
        return `Remove ${objectPrompt} from this image and seamlessly fill in the background. Ensure the removal looks natural and the background blends perfectly without any artifacts.`;
      
      case 'artistic-filter':
        const filter = request.parameters?.style || 'watercolor';
        return `Apply a ${filter} artistic filter to this image. Transform it into a beautiful artistic representation while preserving the main elements and composition.`;
      
      default:
        return 'Process and enhance this image to improve its overall quality and appearance.';
    }
  }

  private extractImageFromResponse(response: any): string {
    // Handle different response formats from AI service
    if (response.choices && response.choices[0] && response.choices[0].message) {
      const content = response.choices[0].message.content;
      
      // Look for image URLs in the response
      const urlMatch = content.match(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|webp|gif))/i);
      if (urlMatch) {
        return urlMatch[1];
      }
    }
    
    // If no URL found, return the content as-is (might be base64)
    return response.choices?.[0]?.message?.content || '';
  }

  // Background removal using AI
  async removeBackground(imageBase64: string): Promise<AIServiceResponse> {
    return this.processImage({
      image: imageBase64,
      operation: 'background-removal'
    });
  }

  // Style transfer
  async applyStyleTransfer(imageBase64: string, style: string): Promise<AIServiceResponse> {
    return this.processImage({
      image: imageBase64,
      operation: 'style-transfer',
      parameters: { style }
    });
  }

  // Image enhancement
  async enhanceImage(imageBase64: string): Promise<AIServiceResponse> {
    return this.processImage({
      image: imageBase64,
      operation: 'enhance'
    });
  }

  // Object removal
  async removeObject(imageBase64: string, objectDescription: string): Promise<AIServiceResponse> {
    return this.processImage({
      image: imageBase64,
      operation: 'object-removal',
      parameters: { prompt: objectDescription }
    });
  }

  // Artistic filters
  async applyArtisticFilter(imageBase64: string, filterType: string): Promise<AIServiceResponse> {
    return this.processImage({
      image: imageBase64,
      operation: 'artistic-filter',
      parameters: { style: filterType }
    });
  }
}

export const aiImageService = new AIImageService();
export type { AIServiceResponse, AIImageEditRequest };