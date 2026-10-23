import React, { useRef, useState } from 'react';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Check,
  X,
  RefreshCw,
  Scissors,
  Maximize,
  Minimize,
  Sliders,
  Palette,
} from 'lucide-react';
import { PhotoFitMode } from '../types/idCard';

interface PhotoCropperModalProps {
  isOpen: boolean;
  photoUrl: string | null;
  fitMode?: PhotoFitMode; // 'contain' | 'cover' | 'manual'
  zoomPercent?: number; // 0 to 100%
  panX: number;
  panY: number;
  rotation: number;
  bgColor?: string;
  onUpdate: (updates: {
    photoFitMode?: PhotoFitMode;
    photoZoomPercent?: number;
    photoScale?: number;
    photoX?: number;
    photoY?: number;
    photoRotation?: number;
    photoBgColor?: string;
  }) => void;
  onClose: () => void;
  onReset: () => void;
}

export const PhotoCropperModal: React.FC<PhotoCropperModalProps> = ({
  isOpen,
  photoUrl,
  fitMode = 'contain',
  zoomPercent = 100,
  panX,
  panY,
  rotation,
  bgColor = '#ffffff',
  onUpdate,
  onClose,
  onReset,
}) => {
  const [activeFitMode, setActiveFitMode] = useState<PhotoFitMode>(fitMode);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  if (!isOpen || !photoUrl) return null;

  // Zoom scale: 100% = 1.0 (normal fitted size). 0% = 0.35
  const currentScale = 0.35 + (zoomPercent / 100) * 0.65;

  const handleZoomChange = (newPercent: number) => {
    const clamped = Math.max(0, Math.min(100, newPercent));
    const newScale = 0.35 + (clamped / 100) * 0.65;
    onUpdate({
      photoZoomPercent: clamped,
      photoScale: newScale,
      photoFitMode: 'manual',
    });
    setActiveFitMode('manual');
  };

  const handleModeChange = (mode: PhotoFitMode) => {
    setActiveFitMode(mode);
    if (mode === 'contain') {
      onUpdate({
        photoFitMode: 'contain',
        photoX: 0,
        photoY: 0,
        photoZoomPercent: 100,
        photoScale: 1,
        photoRotation: 0,
      });
    } else if (mode === 'cover') {
      onUpdate({
        photoFitMode: 'cover',
        photoZoomPercent: 100,
        photoScale: 1,
      });
    } else {
      onUpdate({ photoFitMode: 'manual' });
    }
  };

  // Direct mouse / touch dragging inside frame
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panX,
      initialPanY: panY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    onUpdate({
      photoX: Math.round(dragStartRef.current.initialPanX + deltaX),
      photoY: Math.round(dragStartRef.current.initialPanY + deltaY),
      photoFitMode: activeFitMode === 'contain' ? 'manual' : activeFitMode,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-blue-600" />
              Passport Photograph Fitting &amp; Alignment
            </h3>
            <p className="text-xs text-gray-500">
              Select fitting mode, adjust 0–100% zoom, or drag to center face
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fitting Mode Tabs (Section 3) */}
        <div className="p-3 bg-slate-100 border-b border-gray-200 flex gap-2">
          {/* A. Fit Entire Photo (Default) */}
          <button
            type="button"
            onClick={() => handleModeChange('contain')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-left transition-all flex items-center justify-between border ${
              activeFitMode === 'contain'
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div>
              <div className="font-bold text-xs flex items-center gap-1">
                <Minimize className="w-3.5 h-3.5" />
                Fit Entire Photo
              </div>
              <div className={`text-[10px] mt-0.5 ${activeFitMode === 'contain' ? 'text-blue-100' : 'text-gray-500'}`}>
                (Default) Never cuts head/face
              </div>
            </div>
            {activeFitMode === 'contain' && <Check className="w-4 h-4 text-white" />}
          </button>

          {/* B. Fill Photo Frame */}
          <button
            type="button"
            onClick={() => handleModeChange('cover')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-left transition-all flex items-center justify-between border ${
              activeFitMode === 'cover'
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div>
              <div className="font-bold text-xs flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5" />
                Fill Frame
              </div>
              <div className={`text-[10px] mt-0.5 ${activeFitMode === 'cover' ? 'text-blue-100' : 'text-gray-500'}`}>
                Fills box, crops edges
              </div>
            </div>
            {activeFitMode === 'cover' && <Check className="w-4 h-4 text-white" />}
          </button>

          {/* C. Manual Crop & Position */}
          <button
            type="button"
            onClick={() => handleModeChange('manual')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-left transition-all flex items-center justify-between border ${
              activeFitMode === 'manual'
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div>
              <div className="font-bold text-xs flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                Manual Crop
              </div>
              <div className={`text-[10px] mt-0.5 ${activeFitMode === 'manual' ? 'text-blue-100' : 'text-gray-500'}`}>
                Custom zoom &amp; drag
              </div>
            </div>
            {activeFitMode === 'manual' && <Check className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Body Simulator & Controls */}
        <div className="p-5 flex flex-col items-center">
          {/* Card Frame Simulator with strict clipping boundary */}
          <div className="relative mb-5 p-4 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center w-full">
            <div className="flex items-center justify-between w-full mb-2 px-1">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Assigned Photo Frame (CR80 Passport Ratio)
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Mode: {activeFitMode === 'contain' ? 'Fit Entire Photo' : activeFitMode === 'cover' ? 'Fill Frame' : 'Manual Crop'}
              </span>
            </div>

            {/* Frame with border and overflow hidden to enforce boundary */}
            <div
              className="w-[140px] h-[166px] border-[3px] border-[#b70000] rounded-[2px] shadow-md relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
              style={{ backgroundColor: bgColor }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              title="Click & drag directly inside frame to center photograph"
            >
              {activeFitMode === 'contain' ? (
                /* Mode A: Fit Entire Photo (never cut off face, shoulders, preserves aspect ratio) */
                <img
                  src={photoUrl}
                  alt="Passport preview"
                  className="w-full h-full object-contain pointer-events-none select-none"
                  style={{
                    transform: `translate(${panX}px, ${panY}px) rotate(${rotation}deg)`,
                  }}
                />
              ) : activeFitMode === 'cover' ? (
                /* Mode B: Fill Frame */
                <img
                  src={photoUrl}
                  alt="Passport preview"
                  className="w-full h-full object-cover pointer-events-none select-none"
                  style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${currentScale}) rotate(${rotation}deg)`,
                  }}
                />
              ) : (
                /* Mode C: Manual Zoom & Pan */
                <img
                  src={photoUrl}
                  alt="Passport preview"
                  className="max-w-none transition-transform duration-75 select-none pointer-events-none"
                  style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${currentScale}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                />
              )}

              {/* Boundary guide */}
              <div className="absolute inset-0 pointer-events-none opacity-20 border border-dashed border-red-500" />
            </div>

            <span className="text-[10px] text-slate-400 mt-2 font-medium">
              Click &amp; drag photo directly inside the frame to center face
            </span>
          </div>

          {/* Controls Sliders */}
          <div className="w-full space-y-3.5 text-xs font-medium text-gray-700">
            {/* Zoom Slider (0% to 100%) */}
            <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200/70">
              <div className="flex justify-between items-center mb-1.5">
                <span className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <ZoomIn className="w-4 h-4 text-blue-600" />
                  Zoom Scale (0% – 100%):
                </span>
                <span className="font-mono text-blue-700 font-black text-sm bg-white px-2 py-0.5 rounded border border-blue-200">
                  {Math.round(zoomPercent)}% {zoomPercent === 100 ? '(Normal Fit)' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ZoomOut className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={zoomPercent}
                  onChange={(e) => handleZoomChange(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-blue-200 rounded-lg"
                />
                <ZoomIn className="w-4 h-4 text-gray-500 shrink-0" />
              </div>
            </div>

            {/* Pan Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Pan X:</span>
                  <span className="font-mono text-gray-900 font-bold">{panX}px</span>
                </div>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  step="1"
                  value={panX}
                  onChange={(e) => onUpdate({ photoX: parseInt(e.target.value, 10), photoFitMode: 'manual' })}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Pan Y:</span>
                  <span className="font-mono text-gray-900 font-bold">{panY}px</span>
                </div>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  step="1"
                  value={panY}
                  onChange={(e) => onUpdate({ photoY: parseInt(e.target.value, 10), photoFitMode: 'manual' })}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Letterbox Background Color (in contain mode) */}
            {activeFitMode === 'contain' && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[11px] text-gray-600 flex items-center gap-1 font-semibold">
                  <Palette className="w-3.5 h-3.5 text-blue-600" />
                  Letterbox Background:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdate({ photoBgColor: '#ffffff' })}
                    className={`w-5 h-5 rounded-full border ${bgColor === '#ffffff' ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: '#ffffff' }}
                    title="White"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdate({ photoBgColor: '#f1f5f9' })}
                    className={`w-5 h-5 rounded-full border ${bgColor === '#f1f5f9' ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: '#f1f5f9' }}
                    title="Light Slate"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdate({ photoBgColor: '#e0f2fe' })}
                    className={`w-5 h-5 rounded-full border ${bgColor === '#e0f2fe' ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: '#e0f2fe' }}
                    title="Sky Blue"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Fit Entire Photo
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            Apply Fitting Mode
          </button>
        </div>
      </div>
    </div>
  );
};
