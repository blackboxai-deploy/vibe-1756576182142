'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { downloadImage } from '@/lib/imageUtils';
import { saveAs } from 'file-saver';

interface ExportPanelProps {
  imageData?: string;
  originalImageName?: string;
  isProcessing?: boolean;
}

const EXPORT_FORMATS = [
  { value: 'png', label: 'PNG', description: 'High quality, supports transparency' },
  { value: 'jpg', label: 'JPEG', description: 'Smaller file size, good for photos' },
  { value: 'webp', label: 'WebP', description: 'Modern format, best compression' },
];

const QUALITY_PRESETS = [
  { value: 100, label: 'Maximum (100%)', description: 'Best quality, largest file' },
  { value: 90, label: 'High (90%)', description: 'Great quality, reasonable size' },
  { value: 75, label: 'Good (75%)', description: 'Good balance of quality and size' },
  { value: 60, label: 'Medium (60%)', description: 'Smaller file, acceptable quality' },
];

export function ExportPanel({ imageData, originalImageName, isProcessing }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState('png');
  const [quality, setQuality] = useState([90]);
  const [customName, setCustomName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const generateFileName = () => {
    if (customName.trim()) {
      return customName.trim();
    }
    
    const baseName = originalImageName 
      ? originalImageName.replace(/\.[^/.]+$/, '') 
      : 'edited-image';
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `${baseName}-edited-${timestamp}`;
  };

  const handleDownload = async () => {
    if (!imageData) return;

    setIsExporting(true);
    try {
      const fileName = generateFileName();
      
      if (exportFormat === 'png') {
        // For PNG, we can use the image data directly
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        downloadImage(base64Data, fileName, 'png');
      } else {
        // For JPEG and WebP, we need to convert and apply quality
        await convertAndDownload(imageData, fileName, exportFormat, quality[0]);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const convertAndDownload = async (imageData: string, fileName: string, format: string, qualityValue: number) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // For JPEG, fill with white background (no transparency)
        if (format === 'jpg') {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              saveAs(blob, `${fileName}.${format}`);
              resolve();
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          `image/${format}`,
          qualityValue / 100
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageData;
    });
  };

  const getFileSizeEstimate = () => {
    if (!imageData) return 'Unknown';
    
    const base64Length = imageData.length * 0.75; // Approximate base64 to bytes conversion
    let estimatedSize = base64Length;
    
    // Adjust for format and quality
    if (exportFormat === 'jpg') {
      estimatedSize *= (quality[0] / 100) * 0.7; // JPEG compression
    } else if (exportFormat === 'webp') {
      estimatedSize *= (quality[0] / 100) * 0.5; // WebP compression
    }
    
    return formatBytes(estimatedSize);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-80">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Export Options</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Download your edited image
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* File Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">File Name</Label>
          <input
            type="text"
            placeholder={generateFileName()}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            disabled={isExporting || isProcessing}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Leave empty for auto-generated name
          </p>
        </div>

        {/* Export Format */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Format</Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPORT_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{format.label}</span>
                    <span className="text-xs text-gray-500">{format.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality Setting (not for PNG) */}
        {exportFormat !== 'png' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quality</Label>
            <div className="space-y-2">
              <Slider
                value={quality}
                onValueChange={setQuality}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>10%</span>
                <span className="font-medium">{quality[0]}%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {QUALITY_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={quality[0] === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuality([preset.value])}
                  className="text-xs h-auto py-1"
                  disabled={isExporting || isProcessing}
                >
                  {preset.label.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* File Size Estimate */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Estimated size:</span>
            <span className="font-medium">{getFileSizeEstimate()}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-600 dark:text-gray-400">Format:</span>
            <span className="font-medium uppercase">{exportFormat}</span>
          </div>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={!imageData || isExporting || isProcessing}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Exporting...</span>
            </div>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Download Image
            </>
          )}
        </Button>

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExportFormat('png');
              setQuality([100]);
            }}
            disabled={isExporting || isProcessing}
            className="flex-1"
          >
            Best Quality
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExportFormat('jpg');
              setQuality([75]);
            }}
            disabled={isExporting || isProcessing}
            className="flex-1"
          >
            Balanced
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• PNG: Best for images with transparency</p>
          <p>• JPEG: Best for photographs</p>
          <p>• WebP: Modern format with best compression</p>
        </div>
      </div>
    </Card>
  );
}