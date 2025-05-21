import React from 'react';
import { type Slide } from '../App';

interface SlidePreviewProps {
  slide: Slide;
  isSelected: boolean;
  onClick: () => void;
}

function SlidePreview({ slide, isSelected, onClick }: SlidePreviewProps) {
  // Safely extract text content from textBoxes
  const slideText = slide?.textBoxes?.[0]?.content ?? "No content";

  return (
    <div
      onClick={onClick}
      className={`
        aspect-video w-full rounded-lg p-2 cursor-pointer transition-all
        ${isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}
      `}
    >
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-xs truncate">
          {slideText?.slice(0, 50)}{slideText?.length > 50 ? '...' : ''}
        </p>
      </div>
    </div>
  );
}


export default SlidePreview;
