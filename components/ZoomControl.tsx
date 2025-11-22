
import React from 'react';

interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({ zoom, onZoomChange }) => {
  // Logarithmic mapping logic for extreme zoom
  const MAX_ZOOM = 333333;
  const toSlider = (z: number) => (Math.log(z) / Math.log(MAX_ZOOM)) * 100;
  const fromSlider = (s: number) => Math.pow(MAX_ZOOM, s / 100);

  const sliderVal = toSlider(zoom);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (val < 0.01) {
        onZoomChange(1);
    } else {
        onZoomChange(fromSlider(val));
    }
  };

  return (
    <div className="pointer-events-auto mix-blend-difference text-right">
      <div className="bg-black/0 backdrop-blur-none px-2 py-0 inline-block min-w-[200px] rounded">
        <div className="flex justify-end items-center mb-1 gap-4 opacity-80">
            <span className="font-mono text-[10px] text-gray-400">ZOOM</span>
            <span className="font-mono text-[10px] text-white bg-gray-900/0 px-2 py-0.5 rounded">
                {zoom < 1000 
                    ? `x${zoom.toFixed(1)}` 
                    : `x${(zoom/1000).toFixed(1)}k`}
            </span>
        </div>
        {/* Large touch container */}
        <div className="relative flex items-center h-12 w-full">
            {/* Visual Track (Grey Line) - Centered Vertically - Subtle Look */}
            <div className="absolute w-full h-[1px] bg-[#444444] top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none"></div>
            
            {/* Actual Input - Transparent but large touch area */}
            <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={isNaN(sliderVal) ? 0 : sliderVal}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer focus:outline-none z-10
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-2 
              [&::-webkit-slider-thumb]:h-2 
              [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:border-0 
              [&::-webkit-slider-thumb]:rounded-none
              [&::-moz-range-thumb]:w-2 
              [&::-moz-range-thumb]:h-2 
              [&::-moz-range-thumb]:bg-white 
              [&::-moz-range-thumb]:border-0
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-moz-range-track]:bg-transparent"
            />
        </div>
      </div>
    </div>
  );
};
