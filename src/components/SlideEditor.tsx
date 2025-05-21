import React, { useState, useRef } from 'react';
import { type Slide, type TextBox } from '../App';
import { 
  Plus, 
  Type, 
  Palette, 
  MoveVertical,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Zap,
  Trash2
} from 'lucide-react';

interface SlideEditorProps {
  slide: Slide;
  onUpdate: (id: number, content: string) => void;
  onUpdateAnimation: (id: number, animation: Slide['animation']) => void;
  onUpdateTextBoxAnimation: (slideId: number, textBoxId: string, animation: string) => void;
  onAddTextBox: (slideId: number, textBox: TextBox) => void;
  onUpdateTextBox: (slideId: number, textBoxId: string, content: string) => void;
  onUpdateTextBoxStyle: (slideId: number, textBoxId: string, style: TextBox['style']) => void;
  onMoveTextBox: (slideId: number, textBoxId: string, x: number, y: number) => void;
  onDeleteTextBox: (slideId: number, textBoxId: string) => void;
}

function SlideEditor({ 
  slide, 
  onUpdate, 
  onUpdateAnimation,
  onUpdateTextBoxAnimation,
  onAddTextBox,
  onUpdateTextBox,
  onUpdateTextBoxStyle,
  onMoveTextBox,
  onDeleteTextBox
}: SlideEditorProps) {
  const aspectRatio = '56.25%'; // 16:9 aspect ratio
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null);
  const [isAddingTextBox, setIsAddingTextBox] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; textBoxId: string } | null>(null);
  const [lastDeletedTextBox, setLastDeletedTextBox] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  const defaultStyle = {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#000000',
    bold: false,
    italic: false,
    underline: false,
    align: 'left' as const
  };

  const fontFamilies = [
    'Arial',
    'Times New Roman',
    'Helvetica',
    'Georgia',
    'Verdana',
    'Courier New'
  ];

  const fontSizes = [
    '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'
  ];

  const animations = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide-in', label: 'Slide In' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'rotate', label: 'Rotate' },
    { value: 'flip', label: 'Flip' },
    { value: 'shake', label: 'Shake' }
  ];

  const handleSlideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingTextBox) {
      setContextMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newId = crypto.randomUUID();
    onAddTextBox(slide.id, {
      id: newId,
      content: 'New text box',
      x,
      y,
      style: { ...defaultStyle }
    });
    setSelectedTextBox(newId);
    setIsAddingTextBox(false);
  };

  const handleContextMenu = (e: React.MouseEvent, textBoxId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      textBoxId
    });
  };

  const handleTextBoxDragStart = (e: React.DragEvent, textBox: TextBox) => {
    const slideContainer = e.currentTarget.closest('.slide-container');
    if (!slideContainer) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = slideContainer.getBoundingClientRect();
    
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    e.dataTransfer.setData('text/plain', textBox.id);
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const textBoxId = e.dataTransfer.getData('text/plain');
    const slideContainer = e.currentTarget.closest('.slide-container');
    if (!slideContainer) return;

    const containerRect = slideContainer.getBoundingClientRect();
    const contentPadding = 40; // Padding from slide edges in pixels
    
    // Calculate position relative to slide content area
    const x = ((e.clientX - containerRect.left - contentPadding) / (containerRect.width - 2 * contentPadding)) * 100;
    const y = ((e.clientY - containerRect.top - contentPadding) / (containerRect.height - 2 * contentPadding)) * 100;

    // Constrain position within content area
    const finalX = Math.max(0, Math.min(100, x));
    const finalY = Math.max(0, Math.min(100, y));
    
    onMoveTextBox(slide.id, textBoxId, finalX, finalY);
    setIsDragging(false);
    setDragOffset(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const getTextBoxStyle = (textBox: TextBox) => {
    return textBox.style || defaultStyle;
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

  // Add CSS animation classes
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        transform: translate(-60%, -50%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%);
        opacity: 1;
      }
    }

    @keyframes zoomIn {
      from {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
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
      animation: bounce 0.5s ease-in-out;
    }

    .animate-rotate {
      animation: rotate 0.5s ease-in-out;
    }

    .animate-flip {
      animation: flip 0.5s ease-in-out;
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `;

  // Add style tag to head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add animation end handler
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // Remove animation classes after completion to prevent position reset
    e.currentTarget.classList.remove(
      'animate-fade-in',
      'animate-slide-in',
      'animate-zoom-in',
      'animate-bounce',
      'animate-rotate',
      'animate-flip',
      'animate-shake'
    );
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Add useEffect to handle selection after deletion
  React.useEffect(() => {
    if (lastDeletedTextBox && selectedTextBox === lastDeletedTextBox) {
      setSelectedTextBox(null);
      setLastDeletedTextBox(null);
    }
  }, [slide.textBoxes, lastDeletedTextBox, selectedTextBox]);

  // Update keyboard event handler to prevent text box deletion while editing
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTextBox) {
        const isTextBoxBeingEdited = document.activeElement?.tagName === 'TEXTAREA';
        if ((e.key === 'Delete' || e.key === 'Backspace') && !isTextBoxBeingEdited) {
          setLastDeletedTextBox(selectedTextBox);
          onDeleteTextBox(slide.id, selectedTextBox);
        } else if (e.key === 'Escape') {
          setSelectedTextBox(null);
          setContextMenu(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextBox, slide.id, onDeleteTextBox]);

  // Remove animation classes from preview mode
  const getPreviewClassName = (textBox: TextBox) => {
    return `group ${selectedTextBox === textBox.id ? 'selected' : ''}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div 
        className="relative"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedTextBox(null);
            setContextMenu(null);
          }
        }}
      >
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-2 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Text Controls */}
            <select
              className="px-2 py-1 border rounded"
              value={selectedTextBox && slide.textBoxes.find(tb => tb.id === selectedTextBox)?.style?.fontFamily || defaultStyle.fontFamily}
              onChange={(e) => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                fontFamily: e.target.value
              })}
              disabled={!selectedTextBox}
            >
              {fontFamilies.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>

            <select
              className="px-2 py-1 border rounded"
              value={selectedTextBox && slide.textBoxes.find(tb => tb.id === selectedTextBox)?.style?.fontSize || defaultStyle.fontSize}
              onChange={(e) => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                fontSize: e.target.value
              })}
              disabled={!selectedTextBox}
            >
              {fontSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <input
              type="color"
              value={selectedTextBox && slide.textBoxes.find(tb => tb.id === selectedTextBox)?.style?.color || defaultStyle.color}
              onChange={(e) => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                color: e.target.value
              })}
              className="w-8 h-8 p-1 border rounded"
              disabled={!selectedTextBox}
            />

            <div className="flex items-center gap-1 border-l border-r px-2">
              <button
                className={`p-1 rounded hover:bg-gray-100 ${
                  selectedTextBox && slide.textBoxes.find(tb => tb.id === selectedTextBox)?.style?.bold ? 'bg-gray-200' : ''
                }`}
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  bold: !getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!).bold
                })}
                disabled={!selectedTextBox}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                className={`p-1 rounded hover:bg-gray-100 ${
                  selectedTextBox && slide.textBoxes.find(tb => tb.id === selectedTextBox)?.style?.italic ? 'bg-gray-200' : ''
                }`}
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  italic: !getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!).italic
                })}
                disabled={!selectedTextBox}
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                className={`p-1 rounded hover:bg-gray-100 ${
                  selectedTextBox && slide.textBoxes.find(tb => tb.id === selectedTextBox)?.style?.underline ? 'bg-gray-200' : ''
                }`}
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  underline: !getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!).underline
                })}
                disabled={!selectedTextBox}
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 border-r px-2">
              <button
                className={`p-1 rounded hover:bg-gray-100 ${
                  selectedTextBox && slide.textBoxes.find(tb => tb.id === selectedTextBox)?.style?.align === 'left' ? 'bg-gray-200' : ''
                }`}
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  align: 'left'
                })}
                disabled={!selectedTextBox}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                className={`p-1 rounded hover:bg-gray-100 ${
                  selectedTextBox && slide.textBoxes.find(tb => tb.id === selectedTextBox)?.style?.align === 'center' ? 'bg-gray-200' : ''
                }`}
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  align: 'center'
                })}
                disabled={!selectedTextBox}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                className={`p-1 rounded hover:bg-gray-100 ${
                  selectedTextBox && slide.textBoxes.find(tb => tb.id === selectedTextBox)?.style?.align === 'right' ? 'bg-gray-200' : ''
                }`}
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  align: 'right'
                })}
                disabled={!selectedTextBox}
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            {/* Add new toolbar items */}
            <div className="flex items-center gap-1 border-l border-r px-2">
              <button
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  fontSize: `${parseInt(getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!).fontSize) + 2}px`
                })}
                disabled={!selectedTextBox}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  fontSize: `${Math.max(12, parseInt(getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!).fontSize) - 2)}px`
                })}
                disabled={!selectedTextBox}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  color: '#' + Math.floor(Math.random()*16777215).toString(16)
                })}
                disabled={!selectedTextBox}
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => selectedTextBox && onUpdateTextBoxStyle(slide.id, selectedTextBox, {
                  ...getTextBoxStyle(slide.textBoxes.find(tb => tb.id === selectedTextBox)!),
                  align: 'left'
                })}
                disabled={!selectedTextBox}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Animation Controls */}
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500" />
              <select
                value={slide.animation}
                onChange={(e) => onUpdateAnimation(slide.id, e.target.value as Slide['animation'])}
                className="px-2 py-1 border rounded"
              >
                <option value="" disabled>Slide Animation</option>
                {animations.map(animation => (
                  <option key={animation.value} value={animation.value}>
                    {animation.label}
                  </option>
                ))}
              </select>

              {selectedTextBox && (
                <select
                  value={slide.textBoxes.find(tb => tb.id === selectedTextBox)?.animation || 'none'}
                  onChange={(e) => onUpdateTextBoxAnimation(slide.id, selectedTextBox, e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  <option value="" disabled>Text Animation</option>
                  {animations.map(animation => (
                    <option key={animation.value} value={animation.value}>
                      {animation.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={() => setIsAddingTextBox(true)}
              className={`flex items-center gap-1 px-3 py-1 ${
                isAddingTextBox ? 'bg-blue-700' : 'bg-blue-600'
              } text-white rounded hover:bg-blue-700`}
            >
              <Plus className="w-4 h-4" />
              Add Text Box
            </button>

            {selectedTextBox && (
              <button
                onClick={() => {
                  setLastDeletedTextBox(selectedTextBox);
                  onDeleteTextBox(slide.id, selectedTextBox);
                }}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete Text Box
              </button>
            )}
          </div>
        </div>

        {/* Slide Editor */}
        <div className="p-6">
          <div 
            className="relative w-full bg-white"
            style={{ paddingBottom: aspectRatio }}
          >
            <div 
              className="slide-container absolute inset-0 border-4 border-gray-200 rounded-lg overflow-hidden"
              onClick={handleSlideClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className={`w-full h-full relative p-10 ${isDragging ? 'cursor-move' : ''}`}>
                {slide.template === 'title' ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    {slide.textBoxes.map((textBox) => (
                      <div
                        key={textBox.id}
                        draggable
                        onDragStart={(e) => handleTextBoxDragStart(e, textBox)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextBox(textBox.id === selectedTextBox ? null : textBox.id);
                        }}
                        style={{
                          position: 'absolute',
                          left: `${textBox.x}%`,
                          top: `${textBox.y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: textBox.id.includes('title') ? '80%' : '60%',
                          cursor: selectedTextBox === textBox.id ? 'move' : 'pointer',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '8px',
                          boxShadow: selectedTextBox === textBox.id 
                            ? '0 4px 20px rgba(0, 0, 0, 0.15)' 
                            : '0 2px 10px rgba(0, 0, 0, 0.05)',
                          border: selectedTextBox === textBox.id 
                            ? '2px solid #3b82f6'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          padding: '8px',
                          zIndex: selectedTextBox === textBox.id ? 10 : 1
                        }}
                        className={getPreviewClassName(textBox)}
                      >
                        <textarea
                          value={textBox.content}
                          onChange={(e) => onUpdateTextBox(slide.id, textBox.id, e.target.value)}
                          style={{
                            ...getTextBoxStyle(textBox),
                            width: '100%',
                            minHeight: textBox.id.includes('title') ? '60px' : '40px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            overflow: 'hidden'
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setSelectedTextBox(textBox.id)}
                          rows={textBox.id.includes('content') ? 4 : 2}
                          placeholder={textBox.id.includes('title') ? 'Enter title...' : 'Enter content...'}
                        />
                        {selectedTextBox === textBox.id && (
                          <div className="absolute -top-8 left-0 bg-white rounded-t-lg px-2 py-1 text-xs text-gray-500 select-none">
                            Drag to move
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full relative">
                    {/* Content slide layout */}
                    {slide.textBoxes.map((textBox) => (
                      <div
                        key={textBox.id}
                        draggable
                        onDragStart={(e) => handleTextBoxDragStart(e, textBox)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextBox(textBox.id === selectedTextBox ? null : textBox.id);
                        }}
                        style={{
                          position: 'absolute',
                          left: `${textBox.x}%`,
                          top: `${textBox.y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: textBox.id.includes('title') ? '90%' : '70%',
                          cursor: selectedTextBox === textBox.id ? 'move' : 'pointer',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '8px',
                          boxShadow: selectedTextBox === textBox.id 
                            ? '0 4px 20px rgba(0, 0, 0, 0.15)' 
                            : '0 2px 10px rgba(0, 0, 0, 0.05)',
                          border: selectedTextBox === textBox.id 
                            ? '2px solid #3b82f6'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          padding: '8px',
                          zIndex: selectedTextBox === textBox.id ? 10 : 1
                        }}
                        className={getPreviewClassName(textBox)}
                      >
                        <textarea
                          value={textBox.content}
                          onChange={(e) => onUpdateTextBox(slide.id, textBox.id, e.target.value)}
                          style={{
                            ...getTextBoxStyle(textBox),
                            width: '100%',
                            minHeight: textBox.id.includes('title') ? '60px' : '40px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            overflow: 'hidden'
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={() => setSelectedTextBox(textBox.id)}
                          rows={textBox.id.includes('content') ? 4 : 2}
                          placeholder={textBox.id.includes('title') ? 'Enter title...' : 'Enter content...'}
                        />
                        {selectedTextBox === textBox.id && (
                          <div className="absolute -top-8 left-0 bg-white rounded-t-lg px-2 py-1 text-xs text-gray-500 select-none">
                            Drag to move
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Image placeholder with better positioning */}
                    {slide.imageUrl && (
                      <div 
                        className="absolute right-8 top-1/2 transform -translate-y-1/2 w-1/3 aspect-square rounded-lg overflow-hidden shadow-lg"
                        style={{
                          maxHeight: '60%',
                          objectFit: 'contain'
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
                )}
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {isAddingTextBox ? 
              'Click anywhere on the slide to add a text box' : 
              'Click "Add Text Box" button to start adding a new text box. Drag text boxes to reposition them. Right-click a text box to delete it.'}
          </p>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-lg py-1 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
            onClick={() => {
              setLastDeletedTextBox(contextMenu.textBoxId);
              onDeleteTextBox(slide.id, contextMenu.textBoxId);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete Text Box
          </button>
        </div>
      )}
    </div>
  );
}

export default SlideEditor;