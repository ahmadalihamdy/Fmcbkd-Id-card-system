import React from 'react';
import { X, Printer, HelpCircle, Check, Sliders } from 'lucide-react';
import { PrintOptions } from '../types/idCard';

interface PrintSettingsModalProps {
  isOpen: boolean;
  printOptions: PrintOptions;
  cardWidthMm: number;
  cardHeightMm: number;
  onUpdatePrintOptions: (options: Partial<PrintOptions>) => void;
  onUpdateDimensions: (w: number, h: number) => void;
  onClose: () => void;
}

export const PrintSettingsModal: React.FC<PrintSettingsModalProps> = ({
  isOpen,
  printOptions,
  cardWidthMm,
  cardHeightMm,
  onUpdatePrintOptions,
  onUpdateDimensions,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Card Dimensions & Printing Configuration
              </h3>
              <p className="text-xs text-gray-500">
                Physical sizing and printer options for FMC Birnin Kudu IT Unit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Card Dimensions Standard */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Physical Card Dimensions (CR80 Standard)
              </span>
              <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.5 rounded">
                ISO/IEC 7810 ID-1
              </span>
            </div>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              Standard PVC / composite card size derived from the FMC sample PDF:
              <strong> 53.98mm × 85.60mm</strong> (2.125&quot; × 3.375&quot;).
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Card Width (mm):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={cardWidthMm}
                  onChange={(e) =>
                    onUpdateDimensions(parseFloat(e.target.value) || 54, cardHeightMm)
                  }
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono text-xs bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Card Height (mm):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={cardHeightMm}
                  onChange={(e) =>
                    onUpdateDimensions(cardWidthMm, parseFloat(e.target.value) || 85.6)
                  }
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono text-xs bg-white text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Double-Sided Flip Orientation */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Double-Sided Printing Flip Orientation:
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() =>
                  onUpdatePrintOptions({ flipOrientation: 'flip-long-edge' })
                }
                className={`p-2.5 border rounded-lg text-left transition-all ${
                  printOptions.flipOrientation === 'flip-long-edge'
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-gray-900">Flip on Long Edge</div>
                <div className="text-[10.5px] text-gray-500 mt-0.5">
                  Standard portrait card flip (recommended for ID-card printers)
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdatePrintOptions({ flipOrientation: 'flip-short-edge' })
                }
                className={`p-2.5 border rounded-lg text-left transition-all ${
                  printOptions.flipOrientation === 'flip-short-edge'
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-gray-900">Flip on Short Edge</div>
                <div className="text-[10.5px] text-gray-500 mt-0.5">
                  Tumble flip (used by select thermal card printing drivers)
                </div>
              </button>
            </div>
          </div>

          {/* Default Print Side */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Card Side to Print by Default:
            </label>
            <div className="flex gap-2">
              {(
                [
                  { id: 'both', label: 'Front & Back (Dual Sided)' },
                  { id: 'front', label: 'Front Side Only' },
                  { id: 'back', label: 'Back Side Only' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdatePrintOptions({ side: opt.id })}
                  className={`flex-1 py-1.5 px-2 border rounded-md font-semibold text-center text-xs transition-all ${
                    printOptions.side === opt.id
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bleed Margin & Color Mode */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div>
              <span className="font-semibold text-gray-800 block">
                Show 3mm Bleed Margin in Live Preview
              </span>
              <span className="text-gray-500 text-[10.5px]">
                Displays safe cutting boundary (hidden automatically when printing)
              </span>
            </div>
            <input
              type="checkbox"
              checked={printOptions.showBleedMarks}
              onChange={(e) =>
                onUpdatePrintOptions({ showBleedMarks: e.target.checked })
              }
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Hardware Operator Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5 text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              IT Printing Section Operator Checklist
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[10.5px] leading-relaxed text-amber-800">
              <li>
                In your browser&apos;s Print Dialog, select <strong>&quot;Scale: 100%&quot;</strong> (do not choose &quot;Fit to printable area&quot;).
              </li>
              <li>
                Set <strong>Margins: None</strong> to prevent automatic browser margins.
              </li>
              <li>
                Uncheck <strong>&quot;Headers and footers&quot;</strong> in printer settings.
              </li>
              <li>
                Compatible with Zebra ZXP/ZC series, Evolis Primacy/Zenius, Magicard, and Fargo PVC card printers.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onUpdateDimensions(54, 85.6);
              onUpdatePrintOptions({
                flipOrientation: 'flip-long-edge',
                side: 'both',
                showBleedMarks: false,
              });
            }}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
