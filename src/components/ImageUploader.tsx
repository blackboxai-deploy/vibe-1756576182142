'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { validateImageFile, formatFileSize } from '@/lib/imageUtils';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  disabled?: boolean;
  currentImage?: string;
}

export function ImageUploader({ onImageUpload, disabled, currentImage }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validation = validateImageFile(file);
      
      if (validation.valid) {
        onImageUpload(file);
      } else {
        alert(validation.error);
      }
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: false,
    disabled
  });

  return (
    <Card className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${currentImage ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {currentImage ? (
            <>
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-green-800 dark:text-green-200">
                  Image Loaded Successfully
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Drop a new image to replace or continue editing
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {isDragActive ? 'Drop your image here' : 'Upload an image to start editing'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Drag and drop an image file, or click to browse
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={disabled}
                  className="w-full sm:w-auto"
                >
                  Choose File
                </Button>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  or drag and drop
                </span>
              </div>
            </>
          )}
          
          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <p>Supported formats: JPEG, PNG, WebP, GIF</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate max-w-40">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
    </Card>
  );
}