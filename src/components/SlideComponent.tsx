import React from 'react';
import { Slide } from '../App';

const SlideComponent: React.FC<{ slide: Slide }> = ({ slide }) => {
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

export default SlideComponent;
