import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Trash2, PenTool } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onSave: (signatureDataUrl: string) => void;
  onClose: () => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2.5);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      setHasDrawn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    // Transparent PNG data URL
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              Digital Signature Pad
            </h3>
            <p className="text-xs text-gray-500">
              Draw staff signature using mouse, stylus, or touch
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-5 flex flex-col items-center">
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white shadow-inner">
            <canvas
              ref={canvasRef}
              width={360}
              height={150}
              className="cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 text-xs italic">
                Sign inside this box
              </div>
            )}
            <div className="absolute bottom-3 left-4 right-4 border-b border-gray-200 pointer-events-none" />
          </div>

          {/* Pen Controls */}
          <div className="w-full flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Ink:</span>
              <button
                type="button"
                onClick={() => setPenColor('#000000')}
                className={`w-6 h-6 rounded-full bg-black border-2 ${
                  penColor === '#000000' ? 'border-blue-500 scale-110' : 'border-transparent'
                }`}
                title="Black Ink"
              />
              <button
                type="button"
                onClick={() => setPenColor('#001b69')}
                className={`w-6 h-6 rounded-full bg-[#001b69] border-2 ${
                  penColor === '#001b69' ? 'border-blue-500 scale-110' : 'border-transparent'
                }`}
                title="Blue Ink"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Stroke:</span>
              <select
                value={penWidth}
                onChange={(e) => setPenWidth(parseFloat(e.target.value))}
                className="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white text-gray-800"
              >
                <option value={1.5}>Fine (1.5px)</option>
                <option value={2.5}>Normal (2.5px)</option>
                <option value={3.5}>Bold (3.5px)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
};
