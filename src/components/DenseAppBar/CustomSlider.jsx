import React, { useState } from 'react';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';

export default function CustomSlider(props) {
  const [hoverValue, setHoverValue] = useState(null);

  const handleMouseMove = (event) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const { clientX } = event;
    const percentage = ((clientX - left) / width) * 100;
    const value = (props.max - props.min) * (percentage / 100) + props.min;
    setHoverValue(Math.round(value));
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const handleMouseUp = () => {
    if (hoverValue !== null) {
      // ここで hoverValue を使って何らかの更新処理を行う
      console.log(`Mouse Up: ${hoverValue}`);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}  // ここに onMouseUp イベントを追加
    >
      {hoverValue !== null && (
        <Tooltip title={hoverValue.toString()} placement="top" open>
          <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />
        </Tooltip>
      )}
      <Slider {...props} />
    </div>
  );
}
