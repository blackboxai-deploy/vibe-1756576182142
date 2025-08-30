'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getOptimalDisplaySize, type ImageDimensions } from '@/lib/imageUtils';

interface ImageCanvasProps {
  imageUrl?: string;
  originalImage?: string;
  onImageChange?: (imageData: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export function ImageCanvas({ 
  imageUrl, 
  originalImage,
  onImageChange,
  isProcessing = false,
  className = "" 
}: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState([100]);
  const [canvasSize, setCanvasSize] = useState<ImageDimensions>({ width: 800, height: 600 });
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load image onto canvas
  const loadImageToCanvas = useCallback((imageSrc: string) => {
    if (!canvasRef.current || !containerRef.current) return;

    setIsLoading(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      if (!ctx) return;

      // Store original dimensions
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      // Calculate optimal display size
      const containerRect = containerRef.current?.getBoundingClientRect();
      const maxWidth = containerRect ? containerRect.width - 40 : 800;
      const maxHeight = 600;

      const displaySize = getOptimalDisplaySize(
        img.naturalWidth,
        img.naturalHeight,
        maxWidth,
        maxHeight
      );

      // Set canvas size
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      setCanvasSize(displaySize);

      // Clear and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      setIsLoading(false);
      
      // Notify parent of image change
      if (onImageChange) {
        onImageChange(canvas.toDataURL());
      }
    };

    img.onerror = () => {
      setIsLoading(false);
      console.error('Failed to load image');
    };

    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
  }, [onImageChange]);

  // Apply zoom transformation
  const applyZoom = useCallback(() => {
    if (!canvasRef.current || !imageDimensions || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const zoomLevel = zoom[0] / 100;
    const img = new Image();

    img.onload = () => {
      // Calculate zoomed dimensions
      const zoomedWidth = canvasSize.width * zoomLevel;
      const zoomedHeight = canvasSize.height * zoomLevel;

      // Center the zoomed image
      const offsetX = (canvas.width - zoomedWidth) / 2;
      const offsetY = (canvas.height - zoomedHeight) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, zoomedWidth, zoomedHeight);
    };

    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  }, [zoom, canvasSize, imageDimensions, imageUrl]);

  // Load image when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      loadImageToCanvas(imageUrl);
    }
  }, [imageUrl, loadImageToCanvas]);

  // Apply zoom when zoom level changes
  useEffect(() => {
    if (zoom[0] !== 100) {
      applyZoom();
    }
  }, [zoom, applyZoom]);

  // Reset zoom
  const resetZoom = () => {
    setZoom([100]);
    if (imageUrl) {
      loadImageToCanvas(imageUrl);
    }
  };

  // Download current canvas content
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Card className={`relative ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Zoom:</span>
              <div className="w-32">
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  max={300}
                  min={25}
                  step={25}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                {zoom[0]}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
              disabled={zoom[0] === 100 || isProcessing}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadImage}
              disabled={!imageUrl || isProcessing}
            >
              Download
            </Button>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative p-4 bg-gray-50 dark:bg-gray-900 min-h-[400px] flex items-center justify-center"
      >
        {/* Processing overlay */}
        {(isProcessing || isLoading) && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLoading ? 'Loading image...' : 'Processing with AI...'}
              </p>
            </div>
          </div>
        )}

        {/* Canvas */}
        {imageUrl ? (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
            style={{
              imageRendering: 'crisp-edges',
              background: 'transparent'
            }}
          />
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Upload an image to start editing
            </p>
          </div>
        )}

        {/* Image info */}
        {imageDimensions && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {imageDimensions.width} × {imageDimensions.height}
          </div>
        )}
      </div>

      {/* Comparison view for before/after */}
      {originalImage && imageUrl && originalImage !== imageUrl && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium">Original vs Edited</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <img
                src={originalImage}
                alt="Original"
                className="w-full h-32 object-contain border border-gray-200 dark:border-gray-700 rounded"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Original</p>
            </div>
            <div className="text-center">
              <img
                src={imageUrl}
                alt="Edited"
                className="w-full h-32 object-contain border border-gray-200 dark:border-gray-700 rounded"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Edited</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}