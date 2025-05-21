import React, { useState } from 'react';
import { Layout, ChevronRight, Plus, Presentation, Trash2, Play, Download } from 'lucide-react';
import SlideEditor from './components/SlideEditor';
import SlidePreview from './components/SlidePreview';
import InitialForm from './components/InitialForm';
import PresentationMode from './components/PresentationMode';
import pptxgen from 'pptxgenjs';
import SlideComponent from './components/SlideComponent';


export interface TextBox {
  id: string;
  content: string;
  x: number;
  y: number;
  animation?: string;
  style?: {
    fontSize: string;
    fontFamily: string;
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    align: 'left' | 'center' | 'right';
  };
}

export interface Slide {
  id: number;
  content: string;
  template: 'title' | 'content';
  textBoxes: TextBox[];
  animation: 'none' | 'fade' | 'slide-in' | 'zoom' | 'bounce' | 'rotate' | 'flip' | 'shake';
  imageUrl?: string;
}

const animations = ['fade', 'slide-in', 'zoom', 'bounce', 'rotate', 'flip', 'shake'] as const;

function getRandomAnimation(): Slide['animation'] {
  return animations[Math.floor(Math.random() * animations.length)];
}

function App() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(true);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const handleCreatePresentation = async (text: string, numSlides: number) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/generate_ppt_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, numSlides }),
      });
  
      const data = await response.json();
      if (data.error) {
        console.error("Error:", data.error);
        // Show error to user
        alert(`Error: ${data.error}`);
        return;
      }
  
      const newSlides: Slide[] = data.slides.map((slide: any, index: number) => {
        if (slide.layout === "title") {
          // Title slide
          return {
            id: index + 1,
            template: "title",
            content: "",
            textBoxes: [
              {
                id: `title-${index + 1}`,
                content: slide.title,
                x: slide.position?.title?.x || 50,
                y: slide.position?.title?.y || 40,
                animation: "fade",
                style: {
                  fontSize: "48px",
                  fontFamily: "Arial",
                  color: "#000",
                  bold: true,
                  italic: false,
                  underline: false,
                  align: "center",
                },
              },
              ...(slide.subtitle ? [{
                id: `subtitle-${index + 1}`,
                content: slide.subtitle,
                x: slide.position?.subtitle?.x || 50,
                y: slide.position?.subtitle?.y || 60,
                animation: "slide-in",
                style: {
                  fontSize: "28px",
                  fontFamily: "Arial",
                  color: "#666",
                  bold: false,
                  italic: false,
                  underline: false,
                  align: "center",
                },
              }] : []),
            ],
            animation: "fade",
          };
        } else {
          // Content slide
          return {
            id: index + 1,
            template: "content",
            content: "",
            textBoxes: [
              {
                id: `title-${index + 1}`,
                content: slide.title,
                x: slide.position?.title?.x || 50,
                y: slide.position?.title?.y || 15,
                animation: "fade",
                style: {
                  fontSize: "36px",
                  fontFamily: "Arial",
                  color: "#000",
                  bold: true,
                  italic: false,
                  underline: false,
                  align: "left",
                },
              },
              {
                id: `content-${index + 1}`,
                content: Array.isArray(slide.content) 
                  ? slide.content.map((point: string) => `• ${point}`).join('\n')
                  : slide.content,
                x: slide.position?.content?.x || 10,
                y: slide.position?.content?.y || 30,
                animation: "slide-in",
                style: {
                  fontSize: "24px",
                  fontFamily: "Arial",
                  color: "#333",
                  bold: false,
                  italic: false,
                  underline: false,
                  align: "left",
                },
              },
            ],
            animation: "fade",
            imageUrl: slide.image || "",
          };
        }
      });
  
      setSlides(newSlides);
      setSelectedSlide(1);
      setIsCreating(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to create presentation. Please try again.");
    }
  };

  if (isCreating) {
    return <InitialForm onSubmit={handleCreatePresentation} />;
  }

  if (isPresentationMode) {
    return (
      <PresentationMode
        slides={slides}
        onExit={() => setIsPresentationMode(false)}
      />
    );
  }
  
  const SlideComponent = ({ slide }: { slide: Slide }) => {
    return (
      <div className="slide-container">
        {slide.textBoxes.map((textBox) => (
          <div key={textBox.id} style={{ position: 'absolute', left: textBox.x, top: textBox.y }}>
            <p style={{ fontSize: textBox.style?.fontSize }}>{textBox.content}</p>
          </div>
        ))}
        {slide.template !== 'title' && slide.imageUrl && (
          <img src={slide.imageUrl} alt="Slide visual" style={{ position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)', width: '30%' }} />
        )}
      </div>
    );
  };

  const updateSlideContent = (id: number, content: string,image_url?: string) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, content, image_url } : slide
    ));
  };

  const deleteSlide = (id: number) => {
    const newSlides = slides.filter(slide => slide.id !== id);
    setSlides(newSlides);
    if (selectedSlide === id) {
      setSelectedSlide(newSlides[0]?.id || null);
    }
  };

  const deleteTextBox = (slideId: number, textBoxId: string) => {
    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? { ...slide, textBoxes: slide.textBoxes.filter(tb => tb.id !== textBoxId) }
        : slide
    ));
  };
  const updateSlideAnimation = (id: number, animation: Slide['animation']) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, animation } : slide
    ));
  };

  const updateTextBoxAnimation = (slideId: number, textBoxId: string, animation: string) => {
    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? {
            ...slide,
            textBoxes: slide.textBoxes.map(tb => 
              tb.id === textBoxId ? { ...tb, animation } : tb
            )
          }
        : slide
    ));
  };

  const addTextBox = (slideId: number, textBox: TextBox) => {
    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? { 
            ...slide, 
            textBoxes: [...slide.textBoxes, { 
              ...textBox, 
              animation: getRandomAnimation()
            }]
          }
        : slide
    ));
  };

  const updateTextBox = (slideId: number, textBoxId: string, content: string) => {
    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? {
            ...slide,
            textBoxes: slide.textBoxes.map(tb => 
              tb.id === textBoxId ? { ...tb, content } : tb
            )
          }
        : slide
    ));
  };

  const updateTextBoxStyle = (slideId: number, textBoxId: string, style: TextBox['style']) => {
    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? {
            ...slide,
            textBoxes: slide.textBoxes.map(tb => 
              tb.id === textBoxId ? { ...tb, style } : tb
            )
          }
        : slide
    ));
  };

  const moveTextBox = (slideId: number, textBoxId: string, x: number, y: number) => {
    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? {
            ...slide,
            textBoxes: slide.textBoxes.map(tb => 
              tb.id === textBoxId ? { ...tb, x, y } : tb
            )
          }
        : slide
    ));
  };

  const exportToPPTX = async () => {
    const pptx = new pptxgen();
    
    slides.forEach(slide => {
      const pptxSlide = pptx.addSlide();
      
      // Add main content
      if (slide.template === 'title') {
        pptxSlide.addText(slide.content, {
          x: 0.1,
          y: 0.4,
          w: '80%',
          h: '20%',
          fontSize: 44,
          bold: true,
          align: 'center'
        });
      } else {
        pptxSlide.addText(slide.content, {
          x: 0.1,
          y: 0.1,
          w: '80%',
          h: '80%',
          fontSize: 18
        });
      }

      // Add text boxes
      slide.textBoxes.forEach(textBox => {
        const style = textBox.style || {
          fontSize: '16px',
          fontFamily: 'Arial',
          color: '#000000',
          bold: false,
          italic: false,
          underline: false,
          align: 'left'
        };

        pptxSlide.addText(textBox.content, {
          x: textBox.x / 100,
          y: textBox.y / 100,
          w: '20%',
          h: '10%',
          fontSize: parseInt(style.fontSize),
          fontFace: style.fontFamily,
          color: style.color,
          bold: style.bold,
          italic: style.italic,
          underline: { style: style.underline ? 'sng' : 'none' },
          align: style.align
        });
      });
    });

    await pptx.writeFile({ fileName: 'presentation.pptx' });
  };

  if (isCreating) {
    return <InitialForm onSubmit={handleCreatePresentation} />;
  }

  if (isPresentationMode) {
    return (
      <PresentationMode
        slides={slides}
        onExit={() => setIsPresentationMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Presentation className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Presentify
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={exportToPPTX}
              className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsPresentationMode(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Present
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Slide Preview Sidebar */}
          <div className="w-64 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-700">Slides</h2>
              <button
                onClick={() => {
                  const newSlide = {
                    id: Math.max(...slides.map(s => s.id), 0) + 1,
                    content: 'New Slide',
                    template: 'content' as const,
                    textBoxes: [],
                    animation: getRandomAnimation()
                  };
                  setSlides([...slides, newSlide]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Add new slide"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-3">
              {slides.map((slide) => (
                <div key={slide.id} className="relative group">
                  <SlidePreview
                    slide={slide}
                    isSelected={selectedSlide === slide.id}
                    onClick={() => setSelectedSlide(slide.id)}
                  />
                  {slides.length > 1 && (
                    <button
                      onClick={() => deleteSlide(slide.id)}
                      className="absolute -right-2 -top-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Editor */}
          <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200">
            {selectedSlide && (
              <SlideEditor
                slide={slides.find(s => s.id === selectedSlide)!}
                onUpdate={updateSlideContent}
                onUpdateAnimation={updateSlideAnimation}
                onUpdateTextBoxAnimation={updateTextBoxAnimation}
                onAddTextBox={addTextBox}
                onUpdateTextBox={updateTextBox}
                onUpdateTextBoxStyle={updateTextBoxStyle}
                onMoveTextBox={moveTextBox}
                onDeleteTextBox={deleteTextBox}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-center text-sm text-gray-600">
            Made with Presentify • AI-Powered Presentation Creator
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;