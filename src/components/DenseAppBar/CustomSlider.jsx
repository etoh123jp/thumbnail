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

  return (
    <div onMouseMove={handleMouseMove}>
      {hoverValue !== null && (
        <Tooltip title={hoverValue} placement="top">
          <span />
        </Tooltip>
      )}
      <Slider {...props} />
    </div>
  );
}
