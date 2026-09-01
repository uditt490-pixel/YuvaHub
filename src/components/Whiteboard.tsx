import React, { useRef, useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Eraser, Trash2, PenTool } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawEvent {
  type: 'start' | 'draw' | 'end' | 'clear';
  x?: number;
  y?: number;
  color?: string;
  lineWidth?: number;
}

export const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket, isConnected } = useSocket();
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#b56b37'); // Default theme color
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  
  // Previous point for drawing continuous lines
  const lastPointRef = useRef<Point | null>(null);

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    // Handle window resize
    const handleResize = () => {
      if (parent) {
        // Save existing canvas content before resize
        const ctx = canvas.getContext('2d');
        const imgData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // Restore content
        if (ctx && imgData) {
          ctx.putImageData(imgData, 0, 0);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Socket event listener
  useEffect(() => {
    if (!socket) return;

    const handleDrawEvent = (data: DrawEvent) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      if (data.type === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const drawColor = data.color === 'ERASE' ? '#ffffff' : (data.color || '#000000');
      const drawWidth = data.lineWidth || 3;

      if (data.color === 'ERASE') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (data.type === 'start') {
        ctx.beginPath();
        if (data.x !== undefined && data.y !== undefined) {
          ctx.moveTo(data.x, data.y);
          lastPointRef.current = { x: data.x, y: data.y };
        }
      } else if (data.type === 'draw') {
        if (data.x !== undefined && data.y !== undefined) {
          if (!lastPointRef.current) {
            ctx.beginPath();
            ctx.moveTo(data.x, data.y);
          } else {
            ctx.beginPath();
            ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
          }
          ctx.lineTo(data.x, data.y);
          ctx.stroke();
          lastPointRef.current = { x: data.x, y: data.y };
        }
      } else if (data.type === 'end') {
        ctx.closePath();
        lastPointRef.current = null;
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    socket.on('draw_event', handleDrawEvent);
    return () => {
      socket.off('draw_event', handleDrawEvent);
    };
  }, [socket]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Touch events usually handled passively by React, but standard preventDefault helps
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    lastPointRef.current = coords;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }

    emitDrawEvent({
      type: 'start',
      x: coords.x,
      y: coords.y,
      color: isEraser ? 'ERASE' : color, 
      lineWidth: isEraser ? lineWidth * 3 : lineWidth
    });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (ctx) {
      const activeColor = color;
      const activeWidth = isEraser ? lineWidth * 3 : lineWidth;
      
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.strokeStyle = activeColor;
      ctx.lineWidth = activeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      
      ctx.globalCompositeOperation = 'source-over';
    }

    emitDrawEvent({
      type: 'draw',
      x: coords.x,
      y: coords.y,
      color: isEraser ? 'ERASE' : color,
      lineWidth: isEraser ? lineWidth * 3 : lineWidth
    });
    
    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;

    emitDrawEvent({ type: 'end' });
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    emitDrawEvent({ type: 'clear' });
  };

  const emitDrawEvent = (data: DrawEvent) => {
    if (socket && isConnected) {
      socket.emit('draw_event', data);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-surface dark:bg-slate-900 rounded-3xl relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between bg-surface/90 dark:bg-slate-800/90 backdrop-blur-sm p-2 rounded-2xl shadow-sm border border-border-theme dark:border-slate-700 z-10">
        <div className="flex items-center gap-2">
          {/* Colors */}
          {['#231f20', '#b56b37', '#63703d', '#3b82f6', '#ef4444'].map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && !isEraser ? 'scale-125 border-gray-400' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: c }}
              title="Color"
            />
          ))}
          
          <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1"></div>
          
          <button
            onClick={() => setIsEraser(false)}
            className={`p-1.5 rounded-lg ${!isEraser ? 'bg-background text-primary-blue' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            title="Pen"
          >
            <PenTool className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsEraser(true)}
            className={`p-1.5 rounded-lg ${isEraser ? 'bg-background text-primary-blue' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>

        </div>
        
        <button
          onClick={clearBoard}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 w-full h-full cursor-crosshair relative rounded-b-3xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
