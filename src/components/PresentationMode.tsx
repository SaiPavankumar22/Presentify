import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Minimize2, Maximize2 } from 'lucide-react';
import { type Slide, type TextBox } from '../App';

interface PresentationModeProps {
  slides: Slide[];
  onExit: () => void;
}

function PresentationMode({ slides, onExit }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Animation styles
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        transform: translate(-100%, -50%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%);
        opacity: 1;
      }
    }

    @keyframes zoomIn {
      from {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translate(-50%, -50%);
      }
      40% {
        transform: translate(-50%, -60%);
      }
      60% {
        transform: translate(-50%, -55%);
      }
    }

    @keyframes rotate {
      from {
        transform: translate(-50%, -50%) rotate(-180deg);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) rotate(0);
        opacity: 1;
      }
    }

    @keyframes flip {
      from {
        transform: translate(-50%, -50%) perspective(400px) rotateX(-90deg);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) perspective(400px) rotateX(0);
        opacity: 1;
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translate(-50%, -50%);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translate(-52%, -50%);
      }
      20%, 40%, 60%, 80% {
        transform: translate(-48%, -50%);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .animate-slide-in {
      animation: slideIn 0.5s ease-out forwards;
    }

    .animate-zoom-in {
      animation: zoomIn 0.5s ease-out forwards;
    }

    .animate-bounce {
      animation: bounce 1s ease-in-out;
    }

    .animate-rotate {
      animation: rotate 0.5s ease-out forwards;
    }

    .animate-flip {
      animation: flip 0.5s ease-out forwards;
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `;

  // Add animation styles to head
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, onExit]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getTextBoxStyle = (textBox: TextBox) => {
    return {
      fontFamily: textBox.style?.fontFamily || 'Arial',
      fontSize: textBox.style?.fontSize || '16px',
      color: textBox.style?.color || '#000',
      fontWeight: textBox.style?.bold ? 'bold' : 'normal',
      fontStyle: textBox.style?.italic ? 'italic' : 'normal',
      textDecoration: textBox.style?.underline ? 'underline' : 'none',
      textAlign: textBox.style?.align || 'left'
    };
  };

  const getTextBoxAnimationClass = (animation?: string) => {
    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-in':
        return 'animate-slide-in';
      case 'zoom':
        return 'animate-zoom-in';
      case 'bounce':
        return 'animate-bounce';
      case 'rotate':
        return 'animate-rotate';
      case 'flip':
        return 'animate-flip';
      case 'shake':
        return 'animate-shake';
      default:
        return '';
    }
  };

  const slide = slides[currentSlide];
  if (!slide) return null;

  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-7xl mx-auto bg-white shadow-2xl" style={{ aspectRatio: '16/9' }}>
          {/* Slide Content */}
          <div className="w-full h-full p-12 relative">
            {slide.template === 'title' ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8">
                {slide.textBoxes.map((textBox, index) => (
                  <div
                    key={textBox.id}
                    className={`w-4/5 text-center ${getTextBoxAnimationClass(textBox.animation)}`}
                    style={{
                      ...getTextBoxStyle(textBox),
                      animationDelay: `${index * 0.5}s`
                    }}
                  >
                    {textBox.content}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Content slide layout */}
                <div className="flex-1 relative">
                  {slide.textBoxes.map((textBox, index) => (
                    <div
                      key={textBox.id}
                      className={`absolute ${getTextBoxAnimationClass(textBox.animation)}`}
                      style={{
                        left: `${textBox.x}%`,
                        top: `${textBox.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: textBox.id.includes('title') ? '90%' : '60%',
                        ...getTextBoxStyle(textBox),
                        animationDelay: `${index * 0.3}s`
                      }}
                    >
                      {textBox.content.split('\n').map((line, i) => (
                        <div key={i} className="mb-2">{line}</div>
                      ))}
                    </div>
                  ))}

                  {/* Image with proper positioning and animation */}
                  {slide.imageUrl && (
                    <div 
                      className={`absolute right-8 top-1/2 transform -translate-y-1/2 w-1/3 aspect-square rounded-lg overflow-hidden shadow-lg animate-fade-in`}
                      style={{
                        maxHeight: '60%',
                        animationDelay: '0.5s'
                      }}
                    >
                      <img 
                        src={slide.imageUrl} 
                        alt="Slide visual" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-4 text-gray-600">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-white/80 hover:bg-white disabled:opacity-50"
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm font-medium">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white/80 hover:bg-white disabled:opacity-50"
              disabled={currentSlide === slides.length - 1}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600"
          >
            {isFullscreen ? (
              <Minimize2 className="w-6 h-6" />
            ) : (
              <Maximize2 className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PresentationMode;