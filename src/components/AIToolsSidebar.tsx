'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AIToolsProps {
  onProcessImage: (operation: string, parameters?: any) => Promise<void>;
  isProcessing: boolean;
  hasImage: boolean;
}

const STYLE_PRESETS = [
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'oil-painting', label: 'Oil Painting' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'pencil-sketch', label: 'Pencil Sketch' },
  { value: 'pop-art', label: 'Pop Art' },
  { value: 'impressionist', label: 'Impressionist' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'anime', label: 'Anime' },
  { value: 'vintage', label: 'Vintage' }
];

const ARTISTIC_FILTERS = [
  { value: 'watercolor', label: 'Watercolor', description: 'Soft, flowing watercolor effect' },
  { value: 'oil-painting', label: 'Oil Paint', description: 'Rich, textured oil painting style' },
  { value: 'pencil-sketch', label: 'Pencil Sketch', description: 'Detailed pencil drawing' },
  { value: 'charcoal', label: 'Charcoal', description: 'Dramatic charcoal artwork' },
  { value: 'pastel', label: 'Pastel', description: 'Soft pastel colors' },
  { value: 'ink-wash', label: 'Ink Wash', description: 'Traditional ink painting' }
];

export function AIToolsSidebar({ onProcessImage, isProcessing, hasImage }: AIToolsProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [objectToRemove, setObjectToRemove] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  const handleBackgroundRemoval = async () => {
    await onProcessImage('background-removal');
  };

  const handleStyleTransfer = async () => {
    if (!selectedStyle) {
      alert('Please select a style first');
      return;
    }
    await onProcessImage('style-transfer', { style: selectedStyle });
  };

  const handleImageEnhancement = async () => {
    await onProcessImage('enhance');
  };

  const handleObjectRemoval = async () => {
    if (!objectToRemove.trim()) {
      alert('Please describe what you want to remove');
      return;
    }
    await onProcessImage('object-removal', { prompt: objectToRemove });
  };

  const handleArtisticFilter = async () => {
    if (!selectedFilter) {
      alert('Please select a filter first');
      return;
    }
    await onProcessImage('artistic-filter', { style: selectedFilter });
  };

  const handleCustomEdit = async () => {
    if (!customPrompt.trim()) {
      alert('Please enter a description for your custom edit');
      return;
    }
    await onProcessImage('custom-edit', { prompt: customPrompt });
  };

  return (
    <Card className="w-80 h-fit">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">AI Editing Tools</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Transform your images with AI-powered editing
        </p>
      </div>

      <div className="p-4">
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick">Quick Tools</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4 mt-4">
            {/* Background Removal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Background Removal</Label>
                <Badge variant="secondary">Popular</Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Remove or replace image background automatically
              </p>
              <Button
                onClick={handleBackgroundRemoval}
                disabled={!hasImage || isProcessing}
                className="w-full"
                variant="outline"
              >
                {isProcessing ? 'Processing...' : 'Remove Background'}
              </Button>
            </div>

            <Separator />

            {/* Image Enhancement */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Image Enhancement</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Improve clarity, colors, and overall quality
              </p>
              <Button
                onClick={handleImageEnhancement}
                disabled={!hasImage || isProcessing}
                className="w-full"
                variant="outline"
              >
                {isProcessing ? 'Processing...' : 'Enhance Image'}
              </Button>
            </div>

            <Separator />

            {/* Style Transfer */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Style Transfer</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Apply artistic styles to your image
              </p>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_PRESETS.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStyleTransfer}
                disabled={!hasImage || !selectedStyle || isProcessing}
                className="w-full"
                variant="outline"
              >
                {isProcessing ? 'Processing...' : 'Apply Style'}
              </Button>
            </div>

            <Separator />

            {/* Object Removal */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Object Removal</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Remove unwanted objects from your image
              </p>
              <Input
                placeholder="Describe what to remove (e.g., 'person in background')"
                value={objectToRemove}
                onChange={(e) => setObjectToRemove(e.target.value)}
                disabled={isProcessing}
              />
              <Button
                onClick={handleObjectRemoval}
                disabled={!hasImage || !objectToRemove.trim() || isProcessing}
                className="w-full"
                variant="outline"
              >
                {isProcessing ? 'Processing...' : 'Remove Object'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            {/* Artistic Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Artistic Filters</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Transform into different art styles
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ARTISTIC_FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedFilter === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.value)}
                    className="text-xs h-auto py-2 px-2"
                    disabled={isProcessing}
                  >
                    <div className="text-center">
                      <div className="font-medium">{filter.label}</div>
                    </div>
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleArtisticFilter}
                disabled={!hasImage || !selectedFilter || isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Apply Filter'}
              </Button>
            </div>

            <Separator />

            {/* Custom AI Edit */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Custom AI Edit</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Describe any custom transformation you want
              </p>
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 resize-none"
                rows={3}
                placeholder="e.g., 'Make it look like a sunset scene' or 'Add a dreamy, ethereal glow'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={isProcessing}
              />
              <Button
                onClick={handleCustomEdit}
                disabled={!hasImage || !customPrompt.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Apply Custom Edit'}
              </Button>
            </div>

            <Separator />

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    AI is processing your image...
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  This may take 30-60 seconds depending on the complexity
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Tips for better results:</h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use high-quality images for best results</li>
            <li>• Be specific when describing objects to remove</li>
            <li>• Try different styles to find your perfect look</li>
            <li>• Process may take 30-60 seconds per edit</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}