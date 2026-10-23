import React, { useState } from 'react';
import { StaffData } from '../types/idCard';
import { CardTemplate } from '../types/template';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  QrCode,
  Download,
  Layers,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { buildQRText, generateQRCodeDataUrl } from '../utils/qrGenerator';

interface CardPreviewProps {
  data: StaffData;
  showBleed: boolean;
  onToggleBleed: () => void;
  onPrint: () => void;
  onOpenTemplateEditor: () => void;
  frontTemplate?: CardTemplate;
  backTemplate?: CardTemplate;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  data,
  showBleed,
  onToggleBleed,
  onOpenTemplateEditor,
  frontTemplate,
  backTemplate,
}) => {
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back'>('front');
  const [zoomLevel, setZoomLevel] = useState<number>(0.92);
  const [useTemplateBg, setUseTemplateBg] = useState<boolean>(true);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrModalUrl, setQrModalUrl] = useState<string>('');

  const isSSA = data.idType === 'SSA';
  const isIntern = data.idType === 'Intern';

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(parseFloat((prev + delta).toFixed(2)), 0.5), 1.6));
  };

  const handleOpenQRModal = async () => {
    const text = buildQRText(data);
    const url = await generateQRCodeDataUrl(text, 400);
    setQrModalUrl(url);
    setShowQRModal(true);
  };

  const handleDownloadQR = () => {
    if (!qrModalUrl) return;
    const a = document.createElement('a');
    a.href = qrModalUrl;
    a.download = `QR_${data.idType}_${data.idNumber || 'STAFF'}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Panel Top Toolbar */}
      <div className="bg-white border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveSide('front')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeSide === 'front'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Front Side
          </button>
          <button
            onClick={() => setActiveSide('back')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeSide === 'back'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Back Side
          </button>
          <button
            onClick={() => setActiveSide('both')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeSide === 'both'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Side-by-Side
          </button>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5">
          {/* Visual Template Editor Button */}
          <button
            type="button"
            onClick={onOpenTemplateEditor}
            className="flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition-colors shadow-xs"
            title="Open Drag & Drop Template Editor"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Customize Template</span>
          </button>

          {/* Template Graphic vs Vector Mode Toggle */}
          {!isIntern && (
            <button
              type="button"
              onClick={() => setUseTemplateBg(!useTemplateBg)}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border transition-colors ${
                useTemplateBg
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
              title="Toggle between PDF Sample Background & Clean Vector Rendering"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{useTemplateBg ? 'Sample Artwork' : 'Vector Mode'}</span>
            </button>
          )}

          {/* Bleed Guide Toggle */}
          <button
            type="button"
            onClick={onToggleBleed}
            className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition-colors ${
              showBleed
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
            title="Toggle 3mm Bleed Margin overlay"
          >
            Bleed Guide
          </button>

          {/* QR Code Quick View */}
          <button
            type="button"
            onClick={handleOpenQRModal}
            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            title="Inspect / Download Dynamic QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-700 px-1.5 min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(0.92)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition-colors ml-0.5"
              title="Fit to Workspace"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Canvas Area */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center relative min-h-[580px] bg-slate-200/60 pattern-grid">
        {/* Top Type Notice Banner */}
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs text-white ${
              isIntern ? 'bg-emerald-700' : isSSA ? 'bg-red-700' : 'bg-blue-800'
            }`}
          >
            {data.idType.toUpperCase()} CARD PREVIEW
          </span>
          <span className="text-[11px] text-slate-500 font-medium bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200">
            Standard CR80 (54mm × 85.6mm)
          </span>
          {data.printStatus === 'Printed' ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
              Status: Printed
            </span>
          ) : data.printStatus === 'Not Printed / Updated' ? (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
              Status: Updated (Reprint Required)
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-600 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded">
              Status: Not Printed
            </span>
          )}
        </div>

        {/* Card Render Container */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-4">
          {/* Front Side */}
          {(activeSide === 'front' || activeSide === 'both') && (
            <div className="flex flex-col items-center">
              {activeSide === 'both' && (
                <span className="text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  FRONT SIDE
                </span>
              )}
              <CardFront
                data={data}
                showBleed={showBleed}
                scale={zoomLevel}
                useTemplateBg={useTemplateBg}
                customTemplate={frontTemplate}
              />
            </div>
          )}

          {/* Back Side */}
          {(activeSide === 'back' || activeSide === 'both') && (
            <div className="flex flex-col items-center">
              {activeSide === 'both' && (
                <span className="text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  BACK SIDE
                </span>
              )}
              <CardBack
                data={data}
                showBleed={showBleed}
                scale={zoomLevel}
                useTemplateBg={useTemplateBg}
                customTemplate={backTemplate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Panel Bottom Status */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Form &amp; Template Synchronization Active</span>
        </div>
        <div className="text-[11px] text-slate-400">
          FMC Birnin Kudu IT Unit — Printing Section
        </div>
      </div>

      {/* QR Inspection Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-600" />
                Staff Verification QR Code
              </h4>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-5 flex flex-col items-center">
              <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
                <img
                  src={qrModalUrl}
                  alt="QR Code"
                  className="w-[180px] h-[180px] object-contain"
                />
              </div>
              <div className="mt-3 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[10.5px] font-mono text-slate-700 whitespace-pre-wrap max-h-36 overflow-y-auto">
                {buildQRText(data)}
              </div>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowQRModal(false)}
                className="text-xs text-gray-600 px-3 py-1.5"
              >
                Close
              </button>
              <button
                onClick={handleDownloadQR}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download QR (PNG)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
