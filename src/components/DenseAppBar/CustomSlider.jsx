"use client"
import React from 'react';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';

// カスタムTooltipコンポーネント
function ValueLabelComponent(props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

export default function CustomSlider(props) {
  return (
    <Slider
		valueLabelDisplay="auto"
		ValueLabelComponent={ValueLabelComponent}
		{...props}
    />
  );
}
