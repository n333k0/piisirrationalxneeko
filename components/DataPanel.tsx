
import React from 'react';
import { Point } from '../types';

interface DataPanelProps {
  theta: number;
  point: Point;
}

export const DataPanel: React.FC<DataPanelProps> = ({ theta, point }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 mix-blend-difference pointer-events-none text-right">
      <div className="bg-black/0 backdrop-blur-none p-2 min-w-[200px] rounded">
        <div className="flex justify-between items-center mb-1 font-mono text-xs text-gray-300 opacity-70">
          <span className="text-gray-600">θ</span>
          <span>{theta.toFixed(4)}</span>
        </div>
        
        <div className="flex justify-between items-center mb-1 font-mono text-xs text-gray-300 opacity-70">
          <span className="text-gray-600">Re</span>
          <span>{point.x.toFixed(4)}</span>
        </div>
        
        <div className="flex justify-between items-center font-mono text-xs text-gray-300 opacity-70">
          <span className="text-gray-600">Im</span>
          <span>{point.y.toFixed(4)}</span>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-800/0">
          <div className="w-full bg-gray-900/30 h-0.5 mt-1">
             <div 
               className="bg-white h-full transition-all duration-75 opacity-50" 
               style={{ width: `${(Math.abs(Math.sin(theta)) * 100).toFixed(0)}%` }}
             />
          </div>
        </div>
      </div>
    </div>
  );
};
