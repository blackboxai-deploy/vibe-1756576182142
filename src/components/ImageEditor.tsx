'use client';

import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { ImageCanvas } from './ImageCanvas';
import { AIToolsSidebar } from './AIToolsSidebar';
import { ExportPanel } from './ExportPanel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fileToBase64 } from '@/lib/imageUtils';
import { aiImageService, type AIServiceResponse } from '@/lib/aiService';

interface EditHistory {
  imageUrl: string;
  operation: string;
  timestamp: number;
}

export function ImageEditor() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  // Handle file upload
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setCurrentFile(file);
      const imageUrl = URL.createObjectURL(file);
      setCurrentImageUrl(imageUrl);
      setOriginalImageUrl(imageUrl);
      
      // Reset history when new image is uploaded
      setEditHistory([]);
      setCurrentHistoryIndex(-1);
      
      console.log('Image uploaded successfully:', file.name);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    }
  }, []);

  // Add edit to history
  const addToHistory = useCallback((imageUrl: string, operation: string) => {
    const newEntry: EditHistory = {
      imageUrl,
      operation,
      timestamp: Date.now()
    };
    
    // Remove any history after current index (if user went back and made a new edit)
    const newHistory = editHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newEntry);
    
    setEditHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  }, [editHistory, currentHistoryIndex]);

  // Handle AI image processing
  const handleProcessImage = useCallback(async (operation: string, parameters?: any) => {
    if (!currentFile || !currentImageUrl) {
      alert('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus(`Processing ${operation.replace('-', ' ')}...`);

    try {
      // Convert current image to base64
      const base64Image = await fileToBase64(currentFile);
      
      let result: AIServiceResponse;
      
      // Process based on operation type
      switch (operation) {
        case 'background-removal':
          result = await aiImageService.removeBackground(base64Image);
          break;
        case 'style-transfer':
          result = await aiImageService.applyStyleTransfer(base64Image, parameters?.style || 'artistic');
          break;
        case 'enhance':
          result = await aiImageService.enhanceImage(base64Image);
          break;
        case 'object-removal':
          result = await aiImageService.removeObject(base64Image, parameters?.prompt || '');
          break;
        case 'artistic-filter':
          result = await aiImageService.applyArtisticFilter(base64Image, parameters?.style || 'watercolor');
          break;
        default:
          // Custom edit or fallback
          result = await aiImageService.processImage({
            image: base64Image,
            operation: 'enhance',
            parameters
          });
      }

      if (result.success && result.data) {
        // Create new image URL from result
        let newImageUrl: string;
        
        if (result.data.startsWith('http')) {
          // If it's a URL, use it directly
          newImageUrl = result.data;
        } else {
          // If it's base64, create data URL
          newImageUrl = `data:image/png;base64,${result.data}`;
        }
        
        setCurrentImageUrl(newImageUrl);
        addToHistory(newImageUrl, operation);
        
        setProcessingStatus(`✅ ${operation.replace('-', ' ')} completed successfully!`);
        setTimeout(() => setProcessingStatus(''), 3000);
      } else {
        console.error('AI processing failed:', result.error);
        alert(`Failed to process image: ${result.error || 'Unknown error'}`);
        setProcessingStatus('❌ Processing failed');
        setTimeout(() => setProcessingStatus(''), 3000);
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('An error occurred while processing the image. Please try again.');
      setProcessingStatus('❌ Processing failed');
      setTimeout(() => setProcessingStatus(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [currentFile, currentImageUrl, addToHistory]);

  // Undo last edit
  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setCurrentImageUrl(editHistory[currentHistoryIndex - 1].imageUrl);
    } else if (currentHistoryIndex === 0) {
      // Go back to original
      setCurrentHistoryIndex(-1);
      setCurrentImageUrl(originalImageUrl);
    }
  }, [currentHistoryIndex, editHistory, originalImageUrl]);

  // Redo edit
  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < editHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setCurrentImageUrl(editHistory[currentHistoryIndex + 1].imageUrl);
    }
  }, [currentHistoryIndex, editHistory]);

  // Reset to original image
  const handleReset = useCallback(() => {
    setCurrentImageUrl(originalImageUrl);
    setCurrentHistoryIndex(-1);
    setEditHistory([]);
  }, [originalImageUrl]);

  const canUndo = currentHistoryIndex >= 0;
  const canRedo = currentHistoryIndex < editHistory.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Image Editor
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Free AI-powered image editing for everyone
              </p>
            </div>
            
            {/* History Controls */}
            {currentImageUrl && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo || isProcessing}
                >
                  ↶ Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!canRedo || isProcessing}
                >
                  ↷ Redo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!currentImageUrl || isProcessing}
                >
                  Reset
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {processingStatus && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {processingStatus}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentImageUrl ? (
          /* Upload State */
          <div className="max-w-2xl mx-auto">
            <ImageUploader
              onImageUpload={handleImageUpload}
              disabled={isProcessing}
            />
            
            {/* Features Overview */}
            <Card className="mt-8 p-6">
              <h2 className="text-xl font-semibold mb-4">AI Editing Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-blue-600 dark:text-blue-400">Quick Tools</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Background Removal</li>
                    <li>• Image Enhancement</li>
                    <li>• Style Transfer</li>
                    <li>• Object Removal</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-green-600 dark:text-green-400">Advanced Features</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Artistic Filters</li>
                    <li>• Custom AI Edits</li>
                    <li>• Multiple Export Formats</li>
                    <li>• Undo/Redo History</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Editor State */
          <div className="flex gap-6">
            {/* Left Sidebar - AI Tools */}
            <div className="flex-shrink-0">
              <AIToolsSidebar
                onProcessImage={handleProcessImage}
                isProcessing={isProcessing}
                hasImage={!!currentImageUrl}
              />
            </div>
            
            {/* Main Canvas Area */}
            <div className="flex-1 min-w-0">
              <ImageCanvas
                imageUrl={currentImageUrl}
                originalImage={originalImageUrl}
                isProcessing={isProcessing}
                className="w-full"
              />
              
              {/* Edit History */}
              {editHistory.length > 0 && (
                <Card className="mt-4 p-4">
                  <h3 className="text-sm font-medium mb-3">Edit History</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={currentHistoryIndex === -1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCurrentHistoryIndex(-1);
                        setCurrentImageUrl(originalImageUrl);
                      }}
                      disabled={isProcessing}
                    >
                      Original
                    </Button>
                    {editHistory.map((edit, index) => (
                      <Button
                        key={edit.timestamp}
                        variant={currentHistoryIndex === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentHistoryIndex(index);
                          setCurrentImageUrl(edit.imageUrl);
                        }}
                        disabled={isProcessing}
                      >
                        {edit.operation.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            
            {/* Right Sidebar - Export */}
            <div className="flex-shrink-0">
              <ExportPanel
                imageData={currentImageUrl}
                originalImageName={currentFile?.name}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Free AI Image Editor - Empowering creativity for everyone</p>
            <p className="mt-1">No registration required • Process locally • Privacy focused</p>
          </div>
        </div>
      </footer>
    </div>
  );
}